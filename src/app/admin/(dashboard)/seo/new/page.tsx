import { createClient } from '@/lib/supabase/server';
import SEOForm from '@/components/admin/seo/SEOForm';

export default async function NewSEOPage() {
  const supabase = await createClient();

  const [productsResult, blogsResult] = await Promise.all([
    supabase
      .from('products')
      .select('id, title')
      .eq('is_active', true)
      .order('title', { ascending: true }),
    supabase
      .from('blogs')
      .select('id, title')
      .order('title', { ascending: true }),
  ]);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-gray-900">新增 SEO 設定</h1>
      <SEOForm
        products={(productsResult.data || []).map((p) => ({ id: p.id, title: p.title }))}
        blogs={(blogsResult.data || []).map((b) => ({ id: b.id, title: b.title }))}
      />
    </div>
  );
}
