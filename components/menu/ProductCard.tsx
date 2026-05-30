import React from 'react';
import { Plus } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
}

interface ProductCardProps {
  product: Product;
  onAdd: (product: Product) => void;
}

export function ProductCard({ product, onAdd }: ProductCardProps) {
  return (
    <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 hover:border-[var(--color-primary)] transition-colors group">
      <div className="w-20 h-20 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0">
        {product.image_url ? (
          <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs text-center p-2">
            Sin imagen
          </div>
        )}
      </div>
      <div className="flex-grow space-y-1">
        <h3 className="font-bold text-gray-900 group-hover:text-[var(--color-primary)] transition-colors">
          {product.name}
        </h3>
        <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
          {product.description || 'Delicioso plato preparado especialmente para ti.'}
        </p>
        <div className="flex items-center justify-between mt-2">
          <span className="font-extrabold text-gray-900">${product.price.toFixed(2)}</span>
          <button
            onClick={() => onAdd(product)}
            className="p-1.5 bg-[var(--color-primary)] text-white rounded-full hover:scale-110 transition-transform shadow-sm"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
