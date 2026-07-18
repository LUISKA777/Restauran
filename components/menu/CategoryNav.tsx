import React from 'react';

interface CategoryNavProps {
  categories: string[];
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

export function CategoryNav({ categories, activeCategory, onCategoryChange }: CategoryNavProps) {
  return (
    <nav className="sticky top-0 z-20 bg-slate-900/80 backdrop-blur-xl border-b border-white/10 overflow-x-auto no-scrollbar">
      <div className="flex items-center justify-start md:justify-center gap-2 p-3 max-w-3xl mx-auto">
        {categories.map(category => {
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
