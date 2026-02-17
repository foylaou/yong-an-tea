import { createClient } from '@/lib/supabase/server';
import BlogForm from '@/components/admin/blogs/BlogForm';

export default async function NewBlogPage() {
  const supabase = await createClient();

  const [categoriesResult, tagsResult] = await Promise.all([
    supabase
      .from('blog_categories')
      .select('id, name, slug')
      .order('name', { ascending: true }),
    supabase
      .from('blog_tags')
      .select('id, name, slug')
      .order('name', { ascending: true }),
  ]);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-gray-900">新增文章</h1>
      <BlogForm
        categories={categoriesResult.data || []}
        tags={tagsResult.data || []}
      />
    </div>
  );
}
