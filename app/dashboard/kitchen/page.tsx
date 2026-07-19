"use client";
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { Clock, CheckCircle, Flame, Package, Truck, RotateCcw, Users, UtensilsCrossed, XCircle, Banknote, Bell, RefreshCw } from 'lucide-react';
import { Order, OrderStatus } from '@/types/order';

// Helpers: la tabla `orders` no tiene `is_takeaway` ni `people_count`.
// El mesero codifica esos datos como prefijo en `customer_name`:
//   "🥡 2x · Juan" → takeaway=true, 2 personas, nombre "Juan"
function isTakeawayOrder(order: any): boolean {
  return (order?.customer_name || '').startsWith('🥡');
}
function peopleCountFromName(order: any): number {
  const m = (order?.customer_name || '').match(/^(\d+)x · /);
  return m ? parseInt(m[1], 10) : 1;
}
function cleanCustomerName(order: any): string {
  return (order?.customer_name || '')
    .replace(/^🥡\s*/, '')
    .replace(/^\d+x · /, '')
    .trim() || 'Anónimo';
}

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
    const audio = new Audio('https://cdn.pixabay.com/audio/2021/08/04/audio_0627779232.mp3');
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

    // Polling cada 15s como fallback (Realtime puede no estar habilitado
    // en el proyecto Supabase). Garantiza que pedidos nuevos aparezcan
    // aunque Realtime no esté disponible.
    const poll = setInterval(() => {
      fetchOrders();
    }, 15000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(poll);
    };
  }, []);

  async function fetchOrders() {
    const restaurantId = localStorage.getItem('restaurant_id');
    if (!restaurantId) {
      console.error('[kitchen] restaurant_id es null/vacío en localStorage. ¿Hiciste login?');
      return;
    }
    console.log('[kitchen] fetchOrders con restaurant_id =', restaurantId);

    const { data, error } = await supabase
      .from('orders')
      .select(`*, restaurant_tables(table_number), order_items(product_id, notes, products(name, description, quick_delivery), quantity)`)
      .eq('restaurant_id', restaurantId)
      .neq('status', 'delivered')
      .neq('status', 'cancelled')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('[kitchen] Error en query:', error);
    } else {
      console.log('[kitchen] Query OK, encontrados:', data?.length || 0, 'pedidos');
    }
    if (data) setOrders(data);
    setLoading(false);
  }

  async function updateStatus(orderId: string, newStatus: OrderStatus) {
    const { error } = await supabaseAdmin
      .from('orders')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', orderId);

    if (error) {
      console.error('[updateStatus] error:', error);
      alert(`Error al actualizar el estado: ${error.message}`);
    }

    fetchOrders();
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-ink-50">
      <div className="flex flex-col items-center gap-3">
        <div className="w-12 h-12 border-4 border-brand-200 border-t-brand-500 rounded-full animate-spin" />
        <p className="text-sm text-ink-500 font-medium">Cargando tablero...</p>
      </div>
    </div>
  );

  const activeOrders = orders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled');

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-brand-100 text-brand-700 rounded-full text-xs font-bold mb-2">
              <Flame size={12} className="animate-pulse" /> Cocina
            </div>
            <h1 className="text-3xl font-black text-ink-900 tracking-tight">Tablero de Cocina</h1>
            <p className="text-ink-500 mt-1">{activeOrders.length} pedidos activos en tiempo real</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => fetchOrders()} className="btn-secondary" title="Refrescar pedidos">
              <RefreshCw size={16} /> Refrescar
            </button>
            <button onClick={playBell} className="btn-secondary">
              <Bell size={16} /> Probar Timbre
            </button>
            <button
              onClick={() => window.location.href = '/dashboard/role-selection'}
              className="btn-secondary"
            >
              <RotateCcw size={16} /> Cambiar Rol
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {activeOrders.length === 0 ? (
            <div className="col-span-full card p-20 text-center space-y-3 animate-fade-in">
              <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto">
                <Package size={28} className="text-emerald-500" />
              </div>
              <p className="text-lg font-bold text-ink-900">¡Todo al día!</p>
              <p className="text-ink-500">No hay pedidos pendientes en este momento</p>
            </div>
          ) : (
            activeOrders.map((order, idx) => {
              const statusCfg = STATUS_COLORS[order.status] || { bg: 'bg-ink-100', text: 'text-ink-600', icon: Clock };
              const Icon = statusCfg.icon;

              return (
                <div
                  key={order.id}
                  style={{ animationDelay: `${idx * 50}ms` }}
                  className="card overflow-hidden flex flex-col hover:-translate-y-1 transition-all duration-300 animate-slide-up opacity-0"
                >
                  <div className={`p-4 flex justify-between items-center ${statusCfg.bg} ${statusCfg.text}`}>
                    <div className="flex items-center gap-2 font-black text-sm">
                      <Icon size={18} />
                      <span>
                        {isTakeawayOrder(order) ? (
                          <span className="flex items-center gap-1">
                            <UtensilsCrossed size={14} /> Para Llevar
                          </span>
                        ) : (
                          `Mesa ${order.restaurant_tables?.table_number || 'N/A'}`
                        )}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {order.created_at && (
                        <span className="text-[10px] font-bold opacity-70">
                          {new Date(order.created_at).toLocaleTimeString('es-CR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                      <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/60">
                        {order.status}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 space-y-3 flex-grow">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-ink-500">Cliente:</span>
                        <span className="text-sm font-bold text-ink-900">{cleanCustomerName(order)}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-ink-400 font-medium">
                        <Users size={12} />
                        <span>{peopleCountFromName(order)} pers.</span>
                      </div>
                    </div>

                    { (order as any).notes && (
                      <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs font-bold italic">
                        <span className="uppercase text-[9px] block text-amber-600 not-italic mb-0.5">Nota General</span>
                        📝 {(order as any).notes}
                      </div>
                    )}

                    <div className="space-y-1.5">
                      <p className="text-[10px] font-bold text-ink-400 uppercase tracking-wider">Platillos</p>
                      <div className="space-y-1.5">
                        {order.order_items
                          ?.filter((item: any) => !item.products?.quick_delivery)
                          .map((item: any, idx: number) => (
                          <div key={idx} className="flex flex-col py-1.5 border-b border-ink-50 last:border-0">
                            <div className="flex justify-between text-sm">
                              <span className="text-ink-700 font-medium">
                                <span className="font-black text-ink-900 mr-1.5">{item.quantity}x</span>
                                {item.products?.name}
                              </span>
                            </div>
                            {item.notes && (
                              <div className="mt-1 px-2 py-1 bg-ink-100 text-ink-600 text-[11px] font-medium rounded-md italic">
                                📝 {item.notes}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-ink-50/50 border-t border-ink-100 grid grid-cols-2 gap-2">
                    <button
                      onClick={() => updateStatus(order.id, 'preparing')}
                      disabled={order.status === 'preparing' || order.status === 'ready' || order.status === 'delivered'}
                      className="py-2 px-3 bg-white border border-ink-200 rounded-lg text-xs font-bold hover:bg-brand-50 hover:text-brand-700 hover:border-brand-200 transition-all disabled:opacity-30"
                    >
                      En Preparación
                    </button>
                    <button
                      onClick={() => updateStatus(order.id, 'ready')}
                      disabled={order.status === 'ready' || order.status === 'delivered'}
                      className="py-2 px-3 bg-white border border-ink-200 rounded-lg text-xs font-bold hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 transition-all disabled:opacity-30"
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
