'use client';

import { useNexusAdminConfig, type Mode } from '@/contexts/nexus-admin-config';
import { PageTitle } from '@/components/admin/nexus-layout/PageTitle';
import { lightThemePresets, darkThemePresets, themeLabel } from '@/lib/admin-theme-presets';
import { ThemeSwatchCard } from './ThemeSwatchCard';

const modeLabel: Record<Mode, string> = {
  system: '跟隨系統',
  light: '手動模式',
  dark: '手動模式',
};

export function AppearanceSettings() {
  const { config, resolvedScheme, activeThemeName, setMode, setLightTheme, setDarkTheme, resetToDefault } = useNexusAdminConfig();

  return (
    <div>
      <PageTitle title="外觀設定" />

      <div className="space-y-6">
        {/* 當前設定 */}
        <div className="card card-border bg-base-100">
          <div className="card-body">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="card-title">當前設定</h3>
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className="badge badge-primary">{resolvedScheme === 'dark' ? '深色' : '淺色'}: {themeLabel(activeThemeName)}</span>
                  <span className="badge badge-secondary">{modeLabel[config.mode]}</span>
                </div>
              </div>
              <button type="button" onClick={resetToDefault} className="btn btn-ghost btn-sm">
                <span className="iconify lucide--rotate-ccw size-4" />
                重設為預設
              </button>
            </div>
          </div>
        </div>

        {/* 模式設定 */}
        <div className="card card-border bg-base-100">
          <div className="card-body">
            <h3 className="card-title">
              <span className="iconify lucide--settings-2 size-5" />
              模式設定
            </h3>
            <label className="mt-2 flex cursor-pointer items-center gap-4">
              <input type="checkbox" className="toggle toggle-primary" checked={config.mode === 'system'} onChange={(e) => setMode(e.target.checked ? 'system' : resolvedScheme)} />
              <div>
                <span className="text-sm font-medium">跟隨系統</span>
                <p className="text-base-content/60 text-sm">手動選擇使用淺色或深色模式</p>
              </div>
            </label>
            <div className="mt-4 flex gap-3">
              <button
                type="button"
                onClick={() => setMode('light')}
                className={`btn flex-1 ${config.mode === 'light' ? 'btn-primary' : 'btn-outline'}`}
              >
                <span className="iconify lucide--sun size-5" />
                淺色模式
              </button>
              <button
                type="button"
                onClick={() => setMode('dark')}
                className={`btn flex-1 ${config.mode === 'dark' ? 'btn-primary' : 'btn-outline'}`}
              >
                <span className="iconify lucide--moon size-5" />
                深色模式
              </button>
            </div>
          </div>
        </div>

        {/* 淺色主題 */}
        <div className="card card-border bg-base-100">
          <div className="card-body">
            <h3 className="card-title">
              <span className="iconify lucide--sun size-5" />
              淺色主題
            </h3>
            <p className="text-base-content/60 text-sm">選擇淺色模式時使用的主題</p>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {lightThemePresets.map((preset) => (
                <ThemeSwatchCard key={preset.name} name={preset.name} label={preset.label} selected={config.lightTheme === preset.name} onSelect={() => setLightTheme(preset.name)} />
              ))}
            </div>
          </div>
        </div>

        {/* 深色主題 */}
        <div className="card card-border bg-base-100">
          <div className="card-body">
            <h3 className="card-title">
              <span className="iconify lucide--moon size-5" />
              深色主題
              {resolvedScheme === 'dark' && <span className="badge badge-primary badge-sm">使用中</span>}
            </h3>
            <p className="text-base-content/60 text-sm">選擇深色模式時使用的主題</p>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {darkThemePresets.map((preset) => (
                <ThemeSwatchCard key={preset.name} name={preset.name} label={preset.label} selected={config.darkTheme === preset.name} onSelect={() => setDarkTheme(preset.name)} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
