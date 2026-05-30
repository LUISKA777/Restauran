"use client";

import React, { useState, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { BrandingHeader } from '@/components/menu/BrandingHeader';
import { CategoryNav } from '@/components/menu/CategoryNav';
import { ProductCard } from '@/components/menu/ProductCard';
import { CartModal } from '@/components/menu/CartModal';
import { OrderSuccess } from '@/components/menu/OrderSuccess';
import { ShoppingBag, Table as TableIcon } from 'lucide-react';

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
}

export default function MenuClient({
  restaurantName,
  settings,
  products,
  categories,
  categoriesMap,
  restaurantId,
  tables
}: MenuClientProps) {
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState(categories[0] || 'General');
  const [cart, setCart] = useState<{ product: Product, quantity: number }[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const brandColors = useMemo(() => ({
    primary: settings?.primaryColor || '#16a34a', // Default green-600
    secondary: settings?.secondaryColor || '#ffffff',
    accent: settings?.accentColor || '#f3f4f6',
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
        p_total_price: cartTotal
      });

      if (error) throw error;

      setShowSuccess(true);
      setCart([]);
      setIsCartOpen(false);
    } catch (err) {
      console.error('Error creating order:', err);
      alert('Hubo un error al enviar el pedido. Por favor, intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div
      className="min-h-screen bg-gray-50 flex flex-col"
      style={{
        '--color-primary': brandColors.primary,
        '--color-secondary': brandColors.secondary,
        '--color-accent': brandColors.accent,
      } as React.CSSProperties}
    >
      <BrandingHeader name={restaurantName} settings={settings} />

      {!selectedTableId ? (
        <main className="flex-grow p-6 space-y-8 flex flex-col items-center justify-center text-center">
          <div className="space-y-3 max-w-md">
            <div className="mx-auto w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
              <TableIcon size={32} />
            </div>
            <h2 className="text-2xl font-black text-gray-900">¡Bienvenido!</h2>
            <p className="text-gray-500">Para comenzar a pedir, por favor selecciona el número de tu mesa.</p>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 w-full max-w-xl">
            {tables.map(table => (
              <button
                key={table.id}
                onClick={() => setSelectedTableId(table.id)}
                className="p-4 bg-white border-2 border-gray-100 rounded-2xl font-bold text-gray-700 hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-all shadow-sm active:scale-95"
              >
                Mesa {table.table_number}
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

          <main className="flex-grow p-4 space-y-8 pb-24">
            <div className="flex justify-between items-center px-2">
              <h2 className="text-xl font-black text-gray-900">
                {activeCategory}
              </h2>
              <button
                onClick={() => setSelectedTableId(null)}
                className="text-xs font-bold text-gray-400 hover:text-gray-600 underline transition-colors"
              >
                Cambiar Mesa
              </button>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {(categoriesMap[activeCategory] || []).map((product: Product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAdd={addToCart}
                />
              ))}
            </div>
          </main>

          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-xs px-4">
            <button
              onClick={() => setIsCartOpen(true)}
              className="w-full p-4 bg-[var(--color-primary)] text-white rounded-2xl shadow-xl flex items-center justify-between font-bold hover:scale-[1.02] active:scale-95 transition-all"
            >
              <div className="flex items-center gap-2">
                <ShoppingBag size={20} />
                <span>Ver mi pedido</span>
              </div>
              <div className="bg-white/20 px-3 py-1 rounded-full text-sm">
                {cart.length} items | ${cartTotal.toFixed(2)}
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
      />

      {showSuccess && (
        <OrderSuccess onClose={() => setShowSuccess(false)} />
      )}
    </div>
  );
}
