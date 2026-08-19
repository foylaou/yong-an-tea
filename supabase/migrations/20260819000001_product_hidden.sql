-- Hidden products: excluded from all public browsing/search/sitemap, but
-- still reachable via their direct /products/{slug} URL (the "admin shares
-- a link" flow) and still sellable in POS. See products-db.ts /
-- app/api/search/route.ts / app/sitemap.ts for the enforcement points.
ALTER TABLE public.products ADD COLUMN is_hidden boolean NOT NULL DEFAULT false;
