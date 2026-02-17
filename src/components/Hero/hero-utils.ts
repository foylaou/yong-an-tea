// Shared utilities for Hero banner overlay & text color settings

export const OVERLAY_DEFAULTS = {
  textColor: '#000000',
  subtitleColor: '#dcb14a',
  overlayColor: '#000000',
  overlayOpacity: 0,
  overlayDirection: 'full' as const,
  buttonStyle: 'dark' as const,
};

/** Fill missing overlay fields for DefaultSlide (backward-compat) */
export function normalizeDefaultSlide<T extends Record<string, any>>(slide: T): T & typeof OVERLAY_DEFAULTS {
  return { ...OVERLAY_DEFAULTS, ...slide };
}

/** Fill missing overlay fields for CarouselSlide (no subtitleColor) */
export function normalizeCarouselSlide<T extends Record<string, any>>(slide: T): T & Omit<typeof OVERLAY_DEFAULTS, 'subtitleColor'> {
  const { subtitleColor: _, ...defaults } = OVERLAY_DEFAULTS;
  return { ...defaults, ...slide };
}

/** Convert hex color to rgba string */
export function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/** Build CSS style object for the overlay div */
export function buildOverlayStyle(
  color: string,
  opacity: number,
  direction: string,
): React.CSSProperties {
  const alpha = opacity / 100;
  const solid = hexToRgba(color, alpha);
  const transparent = hexToRgba(color, 0);

  switch (direction) {
    case 'left':
      return { background: `linear-gradient(to right, ${solid} 0%, ${transparent} 100%)` };
    case 'right':
      return { background: `linear-gradient(to left, ${solid} 0%, ${transparent} 100%)` };
    case 'top':
      return { background: `linear-gradient(to bottom, ${solid} 0%, ${transparent} 100%)` };
    case 'bottom':
      return { background: `linear-gradient(to top, ${solid} 0%, ${transparent} 100%)` };
    case 'full':
    default:
      return { backgroundColor: solid };
  }
}
