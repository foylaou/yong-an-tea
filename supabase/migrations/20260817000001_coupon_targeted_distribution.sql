-- ============================================================
-- Coupons were always usable by anyone who had the code — "立即推播給所有
-- 現有 LINE 會員" was only ever a notification, never an access gate,
-- so an admin-only-issued coupon was in practice redeemable by anyone who
-- guessed/saw the code. This adds real targeting:
--
--   coupons.is_public      false = "限定發放" — only usable by an explicit
--                           coupon_recipients row. Flips to true the
--                           moment the coupon is ever broadcast (create-time
--                           checkbox or the standalone 立即推播 button) —
--                           broadcasting to everyone *is* what makes it public.
--   coupon_recipients      who's actually allowed to redeem a non-public
--                           coupon — one row per admin-issued grant
--                           (POST /api/admin/coupons/issue) or per welcome
--                           coupon auto-sent to a new member
--                           (sendWelcomeCoupons).
--
-- Existing coupons are grandfathered as public (DEFAULT true on the ALTER
-- backfills every current row) — locking down promos that are already live
-- and were never meant to require this new plumbing would be a real
-- regression, not a fix. Only coupons created *after* this ships default to
-- targeted-only, matching the "should be admin-issued by default" ask.
-- ============================================================

ALTER TABLE public.coupons ADD COLUMN is_public boolean NOT NULL DEFAULT true;
ALTER TABLE public.coupons ALTER COLUMN is_public SET DEFAULT false;

CREATE TABLE public.coupon_recipients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id uuid NOT NULL REFERENCES public.coupons(id) ON DELETE CASCADE,
  customer_id uuid NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(coupon_id, customer_id)
);

CREATE INDEX idx_coupon_recipients_customer ON public.coupon_recipients(customer_id, coupon_id);

ALTER TABLE public.coupon_recipients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin manage coupon recipients"
  ON public.coupon_recipients FOR ALL USING (public.is_admin());
