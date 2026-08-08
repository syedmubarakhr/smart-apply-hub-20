-- Keep only the most recent registration per employee
DELETE FROM public.face_registrations f
USING public.face_registrations g
WHERE f.user_id = g.user_id
  AND f.created_at < g.created_at;

-- Allow an employee to resubmit after rejection (row goes back to pending)
DROP POLICY IF EXISTS "face_registrations self resubmit rejected" ON public.face_registrations;
CREATE POLICY "face_registrations self resubmit rejected"
ON public.face_registrations FOR UPDATE TO authenticated
USING (auth.uid() = user_id AND status = 'rejected'::face_registration_status)
WITH CHECK (auth.uid() = user_id AND status = 'pending'::face_registration_status);