"use client";
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Clock, CheckCircle, Flame, Package, Truck, RotateCcw } from 'lucide-react';

type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered';

interface Order {
  id: string;
  table_id: string;
  customer_name: string;
  status: OrderStatus;
  created_at: string;
  restaurant_tables?: { table_number: number };
  order_items?: any[];
}

const STATUS_COLORS: Record<OrderStatus, { bg: string; text: string; icon: any }> = {
  pending: { bg: 'bg-gray-100', text: 'text-gray-600', icon: Clock },
  confirmed: { bg: 'bg-blue-100', text: 'text-blue-600', icon: CheckCircle },
  preparing: { bg: 'bg-yellow-100', text: 'text-yellow-600', icon: Flame },
  ready: { bg: 'bg-green-100', text: 'text-green-600', icon: Package },
  delivered: { bg: 'bg-slate-100', text: 'text-slate-400', icon: Truck },
};

export default function KitchenBoard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();

    // Real-time subscription
    const channel = supabase
      .channel('kitchen_orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
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
      .select(`*, restaurant_tables(table_number), order_items(product_id, products(name, description), quantity)`)
      .eq('restaurant_id', restaurantId)
      .neq('status', 'delivered')
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
          <button
            onClick={() => window.location.href = '/dashboard/role-selection'}
            className="px-4 py-2 bg-white border rounded-lg text-sm font-medium hover:bg-gray-50 flex items-center gap-2"
          >
            <RotateCcw size={16} /> Cambiar Rol
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {orders.length === 0 ? (
            <div className="col-span-full py-20 text-center text-slate-400 space-y-3">
              <Package size={48} className="mx-auto opacity-20" />
              <p className="text-lg">No hay pedidos pendientes en este momento</p>
            </div>
          ) : (
            orders.map((order) => {
              const statusCfg = STATUS_COLORS[order.status];
              const Icon = statusCfg.icon;

              return (
                <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
                  <div className={`p-4 flex justify-between items-center ${statusCfg.bg} ${statusCfg.text}`}>
                    <div className="flex items-center gap-2 font-bold">
                      <Icon size={20} />
                      <span>Mesa {order.restaurant_tables?.table_number || 'N/A'}</span>
                    </div>
                    <span className="text-xs font-medium uppercase tracking-wider">
                      {order.status}
                    </span>
                  </div>

                  <div className="p-4 space-y-4 flex-grow">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-500">Cliente:</span>
                      <span className="text-sm font-medium text-slate-900">{order.customer_name || 'Anónimo'}</span>
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-tight">Platillos</p>
                      <div className="space-y-2">
                        {order.order_items?.map((item: any, idx: number) => (
                          <div key={idx} className="flex justify-between text-sm border-b border-slate-100 pb-1">
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
                    <button
                      onClick={() => updateStatus(order.id, 'delivered')}
                      disabled={order.status === 'delivered'}
                      className="col-span-2 py-2 px-3 bg-slate-800 text-white rounded-lg text-xs font-medium hover:bg-slate-900 transition-colors disabled:opacity-50"
                    >
                      Marcar como Entregado
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
