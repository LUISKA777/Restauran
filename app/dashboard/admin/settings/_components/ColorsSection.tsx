// ColorsSection.tsx
// Sección de paleta de colores. Color pickers + presets de color.
// (Reusado de la implementación previa.)

import React from 'react';
import { Palette, Sparkles, Image as ImageIcon } from 'lucide-react';
import type { MenuSettings } from '@/types/menuSettings';

const COLOR_PRESETS = [
  { name: 'Elegante Oro', primary: '#D4AF37', secondary: '#FFFFFF', accent: '#FDFBF2' },
  { name: 'Moderno Oscuro', primary: '#1A1A1A', secondary: '#FFFFFF', accent: '#F3F4F6' },
  { name: 'Verde Fresco', primary: '#16A34A', secondary: '#FFFFFF', accent: '#F0FDF4' },
  { name: 'Océano Profundo', primary: '#1E3A8A', secondary: '#FFFFFF', accent: '#EEF2FF' },
  { name: 'Bebidas & Licores', primary: '#B45309', secondary: '#FFFFFF', accent: '#FFFBEB' },
];

interface ColorsSectionProps {
  settings: MenuSettings;
  onChange: (next: MenuSettings) => void;
}

const COLOR_FIELDS = [
  { key: 'primaryColor' as const, label: 'Color Primario' },
  { key: 'secondaryColor' as const, label: 'Color Secundario' },
  { key: 'accentColor' as const, label: 'Color de Acento' },
];

export function ColorsSection({ settings, onChange }: ColorsSectionProps) {
  const applyColorPreset = (p: typeof COLOR_PRESETS[0]) => {
    onChange({
      ...settings,
      primaryColor: p.primary,
      secondaryColor: p.secondary,
      accentColor: p.accent,
    });
  };

  return (
    <div className="card p-6 space-y-6 animate-slide-up" style={{ animationDelay: '50ms' }}>
      <div className="flex items-center gap-3">
        <div className="p-2 bg-brand-100 text-brand-600 rounded-xl">
          <Palette size={20} />
        </div>
        <h2 className="text-lg font-black text-ink-900">Paleta de Colores</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {COLOR_FIELDS.map(({ key, label }) => (
          <div key={key} className="space-y-2">
            <label className="text-sm font-bold text-ink-600">{label}</label>
            <div className="flex gap-2">
              <input
                type="color"
                value={settings[key]}
                onChange={(e) => onChange({ ...settings, [key]: e.target.value })}
                className="w-12 h-12 rounded-xl cursor-pointer bg-transparent border border-ink-200"
              />
              <input
                type="text"
                value={settings[key]}
                onChange={(e) => onChange({ ...settings, [key]: e.target.value })}
                className="input flex-grow text-xs font-mono"
              />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2 border-t border-ink-100">
        <div className="space-y-2">
          <label className="text-sm font-bold text-ink-600">URL del Logo</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={settings.logoUrl}
              onChange={(e) => onChange({ ...settings, logoUrl: e.target.value })}
              className="input flex-grow"
              placeholder="https://example.com/logo.png"
            />
            <div className="w-10 h-10 border border-ink-200 rounded-xl overflow-hidden bg-ink-100 flex items-center justify-center shrink-0">
              {settings.logoUrl ? (
                <img src={settings.logoUrl} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <ImageIcon size={16} className="text-ink-400" />
              )}
            </div>
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-ink-600">Imagen de Fondo</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={settings.backgroundImageUrl}
              onChange={(e) => onChange({ ...settings, backgroundImageUrl: e.target.value })}
              className="input flex-grow"
              placeholder="https://example.com/bg.jpg"
            />
            <div className="w-10 h-10 border border-ink-200 rounded-xl overflow-hidden bg-ink-100 flex items-center justify-center shrink-0">
              {settings.backgroundImageUrl ? (
                <img src={settings.backgroundImageUrl} alt="BG" className="w-full h-full object-cover" />
              ) : (
                <ImageIcon size={16} className="text-ink-400" />
              )}
            </div>
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-ink-600">Color de Fondo del Menú</label>
          <div className="flex gap-2">
            <input
              type="color"
              value={settings.backgroundColor}
              onChange={(e) => onChange({ ...settings, backgroundColor: e.target.value })}
              className="w-12 h-12 rounded-xl cursor-pointer bg-transparent border border-ink-200"
            />
            <input
              type="text"
              value={settings.backgroundColor}
              onChange={(e) => onChange({ ...settings, backgroundColor: e.target.value })}
              className="input flex-grow text-xs font-mono"
            />
          </div>
        </div>
      </div>

      <div className="pt-2 border-t border-ink-100 space-y-3">
        <p className="text-sm font-bold text-ink-500 flex items-center gap-2">
          <Sparkles size={14} className="text-brand-500" /> Paletas Recomendadas
        </p>
        <div className="flex flex-wrap gap-2">
          {COLOR_PRESETS.map((p) => (
            <button
              key={p.name}
              onClick={() => applyColorPreset(p)}
              className="flex items-center gap-2 px-3 py-2 rounded-full border border-ink-200 hover:border-brand-500 transition-all text-xs font-bold text-ink-600 hover:text-brand-600 bg-white"
            >
              <div className="flex gap-0.5">
                <div className="w-3 h-3 rounded-full ring-1 ring-ink-200" style={{ backgroundColor: p.primary }} />
                <div className="w-3 h-3 rounded-full ring-1 ring-ink-200" style={{ backgroundColor: p.secondary }} />
                <div className="w-3 h-3 rounded-full ring-1 ring-ink-200" style={{ backgroundColor: p.accent }} />
              </div>
              {p.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
