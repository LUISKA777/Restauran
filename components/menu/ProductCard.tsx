import React from 'react';
import { Plus } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  is_available?: boolean;
}

interface ProductCardProps {
  product: Product;
  onAdd: (product: Product) => void;
}

export function ProductCard({ product, onAdd }: ProductCardProps) {
  const isUnavailable = product.is_available === false;

  return (
    <div className={`bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 shadow-sm overflow-hidden flex flex-col transition-all hover:shadow-xl ${isUnavailable ? 'opacity-60 grayscale-[0.5] cursor-not-allowed' : 'hover:border-[var(--color-primary)]/60 group active:scale-[0.98]'}`}>
      <div className="relative aspect-[4/3] overflow-hidden">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className={`w-full h-full object-cover transition-transform duration-500 ${!isUnavailable && 'group-hover:scale-110'}`}
          />
        ) : (
          <div className="w-full h-full bg-white/5 flex items-center justify-center text-white/30">
            <span className="text-xs font-medium uppercase tracking-wider">Sin imagen</span>
          </div>
        )}
        <div className="absolute top-3 right-3">
          <div className="bg-slate-900/80 backdrop-blur-md px-3 py-1 rounded-full shadow-sm border border-white/10">
            <span className="font-black text-white text-sm">₡{product.price.toFixed(0)}</span>
          </div>
        </div>
        {isUnavailable && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-slate-900/80 backdrop-blur-sm px-3 py-1 rounded-full font-black text-white/70 text-xs uppercase tracking-widest border border-white/20">
              Agotado
            </div>
          </div>
        )}
      </div>

      <div className="p-4 space-y-2">
        <h3 className={`font-bold text-lg leading-tight transition-colors ${isUnavailable ? 'text-white/30' : 'text-white group-hover:text-[var(--color-primary)]'}`}>
          {product.name}
        </h3>
        <p className="text-xs text-white/40 line-clamp-2 leading-relaxed min-h-[2.5rem]">
          {product.description || 'Un sabor excepcional preparado con los mejores ingredientes.'}
        </p>

        <div className="pt-2">
          <button
            onClick={() => !isUnavailable && onAdd(product)}
            disabled={isUnavailable}
            className={`w-full py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm ${
              isUnavailable
              ? 'bg-white/10 text-white/30 cursor-not-allowed'
              : 'bg-[var(--color-primary)] text-white hover:brightness-110'
            }`}
          >
            <Plus size={16} strokeWidth={3} />
            {isUnavailable ? 'No disponible' : 'Agregar al pedido'}
          </button>
        </div>
      </div>
    </div>
  );
}
