// TypographySection.tsx
// Selector visual de tipografía: 4 swatches "Aa" + peso + tamaño.

import React from 'react';
import { Type } from 'lucide-react';
import type { MenuSettings, FontFamilyId, TitleWeight, BaseSize } from '@/types/menuSettings';

interface TypographySectionProps {
  settings: MenuSettings;
  onChange: (next: MenuSettings) => void;
}

const FAMILIES: { id: FontFamilyId; label: string; sample: string }[] = [
  { id: 'sans', label: 'Inter (Sans)', sample: 'Aa' },
  { id: 'serif', label: 'Playfair (Serif)', sample: 'Aa' },
  { id: 'display', label: 'Bebas (Display)', sample: 'Aa' },
  { id: 'handwritten', label: 'Caveat (Manuscrita)', sample: 'Aa' },
];

const WEIGHTS: { value: TitleWeight; label: string }[] = [
  { value: 400, label: 'Ligero' },
  { value: 600, label: 'Semi' },
  { value: 700, label: 'Bold' },
  { value: 800, label: 'Extra' },
  { value: 900, label: 'Black' },
];

const SIZES: { value: BaseSize; label: string }[] = [
  { value: 'sm', label: 'Pequeño' },
  { value: 'base', label: 'Normal' },
  { value: 'lg', label: 'Grande' },
];

// Mapas para visualizar los swatches (necesitan la utility class en Tailwind,
// que ya está mapeada en tailwind.config.js a las CSS vars).
const FAMILY_CLASS: Record<FontFamilyId, string> = {
  sans: 'font-sans',
  serif: 'font-serif',
  display: 'font-display',
  handwritten: 'font-handwritten',
};

export function TypographySection({ settings, onChange }: TypographySectionProps) {
  const setTypography = <K extends keyof MenuSettings['typography']>(
    key: K,
    value: MenuSettings['typography'][K]
  ) => {
    onChange({
      ...settings,
      typography: { ...settings.typography, [key]: value },
    });
  };

  return (
    <div className="card p-6 space-y-5 animate-slide-up" style={{ animationDelay: '150ms' }}>
      <div className="flex items-center gap-3">
        <div className="p-2 bg-sky-100 text-sky-600 rounded-xl">
          <Type size={20} />
        </div>
        <h2 className="text-lg font-black text-ink-900">Tipografía</h2>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-bold text-ink-600">Familia</label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {FAMILIES.map((f) => {
            const active = settings.typography.family === f.id;
            return (
              <button
                key={f.id}
                onClick={() => setTypography('family', f.id)}
                className={`p-4 rounded-2xl border-2 transition-all text-center ${
                  active
                    ? 'border-brand-500 bg-brand-50 shadow-glow-brand'
                    : 'border-ink-200 hover:border-ink-300 bg-white'
                }`}
              >
                <p className={`text-4xl text-ink-900 ${FAMILY_CLASS[f.id]}`}>{f.sample}</p>
                <p className="text-[10px] font-bold uppercase tracking-wider text-ink-500 mt-2">
                  {f.label}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2 border-t border-ink-100">
        <div className="space-y-2">
          <label className="text-sm font-bold text-ink-600">Peso del Título</label>
          <div className="inline-flex flex-wrap bg-ink-100 rounded-xl p-1 gap-1">
            {WEIGHTS.map((w) => (
              <button
                key={w.value}
                onClick={() => setTypography('titleWeight', w.value)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  settings.typography.titleWeight === w.value
                    ? 'bg-white text-ink-900 shadow-sm'
                    : 'text-ink-500 hover:text-ink-700'
                }`}
              >
                {w.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-ink-600">Tamaño Base</label>
          <div className="inline-flex bg-ink-100 rounded-xl p-1 gap-1">
            {SIZES.map((s) => (
              <button
                key={s.value}
                onClick={() => setTypography('baseSize', s.value)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  settings.typography.baseSize === s.value
                    ? 'bg-white text-ink-900 shadow-sm'
                    : 'text-ink-500 hover:text-ink-700'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
