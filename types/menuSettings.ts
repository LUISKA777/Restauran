// types/menuSettings.ts
// Shape completo de `restaurants.settings` para el menú del cliente.
// Mantiene campos existentes (compatibilidad hacia atrás) y añade nuevos.

export type ThemePresetId =
  | 'elegant-dark'
  | 'warm-sunset'
  | 'bistro-light'
  | 'custom';

export type FontFamilyId = 'sans' | 'serif' | 'display' | 'handwritten';
export type HeroVariant = 'logo-name' | 'logo-name-tagline' | 'image-fullbleed';
export type CardStyle = 'compact' | 'comfortable' | 'spacious';
export type AspectRatio = 'square' | '4-3' | '16-9';
export type NavPosition = 'sticky-top' | 'hidden' | 'sidebar';
export type CardColumns = 1 | 2 | 3;
export type TitleWeight = 400 | 600 | 700 | 800 | 900;
export type BaseSize = 'sm' | 'base' | 'lg';

export interface MenuSettings {
  // ─── EXISTING (preservados) ───────────────────────────
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  logoUrl: string;
  backgroundImageUrl: string;
  backgroundColor: string;
  categories: string[];

  // ─── NEW ──────────────────────────────────────────────
  themePreset: ThemePresetId;

  typography: {
    family: FontFamilyId;
    titleWeight: TitleWeight;
    baseSize: BaseSize;
  };

  hero: {
    variant: HeroVariant;
    tagline: string;
    showBadge: boolean;
    badgeText: string;
  };

  copy: {
    welcomeHeading: string;
    welcomeMessage: string;
    cartButtonLabel: string;
    emptyCartMessage: string;
    orderNotesPlaceholder: string;
    submitButtonLabel: string;
    successTitle: string;
    successMessage: string;
    productFallbackDescription: string;
  };

  contact: {
    showContactBlock: boolean;
    whatsappNumber: string;
    address: string;
    schedule: string;
  };

  layout: {
    columns: CardColumns;
    cardStyle: CardStyle;
    cardAspectRatio: AspectRatio;
    categoryNavPosition: NavPosition;
    showCategoryBadge: boolean;
  };
}

// Defaults: replican EXACTAMENTE el comportamiento actual del menú.
// Si un restaurante trae settings = {} o sin campos nuevos, se verá idéntico.
export function getDefaultSettings(): MenuSettings {
  return {
    primaryColor: '#f97316',
    secondaryColor: '#ffffff',
    accentColor: '#1e293b',
    logoUrl: '',
    backgroundImageUrl: '',
    backgroundColor: '#0f172a',
    categories: ['General', 'Bebidas', 'Platos Fuertes'],

    themePreset: 'elegant-dark',

    typography: {
      family: 'sans',
      titleWeight: 800,
      baseSize: 'base',
    },

    hero: {
      variant: 'logo-name',
      tagline: '',
      showBadge: true,
      badgeText: 'Menú Digital',
    },

    copy: {
      welcomeHeading: '¡Bienvenido a',
      welcomeMessage:
        'Para comenzar a disfrutar, por favor selecciona el número de tu mesa.',
      cartButtonLabel: 'Ver mi pedido',
      emptyCartMessage: 'Tu carrito está vacío',
      orderNotesPlaceholder: 'Ej: Por favor, sin cebolla...',
      submitButtonLabel: 'Confirmar y Enviar a Cocina',
      successTitle: '¡Pedido Enviado!',
      successMessage: 'Tu pedido ha sido recibido y está en preparación.',
      productFallbackDescription:
        'Un sabor excepcional preparado con los mejores ingredientes.',
    },

    contact: {
      showContactBlock: false,
      whatsappNumber: '',
      address: '',
      schedule: '',
    },

    layout: {
      columns: 2,
      cardStyle: 'comfortable',
      cardAspectRatio: '4-3',
      categoryNavPosition: 'sticky-top',
      showCategoryBadge: true,
    },
  };
}

// Deep-merge por sección. Top-level fields de `raw` pisan a defaults.
// Para `typography`, `hero`, `copy`, `contact`, `layout` se hace merge
// sección-por-sección para que un campo nuevo faltante no rompa nada.
export function mergeSettings(raw: any): MenuSettings {
  const defaults = getDefaultSettings();
  if (!raw || typeof raw !== 'object') return defaults;

  const safeObj = (v: any) => (v && typeof v === 'object' ? v : {});

  return {
    ...defaults,
    ...raw,
    typography: { ...defaults.typography, ...safeObj(raw.typography) },
    hero: { ...defaults.hero, ...safeObj(raw.hero) },
    copy: { ...defaults.copy, ...safeObj(raw.copy) },
    contact: { ...defaults.contact, ...safeObj(raw.contact) },
    layout: { ...defaults.layout, ...safeObj(raw.layout) },
  };
}
