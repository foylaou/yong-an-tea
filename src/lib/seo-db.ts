import { createAdminClient } from './supabase/admin';

export interface SEOData {
  id: string;
  entity_type: string;
  entity_id: string | null;
  page_path: string | null;
  meta_title: string | null;
  meta_description: string | null;
  meta_keywords: string | null;
  canonical_url: string | null;
  og_title: string | null;
  og_description: string | null;
  og_image: string | null;
  og_type: string | null;
  twitter_card: string | null;
  twitter_title: string | null;
  twitter_description: string | null;
  twitter_image: string | null;
  structured_data: any;
  no_index: boolean;
  no_follow: boolean;
}

export async function getSEOByEntity(
  entityType: 'product' | 'blog',
  entityId: string
): Promise<SEOData | null> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('seo_metadata')
    .select('*')
    .eq('entity_type', entityType)
    .eq('entity_id', entityId)
    .single();

  if (error || !data) {
    return null;
  }

  return data as SEOData;
}

export async function getSEOByPagePath(pagePath: string): Promise<SEOData | null> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('seo_metadata')
    .select('*')
    .eq('entity_type', 'page')
    .eq('page_path', pagePath)
    .single();

  if (error || !data) {
    return null;
  }

  return data as SEOData;
}
