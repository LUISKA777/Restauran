// LivePreview.tsx
// Miniatura viva del menú público. Reusa BrandingHeader y ProductCard reales
// (los mismos que se ven en /menu/[id]) dentro de un contenedor escalado.
// Así el preview ES la verdad, no un dibujo.

import React from 'react';
import type { MenuSettings } from '@/types/menuSettings';
import { BrandingHeader } from '@/components/menu/BrandingHeader';
import { ProductCard } from '@/components/menu/ProductCard';

interface LivePreviewProps {
  settings: MenuSettings;
  restaurantName?: string;
}

const MOCK_PRODUCTS = [
  { id: 'p1', name: 'Hamburguesa R', description: 'Carne angus, queso cheddar, bacon y cebolla caramelizada.', price: 6500, image_url: '' },
  { id: 'p2', name: 'Pasta Carbonara', description: 'Pasta fresca con panceta, huevo y parmesano.', price: 5800, image_url: '' },
];

export function LivePreview({ settings, restaurantName = 'Tu Restaurante' }: LivePreviewProps) {
  return (
    <div className="bg-gradient-night p-4 rounded-2xl border border-ink-800 shadow-2xl text-white space-y-3 sticky top-6 overflow-hidden">
      <div className="absolute -top-12 -right-12 w-40 h-40 bg-brand-500/20 rounded-full blur-2xl pointer-events-none" />
      <div className="relative flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-white/10 backdrop-blur-md rounded-lg text-white border border-white/20">
            👁
          </div>
          <h2 className="text-sm font-black">Vista Previa</h2>
        </div>
        <span className="text-[9px] font-bold uppercase tracking-widest text-white/40">En vivo</span>
      </div>

      {/* Contenedor escalado: 300px de ancho visible × ~520px alto */}
      <div
        className="relative mx-auto overflow-hidden rounded-2xl border border-white/10"
        style={{
          width: '300px',
          height: '520px',
        }}
      >
        <div
          className="origin-top-left"
          style={{
            transform: 'scale(0.5)',
            width: '600px',
            minHeight: '1040px',
          }}
        >
          <BrandingHeader name={restaurantName} settings={settings} />
          <div className="p-4 grid grid-cols-2 gap-3">
            {MOCK_PRODUCTS.map((p) => (
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
      </div>

      <p className="relative text-[10px] text-white/40 text-center italic">
        Lo que verán tus clientes
      </p>
    </div>
  );
}
