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
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col transition-all hover:shadow-md hover:border-[var(--color-primary)] group active:scale-[0.98]">
      <div className="relative aspect-[4/3] overflow-hidden">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider">Sin imagen</span>
          </div>
        )}
        <div className="absolute top-3 right-3">
          <div className="bg-white/90 backdrop-blur-md px-3 py-1 rounded-full shadow-sm">
            <span className="font-black text-slate-900 text-sm">₡{product.price.toFixed(0)}</span>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-2">
        <h3 className="font-bold text-slate-900 text-lg leading-tight group-hover:text-[var(--color-primary)] transition-colors">
          {product.name}
        </h3>
        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed min-h-[2.5rem]">
          {product.description || 'Un sabor excepcional preparado con los mejores ingredientes.'}
        </p>

        <div className="pt-2">
          <button
            onClick={() => onAdd(product)}
            className="w-full py-2.5 bg-[var(--color-primary)] text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:brightness-110 transition-all active:scale-95 shadow-sm"
          >
            <Plus size={16} strokeWidth={3} />
            Agregar al pedido
          </button>
        </div>
      </div>
    </div>
  );
}
