'use client';

import { useEffect, useLayoutEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useSettingsStore } from '@/store/settings/settings-slice';

const CACHE_KEY = 'site_settings_cache';

// useLayoutEffect on client, useEffect on server (avoids SSR warning)
const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;

function coerceNumbers(settings: Record<string, any>) {
  const numericKeys = [
    'decimal_places',
    'products_per_page',
    'homepage_variant',
    'header_variant',
    'footer_variant',
  ];
  for (const key of numericKeys) {
    if (settings[key] != null) {
      settings[key] = Number(settings[key]);
    }
  }
}

function SettingsProvider() {
  const hydrate = useSettingsStore((s) => s.hydrate);
  const didRun = useRef(false);

  // Read cache BEFORE browser paint — no flash
  useIsomorphicLayoutEffect(() => {
    if (didRun.current) return;
    didRun.current = true;

    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        coerceNumbers(parsed);
        hydrate(parsed);
      }
    } catch {
      // ignore
    }
  }, [hydrate]);

  // Fetch from Supabase in background to keep cache fresh
  useEffect(() => {
    const supabase = createClient();
    supabase
      .from('site_settings')
      .select('key, value')
      .then(({ data, error }) => {
        if (error || !data) return;
        const settings: Record<string, any> = {};
        for (const row of data) {
          settings[row.key] = row.value;
        }
        coerceNumbers(settings);

        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify(settings));
        } catch {
          // ignore
        }

        hydrate(settings);
      });
  }, [hydrate]);

  return null;
}

export default SettingsProvider;
