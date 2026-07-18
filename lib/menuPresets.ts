// lib/menuPresets.ts
// 3 temas preset para el menú del cliente. Cada uno setea TODO el set
// (colores, tipografía, hero, layout), no solo colores. Al aplicar uno
// se hace spread y `themePreset` queda apuntando al id (o 'custom' si
// el usuario edita después).

import type { MenuSettings, ThemePresetId } from '@/types/menuSettings';

type PresetId = Exclude<ThemePresetId, 'custom'>;

// DeepPartial helper: hace opcional cada nivel recursivamente.
type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};

export interface MenuPreset extends DeepPartial<MenuSettings> {
  label: string;
  description: string;
  previewGradient: string;
}

export const MENU_PRESETS: Record<PresetId, MenuPreset> = {
  'elegant-dark': {
    label: 'Elegante Oscuro',
    description: 'Fine dining, ambiente nocturno',
    previewGradient: 'linear-gradient(135deg,#0f172a 0%,#1e293b 100%)',
    primaryColor: '#f97316',
    secondaryColor: '#ffffff',
    accentColor: '#1e293b',
    backgroundColor: '#0f172a',
    typography: { family: 'serif', titleWeight: 700, baseSize: 'base' },
    hero: { variant: 'logo-name' },
    layout: {
      columns: 2,
      cardStyle: 'comfortable',
      cardAspectRatio: '4-3',
      categoryNavPosition: 'sticky-top',
      showCategoryBadge: true,
    },
  },

  'warm-sunset': {
    label: 'Cálido Sunset',
    description: 'Cafeterías, panaderías, brunch',
    previewGradient: 'linear-gradient(135deg,#7c2d12 0%,#9a3412 100%)',
    primaryColor: '#ea580c',
    secondaryColor: '#fff7ed',
    accentColor: '#fed7aa',
    backgroundColor: '#7c2d12',
    typography: { family: 'handwritten', titleWeight: 700, baseSize: 'lg' },
    hero: { variant: 'logo-name-tagline' },
    layout: {
      columns: 2,
      cardStyle: 'spacious',
      cardAspectRatio: '4-3',
      categoryNavPosition: 'sticky-top',
      showCategoryBadge: true,
    },
  },

  'bistro-light': {
    label: 'Bistro Light',
    description: 'Moderno, luminoso, bistró diurno',
    previewGradient: 'linear-gradient(135deg,#fafaf9 0%,#f5f5f4 100%)',
    primaryColor: '#0f172a',
    secondaryColor: '#f8fafc',
    accentColor: '#1e293b',
    backgroundColor: '#fafaf9',
    typography: { family: 'sans', titleWeight: 800, baseSize: 'base' },
    hero: { variant: 'logo-name' },
    layout: {
      columns: 3,
      cardStyle: 'compact',
      cardAspectRatio: '4-3',
      categoryNavPosition: 'sticky-top',
      showCategoryBadge: true,
    },
  },
};

export const PRESET_ORDER: PresetId[] = [
  'elegant-dark',
  'warm-sunset',
  'bistro-light',
];

// Aplica un preset al settings actual. Mantiene campos que el preset
// no toca (logoUrl, backgroundImageUrl, copy, contact, categories).
// Marca `themePreset: 'custom'` si después hay diff con el preset aplicado.
export function applyPreset(
  current: MenuSettings,
  presetId: PresetId
): MenuSettings {
  const preset = MENU_PRESETS[presetId];

  // El preset es DeepPartial así que hacemos fallback al current para
  // cualquier campo de primer nivel no presente.
  const topLevel: Partial<MenuSettings> = {
    primaryColor: preset.primaryColor ?? current.primaryColor,
    secondaryColor: preset.secondaryColor ?? current.secondaryColor,
    accentColor: preset.accentColor ?? current.accentColor,
    backgroundColor: preset.backgroundColor ?? current.backgroundColor,
  };

  return {
    ...current,
    ...topLevel,
    typography: { ...current.typography, ...(preset.typography || {}) },
    hero: {
      ...current.hero,
      ...(preset.hero || {}),
      // tagline es personal, no se sobrescribe con el preset
      tagline: current.hero.tagline,
    },
    layout: { ...current.layout, ...(preset.layout || {}) },
    themePreset: presetId,
  };
}
