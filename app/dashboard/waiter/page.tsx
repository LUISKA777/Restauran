"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Plus, ShoppingBag, User, Users, Table, Send, RotateCcw, X, Package, Bell, CheckCircle2, Receipt } from 'lucide-react';
import { Order } from '@/types/order';

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
  const [peopleCount, setPeopleCount] = useState(1);
  const [isTakeaway, setIsTakeaway] = useState(false);
  const [cart, setCart] = useState<{ productId: string; quantity: number; notes: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [readyOrders, setReadyOrders] = useState<Order[]>([]);
  const [immediateOrders, setImmediateOrders] = useState<Order[]>([]);
  const [notificationActive, setNotificationActive] = useState(false);
  const router = useRouter();

  const playBell = () => {
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/1015/1015-preview.mp3');
    audio.play().catch(e => console.log('Audio playback failed', e));
  };

  useEffect(() => {
    fetchInitialData();
    fetchReadyOrders();
    fetchImmediateOrders();

    // Real-time subscription for ready orders and immediate delivery
    const channel = supabase
      .channel('waiter_notifications')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'orders'
      }, (payload) => {
        if (payload.eventType === 'UPDATE' && payload.new?.status === 'ready') {
          playBell();
          fetchReadyOrders();
          setNotificationActive(true);
          setTimeout(() => setNotificationActive(false), 5000);
        }
        fetchImmediateOrders();
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'order_items'
      }, () => {
        fetchImmediateOrders();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
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
      .select('id, name, price, category, quick_delivery')
      .eq('restaurant_id', restaurantId)
      .eq('is_available', true);

    setTables(tablesData || []);
    setProducts(productsData || []);
    setLoading(false);
  }

  async function fetchReadyOrders() {
    const restaurantId = localStorage.getItem('restaurant_id');
    if (!restaurantId) return;

    const { data, error } = await supabase
      .from('orders')
      .select(`*, restaurant_tables(table_number), order_items(product_id, products(name, description), quantity)`)
      .eq('restaurant_id', restaurantId)
      .eq('status', 'ready')
      .order('created_at', { ascending: true });

    if (error) console.error('Error fetching ready orders:', error);
    else if (data) setReadyOrders(data);
  }

  async function fetchImmediateOrders() {
    const restaurantId = localStorage.getItem('restaurant_id');
    if (!restaurantId) return;

    const { data, error } = await supabase
      .from('orders')
      .select(`*, restaurant_tables(table_number), order_items(id, product_id, products(name, description, quick_delivery), quantity, delivered)`)
      .eq('restaurant_id', restaurantId)
      .eq('status', 'confirmed')
      .order('created_at', { ascending: true });

    if (error) console.error('Error fetching immediate orders:', error);
    else if (data) {
      const filtered = data.filter(order =>
        order.order_items?.some((item: any) => item.products?.quick_delivery && !item.delivered)
      );
      setImmediateOrders(filtered);
    }
  }

  async function markAsDelivered(orderId: string, isImmediate = false) {
    if (isImmediate) {
      // Only mark quick delivery items as delivered
      const { data: order } = await supabase
        .from('orders')
        .select('order_items(id, products(quick_delivery))')
        .eq('id', orderId)
        .single();

      const itemsToMark = order?.order_items
        ?.filter((item: any) => item.products?.quick_delivery)
        .map((item: any) => item.id);

      if (itemsToMark && itemsToMark.length > 0) {
        const { error } = await supabase
          .from('order_items')
          .update({ delivered: true })
          .in('id', itemsToMark);

        if (error) alert('Error al marcar productos rápidos como entregados');
      }
    } else {
      // Mark entire order as delivered
      const { error } = await supabase
        .from('orders')
        .update({
          status: 'delivered',
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (error) alert('Error al marcar como entregado');
    }

    fetchReadyOrders();
    fetchImmediateOrders();
  }

  const addToCart = (productId: string) => {
    setCart(prev => {
      const existing = prev.find(item => item.productId === productId);
      if (existing) {
        return prev.map(item => item.productId === productId ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { productId, quantity: 1, notes: '' }];
    });
  };

  const updateItemNotes = (productId: string, notes: string) => {
    setCart(prev => prev.map(item =>
      item.productId === productId ? { ...item, notes } : item
    ));
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
    if ((!selectedTable && !isTakeaway) || cart.length === 0) return;

    const restaurantId = localStorage.getItem('restaurant_id');
    if (!restaurantId) return;

    const total = cart.reduce((acc, item) => {
      const p = products.find(prod => prod.id === item.productId);
      return acc + (p?.price || 0) * item.quantity;
    }, 0);

    let orderId: string;

    if (!isTakeaway && selectedTable) {
      // Check if there's an active order for this table
      const { data: activeOrder, error: activeError } = await supabase
        .from('orders')
        .select('id, total_price')
        .eq('restaurant_id', restaurantId)
        .eq('table_id', selectedTable)
        .neq('status', 'paid')
        .neq('status', 'cancelled')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (!activeError && activeOrder) {
        orderId = activeOrder.id;
        const newTotal = (activeOrder.total_price || 0) + total;

        const { error: updateError } = await supabase
          .from('orders')
          .update({
            total_price: newTotal,
            status: 'confirmed', // Reset to confirmed if it was delivered/ready
            updated_at: new Date().toISOString()
          })
          .eq('id', orderId);

        if (updateError) {
          alert('Error al actualizar el pedido existente');
          return;
        }
      } else {
        // No active order, create new one
        const { data: newOrder, error: newOrderError } = await supabase
          .from('orders')
          .insert({
            restaurant_id: restaurantId,
            table_id: selectedTable,
            customer_name: customerName,
            status: 'confirmed',
            total_price: total,
            is_takeaway: false,
            people_count: peopleCount
          })
          .select()
          .single();

        if (newOrderError) {
          alert('Error al crear el pedido');
          return;
        }
        orderId = newOrder.id;
      }
    } else {
      // Takeaway always creates a new order
      const { data: newOrder, error: newOrderError } = await supabase
        .from('orders')
        .insert({
          restaurant_id: restaurantId,
          table_id: null,
          customer_name: customerName,
          status: 'confirmed',
          total_price: total,
          is_takeaway: true,
          people_count: peopleCount
        })
        .select()
        .single();

      if (newOrderError) {
        alert('Error al crear el pedido');
        return;
      }
      orderId = newOrder.id;
    }

    const orderItems = cart.map(item => ({
      order_id: orderId,
      product_id: item.productId,
      quantity: item.quantity,
      notes: item.notes
    }));

    const { error: itemsError } = await supabase.from('order_items').insert(orderItems);

    if (itemsError) {
      alert('Error al agregar productos al pedido');
    } else {
      alert('Pedido enviado a cocina con éxito!');
      setCart([]);
      setSelectedTable(null);
      setCustomerName('');
      setPeopleCount(1);
      setIsTakeaway(false);
    }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center">Cargando panel de mesero...</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row">
      {/* Left side: Table, Menu and Ready Orders */}
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
          <button
            onClick={() => router.push('/dashboard/admin/invoices')}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-bold hover:bg-orange-600 flex items-center gap-2 transition-colors shadow-sm"
          >
            <Receipt size={16} /> Facturas y Cobros
          </button>
        </header>

        {/* NOTIFICATION BANNER */}
        {notificationActive && (
          <div className="bg-green-600 text-white p-4 rounded-2xl shadow-lg flex items-center justify-between animate-bounce">
            <div className="flex items-center gap-3">
              <Bell className="animate-ring" />
              <span className="font-bold">¡Hay pedidos listos para entregar!</span>
            </div>
            <button onClick={() => setNotificationActive(false)} className="text-white/80 hover:text-white">Cerrar</button>
          </div>
        )}

        {/* IMMEDIATE DELIVERY SECTION */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
            <Bell size={20} className="text-orange-600" /> Entregas Inmediatas (Bebidas/Rápidos)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {immediateOrders.length === 0 ? (
              <div className="col-span-full p-6 bg-gray-100 rounded-2xl text-center text-gray-400 border border-dashed border-gray-300">
                No hay entregas inmediatas pendientes.
              </div>
            ) : (
              immediateOrders.map(order => (
                <div key={order.id} className="bg-white p-4 rounded-2xl border-2 border-orange-200 shadow-sm space-y-3 relative group hover:border-orange-500 transition-colors">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-xs font-bold uppercase text-orange-600">
                        {order.is_takeaway ? '🥡 Para Llevar' : `Mesa ${order.restaurant_tables?.table_number || 'N/A'}`}
                      </span>
                      <h3 className="font-bold text-gray-900">{order.customer_name || 'Anónimo'}</h3>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Users size={12} /> {order.people_count} pers.
                    </div>
                  </div>

                  <div className="space-y-1 bg-orange-50 p-2 rounded-lg">
                    {order.order_items?.filter((item: any) => item.products?.quick_delivery && !item.delivered).map((item: any, idx: number) => (
                      <div key={idx} className="text-xs flex justify-between text-gray-600">
                        <span className="font-bold text-orange-700">{item.quantity}x {item.products?.name}</span>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => markAsDelivered(order.id, true)}
                    className="w-full py-2 bg-orange-600 text-white text-sm font-bold rounded-xl hover:bg-orange-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 size={16} /> Entregar Rápidos
                  </button>
                </div>
              ))
            )}
          </div>
        </section>

        {/* READY ORDERS SECTION */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
            <CheckCircle2 size={20} className="text-green-600" /> Pedidos Listos para Entregar
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {readyOrders.length === 0 ? (
              <div className="col-span-full p-6 bg-gray-100 rounded-2xl text-center text-gray-400 border border-dashed border-gray-300">
                No hay pedidos listos en este momento.
              </div>
            ) : (
              readyOrders.map(order => (
                <div key={order.id} className="bg-white p-4 rounded-2xl border-2 border-green-200 shadow-sm space-y-3 relative group hover:border-green-500 transition-colors">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-xs font-bold uppercase text-green-600">
                        {order.is_takeaway ? '🥡 Para Llevar' : `Mesa ${order.restaurant_tables?.table_number || 'N/A'}`}
                      </span>
                      <h3 className="font-bold text-gray-900">{order.customer_name || 'Anónimo'}</h3>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Users size={12} /> {order.people_count} pers.
                    </div>
                  </div>

                  <div className="space-y-1 bg-gray-50 p-2 rounded-lg">
                    {order.order_items?.map((item: any, idx: number) => (
                      <div key={idx} className="text-xs flex justify-between text-gray-600">
                        <span>{item.quantity}x {item.products?.name}</span>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => markAsDelivered(order.id)}
                    className="w-full py-2 bg-green-600 text-white text-sm font-bold rounded-xl hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 size={16} /> Marcar como Entregado
                  </button>
                </div>
              ))
            )}
          </div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Table Selection */}
          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
              <Table size={20} /> Detalles del Nuevo Pedido
            </h2>

            <div className="space-y-4 bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                <div className="flex items-center gap-2">
                  <Package size={18} className="text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">¿Es pedido para llevar?</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={isTakeaway}
                    onChange={(e) => setIsTakeaway(e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                </label>
              </div>

              {!isTakeaway && (
                <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-600 block">Seleccionar Mesa</label>
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
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-600 block">Cliente (Opcional)</label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Ej: Juan Perez"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-600 block">Nº Personas</label>
                  <input
                    type="number"
                    min="1"
                    value={peopleCount}
                    onChange={(e) => setPeopleCount(parseInt(e.target.value) || 1)}
                    className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
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
                    <p className="text-xs text-gray-400">₡{product.price}</p>
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
                <div key={item.productId} className="flex flex-col p-3 bg-gray-50 rounded-xl border border-gray-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex-grow">
                      <p className="text-sm font-medium text-gray-800">{product?.name}</p>
                      <p className="text-xs text-gray-500">₡{product?.price}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => removeFromCart(item.productId)}
                        className="p-1 text-gray-500 hover:text-red-600"
                        title="Eliminar producto"
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
                  <input
                    type="text"
                    value={item.notes}
                    onChange={(e) => updateItemNotes(item.productId, e.target.value)}
                    placeholder="Notas (ej: Sin cebolla, término medio...)"
                    className="w-full px-3 py-1.5 text-xs border rounded-lg outline-none focus:ring-2 focus:ring-green-500 bg-white"
                  />
                </div>
              );
            })
          )}
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200 space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-500">Total Estimado</span>
            <span className="text-xl font-bold text-gray-900">
              ₡{cart.reduce((acc, item) => {
                const p = products.find(prod => prod.id === item.productId);
                return acc + (p?.price || 0) * item.quantity;
              }, 0).toFixed(2)}
            </span>
          </div>

          <button
            onClick={sendOrder}
            disabled={(!selectedTable && !isTakeaway) || cart.length === 0}
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
