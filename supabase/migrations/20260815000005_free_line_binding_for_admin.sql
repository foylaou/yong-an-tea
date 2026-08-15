-- ============================================================
-- One-off data fix: the admin's LINE account was already bound to their
-- pre-existing customer profile (Foy, s0955787053@gmail.com, created
-- 2026-04-13 — well before this LINE Bot integration work), so
-- /api/admin/line-bind's UPDATE on the admin profile hit line_user_id's
-- UNIQUE constraint and failed with already-bound. Freeing it here so the
-- admin can re-run the bind flow and claim it on their admin profile
-- instead. The customer profile itself is untouched otherwise.
-- ============================================================

UPDATE public.profiles
SET line_user_id = NULL
WHERE id = '3b9a6418-7cdb-41b7-8ad7-7fdf98bf3921'
  AND line_user_id = 'U835c9d6fd673305e70c8e0c0e7fce4c5';
