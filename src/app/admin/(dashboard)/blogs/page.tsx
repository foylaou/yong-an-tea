import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import BlogTable from '@/components/admin/blogs/BlogTable';
import BlogSubNav from '@/components/admin/blogs/BlogSubNav';

const PER_PAGE = 20;

export default async function BlogsPage() {
  const supabase = await createClient();

  const [blogsResult, categoriesResult] = await Promise.all([
    supabase
      .from('blogs')
      .select('*, blog_tag_map(tag_id, blog_tags(id, name, slug))', {
        count: 'exact',
      })
      .order('date', { ascending: false })
      .order('created_at', { ascending: false })
      .range(0, PER_PAGE - 1),
    supabase
      .from('blog_categories')
      .select('id, name, slug')
      .order('name', { ascending: true }),
  ]);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">部落格管理</h1>
        <Link
          href="/admin/blogs/new"
          className="rounded-md bg-black px-4 py-2 text-sm text-white hover:bg-gray-800"
        >
          新增文章
        </Link>
      </div>
      <BlogSubNav />
      <BlogTable
        initialBlogs={blogsResult.data || []}
        initialTotal={blogsResult.count || 0}
        initialPage={1}
        perPage={PER_PAGE}
        categories={categoriesResult.data || []}
      />
    </div>
  );
}
