import React from 'react';

interface CategoryNavProps {
  categories: string[];
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

export function CategoryNav({ categories, activeCategory, onCategoryChange }: CategoryNavProps) {
  return (
    <nav className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-100 overflow-x-auto no-scrollbar">
      <div className="flex items-center justify-start md:justify-center gap-2 p-3">
        {categories.map(category => (
          <button
            key={category}
            onClick={() => onCategoryChange(category)}
            className={`px-4 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap ${
              activeCategory === category
                ? 'bg-[var(--color-primary)] text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {category}
          </button>
        ))}
      </div>
    </nav>
  );
}
