CREATE TYPE public.role_scope AS ENUM ('platform', 'company');
CREATE TYPE public.role_status AS ENUM ('active', 'inactive');

CREATE TABLE public.roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE,
  name text NOT NULL,
  code text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  scope public.role_scope NOT NULL DEFAULT 'company',
  status public.role_status NOT NULL DEFAULT 'active',
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX roles_scope_name_key ON public.roles (COALESCE(company_id, '00000000-0000-0000-0000-000000000000'::uuid), lower(name));

GRANT SELECT, INSERT, UPDATE, DELETE ON public.roles TO authenticated;
GRANT ALL ON public.roles TO service_role;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "developers manage roles" ON public.roles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'developer'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'developer'::public.app_role));

CREATE POLICY "company can view own roles" ON public.roles FOR SELECT TO authenticated
  USING (
    company_id IS NULL
    OR EXISTS (SELECT 1 FROM public.companies c WHERE c.id = roles.company_id AND c.auth_user_id = auth.uid())
  );

CREATE TABLE public.role_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id uuid NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
  module text NOT NULL,
  can_view boolean NOT NULL DEFAULT false,
  can_add boolean NOT NULL DEFAULT false,
  can_edit boolean NOT NULL DEFAULT false,
  can_delete boolean NOT NULL DEFAULT false,
  can_approve boolean NOT NULL DEFAULT false,
  can_export boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (role_id, module)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.role_permissions TO authenticated;
GRANT ALL ON public.role_permissions TO service_role;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "developers manage role permissions" ON public.role_permissions FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'developer'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'developer'::public.app_role));

CREATE POLICY "company can view own role permissions" ON public.role_permissions FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.roles r
    WHERE r.id = role_permissions.role_id
      AND (r.company_id IS NULL OR EXISTS (
        SELECT 1 FROM public.companies c WHERE c.id = r.company_id AND c.auth_user_id = auth.uid()
      ))
  ));

CREATE TRIGGER roles_set_updated_at BEFORE UPDATE ON public.roles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER role_permissions_set_updated_at BEFORE UPDATE ON public.role_permissions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();