'use client';

import { useNexusAdminConfig } from '@/contexts/nexus-admin-config';

export function ThemeToggle({ className }: { className?: string }) {
  const { toggleTheme } = useNexusAdminConfig();

  return (
    <button
      type="button"
      className={`relative overflow-hidden ${className ?? ''}`}
      onClick={toggleTheme}
      aria-label="切換深色模式"
    >
      <span className="iconify lucide--sun absolute size-4.5 opacity-0 transition-all duration-300 group-data-[color-scheme=light]/html:opacity-100" />
      <span className="iconify lucide--moon absolute size-4.5 opacity-0 transition-all duration-300 group-data-[color-scheme=dark]/html:opacity-100" />
    </button>
  );
}
