import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import BlogForm from '@/components/admin/blogs/BlogForm';

export default async function EditBlogPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [blogResult, categoriesResult, tagsResult] = await Promise.all([
    supabase
      .from('blogs')
      .select('*, blog_tag_map(tag_id)')
      .eq('id', id)
      .single(),
    supabase
      .from('blog_categories')
      .select('id, name, slug')
      .order('name', { ascending: true }),
    supabase
      .from('blog_tags')
      .select('id, name, slug')
      .order('name', { ascending: true }),
  ]);

  if (!blogResult.data) {
    notFound();
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-gray-900">
        編輯文章：{blogResult.data.title}
      </h1>
      <BlogForm
        categories={categoriesResult.data || []}
        tags={tagsResult.data || []}
        initialData={blogResult.data}
        isEdit
      />
    </div>
  );
}
