// HeroSection.tsx
// Variante de hero (3 opciones con mini-ilustración) + tagline + badge.

import React from 'react';
import { Star, Type, ToggleRight, ToggleLeft } from 'lucide-react';
import type { MenuSettings, HeroVariant } from '@/types/menuSettings';

interface HeroSectionProps {
  settings: MenuSettings;
  onChange: (next: MenuSettings) => void;
}

const VARIANTS: { id: HeroVariant; label: string; description: string }[] = [
  {
    id: 'logo-name',
    description: 'Solo el logo y el nombre del restaurante. Limpio y directo.',
    label: 'Logo + Nombre',
  },
  {
    id: 'logo-name-tagline',
    description: 'Logo, nombre y un eslogan corto. Ideal para identidad de marca.',
    label: 'Logo + Tagline',
  },
  {
    id: 'image-fullbleed',
    description: 'Imagen a sangre completa con logo y nombre superpuestos.',
    label: 'Imagen Full-Bleed',
  },
];

export function HeroSection({ settings, onChange }: HeroSectionProps) {
  const setHero = <K extends keyof MenuSettings['hero']>(
    key: K,
    value: MenuSettings['hero'][K]
  ) => {
    onChange({ ...settings, hero: { ...settings.hero, [key]: value } });
  };

  return (
    <div className="space-y-3">
      <summary className="card p-4 flex items-center justify-between cursor-pointer list-none">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-100 text-amber-600 rounded-xl">
            <Star size={20} />
          </div>
          <div>
            <h2 className="text-base font-black text-ink-900">Hero y Logo</h2>
            <p className="text-xs text-ink-500">Personaliza la cabecera del menú</p>
          </div>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider text-ink-400">Opcional</span>
      </summary>

      <div className="card p-6 space-y-5 mt-2">
        <div className="space-y-3">
          <label className="text-sm font-bold text-ink-600">Variante del Hero</label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {VARIANTS.map((v) => {
              const active = settings.hero.variant === v.id;
              return (
                <button
                  key={v.id}
                  onClick={() => setHero('variant', v.id)}
                  className={`text-left p-4 rounded-2xl border-2 transition-all ${
                    active
                      ? 'border-brand-500 bg-brand-50 shadow-sm'
                      : 'border-ink-200 hover:border-ink-300 bg-white'
                  }`}
                >
                  <p className="text-sm font-black text-ink-900">{v.label}</p>
                  <p className="text-[11px] text-ink-500 mt-1 leading-relaxed">{v.description}</p>
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-ink-600 flex items-center gap-2">
            <Type size={14} /> Tagline (opcional)
          </label>
          <input
            type="text"
            value={settings.hero.tagline}
            onChange={(e) => setHero('tagline', e.target.value)}
            className="input"
            placeholder="Ej: Sabor que se recuerda"
            maxLength={60}
          />
          <p className="text-[10px] text-ink-400 italic">
            Aparece debajo del nombre del restaurante (visible cuando la variante incluye tagline).
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-ink-600">Texto del Badge</label>
          <input
            type="text"
            value={settings.hero.badgeText}
            onChange={(e) => setHero('badgeText', e.target.value)}
            className="input"
            maxLength={30}
          />
        </div>

        <label className="flex items-center gap-3 cursor-pointer p-3 bg-ink-50 rounded-xl">
          <button
            type="button"
            onClick={() => setHero('showBadge', !settings.hero.showBadge)}
            className="transition-colors"
          >
            {settings.hero.showBadge ? (
              <ToggleRight size={28} className="text-brand-500" />
            ) : (
              <ToggleLeft size={28} className="text-ink-400" />
            )}
          </button>
          <span className="text-sm font-bold text-ink-700">Mostrar badge "Menú Digital"</span>
        </label>
      </div>
    </div>
  );
}
