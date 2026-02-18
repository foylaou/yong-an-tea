'use client';

import Link from 'next/link';
import { useRouter } from 'next/router';

interface AccountLayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { href: '/account', label: '個人資料', exact: true },
  { href: '/account/orders', label: '訂單記錄' },
  { href: '/account/addresses', label: '收件地址' },
];

function AccountLayout({ children }: AccountLayoutProps) {
  const router = useRouter();
  const pathname = router.pathname;

  return (
    <div className="border-b border-[#ededed] lg:py-[90px] md:py-[80px] py-[50px]">
      <div className="container">
        <div className="grid grid-cols-12 lg:gap-x-[30px] max-md:gap-y-[30px]">
          {/* Sidebar */}
          <div className="lg:col-span-3 col-span-12">
            <nav className="bg-[#f6f6f6] border border-[#e8e8e8] rounded">
              <h2 className="text-[16px] font-medium px-5 py-4 border-b border-[#e8e8e8]">
                我的帳戶
              </h2>
              <ul>
                {navItems.map((item) => {
                  const isActive = item.exact
                    ? pathname === item.href
                    : pathname.startsWith(item.href);

                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={`block px-5 py-3 text-sm transition-colors border-b border-[#e8e8e8] last:border-0 ${
                          isActive
                            ? 'bg-white font-medium text-black'
                            : 'text-gray-600 hover:bg-white hover:text-black'
                        }`}
                      >
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </div>

          {/* Main content */}
          <div className="lg:col-span-9 col-span-12">{children}</div>
        </div>
      </div>
    </div>
  );
}

export default AccountLayout;
