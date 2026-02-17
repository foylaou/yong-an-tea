'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const tabs = [
  { label: '文章列表', href: '/admin/blogs' },
  { label: '分類管理', href: '/admin/blogs/categories' },
  { label: '標籤管理', href: '/admin/blogs/tags' },
];

export default function BlogSubNav() {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === '/admin/blogs') {
      // Exact match for the blog list page — avoid matching /admin/blogs/categories etc.
      return pathname === '/admin/blogs';
    }
    return pathname.startsWith(href);
  }

  return (
    <div className="mb-6 border-b border-gray-200">
      <nav className="-mb-px flex gap-6">
        {tabs.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className={`whitespace-nowrap border-b-2 px-1 py-3 text-sm font-medium transition-colors ${
              isActive(tab.href)
                ? 'border-black text-gray-900'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
