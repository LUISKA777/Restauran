import React from 'react';
import { X, ShoppingBag, Trash2 } from 'lucide-react';

interface CartItem {
  product: {
    id: string;
    name: string;
    price: number;
  };
  quantity: number;
}

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemove: (id: string) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  total: number;
  orderNotes: string;
  setOrderNotes: (notes: string) => void;
}

export function CartModal({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemove,
  onSubmit,
  isSubmitting,
  total,
  orderNotes,
  setOrderNotes
}: CartModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-0 sm:p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      <div className="relative w-full max-w-lg bg-slate-900 border border-white/10 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300">
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="text-[var(--color-primary)]" />
              <h2 className="text-xl font-bold text-white">Tu Pedido</h2>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <X size={20} className="text-white/40" />
            </button>
          </div>

          <div className="max-h-60 overflow-y-auto space-y-3 pr-2">
            {items.length === 0 ? (
              <div className="text-center py-10 text-white/30 italic">
                Tu carrito está vacío. ¡Agrega algo rico!
              </div>
            ) : (
              items.map(item => (
                <div key={item.product.id} className="flex items-center justify-between p-3 bg-white/5 rounded-2xl border border-white/10">
                  <div className="flex-grow">
                    <p className="text-sm font-bold text-white">{item.product.name}</p>
                    <p className="text-xs text-white/40">₡{item.product.price.toFixed(0)} c/u</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-2 py-1">
                      <button
                        onClick={() => onUpdateQuantity(item.product.id, -1)}
                        className="text-white/50 hover:text-red-400 font-bold"
                      >-</button>
                      <span className="text-sm font-bold w-4 text-center text-white">{item.quantity}</span>
                      <button
                        onClick={() => onUpdateQuantity(item.product.id, 1)}
                        className="text-white/50 hover:text-[var(--color-primary)] font-bold"
                      >+</button>
                    </div>
                    <button
                      onClick={() => onRemove(item.product.id)}
                      className="p-2 text-white/30 hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="space-y-3">
            <label className="text-sm font-bold text-white/60 flex items-center gap-2">
              Notas especiales (Alergias, ingredientes, etc.)
            </label>
            <textarea
              value={orderNotes}
              onChange={(e) => setOrderNotes(e.target.value)}
              placeholder="Ej: Por favor, sin cebolla en el plato fuerte..."
              className="w-full p-3 bg-white/5 border border-white/10 rounded-2xl text-sm text-white placeholder:text-white/20 outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all min-h-[80px] resize-none"
            />
          </div>

          <div className="pt-4 border-t border-white/10 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-white/50 font-medium">Total Estimado</span>
              <span className="text-2xl font-black text-white">₡{total.toFixed(0)}</span>
            </div>
            <button
              onClick={onSubmit}
              disabled={items.length === 0 || isSubmitting}
              className="w-full py-4 bg-[var(--color-primary)] text-white font-bold rounded-2xl hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? 'Enviando pedido...' : 'Confirmar y Enviar a Cocina'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
