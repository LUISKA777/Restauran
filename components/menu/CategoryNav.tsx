import React from 'react';
import type { NavPosition } from '@/types/menuSettings';

interface CategoryNavProps {
  categories: string[];
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  position?: NavPosition;
}

export function CategoryNav({
  categories,
  activeCategory,
  onCategoryChange,
  position = 'sticky-top',
}: CategoryNavProps) {
  // 'hidden': un select nativo compacto. Útil para menús muy densos
  // o cuando el dueño quiere maximizar el área de producto.
  if (position === 'hidden') {
    return (
      <div className="px-4 pt-2 animate-fade-in">
        <div className="relative max-w-md mx-auto">
          <select
            value={activeCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="w-full appearance-none bg-slate-900/80 backdrop-blur-xl border border-white/10 text-white font-bold py-2.5 pl-4 pr-10 rounded-full text-sm shadow-lg outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
          >
            {categories.map((category) => (
              <option key={category} value={category} className="bg-slate-900">
                {category}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-white/40">
            ▾
          </div>
        </div>
      </div>
    );
  }

  // 'sidebar': aside vertical. En desktop va fijo a la izquierda del grid.
  // En móvil (<lg) el padre (MenuClient) lo renderiza como sticky-top mediante
  // CSS responsive, pero como defensa redundante, si position === 'sidebar'
  // pero no estamos en lg, también caemos a sticky-top.
  if (position === 'sidebar') {
    return (
      <aside className="hidden lg:block w-full animate-fade-in">
        <div className="space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 px-2 mb-3">
            Categorías
          </p>
          {categories.map((category) => {
            const isActive = activeCategory === category;
            return (
              <button
                key={category}
                onClick={() => onCategoryChange(category)}
                className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95 ${
                  isActive
                    ? 'text-white shadow-lg'
                    : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white border border-white/10'
                }`}
                style={isActive ? { backgroundColor: 'var(--color-primary)' } : undefined}
              >
                {category}
              </button>
            );
          })}
        </div>
      </aside>
    );
  }

  // 'sticky-top' (default): el comportamiento actual preservado.
  return (
    <nav className="sticky top-0 z-20 bg-slate-900/80 backdrop-blur-xl border-b border-white/10 overflow-x-auto no-scrollbar">
      <div className="flex items-center justify-start md:justify-center gap-2 p-3 max-w-3xl mx-auto">
        {categories.map((category) => {
          const isActive = activeCategory === category;
          return (
            <button
              key={category}
              onClick={() => onCategoryChange(category)}
              className={`relative px-4 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap active:scale-95 ${
                isActive
                  ? 'text-white shadow-lg'
                  : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white border border-white/10'
              }`}
              style={isActive ? { backgroundColor: 'var(--color-primary)' } : undefined}
            >
              {category}
              {isActive && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-white" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
