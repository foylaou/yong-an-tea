-- Newsletter subscribers (independent of auth.users — guests can subscribe)
CREATE TABLE public.newsletter_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'unsubscribed')),
  unsubscribe_token uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_newsletter_subscribers_status ON public.newsletter_subscribers(status);
CREATE UNIQUE INDEX idx_newsletter_subscribers_token ON public.newsletter_subscribers(unsubscribe_token);

ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full access to newsletter_subscribers"
  ON public.newsletter_subscribers
  FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Newsletters
CREATE TABLE public.newsletters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject text NOT NULL,
  content_html text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent')),
  sent_at timestamptz,
  sent_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.newsletters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full access to newsletters"
  ON public.newsletters
  FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
