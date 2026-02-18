import type { MetadataRoute } from 'next';
import { createAdminClient } from '@/lib/supabase/admin';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createAdminClient();

  // Fetch all no_index entity IDs to exclude
  const { data: noIndexItems } = await supabase
    .from('seo_metadata')
    .select('entity_type, entity_id, page_path')
    .eq('no_index', true);

  const noIndexProductIds = new Set(
    (noIndexItems || [])
      .filter((item) => item.entity_type === 'product' && item.entity_id)
      .map((item) => item.entity_id)
  );
  const noIndexBlogIds = new Set(
    (noIndexItems || [])
      .filter((item) => item.entity_type === 'blog' && item.entity_id)
      .map((item) => item.entity_id)
  );
  const noIndexPaths = new Set(
    (noIndexItems || [])
      .filter((item) => item.entity_type === 'page' && item.page_path)
      .map((item) => item.page_path)
  );

  // Static pages
  const staticPages = ['/', '/products', '/blogs', '/about', '/contact'];
  const staticEntries: MetadataRoute.Sitemap = staticPages
    .filter((path) => !noIndexPaths.has(path))
    .map((path) => ({
      url: `${SITE_URL}${path}`,
      lastModified: new Date(),
      changeFrequency: path === '/' ? 'daily' : 'weekly',
      priority: path === '/' ? 1.0 : 0.8,
    }));

  // Products
  const { data: products } = await supabase
    .from('products')
    .select('id, slug, updated_at')
    .eq('is_active', true);

  const productEntries: MetadataRoute.Sitemap = (products || [])
    .filter((p) => !noIndexProductIds.has(p.id))
    .map((p) => ({
      url: `${SITE_URL}/products/${p.slug}`,
      lastModified: p.updated_at ? new Date(p.updated_at) : new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    }));

  // Blogs
  const { data: blogs } = await supabase
    .from('blogs')
    .select('id, slug, updated_at')
    .eq('published', true);

  const blogEntries: MetadataRoute.Sitemap = (blogs || [])
    .filter((b) => !noIndexBlogIds.has(b.id))
    .map((b) => ({
      url: `${SITE_URL}/blogs/${b.slug}`,
      lastModified: b.updated_at ? new Date(b.updated_at) : new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    }));

  return [...staticEntries, ...productEntries, ...blogEntries];
}
