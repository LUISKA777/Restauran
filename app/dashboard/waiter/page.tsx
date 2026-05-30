import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Plus, ShoppingBag, User, Table, Send, RotateCcw, X } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
}

interface RestaurantTable {
  id: string;
  table_number: number;
}

export default function WaiterPanel() {
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [customerName, setCustomerName] = useState('');
  const [cart, setCart] = useState<{ productId: string; quantity: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchInitialData();
  }, []);

  async function fetchInitialData() {
    const restaurantId = localStorage.getItem('restaurant_id');
    if (!restaurantId) return;

    const { data: tablesData } = await supabase
      .from('restaurant_tables')
      .select('id, table_number')
      .eq('restaurant_id', restaurantId);

    const { data: productsData } = await supabase
      .from('products')
      .select('id, name, price, category')
      .eq('restaurant_id', restaurantId)
      .eq('is_available', true);

    setTables(tablesData || []);
    setProducts(productsData || []);
    setLoading(false);
  }

  const addToCart = (productId: string) => {
    setCart(prev => {
      const existing = prev.find(item => item.productId === productId);
      if (existing) {
        return prev.map(item => item.productId === productId ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { productId, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.productId !== productId));
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.productId === productId) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  async function sendOrder() {
    if (!selectedTable || cart.length === 0) return;

    const restaurantId = localStorage.getItem('restaurant_id');
    if (!restaurantId) return;

    // 1. Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        restaurant_id: restaurantId,
        table_id: selectedTable,
        customer_name: customerName,
        status: 'confirmed', // Sent directly to kitchen
        total_price: 0 // Calculate later or let backend handle
      })
      .select()
      .single();

    if (orderError) {
      alert('Error al crear el pedido');
      return;
    }

    // 2. Create order items
    const orderItems = cart.map(item => ({
      order_id: order.id,
      product_id: item.productId,
      quantity: item.quantity
    }));

    const { error: itemsError } = await supabase.from('order_items').insert(orderItems);

    if (itemsError) {
      alert('Error al agregar productos al pedido');
    } else {
      alert('Pedido enviado a cocina con éxito!');
      setCart([]);
      setSelectedTable(null);
      setCustomerName('');
    }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center">Cargando panel de mesero...</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row">
      {/* Left side: Table and Menu selection */}
      <div className="flex-grow p-6 space-y-6 overflow-y-auto">
        <header className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 text-green-600 rounded-lg">
              <UserCheck size={24} />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Panel de Mesero</h1>
          </div>
          <button
            onClick={() => window.location.href = '/dashboard/role-selection'}
            className="px-4 py-2 bg-white border rounded-lg text-sm font-medium hover:bg-gray-50 flex items-center gap-2"
          >
            <RotateCcw size={16} /> Cambiar Rol
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Table Selection */}
          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
              <Table size={20} /> Seleccionar Mesa
            </h2>
            <div className="grid grid-cols-4 gap-3">
              {tables.map(table => (
                <button
                  key={table.id}
                  onClick={() => setSelectedTable(table.id)}
                  className={`p-4 rounded-xl border transition-all ${
                    selectedTable === table.id
                    ? 'bg-green-600 text-white border-green-600 shadow-lg ring-2 ring-green-200'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-green-500'
                  }`}
                >
                  <span className="text-lg font-bold">{table.table_number}</span>
                </button>
              ))}
            </div>
            <div className="mt-4 space-y-2">
              <label className="text-sm font-medium text-gray-600">Nombre del Cliente (Opcional)</label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Ej: Juan Perez"
              />
            </div>
          </section>

          {/* Menu selection */}
          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
              <ShoppingBag size={20} /> Menú de Productos
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {products.map(product => (
                <button
                  key={product.id}
                  onClick={() => addToCart(product.id)}
                  className="p-3 bg-white border border-gray-200 rounded-xl text-left hover:border-green-500 transition-all flex justify-between items-center group"
                >
                  <div>
                    <p className="font-medium text-gray-800 group-hover:text-green-600 transition-colors">{product.name}</p>
                    <p className="text-xs text-gray-400">${product.price}</p>
                  </div>
                  <div className="p-1 bg-gray-100 rounded-full group-hover:bg-green-100 group-hover:text-green-600 transition-colors">
                    <Plus size={16} />
                  </div>
                </button>
              ))}
            </div>
          </section>
        </div>
      </div>

      {/* Right side: Cart/Order Summary */}
      <div className="w-full lg:w-96 bg-white border-l border-gray-200 p-6 flex flex-col shadow-2xl">
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <ShoppingBag size={20} className="text-green-600" /> Resumen del Pedido
        </h2>

        <div className="flex-grow space-y-4 overflow-y-auto max-h-[calc(100vh-300px)]">
          {cart.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p className="text-sm italic">El pedido está vacío</p>
            </div>
          ) : (
            cart.map(item => {
              const product = products.find(p => p.id === item.productId);
              return (
                <div key={item.productId} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="flex-grow">
                    <p className="text-sm font-medium text-gray-800">{product?.name}</p>
                    <p className="text-xs text-gray-500">${product?.price}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.productId, -1)}
                      className="p-1 text-gray-500 hover:text-red-600"
                    >
                      <X size={14} />
                    </button>
                    <span className="text-sm font-bold w-6 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.productId, 1)}
                      className="p-1 text-gray-500 hover:text-green-600"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200 space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-500">Total Estimado</span>
            <span className="text-xl font-bold text-gray-900">
              ${cart.reduce((acc, item) => {
                const p = products.find(prod => prod.id === item.productId);
                return acc + (p?.price || 0) * item.quantity;
              }, 0).toFixed(2)}
            </span>
          </div>

          <button
            onClick={sendOrder}
            disabled={!selectedTable || cart.length === 0}
            className="w-full py-4 bg-green-600 text-white font-bold rounded-2xl hover:bg-green-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={20} /> Confirmar y Enviar a Cocina
          </button>
        </div>
      </div>
    </div>
  );
}

function UserCheck(props: any) {
  return <User size={props.size} {...props} />;
}
