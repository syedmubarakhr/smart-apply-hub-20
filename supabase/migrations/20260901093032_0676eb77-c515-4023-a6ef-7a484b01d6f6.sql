-- 1. Account status enum for user profiles
DO $$ BEGIN
  CREATE TYPE public.user_status AS ENUM ('active','inactive');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 2. Extra profile fields for employee management
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS mobile text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS status public.user_status NOT NULL DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS reporting_manager_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS role_id uuid REFERENCES public.roles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS last_login_at timestamp with time zone;

CREATE UNIQUE INDEX IF NOT EXISTS profiles_username_unique
  ON public.profiles (lower(username)) WHERE username IS NOT NULL;

CREATE INDEX IF NOT EXISTS profiles_company_id_idx ON public.profiles (company_id);
CREATE INDEX IF NOT EXISTS profiles_department_id_idx ON public.profiles (department_id);

-- 3. Developer management policies
DROP POLICY IF EXISTS "developers manage profiles" ON public.profiles;
CREATE POLICY "developers manage profiles" ON public.profiles
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'developer'))
  WITH CHECK (public.has_role(auth.uid(), 'developer'));

DROP POLICY IF EXISTS "developers manage user roles" ON public.user_roles;
CREATE POLICY "developers manage user roles" ON public.user_roles
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'developer'))
  WITH CHECK (public.has_role(auth.uid(), 'developer'));

DROP POLICY IF EXISTS "developers manage face registrations" ON public.face_registrations;
CREATE POLICY "developers manage face registrations" ON public.face_registrations
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'developer'))
  WITH CHECK (public.has_role(auth.uid(), 'developer'));

DROP POLICY IF EXISTS "developers view audit logs" ON public.audit_logs;
CREATE POLICY "developers view audit logs" ON public.audit_logs
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'developer'));

DROP POLICY IF EXISTS "developers insert audit logs" ON public.audit_logs;
CREATE POLICY "developers insert audit logs" ON public.audit_logs
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'developer'));

GRANT DELETE ON public.face_registrations TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.user_roles TO authenticated;
GRANT DELETE ON public.profiles TO authenticated;