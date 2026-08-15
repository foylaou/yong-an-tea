-- ============================================================
-- LINE Rich Menus — configurable, multi-menu, multi-page
--
-- Replaces the earlier hardcoded "one admin menu, one button" approach
-- (src/app/api/admin/line-richmenu/admin-menu) with a real management
-- table: any number of named menus, each with its own grid template,
-- per-button actions (including switching to another menu), and target
-- audience (all friends vs admin-only).
--
-- `name` doubles as the LINE rich menu *alias* ID (see line-richmenu.ts) —
-- aliases are what richmenuswitch actions point at, specifically so a
-- switch target stays valid across recreations of the target menu (LINE
-- has no "update a rich menu", only replace).
-- ============================================================

CREATE TABLE public.line_richmenus (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  chat_bar_text text NOT NULL DEFAULT '選單',
  template text NOT NULL, -- e.g. '2x2', '1x3' — see RICHMENU_TEMPLATES in code
  buttons jsonb NOT NULL DEFAULT '[]', -- one entry per grid cell, in row-major order
  image_url text,
  target text NOT NULL DEFAULT 'all' CHECK (target IN ('all', 'admin')),
  line_richmenu_id text, -- set once actually created on LINE's side (POST /v2/bot/richmenu)
  applied_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER update_line_richmenus_updated_at
  BEFORE UPDATE ON public.line_richmenus
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.line_richmenus ENABLE ROW LEVEL SECURITY;

-- Admin-only in both directions — this configures bot behavior, not
-- something to expose to the public API surface.
CREATE POLICY "Admin manage line richmenus"
  ON public.line_richmenus FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
