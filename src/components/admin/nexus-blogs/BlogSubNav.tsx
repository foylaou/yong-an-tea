'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const tabs = [
  { label: '文章列表', href: '/admin/blogs' },
  { label: '分類管理', href: '/admin/blogs/categories' },
  { label: '標籤管理', href: '/admin/blogs/tags' },
];

export function BlogSubNav() {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === '/admin/blogs') {
      return pathname === '/admin/blogs';
    }
    return pathname.startsWith(href);
  }

  return (
    <div role="tablist" className="tabs tabs-border mb-6">
      {tabs.map((tab) => (
        <Link key={tab.href} href={tab.href} role="tab" className={`tab ${isActive(tab.href) ? 'tab-active' : ''}`}>
          {tab.label}
        </Link>
      ))}
    </div>
  );
}
