// ThemePresetsSection.tsx
// 3 cards con preview aplicado al hacer click. Cada card muestra el
// gradient del preset + un mini-blob con los colores.

import React from 'react';
import { Sparkles, Check } from 'lucide-react';
import { MENU_PRESETS, PRESET_ORDER, applyPreset, type MenuPreset } from '@/lib/menuPresets';
import type { MenuSettings, ThemePresetId } from '@/types/menuSettings';

interface ThemePresetsSectionProps {
  settings: MenuSettings;
  onChange: (next: MenuSettings) => void;
}

export function ThemePresetsSection({ settings, onChange }: ThemePresetsSectionProps) {
  return (
    <div className="card p-6 space-y-5 animate-slide-up">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-royal-100 text-royal-600 rounded-xl">
          <Sparkles size={20} />
        </div>
        <div className="flex-1">
          <h2 className="text-lg font-black text-ink-900">Tema del Menú</h2>
          <p className="text-xs text-ink-500">Elige un punto de partida. Puedes ajustar todo después.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {PRESET_ORDER.map((id) => {
          const preset: MenuPreset = MENU_PRESETS[id];
          const active = settings.themePreset === id;
          return (
            <button
              key={id}
              onClick={() => onChange(applyPreset(settings, id))}
              className={`group relative text-left p-4 rounded-2xl border-2 transition-all overflow-hidden ${
                active
                  ? 'border-brand-500 shadow-glow-brand'
                  : 'border-ink-200 hover:border-ink-300 hover:-translate-y-0.5'
              }`}
            >
              <div
                className="absolute inset-0 opacity-90 transition-opacity group-hover:opacity-100"
                style={{ background: preset.previewGradient }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="relative space-y-2 text-white">
                <div className="flex items-start justify-between">
                  <p className="text-base font-black drop-shadow">{preset.label}</p>
                  {active && (
                    <span className="p-1 bg-white text-brand-600 rounded-full">
                      <Check size={12} strokeWidth={3} />
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-white/70 leading-tight">{preset.description}</p>
                <div className="flex gap-1 pt-1">
                  {preset.primaryColor && (
                    <div className="w-4 h-4 rounded-full ring-1 ring-white/30" style={{ backgroundColor: preset.primaryColor }} />
                  )}
                  {preset.secondaryColor && (
                    <div className="w-4 h-4 rounded-full ring-1 ring-white/30" style={{ backgroundColor: preset.secondaryColor }} />
                  )}
                  {preset.accentColor && (
                    <div className="w-4 h-4 rounded-full ring-1 ring-white/30" style={{ backgroundColor: preset.accentColor }} />
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
      {settings.themePreset === 'custom' && (
        <p className="text-xs text-ink-500 italic">
          Estás editando un tema personalizado. Elige un preset para volver a un estilo base.
        </p>
      )}
    </div>
  );
}
