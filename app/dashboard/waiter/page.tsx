"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const playBell = () => {
    const audio = new Audio('https://cdn.pixabay.com/audio/2021/08/04/audio_0627779232.mp3');
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

    // Polling fallback: Refresh immediate orders every 30 seconds
    // in case Realtime is not enabled in Supabase Dashboard
    const pollingInterval = setInterval(() => {
      fetchImmediateOrders();
      fetchReadyOrders();
    }, 30000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(pollingInterval);
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
      .neq('status', 'delivered')
      .neq('status', 'cancelled')
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
      const { data: order } = await supabaseAdmin
        .from('orders')
        .select('order_items(id, products(quick_delivery))')
        .eq('id', orderId)
        .single();

      const itemsToMark = order?.order_items
        ?.filter((item: any) => item.products?.quick_delivery)
        .map((item: any) => item.id);

      if (itemsToMark && itemsToMark.length > 0) {
        const { error } = await supabaseAdmin
          .from('order_items')
          .update({ delivered: true })
          .in('id', itemsToMark);

        if (error) {
          console.error('[markAsDelivered - quick] error:', error);
          alert(`Error al marcar productos rápidos como entregados: ${error.message}`);
        }
      }
    } else {
      // Mark entire order as delivered
      const { error } = await supabaseAdmin
        .from('orders')
        .update({
          status: 'delivered',
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (error) {
        console.error('[markAsDelivered] error:', error);
        alert(`Error al marcar como entregado: ${error.message}`);
      }
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

    setIsSubmitting(true);
    try {
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
          .neq('status', 'delivered')
          .neq('status', 'cancelled')
          .order('created_at', { ascending: false });

        if (!activeError && activeOrder && activeOrder.length > 0) {
          const active = activeOrder[0];
          orderId = active.id;
          const newTotal = (active.total_price || 0) + total;

          const { error: updateError } = await supabaseAdmin
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
          const { data: newOrder, error: newOrderError } = await supabaseAdmin
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
        const { data: newOrder, error: newOrderError } = await supabaseAdmin
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

      const { error: itemsError } = await supabaseAdmin.from('order_items').insert(orderItems);

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
    } catch (err) {
      console.error('Error sending order:', err);
      alert('Hubo un error al enviar el pedido');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-ink-50">
      <div className="flex flex-col items-center gap-3">
        <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
        <p className="text-sm text-ink-500 font-medium">Cargando panel de mesero...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-ink-50">
      {/* Left side: Table, Menu and Ready Orders */}
      <div className="flex-grow p-6 space-y-6 overflow-y-auto">
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-xl shadow-glow-green">
              <UserCheck size={22} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-ink-900 tracking-tight">Panel de Mesero</h1>
              <p className="text-xs text-ink-500">Toma y seguimiento de pedidos</p>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button onClick={playBell} className="btn-secondary text-xs">
              <Bell size={14} /> Probar Timbre
            </button>
            <button
              onClick={() => window.location.href = '/dashboard/role-selection'}
              className="btn-secondary text-xs"
            >
              <RotateCcw size={14} /> Cambiar Rol
            </button>
            <button
              onClick={() => router.push('/dashboard/admin/invoices')}
              className="btn-primary text-xs"
            >
              <Receipt size={14} /> Facturas
            </button>
          </div>
        </header>

        {/* NOTIFICATION BANNER */}
        {notificationActive && (
          <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white p-4 rounded-2xl shadow-glow-green flex items-center justify-between animate-slide-up">
            <div className="flex items-center gap-3">
              <Bell className="animate-ring" />
              <span className="font-bold">¡Hay pedidos listos para entregar!</span>
            </div>
            <button onClick={() => setNotificationActive(false)} className="text-white/80 hover:text-white text-sm font-medium">
              Cerrar
            </button>
          </div>
        )}

        {/* IMMEDIATE DELIVERY SECTION */}
        <section className="space-y-3">
          <h2 className="text-base font-black text-ink-700 flex items-center gap-2">
            <span className="p-1.5 bg-brand-100 text-brand-600 rounded-lg">
              <Bell size={14} />
            </span>
            Entregas Inmediatas (Rápidos)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {immediateOrders.length === 0 ? (
              <div className="col-span-full p-8 bg-white rounded-2xl text-center text-ink-400 border border-dashed border-ink-200 text-sm">
                No hay entregas inmediatas pendientes.
              </div>
            ) : (
              immediateOrders.map((order, idx) => (
                <div
                  key={order.id}
                  style={{ animationDelay: `${idx * 50}ms` }}
                  className="card-hover p-4 border-2 border-brand-200 space-y-3 animate-slide-up opacity-0"
                >
                  <div className="flex justify-between items-start">
                    <div className="min-w-0 flex-1">
                      <span className="badge-brand">
                        {order.is_takeaway ? '🥡 Para Llevar' : `Mesa ${order.restaurant_tables?.table_number || 'N/A'}`}
                      </span>
                      <h3 className="font-bold text-ink-900 mt-1 truncate">{order.customer_name || 'Anónimo'}</h3>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-ink-500 font-bold shrink-0 ml-2">
                      <Users size={11} /> {order.people_count} pers.
                    </div>
                  </div>

                  <div className="space-y-1 bg-brand-50 p-2.5 rounded-xl border border-brand-100">
                    {order.order_items?.filter((item: any) => item.products?.quick_delivery && !item.delivered).map((item: any, idx: number) => (
                      <div key={idx} className="text-xs flex justify-between text-ink-600">
                        <span className="font-bold text-brand-700">{item.quantity}x {item.products?.name}</span>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => markAsDelivered(order.id, true)}
                    className="w-full py-2 bg-gradient-brand text-white text-xs font-bold rounded-xl shadow-glow-brand hover:shadow-lg transition-all active:scale-95 flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 size={14} /> Entregar Rápidos
                  </button>
                </div>
              ))
            )}
          </div>
        </section>

        {/* READY ORDERS SECTION */}
        <section className="space-y-3">
          <h2 className="text-base font-black text-ink-700 flex items-center gap-2">
            <span className="p-1.5 bg-emerald-100 text-emerald-600 rounded-lg">
              <CheckCircle2 size={14} />
            </span>
            Pedidos Listos para Entregar
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {readyOrders.length === 0 ? (
              <div className="col-span-full p-8 bg-white rounded-2xl text-center text-ink-400 border border-dashed border-ink-200 text-sm">
                No hay pedidos listos en este momento.
              </div>
            ) : (
              readyOrders.map((order, idx) => (
                <div
                  key={order.id}
                  style={{ animationDelay: `${idx * 50}ms` }}
                  className="card-hover p-4 border-2 border-emerald-200 space-y-3 animate-slide-up opacity-0"
                >
                  <div className="flex justify-between items-start">
                    <div className="min-w-0 flex-1">
                      <span className="badge-success">
                        {order.is_takeaway ? '🥡 Para Llevar' : `Mesa ${order.restaurant_tables?.table_number || 'N/A'}`}
                      </span>
                      <h3 className="font-bold text-ink-900 mt-1 truncate">{order.customer_name || 'Anónimo'}</h3>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-ink-500 font-bold shrink-0 ml-2">
                      <Users size={11} /> {order.people_count} pers.
                    </div>
                  </div>

                  <div className="space-y-1 bg-ink-50 p-2.5 rounded-xl border border-ink-100">
                    {order.order_items?.map((item: any, idx: number) => (
                      <div key={idx} className="text-xs flex justify-between text-ink-600">
                        <span>{item.quantity}x {item.products?.name}</span>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => markAsDelivered(order.id)}
                    className="w-full py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700 transition-all active:scale-95 flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 size={14} /> Marcar como Entregado
                  </button>
                </div>
              ))
            )}
          </div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Table Selection */}
          <section className="space-y-3">
            <h2 className="text-base font-black text-ink-700 flex items-center gap-2">
              <span className="p-1.5 bg-royal-100 text-royal-600 rounded-lg">
                <Table size={14} />
              </span>
              Detalles del Nuevo Pedido
            </h2>

            <div className="space-y-4 card p-4">
              <div className="flex items-center justify-between p-3 bg-ink-50 rounded-xl border border-ink-100">
                <div className="flex items-center gap-2">
                  <Package size={16} className="text-ink-500" />
                  <span className="text-sm font-bold text-ink-700">¿Es pedido para llevar?</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={isTakeaway}
                    onChange={(e) => setIsTakeaway(e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-ink-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-ink-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>

              {!isTakeaway && (
                <div className="space-y-2">
                  <label className="text-sm font-bold text-ink-600 block">Seleccionar Mesa</label>
                  {tables.length === 0 ? (
                    <div className="p-4 text-center text-sm text-ink-400 bg-ink-50 rounded-xl border border-dashed border-ink-200">
                      No hay mesas configuradas
                    </div>
                  ) : (
                    <div className="grid grid-cols-4 gap-2">
                      {tables.map(table => (
                        <button
                          key={table.id}
                          onClick={() => setSelectedTable(table.id)}
                          className={`p-3 rounded-xl border-2 transition-all font-black text-lg active:scale-95 ${
                            selectedTable === table.id
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-glow-green'
                            : 'bg-white text-ink-600 border-ink-200 hover:border-emerald-400'
                          }`}
                        >
                          {table.table_number}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-ink-600 block">Cliente (Opcional)</label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="input"
                    placeholder="Ej: Juan Perez"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-ink-600 block">Nº Personas</label>
                  <input
                    type="number"
                    min="1"
                    value={peopleCount}
                    onChange={(e) => setPeopleCount(parseInt(e.target.value) || 1)}
                    className="input"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Menu selection */}
          <section className="space-y-3">
            <h2 className="text-base font-black text-ink-700 flex items-center gap-2">
              <span className="p-1.5 bg-brand-100 text-brand-600 rounded-lg">
                <ShoppingBag size={14} />
              </span>
              Menú de Productos
            </h2>
            {products.length === 0 ? (
              <div className="card p-8 text-center text-ink-400 text-sm">
                No hay productos disponibles
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-96 overflow-y-auto pr-1">
                {products.map(product => (
                  <button
                    key={product.id}
                    onClick={() => addToCart(product.id)}
                    className="card-hover p-3 text-left flex justify-between items-center group"
                  >
                    <div className="min-w-0">
                      <p className="font-bold text-ink-800 text-sm group-hover:text-emerald-700 transition-colors truncate">
                        {product.name}
                      </p>
                      <p className="text-xs text-ink-500 font-bold">₡{product.price}</p>
                    </div>
                    <div className="p-1.5 bg-ink-100 rounded-lg group-hover:bg-emerald-100 group-hover:text-emerald-600 transition-colors shrink-0">
                      <Plus size={14} />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>

      {/* Right side: Cart/Order Summary */}
      <div className="w-full lg:w-96 bg-white border-l border-ink-200 p-5 flex flex-col shadow-2xl">
        <div className="flex items-center gap-2 mb-5 pb-4 border-b border-ink-100">
          <span className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
            <ShoppingBag size={18} />
          </span>
          <h2 className="text-lg font-black text-ink-900">Resumen del Pedido</h2>
        </div>

        <div className="flex-grow space-y-3 overflow-y-auto max-h-[calc(100vh-300px)] pr-1">
          {cart.length === 0 ? (
            <div className="text-center py-12 text-ink-400">
              <div className="w-12 h-12 bg-ink-100 rounded-2xl flex items-center justify-center mx-auto mb-2">
                <ShoppingBag size={20} className="opacity-50" />
              </div>
              <p className="text-sm italic font-medium">El pedido está vacío</p>
              <p className="text-xs mt-1">Agrega productos del menú</p>
            </div>
          ) : (
            cart.map(item => {
              const product = products.find(p => p.id === item.productId);
              return (
                <div key={item.productId} className="flex flex-col p-3 bg-ink-50 rounded-xl border border-ink-100 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex-grow min-w-0">
                      <p className="text-sm font-bold text-ink-800 truncate">{product?.name}</p>
                      <p className="text-xs text-ink-500">₡{product?.price}</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => removeFromCart(item.productId)}
                        className="p-1 text-ink-500 hover:text-rose-600 rounded-md"
                        title="Eliminar"
                      >
                        <X size={14} />
                      </button>
                      <span className="text-sm font-black w-7 text-center bg-white rounded-md py-0.5 border border-ink-200">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.productId, 1)}
                        className="p-1 text-ink-500 hover:text-emerald-600 rounded-md"
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
                    className="w-full px-2.5 py-1.5 text-xs border border-ink-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  />
                </div>
              );
            })
          )}
        </div>

        <div className="mt-5 pt-4 border-t border-ink-200 space-y-4">
          <div className="flex justify-between items-center p-3 bg-ink-50 rounded-xl">
            <span className="text-sm font-bold text-ink-500">Total Estimado</span>
            <span className="text-xl font-black text-ink-900">
              ₡{cart.reduce((acc, item) => {
                const p = products.find(prod => prod.id === item.productId);
                return acc + (p?.price || 0) * item.quantity;
              }, 0).toFixed(2)}
            </span>
          </div>

          <button
            onClick={sendOrder}
            disabled={(!selectedTable && !isTakeaway) || cart.length === 0 || isSubmitting}
            className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold rounded-xl shadow-glow-green transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Send size={18} /> {isSubmitting ? 'Enviando...' : 'Confirmar y Enviar a Cocina'}
          </button>
        </div>
      </div>
    </div>
  );
}

function UserCheck(props: any) {
  return <User size={props.size} {...props} />;
}
