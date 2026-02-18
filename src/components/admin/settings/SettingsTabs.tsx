'use client';

import { useState } from 'react';
import { groupLabels, type SettingsGroup } from '@/lib/validations/settings';
import GeneralSettings from './GeneralSettings';
import HomepageSettings from './HomepageSettings';
import CurrencySettings from './CurrencySettings';
import BranchManager from './BranchManager';
import SocialSettings from './SocialSettings';
import ProductDisplaySettings from './ProductDisplaySettings';
import ContentSettings from './ContentSettings';
import VideoSettings from './VideoSettings';
import OfferSettings from './OfferSettings';
import BrandsSettings from './BrandsSettings';
import HeroSettings from './HeroSettings';
import FeaturedSettings from './FeaturedSettings';
import AboutSettings from './AboutSettings';
import ShippingSettings from './ShippingSettings';
import LinePaySettings from './LinePaySettings';
import LineLoginSettings from './LineLoginSettings';
import LogisticsSettings from './LogisticsSettings';
import SmtpSettings from './SmtpSettings';
import HeaderFooterSettings from './HeaderFooterSettings';

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
];

interface SettingsTabsProps {
  initialSettings: Record<string, Record<string, unknown>>;
}

export default function SettingsTabs({ initialSettings }: SettingsTabsProps) {
  const [activeTab, setActiveTab] = useState<SettingsGroup>('general');
  const [expandedGroup, setExpandedGroup] = useState<string>('基本設定');

  const tabComponents: Partial<Record<SettingsGroup, React.ReactNode>> = {
    general: <GeneralSettings initialData={initialSettings.general || {}} />,
    homepage: <HomepageSettings initialData={initialSettings.homepage || {}} />,
    currency: <CurrencySettings initialData={initialSettings.currency || {}} />,
    branches: <BranchManager />,
    social: <SocialSettings initialData={initialSettings.social || {}} />,
    product_display: <ProductDisplaySettings initialData={initialSettings.product_display || {}} />,
    content: <ContentSettings initialData={initialSettings.content || {}} />,
    video: <VideoSettings initialData={initialSettings.video || {}} />,
    offer: <OfferSettings initialData={initialSettings.offer || {}} />,
    brands: <BrandsSettings initialData={initialSettings.brands || {}} />,
    hero: <HeroSettings initialData={initialSettings.hero || {}} />,
    featured: <FeaturedSettings initialData={initialSettings.featured || {}} />,
    about: <AboutSettings initialData={initialSettings.about || {}} />,
    shipping: <ShippingSettings initialData={initialSettings.shipping || {}} />,
    linepay: <LinePaySettings initialData={initialSettings.linepay || {}} />,
    line_login: <LineLoginSettings initialData={initialSettings.line_login || {}} />,
    logistics: <LogisticsSettings initialData={initialSettings.logistics || {}} />,
    smtp: <SmtpSettings initialData={initialSettings.smtp || {}} />,
    header_footer: <HeaderFooterSettings initialData={initialSettings.header_footer || {}} />,
  };

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
        {tabComponents[activeTab] ?? null}
      </div>
    </div>
  );
}
