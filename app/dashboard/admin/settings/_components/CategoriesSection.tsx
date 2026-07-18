// CategoriesSection.tsx
// Gestión de categorías del menú (existente, extraído tal cual).

import React from 'react';
import { Tag, Plus, Trash2 } from 'lucide-react';
import type { MenuSettings } from '@/types/menuSettings';

interface CategoriesSectionProps {
  settings: MenuSettings;
  onChange: (next: MenuSettings) => void;
}

export function CategoriesSection({ settings, onChange }: CategoriesSectionProps) {
  const addCategory = () => {
    const name = prompt('Nombre de la nueva categoría (ej. Licores):');
    if (name && !settings.categories.includes(name)) {
      onChange({ ...settings, categories: [...settings.categories, name] });
    }
  };

  const removeCategory = (cat: string) => {
    if (settings.categories.length <= 1) return;
    onChange({ ...settings, categories: settings.categories.filter((c) => c !== cat) });
  };

  return (
    <div className="card p-6 space-y-5 animate-slide-up" style={{ animationDelay: '200ms' }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-royal-100 text-royal-600 rounded-xl">
            <Tag size={20} />
          </div>
          <h2 className="text-lg font-black text-ink-900">Categorías del Menú</h2>
        </div>
        <button onClick={addCategory} className="btn-royal text-xs" title="Agregar Categoría">
          <Plus size={16} /> Agregar
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {settings.categories.map((cat) => (
          <div
            key={cat}
            className="flex items-center justify-between p-3 bg-ink-50 rounded-xl border border-ink-100 group hover:border-royal-300 transition-all"
          >
            <span className="font-bold text-ink-700 text-sm">{cat}</span>
            <button
              onClick={() => removeCategory(cat)}
              className="p-1.5 text-ink-300 hover:text-rose-600 hover:bg-rose-50 opacity-0 group-hover:opacity-100 transition-all rounded-md"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
      <p className="text-xs text-ink-400 italic">
        * Las categorías definidas aquí aparecerán como opciones al crear productos.
      </p>
    </div>
  );
}
