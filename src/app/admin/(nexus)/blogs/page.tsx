import { createClient } from '@/lib/supabase/server';
import { BlogTable } from '@/components/admin/nexus-blogs/BlogTable';

export default async function BlogsPage() {
  const supabase = await createClient();

  const [blogsResult, categoriesResult] = await Promise.all([
    supabase
      .from('blogs')
      .select('*, blog_tag_map(tag_id, blog_tags(id, name, slug))', { count: 'exact' })
      .order('date', { ascending: false })
      .order('created_at', { ascending: false })
      .range(0, 19),
    supabase.from('blog_categories').select('id, name, slug').order('name', { ascending: true }),
  ]);

  return (
    <BlogTable
      initialBlogs={blogsResult.data || []}
      initialTotal={blogsResult.count || 0}
      initialPage={1}
      perPage={20}
      categories={categoriesResult.data || []}
    />
  );
}
