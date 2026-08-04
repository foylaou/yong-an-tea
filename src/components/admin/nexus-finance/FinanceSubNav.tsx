'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const tabs = [
  { label: '固定支出', href: '/admin/expenses' },
  { label: '代墊款', href: '/admin/expenses/advances' },
];

export function FinanceSubNav() {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === '/admin/expenses') {
      return pathname === '/admin/expenses';
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
