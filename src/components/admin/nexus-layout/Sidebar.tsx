'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Logo } from './Logo';
import { ISidebarMenuItem, SidebarMenuItem } from './SidebarMenuItem';
import { getActivatedItemParentKeys } from './helpers';

interface SidebarProps {
  menuItems: ISidebarMenuItem[];
  siteName: string;
}

export function Sidebar({ menuItems, siteName }: SidebarProps) {
  const pathname = usePathname();
  const hasMounted = useRef(false);

  const [activatedParents, setActivatedParents] = useState<Set<string>>(new Set());

  useEffect(() => {
    setActivatedParents(getActivatedItemParentKeys(menuItems, pathname));
  }, [menuItems, pathname]);

  const onToggleActivated = (key: string) => {
    if (activatedParents.has(key)) {
      activatedParents.delete(key);
    } else {
      activatedParents.add(key);
    }
    setActivatedParents(new Set(activatedParents));
  };

  // Auto-close the mobile drawer after navigating.
  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      return;
    }
    if (window.innerWidth <= 64 * 16) {
      const sidebarTrigger = document.querySelector<HTMLInputElement>('#layout-sidebar-toggle-trigger');
      if (sidebarTrigger) {
        sidebarTrigger.checked = false;
      }
    }
  }, [pathname]);

  return (
    <>
      <input type="checkbox" id="layout-sidebar-toggle-trigger" className="hidden" aria-label="Toggle layout sidebar" />
      <input type="checkbox" id="layout-sidebar-hover-trigger" className="hidden" aria-label="Dense layout sidebar" />
      <div id="layout-sidebar-hover" className="bg-base-300 h-screen w-1" />

      <div id="layout-sidebar" className="sidebar-menu flex flex-col">
        <div className="flex h-16 min-h-16 items-center justify-between gap-3 ps-5 pe-4">
          <Link href="/admin/orders">
            <Logo siteName={siteName} />
          </Link>
          <label
            htmlFor="layout-sidebar-hover-trigger"
            title="收合側邊欄"
            className="btn btn-circle btn-ghost btn-sm text-base-content/50 relative max-lg:hidden"
          >
            <span className="iconify lucide--panel-left-close absolute size-4.5 opacity-100 transition-all duration-300 group-has-[[id=layout-sidebar-hover-trigger]:checked]/html:opacity-0" />
            <span className="iconify lucide--panel-left-dashed absolute size-4.5 opacity-0 transition-all duration-300 group-has-[[id=layout-sidebar-hover-trigger]:checked]/html:opacity-100" />
          </label>
        </div>
        <div className="relative min-h-0 grow overflow-y-auto">
          <div className="mb-3 space-y-0.5 px-2.5">
            {menuItems.map((item) => (
              <SidebarMenuItem
                {...item}
                key={item.id}
                activated={activatedParents}
                onToggleActivated={onToggleActivated}
              />
            ))}
          </div>
        </div>
      </div>

      <label htmlFor="layout-sidebar-toggle-trigger" id="layout-sidebar-backdrop" />
    </>
  );
}
