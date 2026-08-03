import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { BlogForm } from '@/components/admin/nexus-blogs/BlogForm';
import { PageTitle } from '@/components/admin/nexus-layout/PageTitle';

export default async function EditBlogPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const [blogResult, categoriesResult, tagsResult] = await Promise.all([
    supabase.from('blogs').select('*, blog_tag_map(tag_id)').eq('id', id).single(),
    supabase.from('blog_categories').select('id, name, slug').order('name', { ascending: true }),
    supabase.from('blog_tags').select('id, name, slug').order('name', { ascending: true }),
  ]);

  if (!blogResult.data) {
    notFound();
  }

  return (
    <div>
      <PageTitle title={`編輯文章：${blogResult.data.title}`} />
      <BlogForm categories={categoriesResult.data || []} tags={tagsResult.data || []} initialData={blogResult.data} isEdit />
    </div>
  );
}
