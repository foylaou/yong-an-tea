'use client';

import { createContext, useContext, useEffect, useMemo, type ReactNode } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';

/**
 * Minimal port of Nexus's ConfigProvider — only the light/dark theme toggle
 * is exposed in this admin (sidebar theme, font family, direction, and
 * fullscreen were tied to Nexus's theme-customizer drawer, which isn't used
 * here).
 */
type Theme = 'light' | 'dark';

interface AdminConfig {
  theme: Theme;
}

const defaultConfig: AdminConfig = { theme: 'light' };

function useConfigHook() {
  const [config, setConfig] = useLocalStorage<AdminConfig>('__yat_admin_config__', defaultConfig);
  const htmlRef = useMemo(() => (typeof window !== 'undefined' ? document.documentElement : null), []);

  const toggleTheme = () => {
    setConfig({ theme: config.theme === 'dark' ? 'light' : 'dark' });
  };

  useEffect(() => {
    if (!htmlRef) return;
    htmlRef.setAttribute('data-theme', config.theme);
  }, [config, htmlRef]);

  return { config, toggleTheme };
}

const ConfigContext = createContext({} as ReturnType<typeof useConfigHook>);

export function NexusAdminConfigProvider({ children }: { children: ReactNode }) {
  return <ConfigContext.Provider value={useConfigHook()}>{children}</ConfigContext.Provider>;
}

export function useNexusAdminConfig() {
  return useContext(ConfigContext);
}
