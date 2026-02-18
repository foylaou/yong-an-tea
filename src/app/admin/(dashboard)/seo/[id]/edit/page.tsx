import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import SEOForm from '@/components/admin/seo/SEOForm';

export default async function EditSEOPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [seoResult, productsResult, blogsResult] = await Promise.all([
    supabase.from('seo_metadata').select('*').eq('id', id).single(),
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

  if (!seoResult.data) {
    notFound();
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-gray-900">
        編輯 SEO：{seoResult.data.meta_title || seoResult.data.page_path || seoResult.data.entity_id}
      </h1>
      <SEOForm
        products={(productsResult.data || []).map((p) => ({ id: p.id, title: p.title }))}
        blogs={(blogsResult.data || []).map((b) => ({ id: b.id, title: b.title }))}
        initialData={seoResult.data}
        isEdit
      />
    </div>
  );
}
