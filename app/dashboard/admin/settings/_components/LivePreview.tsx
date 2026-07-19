// LivePreview.tsx
// Miniatura viva del menú público. Reusa BrandingHeader y ProductCard reales
// (los mismos que se ven en /menu/[id]) para que el preview sea la verdad,
// no un dibujo. Renderizado a tamaño grande para que los cambios se vean
// inmediatamente al editar el tema, colores, tipografía, layout, etc.

import React from 'react';
import type { MenuSettings } from '@/types/menuSettings';
import { BrandingHeader } from '@/components/menu/BrandingHeader';
import { ProductCard } from '@/components/menu/ProductCard';
import { ShoppingBag, Eye, Sparkles } from 'lucide-react';

interface LivePreviewProps {
  settings: MenuSettings;
  restaurantName?: string;
}

const MOCK_PRODUCTS = [
  {
    id: 'p1',
    name: 'Hamburguesa R',
    description: 'Carne angus, queso cheddar, bacon y cebolla caramelizada en pan brioche.',
    price: 6500,
    image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&h=400&fit=crop',
  },
  {
    id: 'p2',
    name: 'Pasta Carbonara',
    description: 'Pasta fresca con panceta crujiente, huevo y parmesano auténtico.',
    price: 5800,
    image_url: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=600&h=400&fit=crop',
  },
  {
    id: 'p3',
    name: 'Ceviche Tropical',
    description: 'Pescado fresco marinado en limón con mango, cebolla morada y cilantro.',
    price: 7200,
    image_url: 'https://images.unsplash.com/photo-1535399831218-d5bd36d1a6b3?w=600&h=400&fit=crop',
  },
  {
    id: 'p4',
    name: 'Tiramisú Casero',
    description: 'Clásico italiano con mascarpone, café espresso y cacao espolvoreado.',
    price: 3500,
    image_url: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=600&h=400&fit=crop',
  },
];

export function LivePreview({ settings, restaurantName = 'Tu Restaurante' }: LivePreviewProps) {
  // Mapeo de columnas del settings → clases grid de Tailwind
  const gridColsClass = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-2 md:grid-cols-3',
  }[settings.layout.columns];

  return (
    <div className="rounded-2xl border-2 border-ink-200 shadow-xl bg-white overflow-hidden sticky top-6 animate-fade-in">
      {/* Header del panel preview */}
      <div className="px-4 py-3 bg-gradient-to-r from-brand-50 to-royal-50 border-b border-ink-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-white rounded-lg shadow-sm text-brand-600">
            <Eye size={14} />
          </div>
          <div>
            <h2 className="text-sm font-black text-ink-900 flex items-center gap-1.5">
              Vista Previa <Sparkles size={12} className="text-amber-500" />
            </h2>
            <p className="text-[10px] text-ink-500">Actualiza en tiempo real</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">En vivo</span>
        </div>
      </div>

      {/* Contenedor del preview: simulamos un "phone" con marco */}
      <div className="p-4 bg-ink-100">
        <div
          className="mx-auto rounded-2xl shadow-2xl overflow-hidden border-4 border-ink-900/10"
          style={{
            backgroundColor: settings.backgroundColor,
            // Aplicamos los colores como CSS variables (mismo patrón que el menú real)
            ['--color-primary' as any]: settings.primaryColor,
            ['--color-secondary' as any]: settings.secondaryColor,
            ['--color-accent' as any]: settings.accentColor,
          } as React.CSSProperties}
        >
          {/* Orbes de color atmosféricos (idénticos al menú real) */}
          <div className="relative">
            <div
              className="absolute inset-0 pointer-events-none opacity-25"
              style={{
                background: `radial-gradient(circle at top right, ${settings.primaryColor}40, transparent 60%), radial-gradient(circle at bottom left, ${settings.primaryColor}30, transparent 60%)`,
              }}
            />
            {settings.backgroundImageUrl && (
              <div
                className="absolute inset-0 opacity-20 scale-110 pointer-events-none"
                style={{
                  backgroundImage: `url(${settings.backgroundImageUrl})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  filter: 'blur(80px) saturate(180%)',
                }}
              />
            )}

            <BrandingHeader name={restaurantName} settings={settings} />

            {/* Productos mock para el preview */}
            <div className="px-4 pb-4">
              <div className={`grid ${gridColsClass} gap-3`}>
                {MOCK_PRODUCTS.slice(0, settings.layout.columns * 2).map((p) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    onAdd={() => {}}
                    density={settings.layout.cardStyle}
                    aspect={settings.layout.cardAspectRatio}
                    fallbackDescription={settings.copy.productFallbackDescription}
                  />
                ))}
              </div>
            </div>

            {/* Mock del botón flotante de carrito (igual al menú real) */}
            <div className="px-4 pb-4">
              <div className="w-full p-3 bg-slate-900/95 backdrop-blur-xl border border-white/10 text-white rounded-2xl shadow-2xl flex items-center justify-between font-bold">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-white/10 rounded-lg">
                    <ShoppingBag size={14} />
                  </div>
                  <span className="text-xs">{settings.copy.cartButtonLabel}</span>
                </div>
                <div
                  className="px-2.5 py-1 rounded-xl text-xs font-black"
                  style={{
                    backgroundColor: settings.primaryColor,
                    color: settings.secondaryColor,
                  }}
                >
                  0 · ₡0
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer con info del preset activo */}
      <div className="px-4 py-2.5 bg-ink-50 border-t border-ink-200 flex items-center justify-between">
        <span className="text-[10px] font-bold text-ink-500 uppercase tracking-wider">
          Tema: <span className="text-brand-600">{settings.themePreset}</span>
        </span>
        <span className="text-[10px] font-bold text-ink-500 uppercase tracking-wider">
          {settings.layout.columns}×{settings.layout.cardStyle}
        </span>
      </div>
    </div>
  );
}
