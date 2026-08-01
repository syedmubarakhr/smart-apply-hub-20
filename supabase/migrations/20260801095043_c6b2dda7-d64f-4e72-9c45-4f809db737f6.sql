CREATE TYPE public.department_status AS ENUM ('active','inactive');

CREATE TABLE public.departments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name text NOT NULL,
  code text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  status public.department_status NOT NULL DEFAULT 'active',
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX departments_company_name_key ON public.departments (company_id, lower(name));
CREATE INDEX departments_company_id_idx ON public.departments (company_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.departments TO authenticated;
GRANT ALL ON public.departments TO service_role;

ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "developers manage departments" ON public.departments FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'developer')) WITH CHECK (public.has_role(auth.uid(), 'developer'));

CREATE POLICY "company can view own departments" ON public.departments FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.companies c WHERE c.id = departments.company_id AND c.auth_user_id = auth.uid()));

CREATE TRIGGER departments_set_updated_at BEFORE UPDATE ON public.departments
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();