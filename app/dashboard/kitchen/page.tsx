"use client";
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Clock, CheckCircle, Flame, Package, Truck, RotateCcw, Users, UtensilsCrossed, XCircle, Banknote, Bell } from 'lucide-react';
import { Order, OrderStatus } from '@/types/order';

const STATUS_COLORS: Record<OrderStatus, { bg: string; text: string; icon: any }> = {
  pending: { bg: 'bg-gray-100', text: 'text-gray-600', icon: Clock },
  confirmed: { bg: 'bg-blue-100', text: 'text-blue-600', icon: CheckCircle },
  preparing: { bg: 'bg-yellow-100', text: 'text-yellow-600', icon: Flame },
  ready: { bg: 'bg-green-100', text: 'text-green-600', icon: Package },
  delivered: { bg: 'bg-slate-100', text: 'text-slate-400', icon: Truck },
  paid: { bg: 'bg-green-200', text: 'text-green-700', icon: Banknote },
  cancelled: { bg: 'bg-red-100', text: 'text-red-600', icon: XCircle },
};

export default function KitchenBoard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const playBell = () => {
    const audio = new Audio('https://cdn.pixabay.com/audio/2022/03/10/audio_cba687da81.mp3');
    audio.play().catch(e => console.log('Audio playback failed', e));
  };

  useEffect(() => {
    fetchOrders();

    const channel = supabase
      .channel('kitchen_orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, (payload) => {
        playBell();
        fetchOrders();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'order_items' }, (payload) => {
        fetchOrders();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function fetchOrders() {
    const restaurantId = localStorage.getItem('restaurant_id');
    if (!restaurantId) return;

    const { data, error } = await supabase
      .from('orders')
      .select(`*, restaurant_tables(table_number), order_items(product_id, notes, products(name, description, quick_delivery), quantity)`)
      .eq('restaurant_id', restaurantId)
      .neq('status', 'delivered')
      .neq('status', 'cancelled')
      .order('created_at', { ascending: true });

    if (error) console.error('Error fetching orders:', error);
    else if (data) setOrders(data);
    setLoading(false);
  }

  async function updateStatus(orderId: string, newStatus: OrderStatus) {
    await supabase
      .from('orders')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', orderId);

    fetchOrders();
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center">Cargando tablero de cocina...</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Tablero de Cocina</h1>
            <p className="text-slate-500">Monitorea y gestiona los pedidos en tiempo real</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={playBell}
              className="px-4 py-2 bg-white border rounded-lg text-sm font-medium hover:bg-gray-50 flex items-center gap-2"
            >
              <Bell size={16} /> Probar Timbre
            </button>
            <button
              onClick={() => window.location.href = '/dashboard/role-selection'}
              className="px-4 py-2 bg-white border rounded-lg text-sm font-medium hover:bg-gray-50 flex items-center gap-2"
            >
              <RotateCcw size={16} /> Cambiar Rol
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {orders.length === 0 ? (
            <div className="col-span-full py-20 text-center text-slate-400 space-y-3">
              <Package size={48} className="mx-auto opacity-20" />
              <p className="text-lg">No hay pedidos pendientes en este momento</p>
            </div>
          ) : (
            orders.map((order) => {
              const statusCfg = STATUS_COLORS[order.status] || { bg: 'bg-gray-100', text: 'text-gray-600', icon: Clock };
              const Icon = statusCfg.icon;

              return (
                <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
                  <div className={`p-4 flex justify-between items-center ${statusCfg.bg} ${statusCfg.text}`}>
                    <div className="flex items-center gap-2 font-bold">
                      <Icon size={20} />
                      <span>
                        {order.is_takeaway ? (
                          <span className="flex items-center gap-1 text-orange-700">
                            <UtensilsCrossed size={16} /> Para Llevar
                          </span>
                        ) : (
                          `Mesa ${order.restaurant_tables?.table_number || 'N/A'}`
                        )}
                      </span>
                    </div>
                    <span className="text-xs font-medium uppercase tracking-wider">
                      {order.status}
                    </span>
                  </div>

                  <div className="p-4 space-y-4 flex-grow">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-500">Cliente:</span>
                        <span className="text-sm font-medium text-slate-900">{order.customer_name || 'Anónimo'}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-slate-400 font-medium">
                        <Users size={14} />
                        <span>{order.people_count || 1} pers.</span>
                      </div>
                    </div>

                    { (order as any).notes && (
                      <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs font-bold italic shadow-sm">
                        <span className="uppercase text-[10px] block text-amber-600 not-italic mb-1">Nota General del Cliente:</span>
                        📝 {(order as any).notes}
                      </div>
                    )}

                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-tight">Platillos</p>
                      <div className="space-y-2">
                        {order.order_items
                          ?.filter((item: any) => !item.products?.quick_delivery)
                          .map((item: any, idx: number) => (
                          <div key={idx} className="flex flex-col border-b border-slate-100 pb-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-slate-700">
                                <span className="font-bold mr-2">{item.quantity}x</span>
                                {item.products?.name}
                              </span>
                              {item.products?.description && (
                                <span className="text-xs text-slate-400 italic truncate max-w-32">
                                  {item.products.description}
                                </span>
                              )}
                            </div>
                            {item.notes && (
                              <div className="mt-1 px-2 py-1 bg-slate-100 text-slate-600 text-[11px] font-medium rounded-md border border-slate-200 italic">
                                📝 {item.notes}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 border-t border-slate-100 grid grid-cols-2 gap-2">
                    <button
                      onClick={() => updateStatus(order.id, 'preparing')}
                      disabled={order.status === 'preparing' || order.status === 'ready' || order.status === 'delivered'}
                      className="py-2 px-3 bg-white border rounded-lg text-xs font-medium hover:bg-orange-50 hover:text-orange-600 transition-colors disabled:opacity-50"
                    >
                      En Preparación
                    </button>
                    <button
                      onClick={() => updateStatus(order.id, 'ready')}
                      disabled={order.status === 'ready' || order.status === 'delivered'}
                      className="py-2 px-3 bg-white border rounded-lg text-xs font-medium hover:bg-green-50 hover:text-green-600 transition-colors disabled:opacity-50"
                    >
                      Listo / Entregar
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
