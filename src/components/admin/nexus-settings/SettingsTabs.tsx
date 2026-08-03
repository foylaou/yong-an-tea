'use client';

import { useState, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { groupLabels, type SettingsGroup } from '@/lib/validations/settings';
import { PageTitle } from '@/components/admin/nexus-layout/PageTitle';

// Lazy-load each settings panel – only the active tab is loaded.
// Panels are migrated to daisyUI batch by batch; not-yet-migrated groups
// temporarily render their pre-Nexus component as-is until their batch lands.
const GeneralSettings = dynamic(() => import('./GeneralSettings'));
const BranchManager = dynamic(() => import('./BranchManager'));
const SocialSettings = dynamic(() => import('./SocialSettings'));
const CurrencySettings = dynamic(() => import('./CurrencySettings'));
const ProductDisplaySettings = dynamic(() => import('./ProductDisplaySettings'));
const ShippingSettings = dynamic(() => import('./ShippingSettings'));
const PaymentSettings = dynamic(() => import('./PaymentSettings'));
const LineLoginSettings = dynamic(() => import('./LineLoginSettings'));
const LogisticsSettings = dynamic(() => import('./LogisticsSettings'));
const SmtpSettings = dynamic(() => import('./SmtpSettings'));

const LegacyHomepageSettings = dynamic(() => import('@/components/admin/settings/HomepageSettings'));
const LegacyHeroSettings = dynamic(() => import('@/components/admin/settings/HeroSettings'));
const LegacyFeaturedSettings = dynamic(() => import('@/components/admin/settings/FeaturedSettings'));
const LegacyAboutSettings = dynamic(() => import('@/components/admin/settings/AboutSettings'));
const LegacyHeaderFooterSettings = dynamic(() => import('@/components/admin/settings/HeaderFooterSettings'));
const LegacyContentSettings = dynamic(() => import('@/components/admin/settings/ContentSettings'));
const LegacyVideoSettings = dynamic(() => import('@/components/admin/settings/VideoSettings'));
const LegacyOfferSettings = dynamic(() => import('@/components/admin/settings/OfferSettings'));
const LegacyBrandsSettings = dynamic(() => import('@/components/admin/settings/BrandsSettings'));
const LegacyFaqSettings = dynamic(() => import('@/components/admin/settings/FaqSettings'));
const LegacyErrorPageSettings = dynamic(() => import('@/components/admin/settings/ErrorPageSettings'));
const LegacyAuthPageSettings = dynamic(() => import('@/components/admin/settings/AuthPageSettings'));
const LegacyComingSoonSettings = dynamic(() => import('@/components/admin/settings/ComingSoonSettings'));
const LegacyCartPageSettings = dynamic(() => import('@/components/admin/settings/CartPageSettings'));
const LegacyWishlistPageSettings = dynamic(() => import('@/components/admin/settings/WishlistPageSettings'));
const LegacyProductDetailSettings = dynamic(() => import('@/components/admin/settings/ProductDetailSettings'));
const LegacyGridLayoutSettings = dynamic(() => import('@/components/admin/settings/GridLayoutSettings'));

// Sidebar groups with sub-items
const sidebarGroups: { label: string; items: SettingsGroup[] }[] = [
  {
    label: '基本設定',
    items: ['general', 'branches', 'social'],
  },
  {
    label: '商店設定',
    items: ['currency', 'product_display', 'shipping', 'payment', 'line_login', 'logistics', 'smtp'],
  },
  {
    label: '首頁與頁面',
    items: ['homepage', 'hero', 'featured', 'about', 'header_footer'],
  },
  {
    label: '內容管理',
    items: ['content', 'video', 'offer', 'brands'],
  },
  {
    label: '頁面設定',
    items: ['faq', 'error_page', 'auth_page', 'coming_soon', 'cart_page', 'wishlist_page', 'product_detail', 'grid_layout'],
  },
];

function TabSkeleton() {
  return (
    <div className="card card-border bg-base-100 animate-pulse">
      <div className="card-body space-y-4">
        <div className="bg-base-200 h-6 w-32 rounded" />
        <div className="space-y-3">
          <div className="bg-base-200 h-4 w-full rounded" />
          <div className="bg-base-200 h-4 w-3/4 rounded" />
          <div className="bg-base-200 h-10 w-full rounded" />
          <div className="bg-base-200 h-10 w-full rounded" />
        </div>
      </div>
    </div>
  );
}

interface SettingsTabsProps {
  initialSettings: Record<string, Record<string, unknown>>;
}

export function SettingsTabs({ initialSettings }: SettingsTabsProps) {
  const [activeTab, setActiveTab] = useState<SettingsGroup>('general');
  const [expandedGroup, setExpandedGroup] = useState<string>('基本設定');

  function renderActiveTab() {
    const props = { initialData: initialSettings[activeTab] || {} };
    switch (activeTab) {
      // -- Migrated to Nexus/daisyUI --
      case 'general':
        return <GeneralSettings {...props} />;
      case 'branches':
        return <BranchManager />;
      case 'social':
        return <SocialSettings {...props} />;

      case 'currency':
        return <CurrencySettings {...props} />;
      case 'product_display':
        return <ProductDisplaySettings {...props} />;
      case 'shipping':
        return <ShippingSettings {...props} />;
      case 'payment':
        return (
          <PaymentSettings
            initialData={initialSettings['payment'] || {}}
            linePayData={initialSettings['linepay'] || {}}
            shippingData={initialSettings['shipping'] || {}}
          />
        );
      case 'line_login':
        return <LineLoginSettings {...props} />;
      case 'logistics':
        return <LogisticsSettings {...props} />;
      case 'smtp':
        return <SmtpSettings {...props} />;

      // -- Not yet migrated: renders the pre-Nexus panel as-is --
      case 'homepage':
        return <LegacyHomepageSettings {...props} />;
      case 'hero':
        return <LegacyHeroSettings {...props} />;
      case 'featured':
        return <LegacyFeaturedSettings {...props} />;
      case 'about':
        return <LegacyAboutSettings {...props} />;
      case 'header_footer':
        return <LegacyHeaderFooterSettings {...props} />;
      case 'content':
        return <LegacyContentSettings {...props} />;
      case 'video':
        return <LegacyVideoSettings {...props} />;
      case 'offer':
        return <LegacyOfferSettings {...props} />;
      case 'brands':
        return <LegacyBrandsSettings {...props} />;
      case 'faq':
        return <LegacyFaqSettings {...props} />;
      case 'error_page':
        return <LegacyErrorPageSettings {...props} />;
      case 'auth_page':
        return <LegacyAuthPageSettings {...props} />;
      case 'coming_soon':
        return <LegacyComingSoonSettings {...props} />;
      case 'cart_page':
        return <LegacyCartPageSettings {...props} />;
      case 'wishlist_page':
        return <LegacyWishlistPageSettings {...props} />;
      case 'product_detail':
        return <LegacyProductDetailSettings {...props} />;
      case 'grid_layout':
        return <LegacyGridLayoutSettings {...props} />;
      default:
        return null;
    }
  }

  const handleItemClick = (group: string, item: SettingsGroup) => {
    setExpandedGroup(group);
    setActiveTab(item);
  };

  const toggleGroup = (group: string) => {
    setExpandedGroup(expandedGroup === group ? '' : group);
  };

  return (
    <div>
      <PageTitle title="系統設定" />

      {/* Mobile / tablet: flat dropdown */}
      <div className="mb-4 md:hidden">
        <select
          value={activeTab}
          onChange={(e) => setActiveTab(e.target.value as SettingsGroup)}
          className="select select-sm w-full"
        >
          {sidebarGroups.map((group) => (
            <optgroup key={group.label} label={group.label}>
              {group.items.map((item) => (
                <option key={item} value={item}>
                  {groupLabels[item]}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>

      <div className="flex gap-6">
        {/* Desktop: two-level collapsible sidebar */}
        <nav className="hidden w-56 shrink-0 md:block">
          <div className="border-base-300 bg-base-100 overflow-hidden rounded-box border">
            {sidebarGroups.map((group) => {
              const isExpanded = expandedGroup === group.label;
              const hasActiveItem = group.items.includes(activeTab);

              return (
                <div key={group.label}>
                  <button
                    type="button"
                    onClick={() => toggleGroup(group.label)}
                    className={`border-base-200 flex w-full items-center justify-between border-b px-4 py-3 text-sm font-medium transition-colors ${
                      hasActiveItem ? 'bg-base-200' : 'hover:bg-base-200'
                    }`}
                  >
                    <span>{group.label}</span>
                    <span className={`iconify lucide--chevron-down size-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                  </button>

                  {isExpanded && (
                    <div className="bg-base-200/50">
                      {group.items.map((item) => (
                        <button
                          key={item}
                          type="button"
                          onClick={() => handleItemClick(group.label, item)}
                          className={`block w-full px-4 py-2 pl-8 text-left text-sm transition-colors ${
                            activeTab === item ? 'bg-primary text-primary-content' : 'text-base-content/60 hover:bg-base-200'
                          }`}
                        >
                          {groupLabels[item]}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </nav>

        {/* Active panel */}
        <div className="min-w-0 flex-1">
          <Suspense fallback={<TabSkeleton />}>{renderActiveTab()}</Suspense>
        </div>
      </div>
    </div>
  );
}
