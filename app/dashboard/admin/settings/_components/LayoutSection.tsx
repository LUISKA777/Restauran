// LayoutSection.tsx
// Controles para layout/densidad: columnas, card style, aspect ratio, nav position.

import React from 'react';
import { Layout, Columns, Square, Image as ImageIcon, List } from 'lucide-react';
import type { MenuSettings, CardColumns, CardStyle, AspectRatio, NavPosition } from '@/types/menuSettings';

interface LayoutSectionProps {
  settings: MenuSettings;
  onChange: (next: MenuSettings) => void;
}

const COLS_OPTIONS: { value: CardColumns; label: string }[] = [
  { value: 1, label: '1 col' },
  { value: 2, label: '2 cols' },
  { value: 3, label: '3 cols' },
];

const STYLE_OPTIONS: { value: CardStyle; label: string }[] = [
  { value: 'compact', label: 'Compacto' },
  { value: 'comfortable', label: 'Cómodo' },
  { value: 'spacious', label: 'Espacioso' },
];

const ASPECT_OPTIONS: { value: AspectRatio; label: string }[] = [
  { value: 'square', label: 'Cuadrado' },
  { value: '4-3', label: '4:3' },
  { value: '16-9', label: '16:9' },
];

const NAV_OPTIONS: { value: NavPosition; label: string }[] = [
  { value: 'sticky-top', label: 'Sticky' },
  { value: 'hidden', label: 'Oculto' },
  { value: 'sidebar', label: 'Lateral' },
];

function Segmented<T extends string | number>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="inline-flex bg-ink-100 rounded-xl p-1 gap-1">
      {options.map((o) => (
        <button
          key={String(o.value)}
          onClick={() => onChange(o.value)}
          className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
            value === o.value
              ? 'bg-white text-ink-900 shadow-sm'
              : 'text-ink-500 hover:text-ink-700'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function LayoutSection({ settings, onChange }: LayoutSectionProps) {
  const setLayout = <K extends keyof MenuSettings['layout']>(
    key: K,
    value: MenuSettings['layout'][K]
  ) => {
    onChange({
      ...settings,
      layout: { ...settings.layout, [key]: value },
    });
  };

  return (
    <div className="card p-6 space-y-5 animate-slide-up" style={{ animationDelay: '100ms' }}>
      <div className="flex items-center gap-3">
        <div className="p-2 bg-emerald-100 text-emerald-600 rounded-xl">
          <Layout size={20} />
        </div>
        <h2 className="text-lg font-black text-ink-900">Diseño y Densidad</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-2">
          <label className="text-sm font-bold text-ink-600 flex items-center gap-2">
            <Columns size={14} /> Columnas
          </label>
          <Segmented
            options={COLS_OPTIONS}
            value={settings.layout.columns}
            onChange={(v) => setLayout('columns', v)}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-ink-600 flex items-center gap-2">
            <Square size={14} /> Densidad de Tarjeta
          </label>
          <Segmented
            options={STYLE_OPTIONS}
            value={settings.layout.cardStyle}
            onChange={(v) => setLayout('cardStyle', v)}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-ink-600 flex items-center gap-2">
            <ImageIcon size={14} /> Proporción Imagen
          </label>
          <Segmented
            options={ASPECT_OPTIONS}
            value={settings.layout.cardAspectRatio}
            onChange={(v) => setLayout('cardAspectRatio', v)}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-ink-600 flex items-center gap-2">
            <List size={14} /> Navegación de Categorías
          </label>
          <Segmented
            options={NAV_OPTIONS}
            value={settings.layout.categoryNavPosition}
            onChange={(v) => setLayout('categoryNavPosition', v)}
          />
        </div>
      </div>
    </div>
  );
}
