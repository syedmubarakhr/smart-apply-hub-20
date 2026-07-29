
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS face_verify_attempts integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS face_locked_at timestamptz;

CREATE TABLE public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  event text NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  ip_address text,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.audit_logs TO authenticated;
GRANT ALL ON public.audit_logs TO service_role;

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "audit_logs self select" ON public.audit_logs
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "audit_logs self insert" ON public.audit_logs
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS audit_logs_user_created_idx ON public.audit_logs (user_id, created_at DESC);
