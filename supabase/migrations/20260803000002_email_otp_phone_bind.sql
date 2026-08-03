-- ============================================================
-- Email OTP (電話綁定驗證) + verified phone on profiles
--
-- Not using Supabase Auth's built-in signInWithOtp/verifyOtp:
-- that mechanism establishes a session on success, which would
-- clobber the logged-in admin/staff session when used from the
-- POS staff-assisted flow. This is a fully separate, session-free
-- OTP table used by both the member self-service flow and the
-- POS "verify this walk-in is an existing member" flow.
-- ============================================================

CREATE TABLE public.email_otps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  code text NOT NULL,
  purpose text NOT NULL DEFAULT 'bind_phone',
  expires_at timestamptz NOT NULL,
  consumed_at timestamptz,
  attempts int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX email_otps_email_purpose_idx ON public.email_otps (email, purpose, created_at DESC);

-- No policies — this table is only ever touched via the service-role
-- client (createAdminClient()), never directly by anon/authenticated
-- roles. RLS with zero policies denies all access except service-role,
-- which bypasses RLS entirely.
ALTER TABLE public.email_otps ENABLE ROW LEVEL SECURITY;

-- profiles.phone is only ever written after a successful OTP check —
-- its presence IS the "verified" signal, no separate boolean needed.
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone text;
