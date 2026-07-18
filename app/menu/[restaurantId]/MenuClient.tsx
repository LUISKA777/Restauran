"use client";

import React, { useState, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { BrandingHeader } from '@/components/menu/BrandingHeader';
import { CategoryNav } from '@/components/menu/CategoryNav';
import { ProductCard } from '@/components/menu/ProductCard';
import { CartModal } from '@/components/menu/CartModal';
import { OrderSuccess } from '@/components/menu/OrderSuccess';
import { ShoppingBag, Table as TableIcon, ChevronRight } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
}

interface Table {
  id: string;
  table_number: number;
}

interface MenuClientProps {
  restaurantName: string;
  settings: any;
  products: Product[];
  categories: string[];
  categoriesMap: Record<string, Product[]>;
  restaurantId: string;
  tables: Table[];
  initialTableId?: string;
}

export default function MenuClient({
  restaurantName,
  settings,
  products,
  categories,
  categoriesMap,
  restaurantId,
  tables,
  initialTableId
}: MenuClientProps) {
  const [selectedTableId, setSelectedTableId] = useState<string | null>(initialTableId || null);
  const [activeCategory, setActiveCategory] = useState(categories[0] || 'General');
  const [cart, setCart] = useState<{ product: Product, quantity: number }[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [orderNotes, setOrderNotes] = useState('');

  const brandColors = useMemo(() => ({
    primary: settings?.primaryColor || '#f97316',
    secondary: settings?.secondaryColor || '#0f172a',
    accent: settings?.accentColor || '#1e293b',
  }), [settings]);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.product.id === id) {
        return { ...item, quantity: Math.max(1, item.quantity + delta) };
      }
      return item;
    }));
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.product.id !== id));
  };

  const cartTotal = useMemo(() =>
    cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0),
  [cart]);

  async function handleSubmitOrder() {
    if (!selectedTableId) {
      alert('Por favor, selecciona una mesa antes de enviar el pedido.');
      return;
    }

    setIsSubmitting(true);
    try {
      const itemsPayload = cart.map(item => ({
        product_id: item.product.id,
        quantity: item.quantity,
        notes: ''
      }));

      const { data, error } = await supabase.rpc('create_customer_order', {
        p_restaurant_id: restaurantId,
        p_table_id: selectedTableId,
        p_items: itemsPayload,
        p_total_price: cartTotal,
      });

      if (error) throw error;

      setShowSuccess(true);
      setCart([]);
      setOrderNotes('');
      setIsCartOpen(false);
    } catch (err: any) {
      console.error('Order Submission Exception:', err);
      alert(`Error al enviar el pedido: ${err.message || 'Hubo un problema técnico.'}`);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col relative overflow-hidden"
      style={{
        '--color-primary': brandColors.primary,
        '--color-secondary': brandColors.secondary,
        '--color-accent': brandColors.accent,
      } as React.CSSProperties}
    >
      {/* Dark Atmospheric Background */}
      <div className="fixed inset-0 z-[-1] pointer-events-none overflow-hidden" style={{ backgroundColor: settings?.backgroundColor || '#0f172a' }}>
        {/* Subtle color orbs */}
        <div
          className="absolute inset-0 opacity-20"
          style={{ background: `radial-gradient(circle at top right, ${brandColors.primary}33, transparent 60%), radial-gradient(circle at bottom left, ${brandColors.primary}22, transparent 60%)` }}
        />

        {/* Blurred Image Layer */}
        {(settings?.backgroundImageUrl || settings?.logoUrl) ? (
          <div
            className="absolute inset-0 opacity-20 scale-110"
            style={{
              backgroundImage: `url(${settings.backgroundImageUrl || settings.logoUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              filter: 'blur(80px) saturate(180%)',
            }}
          />
        ) : null}

        {/* Dark overlay for readability */}
        <div className="absolute inset-0" style={{ backgroundColor: 'rgba(15, 23, 42, 0.7)' }} />
      </div>

      <BrandingHeader name={restaurantName} settings={settings} />

      {!selectedTableId ? (
        <main className="flex-grow p-6 flex flex-col items-center justify-center text-center space-y-10 animate-fade-in">
          <div className="space-y-3 max-w-md">
            <div className="mx-auto w-20 h-20 rounded-3xl flex items-center justify-center mb-4 rotate-3 border border-white/10 shadow-2xl"
              style={{ backgroundColor: `${brandColors.primary}22`, color: brandColors.primary }}>
              <TableIcon size={40} strokeWidth={2.5} />
            </div>
            <h2 className="text-4xl font-black tracking-tight text-white text-balance">
              ¡Bienvenido a <br />
              <span style={{ color: brandColors.primary }}>{restaurantName}</span>
            </h2>
            <p className="text-base font-medium text-white/50 max-w-sm mx-auto">
              Para comenzar a disfrutar, por favor selecciona el número de tu mesa.
            </p>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 w-full max-w-2xl px-4">
            {tables.map((table, idx) => (
              <button
                key={table.id}
                onClick={() => setSelectedTableId(table.id)}
                style={{ animationDelay: `${idx * 30}ms` }}
                className="group relative p-5 bg-white/5 backdrop-blur-md border-2 border-white/10 rounded-2xl font-black transition-all shadow-sm hover:-translate-y-1 active:scale-95 overflow-hidden text-white/70 hover:text-white animate-slide-up opacity-0"
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = brandColors.primary;
                  (e.currentTarget as HTMLElement).style.color = brandColors.primary;
                  (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 24px -8px ${brandColors.primary}66`;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = '';
                  (e.currentTarget as HTMLElement).style.color = '';
                  (e.currentTarget as HTMLElement).style.boxShadow = '';
                }}
              >
                <span className="relative z-10 text-2xl">{table.table_number}</span>
                <div className="absolute -right-2 -bottom-2 opacity-10 group-hover:opacity-20 transition-opacity" style={{ color: brandColors.primary }}>
                  <TableIcon size={48} />
                </div>
              </button>
            ))}
          </div>
        </main>
      ) : (
        <>
          <CategoryNav
            categories={categories}
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
          />

          <main className="flex-grow p-4 space-y-6 pb-32 animate-fade-in">
            <div className="flex justify-between items-center px-2 pt-2">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">Categoría</p>
                <h2 className="text-3xl font-black tracking-tight text-white">
                  {activeCategory}
                </h2>
              </div>
              <button
                onClick={() => setSelectedTableId(null)}
                className="text-xs font-bold flex items-center gap-1.5 px-3 py-2 rounded-full bg-white/5 border border-white/10 transition-all group text-white/50 hover:text-white hover:bg-white/10"
              >
                <ChevronRight size={14} className="rotate-180 group-hover:-translate-x-0.5 transition-transform" />
                Cambiar Mesa
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(categoriesMap[activeCategory] || []).map((product: Product, idx: number) => (
                <div
                  key={product.id}
                  style={{ animationDelay: `${idx * 50}ms` }}
                  className="animate-slide-up opacity-0"
                >
                  <ProductCard
                    product={product}
                    onAdd={addToCart}
                  />
                </div>
              ))}
            </div>
          </main>

          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-md px-4 z-30">
            <button
              onClick={() => setIsCartOpen(true)}
              className="w-full p-4 bg-slate-900/95 backdrop-blur-xl border border-white/10 text-white rounded-3xl shadow-2xl flex items-center justify-between font-bold hover:scale-[1.02] active:scale-95 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/10 rounded-xl group-hover:bg-white/20 transition-colors">
                  <ShoppingBag size={20} />
                </div>
                <span className="text-base">Ver mi pedido</span>
              </div>
              <div
                className="px-3.5 py-1.5 rounded-2xl text-sm font-black shadow-lg"
                style={{ backgroundColor: brandColors.primary, color: brandColors.secondary }}
              >
                {cart.reduce((a, i) => a + i.quantity, 0)} · ₡{cartTotal.toFixed(0)}
              </div>
            </button>
          </div>
        </>
      )}

      <CartModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cart}
        onUpdateQuantity={updateQuantity}
        onRemove={removeFromCart}
        onSubmit={handleSubmitOrder}
        isSubmitting={isSubmitting}
        total={cartTotal}
        orderNotes={orderNotes}
        setOrderNotes={setOrderNotes}
      />

      {showSuccess && (
        <OrderSuccess onClose={() => setShowSuccess(false)} />
      )}
    </div>
  );
}
