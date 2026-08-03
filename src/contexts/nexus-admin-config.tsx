'use client';

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';

/**
 * Admin appearance config. `mode` is what the user asked for; `lightTheme`/
 * `darkTheme` are which daisyUI skin to use once `mode` resolves to a
 * concrete light-or-dark scheme (see /admin/appearance for the picker).
 */
export type Mode = 'system' | 'light' | 'dark';
export type Scheme = 'light' | 'dark';

interface AdminConfig {
  mode: Mode;
  lightTheme: string;
  darkTheme: string;
}

const defaultConfig: AdminConfig = { mode: 'light', lightTheme: 'light', darkTheme: 'dark' };

function useSystemPrefersDark(): boolean {
  const [prefersDark, setPrefersDark] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    setPrefersDark(mql.matches);
    const listener = (e: MediaQueryListEvent) => setPrefersDark(e.matches);
    mql.addEventListener('change', listener);
    return () => mql.removeEventListener('change', listener);
  }, []);

  return prefersDark;
}

function useConfigHook() {
  const [config, setConfig] = useLocalStorage<AdminConfig>('__yat_admin_config__', defaultConfig);
  const htmlRef = useMemo(() => (typeof window !== 'undefined' ? document.documentElement : null), []);
  const systemPrefersDark = useSystemPrefersDark();

  const resolvedScheme: Scheme = config.mode === 'system' ? (systemPrefersDark ? 'dark' : 'light') : config.mode;
  const activeThemeName = resolvedScheme === 'dark' ? config.darkTheme : config.lightTheme;

  const toggleTheme = () => {
    setConfig((prev) => ({ ...prev, mode: resolvedScheme === 'dark' ? 'light' : 'dark' }));
  };

  const setMode = (mode: Mode) => setConfig((prev) => ({ ...prev, mode }));
  const setLightTheme = (name: string) => setConfig((prev) => ({ ...prev, lightTheme: name }));
  const setDarkTheme = (name: string) => setConfig((prev) => ({ ...prev, darkTheme: name }));
  const resetToDefault = () => setConfig(defaultConfig);

  useEffect(() => {
    if (!htmlRef) return;
    htmlRef.setAttribute('data-theme', activeThemeName);
    htmlRef.setAttribute('data-color-scheme', resolvedScheme);
  }, [htmlRef, activeThemeName, resolvedScheme]);

  return { config, resolvedScheme, activeThemeName, toggleTheme, setMode, setLightTheme, setDarkTheme, resetToDefault };
}

const ConfigContext = createContext({} as ReturnType<typeof useConfigHook>);

export function NexusAdminConfigProvider({ children }: { children: ReactNode }) {
  return <ConfigContext.Provider value={useConfigHook()}>{children}</ConfigContext.Provider>;
}

export function useNexusAdminConfig() {
  return useContext(ConfigContext);
}
