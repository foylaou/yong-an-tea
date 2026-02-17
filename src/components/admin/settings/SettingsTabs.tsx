'use client';

import { useState } from 'react';
import { groupKeys, groupLabels, type SettingsGroup } from '@/lib/validations/settings';
import GeneralSettings from './GeneralSettings';
import HomepageSettings from './HomepageSettings';
import CurrencySettings from './CurrencySettings';
import ContactSettings from './ContactSettings';
import SocialSettings from './SocialSettings';
import ProductDisplaySettings from './ProductDisplaySettings';
import ContentSettings from './ContentSettings';
import VideoSettings from './VideoSettings';
import OfferSettings from './OfferSettings';
import BrandsSettings from './BrandsSettings';
import HeroSettings from './HeroSettings';
import FeaturedSettings from './FeaturedSettings';
import AboutSettings from './AboutSettings';


interface SettingsTabsProps {
  initialSettings: Record<string, Record<string, unknown>>;
}

export default function SettingsTabs({ initialSettings }: SettingsTabsProps) {
  const [activeTab, setActiveTab] = useState<SettingsGroup>('general');

  const tabComponents: Record<SettingsGroup, React.ReactNode> = {
    general: <GeneralSettings initialData={initialSettings.general || {}} />,
    homepage: <HomepageSettings initialData={initialSettings.homepage || {}} />,
    currency: <CurrencySettings initialData={initialSettings.currency || {}} />,
    contact: <ContactSettings initialData={initialSettings.contact || {}} />,
    social: <SocialSettings initialData={initialSettings.social || {}} />,
    product_display: <ProductDisplaySettings initialData={initialSettings.product_display || {}} />,
    content: <ContentSettings initialData={initialSettings.content || {}} />,
    video: <VideoSettings initialData={initialSettings.video || {}} />,
    offer: <OfferSettings initialData={initialSettings.offer || {}} />,
    brands: <BrandsSettings initialData={initialSettings.brands || {}} />,
    hero: <HeroSettings initialData={initialSettings.hero || {}} />,
    featured: <FeaturedSettings initialData={initialSettings.featured || {}} />,
    about: <AboutSettings initialData={initialSettings.about || {}} />,
  };

  return (
    <div>
      {/* Tab bar */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          {groupKeys.map((key) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`whitespace-nowrap border-b-2 px-1 py-3 text-sm font-medium transition-colors ${
                activeTab === key
                  ? 'border-black text-black'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              {groupLabels[key]}
            </button>
          ))}
        </nav>
      </div>

      {/* Active tab content */}
      {tabComponents[activeTab]}
    </div>
  );
}
