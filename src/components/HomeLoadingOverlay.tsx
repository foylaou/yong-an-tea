'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useSettingsStore } from '../store/settings/settings-slice';

/**
 * Covers the homepage with a full-screen splash (logo + spinner) until
 * useSettingsStore has hydrated with real site_settings. Without this,
 * the first paint (SSR + first client render) shows the store's hard-coded
 * template defaults — demo hero images, "Nancy Chair" featured product, etc.
 * — which then pop to the real content once settings finish loading.
 */
function HomeLoadingOverlay() {
    const loaded = useSettingsStore((s) => s.loaded);
    const [visible, setVisible] = useState(true);
    const [fadingOut, setFadingOut] = useState(false);

    useEffect(() => {
        if (!loaded) return;
        setFadingOut(true);
        const timer = setTimeout(() => setVisible(false), 300);
        return () => clearTimeout(timer);
    }, [loaded]);

    if (!visible) return null;

    return (
        <div
            className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center gap-6 bg-white transition-opacity duration-300 ${
                fadingOut ? 'opacity-0' : 'opacity-100'
            }`}
        >
            <Image src="/home-logo.svg" alt="永安茶園" width={160} height={48} priority unoptimized />
            <span className="border-primary h-8 w-8 animate-spin rounded-full border-2 border-t-transparent" />
        </div>
    );
}

export default HomeLoadingOverlay;
