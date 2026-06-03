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
        <main className="flex-grow p-6 flex flex-col items-center justify-center text-center space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="space-y-4 max-w-md">
            <div className="mx-auto w-20 h-20 bg-white/10 shadow-xl rounded-3xl flex items-center justify-center text-[var(--color-primary)] mb-6 rotate-3 border border-white/10">
              <TableIcon size={40} strokeWidth={2.5} />
            </div>
            <h2 className="text-4xl font-black tracking-tight text-white">
              ¡Bienvenido a <br />
              <span style={{ color: brandColors.primary }}>{restaurantName}</span>
            </h2>
            <p className="text-lg font-medium text-white/50">
              Para comenzar a disfrutar, por favor selecciona el número de tu mesa.
            </p>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4 w-full max-w-2xl px-4">
            {tables.map(table => (
              <button
                key={table.id}
                onClick={() => setSelectedTableId(table.id)}
                className="group relative p-6 bg-white/5 border-2 border-white/10 rounded-3xl font-black transition-all shadow-sm active:scale-95 overflow-hidden text-white/70 hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
              >
                <span className="relative z-10 text-2xl">{table.table_number}</span>
                <div className="absolute -right-2 -bottom-2 opacity-10 group-hover:opacity-20 transition-opacity">
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

          <main className="flex-grow p-4 space-y-8 pb-32 animate-in fade-in duration-500">
            <div className="flex justify-between items-center px-2">
              <h2 className="text-2xl font-black tracking-tight text-white">
                {activeCategory}
              </h2>
              <button
                onClick={() => setSelectedTableId(null)}
                className="text-xs font-bold flex items-center gap-1 transition-colors group text-white/30 hover:text-white/60"
              >
                <ChevronRight size={14} className="rotate-180 group-hover:-translate-x-1 transition-transform" />
                Cambiar Mesa
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {(categoriesMap[activeCategory] || []).map((product: Product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAdd={addToCart}
                />
              ))}
            </div>
          </main>

          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-md px-4">
            <button
              onClick={() => setIsCartOpen(true)}
              className="w-full p-5 bg-slate-800/90 backdrop-blur-md border border-white/10 text-white rounded-3xl shadow-2xl flex items-center justify-between font-bold hover:scale-[1.02] active:scale-95 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/10 rounded-xl group-hover:bg-white/20 transition-colors">
                  <ShoppingBag size={22} />
                </div>
                <span className="text-lg">Ver mi pedido</span>
              </div>
              <div className="bg-[var(--color-primary)] text-white px-4 py-2 rounded-2xl text-sm font-black">
                {cart.length} items | ₡{cartTotal.toFixed(0)}
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
