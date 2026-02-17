import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

function getImageUrl(value: string | null | undefined, slug: string): string {
  if (!value) return '';
  if (value.startsWith('http')) return value;
  return `/images/products/${slug}/${value}`;
}

async function getStats() {
  const supabase = await createClient();

  const [products, activeProducts, inactiveProducts, blogs, categories, profiles] =
    await Promise.all([
      supabase.from('products').select('id', { count: 'exact', head: true }),
      supabase
        .from('products')
        .select('id', { count: 'exact', head: true })
        .eq('is_active', true),
      supabase
        .from('products')
        .select('id', { count: 'exact', head: true })
        .eq('is_active', false),
      supabase.from('blogs').select('id', { count: 'exact', head: true }),
      supabase
        .from('categories')
        .select('id', { count: 'exact', head: true })
        .eq('is_active', true),
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
    ]);

  return {
    productCount: products.count ?? 0,
    activeProductCount: activeProducts.count ?? 0,
    inactiveProductCount: inactiveProducts.count ?? 0,
    blogCount: blogs.count ?? 0,
    categoryCount: categories.count ?? 0,
    userCount: profiles.count ?? 0,
  };
}

async function getRecentProducts() {
  const supabase = await createClient();

  const { data } = await supabase
    .from('products')
    .select('id, title, slug, price, is_active, xs_image, created_at')
    .order('created_at', { ascending: false })
    .limit(5);

  return data ?? [];
}

export default async function AdminDashboard() {
  const [stats, recentProducts] = await Promise.all([
    getStats(),
    getRecentProducts(),
  ]);

  const cards = [
    {
      label: '商品總數',
      value: stats.productCount,
      color: 'bg-blue-500',
      href: '/admin/products',
    },
    {
      label: '上架商品',
      value: stats.activeProductCount,
      color: 'bg-green-500',
      href: '/admin/products',
    },
    {
      label: '下架商品',
      value: stats.inactiveProductCount,
      color: 'bg-yellow-500',
      href: '/admin/products',
    },
    {
      label: '部落格文章',
      value: stats.blogCount,
      color: 'bg-indigo-500',
      href: '/admin/blogs',
    },
    {
      label: '分類',
      value: stats.categoryCount,
      color: 'bg-pink-500',
      href: '/admin/categories',
    },
    {
      label: '使用者',
      value: stats.userCount,
      color: 'bg-purple-500',
      href: '/admin/settings',
    },
  ];

  const quickActions = [
    { label: '新增商品', href: '/admin/products/new' },
    { label: '新增文章', href: '/admin/blogs/new' },
    { label: '新增分類', href: '/admin/categories' },
    { label: '系統設定', href: '/admin/settings' },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold text-gray-900">儀表板</h1>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="overflow-hidden rounded-lg bg-white shadow transition-shadow hover:shadow-md"
          >
            <div className="p-5">
              <div className="flex items-center">
                <div
                  className={`flex-shrink-0 rounded-md ${card.color} p-3`}
                >
                  <span className="text-2xl font-bold text-white">
                    {card.value}
                  </span>
                </div>
                <div className="ml-5">
                  <p className="text-sm font-medium text-gray-500">
                    {card.label}
                  </p>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent Products */}
      <section className="overflow-hidden rounded-lg bg-white shadow">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">最近新增商品</h2>
          <Link
            href="/admin/products"
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            查看全部
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="w-[60px] px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                  縮圖
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                  商品名稱
                </th>
                <th className="w-[100px] px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                  價格
                </th>
                <th className="w-[80px] px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                  狀態
                </th>
                <th className="w-[150px] px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                  建立時間
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {recentProducts.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-8 text-center text-sm text-gray-500"
                  >
                    尚無商品
                  </td>
                </tr>
              ) : (
                recentProducts.map((product: any) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      {product.xs_image ? (
                        <img
                          src={getImageUrl(product.xs_image, product.slug)}
                          alt={product.title}
                          className="h-10 w-10 rounded object-cover"
                        />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded bg-gray-200 text-xs text-gray-400">
                          N/A
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/products/${product.id}/edit`}
                        className="text-sm font-medium text-gray-900 hover:text-blue-600"
                      >
                        {product.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      ${product.price}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${
                          product.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {product.is_active ? '上架' : '下架'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {new Date(product.created_at).toLocaleDateString('zh-TW')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="rounded-lg bg-white p-6 shadow">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">快速操作</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {quickActions.map((action) => (
            <Link
              key={action.label}
              href={action.href}
              className="rounded-md border border-gray-300 px-4 py-3 text-center text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              {action.label}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
