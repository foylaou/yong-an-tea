'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/admin', label: '儀表板', icon: '📊' },
  { href: '/admin/products', label: '商品管理', icon: '📦' },
  { href: '/admin/orders', label: '訂單管理', icon: '🛒' },
  { href: '/admin/reviews', label: '評價管理', icon: '⭐' },
  { href: '/admin/analytics', label: '銷售分析', icon: '📈' },
  { href: '/admin/coupons', label: '優惠券', icon: '🎟️' },
  { href: '/admin/categories', label: '商品分類', icon: '📁' },
  { href: '/admin/blogs', label: '部落格管理', icon: '📝' },
  { href: '/admin/members', label: '會員管理', icon: '👤' },
  { href: '/admin/users', label: '管理員', icon: '👥' },
  { href: '/admin/newsletter', label: '電子報', icon: '📧' },
  { href: '/admin/seo', label: 'SEO 管理', icon: '🔍' },
  { href: '/admin/settings', label: '系統設定', icon: '⚙️' },
];

interface AdminSidebarProps {
  siteName?: string;
}

export default function AdminSidebar({ siteName = 'Helendo' }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="flex w-64 flex-col bg-gray-900 text-white">
      <div className="flex h-16 items-center justify-center border-b border-gray-800">
        <Link href="/admin" className="text-xl font-bold tracking-wide">
          {siteName} 後台
        </Link>
      </div>
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-3">
          {navItems.map((item) => {
            const isActive =
              item.href === '/admin'
                ? pathname === '/admin'
                : pathname?.startsWith(item.href) ?? false;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-gray-800 text-white'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <span className="mr-3">{item.icon}</span>
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="border-t border-gray-800 p-4">
        <Link
          href="/"
          className="flex items-center text-sm text-gray-400 transition-colors hover:text-white"
        >
          ← 返回前台
        </Link>
      </div>
    </aside>
  );
}
