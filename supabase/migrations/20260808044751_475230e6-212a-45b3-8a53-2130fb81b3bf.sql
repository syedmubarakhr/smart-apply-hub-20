-- 1. New role value
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'hr_lead';

-- 2. Optional org linkage on profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS company_id uuid REFERENCES public.companies(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS department_id uuid REFERENCES public.departments(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS username text;

-- 3. Approver check (text compare avoids enum-literal use in this migration)
CREATE OR REPLACE FUNCTION public.is_face_approver(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id
      and role::text in ('hr_lead', 'developer')
  )
$$;

-- 4. Face registration review policies
DROP POLICY IF EXISTS "approvers can view all face registrations" ON public.face_registrations;
CREATE POLICY "approvers can view all face registrations"
ON public.face_registrations FOR SELECT TO authenticated
USING (public.is_face_approver(auth.uid()));

DROP POLICY IF EXISTS "approvers can review face registrations" ON public.face_registrations;
CREATE POLICY "approvers can review face registrations"
ON public.face_registrations FOR UPDATE TO authenticated
USING (public.is_face_approver(auth.uid()))
WITH CHECK (public.is_face_approver(auth.uid()));

-- 5. Approvers can read profiles for the review queue
DROP POLICY IF EXISTS "approvers can view profiles" ON public.profiles;
CREATE POLICY "approvers can view profiles"
ON public.profiles FOR SELECT TO authenticated
USING (public.is_face_approver(auth.uid()));

-- 6. Approvers can read company/department names for the queue
DROP POLICY IF EXISTS "approvers can view companies" ON public.companies;
CREATE POLICY "approvers can view companies"
ON public.companies FOR SELECT TO authenticated
USING (public.is_face_approver(auth.uid()));

DROP POLICY IF EXISTS "approvers can view departments" ON public.departments;
CREATE POLICY "approvers can view departments"
ON public.departments FOR SELECT TO authenticated
USING (public.is_face_approver(auth.uid()));

-- 7. Approvers may also read the roles of users they review
DROP POLICY IF EXISTS "approvers can view user roles" ON public.user_roles;
CREATE POLICY "approvers can view user roles"
ON public.user_roles FOR SELECT TO authenticated
USING (public.is_face_approver(auth.uid()));

-- 8. Approvers may write audit entries about registrations they review
DROP POLICY IF EXISTS "approvers can insert audit logs" ON public.audit_logs;
CREATE POLICY "approvers can insert audit logs"
ON public.audit_logs FOR INSERT TO authenticated
WITH CHECK (public.is_face_approver(auth.uid()));

DROP POLICY IF EXISTS "approvers can view audit logs" ON public.audit_logs;
CREATE POLICY "approvers can view audit logs"
ON public.audit_logs FOR SELECT TO authenticated
USING (public.is_face_approver(auth.uid()));