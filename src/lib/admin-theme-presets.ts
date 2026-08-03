export interface ThemePreset {
  name: string;
  label: string;
}

export const lightThemePresets: ThemePreset[] = [
  { name: 'light', label: '品牌金（預設）' },
  { name: 'contrast', label: 'Contrast' },
  { name: 'cupcake', label: 'Cupcake' },
  { name: 'bumblebee', label: 'Bumblebee' },
  { name: 'emerald', label: 'Emerald' },
  { name: 'corporate', label: 'Corporate' },
  { name: 'retro', label: 'Retro' },
  { name: 'cyberpunk', label: 'Cyberpunk' },
  { name: 'valentine', label: 'Valentine' },
  { name: 'garden', label: 'Garden' },
  { name: 'lofi', label: 'Lofi' },
  { name: 'pastel', label: 'Pastel' },
  { name: 'fantasy', label: 'Fantasy' },
  { name: 'wireframe', label: 'Wireframe' },
  { name: 'cmyk', label: 'CMYK' },
  { name: 'autumn', label: 'Autumn' },
  { name: 'acid', label: 'Acid' },
  { name: 'lemonade', label: 'Lemonade' },
  { name: 'winter', label: 'Winter' },
  { name: 'nord', label: 'Nord' },
];

export const darkThemePresets: ThemePreset[] = [
  { name: 'dark', label: '品牌金（預設）' },
  { name: 'dim', label: 'Dim' },
  { name: 'material-dark', label: 'Material Dark' },
];

export function themeLabel(name: string): string {
  return (
    lightThemePresets.find((t) => t.name === name)?.label ||
    darkThemePresets.find((t) => t.name === name)?.label ||
    name
  );
}
