'use client';

import { useState, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { groupLabels, type SettingsGroup } from '@/lib/validations/settings';

// Lazy-load each settings component – only the active tab is loaded
const GeneralSettings = dynamic(() => import('./GeneralSettings'));
const HomepageSettings = dynamic(() => import('./HomepageSettings'));
const CurrencySettings = dynamic(() => import('./CurrencySettings'));
const BranchManager = dynamic(() => import('./BranchManager'));
const SocialSettings = dynamic(() => import('./SocialSettings'));
const ProductDisplaySettings = dynamic(() => import('./ProductDisplaySettings'));
const ContentSettings = dynamic(() => import('./ContentSettings'));
const VideoSettings = dynamic(() => import('./VideoSettings'));
const OfferSettings = dynamic(() => import('./OfferSettings'));
const BrandsSettings = dynamic(() => import('./BrandsSettings'));
const HeroSettings = dynamic(() => import('./HeroSettings'));
const FeaturedSettings = dynamic(() => import('./FeaturedSettings'));
const AboutSettings = dynamic(() => import('./AboutSettings'));
const ShippingSettings = dynamic(() => import('./ShippingSettings'));
const LinePaySettings = dynamic(() => import('./LinePaySettings'));
const LineLoginSettings = dynamic(() => import('./LineLoginSettings'));
const LogisticsSettings = dynamic(() => import('./LogisticsSettings'));
const SmtpSettings = dynamic(() => import('./SmtpSettings'));
const HeaderFooterSettings = dynamic(() => import('./HeaderFooterSettings'));
const FaqSettings = dynamic(() => import('./FaqSettings'));
const ErrorPageSettings = dynamic(() => import('./ErrorPageSettings'));
const AuthPageSettings = dynamic(() => import('./AuthPageSettings'));
const ComingSoonSettings = dynamic(() => import('./ComingSoonSettings'));
const CartPageSettings = dynamic(() => import('./CartPageSettings'));
const WishlistPageSettings = dynamic(() => import('./WishlistPageSettings'));
const ProductDetailSettings = dynamic(() => import('./ProductDetailSettings'));
const GridLayoutSettings = dynamic(() => import('./GridLayoutSettings'));

// Sidebar groups with sub-items
const sidebarGroups: { label: string; items: SettingsGroup[] }[] = [
  {
    label: '基本設定',
    items: ['general', 'branches', 'social'],
  },
  {
    label: '商店設定',
    items: ['currency', 'product_display', 'shipping', 'linepay', 'line_login', 'logistics', 'smtp'],
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
    <div className="animate-pulse space-y-4 rounded-lg bg-white p-6 shadow">
      <div className="h-6 w-32 rounded bg-gray-200" />
      <div className="space-y-3">
        <div className="h-4 w-full rounded bg-gray-200" />
        <div className="h-4 w-3/4 rounded bg-gray-200" />
        <div className="h-10 w-full rounded bg-gray-200" />
        <div className="h-10 w-full rounded bg-gray-200" />
      </div>
    </div>
  );
}

interface SettingsTabsProps {
  initialSettings: Record<string, Record<string, unknown>>;
}

export default function SettingsTabs({ initialSettings }: SettingsTabsProps) {
  const [activeTab, setActiveTab] = useState<SettingsGroup>('general');
  const [expandedGroup, setExpandedGroup] = useState<string>('基本設定');

  function renderActiveTab() {
    const props = { initialData: initialSettings[activeTab] || {} };
    switch (activeTab) {
      case 'general': return <GeneralSettings {...props} />;
      case 'homepage': return <HomepageSettings {...props} />;
      case 'currency': return <CurrencySettings {...props} />;
      case 'branches': return <BranchManager />;
      case 'social': return <SocialSettings {...props} />;
      case 'product_display': return <ProductDisplaySettings {...props} />;
      case 'content': return <ContentSettings {...props} />;
      case 'video': return <VideoSettings {...props} />;
      case 'offer': return <OfferSettings {...props} />;
      case 'brands': return <BrandsSettings {...props} />;
      case 'hero': return <HeroSettings {...props} />;
      case 'featured': return <FeaturedSettings {...props} />;
      case 'about': return <AboutSettings {...props} />;
      case 'shipping': return <ShippingSettings {...props} />;
      case 'linepay': return <LinePaySettings {...props} />;
      case 'line_login': return <LineLoginSettings {...props} />;
      case 'logistics': return <LogisticsSettings {...props} />;
      case 'smtp': return <SmtpSettings {...props} />;
      case 'header_footer': return <HeaderFooterSettings {...props} />;
      case 'faq': return <FaqSettings {...props} />;
      case 'error_page': return <ErrorPageSettings {...props} />;
      case 'auth_page': return <AuthPageSettings {...props} />;
      case 'coming_soon': return <ComingSoonSettings {...props} />;
      case 'cart_page': return <CartPageSettings {...props} />;
      case 'wishlist_page': return <WishlistPageSettings {...props} />;
      case 'product_detail': return <ProductDetailSettings {...props} />;
      case 'grid_layout': return <GridLayoutSettings {...props} />;
      default: return null;
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
    <div className="flex gap-6 min-h-[600px]">
      {/* Sidebar */}
      <nav className="w-56 shrink-0">
        <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
          {sidebarGroups.map((group) => {
            const isExpanded = expandedGroup === group.label;
            const hasActiveItem = group.items.includes(activeTab);

            return (
              <div key={group.label}>
                <button
                  onClick={() => toggleGroup(group.label)}
                  className={`flex w-full items-center justify-between px-4 py-3 text-sm font-medium transition-colors border-b border-gray-100 ${
                    hasActiveItem
                      ? 'bg-gray-50 text-black'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-black'
                  }`}
                >
                  <span>{group.label}</span>
                  <svg
                    className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isExpanded && (
                  <div className="bg-gray-50">
                    {group.items.map((item) => (
                      <button
                        key={item}
                        onClick={() => handleItemClick(group.label, item)}
                        className={`block w-full text-left px-4 py-2 pl-8 text-sm transition-colors ${
                          activeTab === item
                            ? 'bg-black text-white'
                            : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'
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

      {/* Main content */}
      <div className="flex-1 min-w-0">
        <Suspense fallback={<TabSkeleton />}>
          {renderActiveTab()}
        </Suspense>
      </div>
    </div>
  );
}
