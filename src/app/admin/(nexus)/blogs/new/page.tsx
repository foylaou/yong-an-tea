import { createClient } from '@/lib/supabase/server';
import { BlogForm } from '@/components/admin/nexus-blogs/BlogForm';
import { PageTitle } from '@/components/admin/nexus-layout/PageTitle';

export default async function NewBlogPage() {
  const supabase = await createClient();

  const [categoriesResult, tagsResult] = await Promise.all([
    supabase.from('blog_categories').select('id, name, slug').order('name', { ascending: true }),
    supabase.from('blog_tags').select('id, name, slug').order('name', { ascending: true }),
  ]);

  return (
    <div>
      <PageTitle title="新增文章" />
      <BlogForm categories={categoriesResult.data || []} tags={tagsResult.data || []} />
    </div>
  );
}
