import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/server';
import { PageTitle } from '@/components/admin/nexus-layout/PageTitle';

function getImageUrl(value: string | null | undefined, slug: string): string {
  if (!value) return '';
  if (value.startsWith('http')) return value;
  return `/images/products/${slug}/${value}`;
}

async function getStats() {
  const supabase = await createClient();

  const [products, activeProducts, blogs, categories, profiles] = await Promise.all([
    supabase.from('products').select('id', { count: 'exact', head: true }),
    supabase.from('products').select('id', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('blogs').select('id', { count: 'exact', head: true }),
    supabase.from('categories').select('id', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
  ]);

  const productCount = products.count ?? 0;
  const activeProductCount = activeProducts.count ?? 0;

  return {
    productCount,
    activeProductCount,
    inactiveProductCount: productCount - activeProductCount,
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
  const [stats, recentProducts] = await Promise.all([getStats(), getRecentProducts()]);

  const cards = [
    { label: '商品總數', value: stats.productCount, color: 'bg-info', href: '/admin/products' },
    { label: '上架商品', value: stats.activeProductCount, color: 'bg-success', href: '/admin/products' },
    { label: '下架商品', value: stats.inactiveProductCount, color: 'bg-warning', href: '/admin/products' },
    { label: '部落格文章', value: stats.blogCount, color: 'bg-primary', href: '/admin/blogs' },
    { label: '分類', value: stats.categoryCount, color: 'bg-secondary', href: '/admin/categories' },
    { label: '使用者', value: stats.userCount, color: 'bg-accent', href: '/admin/users' },
  ];

  const quickActions = [
    { label: '新增商品', href: '/admin/products/new' },
    { label: '新增文章', href: '/admin/blogs/new' },
    { label: '新增分類', href: '/admin/categories' },
    { label: '系統設定', href: '/admin/settings' },
  ];

  return (
    <div>
      <PageTitle title="儀表板" />

      <div className="space-y-8">
        {/* Stat Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => (
            <Link key={card.label} href={card.href} className="card card-border bg-base-100 hover:shadow-md">
              <div className="card-body flex-row items-center gap-5 p-5">
                <div className={`rounded-md ${card.color} p-3`}>
                  <span className="text-2xl font-bold text-white">{card.value}</span>
                </div>
                <p className="text-base-content/60 text-sm font-medium">{card.label}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Recent Products */}
        <div className="card card-border bg-base-100">
          <div className="card-body p-0">
            <div className="flex items-center justify-between px-6 py-4">
              <h2 className="card-title text-base">最近新增商品</h2>
              <Link href="/admin/products" className="link link-hover text-sm">
                查看全部
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th className="w-[60px]">縮圖</th>
                    <th>商品名稱</th>
                    <th className="w-[100px]">價格</th>
                    <th className="w-[80px]">狀態</th>
                    <th className="w-[150px]">建立時間</th>
                  </tr>
                </thead>
                <tbody>
                  {recentProducts.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-base-content/40 py-8 text-center">
                        尚無商品
                      </td>
                    </tr>
                  ) : (
                    recentProducts.map((product: any) => (
                      <tr key={product.id}>
                        <td>
                          {product.xs_image ? (
                            <Image
                              src={getImageUrl(product.xs_image, product.slug)}
                              alt={product.title}
                              width={40}
                              height={40}
                              className="h-10 w-10 rounded object-cover"
                            />
                          ) : (
                            <div className="bg-base-200 text-base-content/40 flex h-10 w-10 items-center justify-center rounded text-xs">N/A</div>
                          )}
                        </td>
                        <td>
                          <Link href={`/admin/products/${product.id}/edit`} className="link link-hover font-medium">
                            {product.title}
                          </Link>
                        </td>
                        <td>${product.price}</td>
                        <td>
                          <span className={`badge badge-sm ${product.is_active ? 'badge-success' : 'badge-ghost'}`}>{product.is_active ? '上架' : '下架'}</span>
                        </td>
                        <td className="text-base-content/60">{new Date(product.created_at).toLocaleDateString('zh-TW')}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card card-border bg-base-100">
          <div className="card-body">
            <h2 className="card-title text-base">快速操作</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {quickActions.map((action) => (
                <Link key={action.label} href={action.href} className="btn btn-outline">
                  {action.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
