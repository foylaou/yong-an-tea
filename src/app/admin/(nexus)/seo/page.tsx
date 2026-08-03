import { createClient } from '@/lib/supabase/server';
import { SEOTable } from '@/components/admin/nexus-seo/SEOTable';

const PER_PAGE = 20;

export default async function SEOPage() {
  const supabase = await createClient();

  const { data: items, count } = await supabase
    .from('seo_metadata')
    .select('*', { count: 'exact' })
    .order('updated_at', { ascending: false })
    .range(0, PER_PAGE - 1);

  const entityIds = (items || []).filter((item: any) => item.entity_id).map((item: any) => item.entity_id);

  const entityNames: Record<string, string> = {};

  if (entityIds.length > 0) {
    const [productsResult, blogsResult] = await Promise.all([
      supabase.from('products').select('id, title').in('id', entityIds),
      supabase.from('blogs').select('id, title').in('id', entityIds),
    ]);

    for (const p of productsResult.data || []) {
      entityNames[p.id] = p.title;
    }
    for (const b of blogsResult.data || []) {
      entityNames[b.id] = b.title;
    }
  }

  return <SEOTable initialItems={items || []} initialTotal={count || 0} initialPage={1} perPage={PER_PAGE} entityNames={entityNames} />;
}
