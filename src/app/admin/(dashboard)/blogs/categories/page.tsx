import BlogSubNav from '@/components/admin/blogs/BlogSubNav';
import BlogCategoryManager from '@/components/admin/blogs/BlogCategoryManager';

export default function BlogCategoriesPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">部落格管理</h1>
      </div>
      <BlogSubNav />
      <BlogCategoryManager />
    </div>
  );
}
