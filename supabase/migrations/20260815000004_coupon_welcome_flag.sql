-- ============================================================
-- Coupon LINE distribution: welcome-coupon flag
--
-- Two distinct distribution modes an admin needs on a coupon:
--   1. One-time broadcast to everyone currently LINE-bound (an anniversary
--      sale coupon) — this is just an action (push to profiles.line_user_id
--      IS NOT NULL right now), doesn't need any new column.
--   2. Standing "send this to every new member as they bind LINE" (a
--      welcome coupon) — this DOES need to persist, since it has to keep
--      firing for members who join long after the coupon was created.
-- ============================================================

ALTER TABLE public.coupons ADD COLUMN IF NOT EXISTS is_welcome_coupon boolean NOT NULL DEFAULT false;
