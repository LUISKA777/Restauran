"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  BarChart3,
  TrendingUp,
  ShoppingBag,
  Clock,
  DollarSign,
  Calendar,
  Download
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

interface Order {
  id: string;
  total_price: number;
  status: string;
  created_at: string;
  customer_name: string;
}

type TimeRange = 'today' | 'week' | 'month' | 'all';

export default function ReportsPage() {
  const router = useRouter();
  const [range, setRange] = useState<TimeRange>('all');
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [topProduct, setTopProduct] = useState('Cargando...');

  useEffect(() => {
    fetchData();
  }, [range]);

  async function fetchData() {
    setLoading(true);
    const restaurantId = localStorage.getItem('restaurant_id');
    if (!restaurantId) return;

    try {
      let dateFilter = '';
      const now = new Date();
      if (range === 'today') {
        const start = new Date();
        start.setHours(0,0,0,0);
        dateFilter = start.toISOString();
      } else if (range === 'week') {
        const start = new Date();
        start.setDate(now.getDate() - 7);
        dateFilter = start.toISOString();
      } else if (range === 'month') {
        const start = new Date();
        start.setMonth(now.getMonth() - 1);
        dateFilter = start.toISOString();
      }

      // 1. Fetch Orders with their total_price
      // service_role: orders y order_items no tienen SELECT para anon
      let query = supabaseAdmin
        .from('orders')
        .select('id, status, created_at, customer_name, total_price')
        .eq('restaurant_id', restaurantId)
        .neq('status', 'cancelled');

      if (dateFilter) {
        query = query.gte('created_at', dateFilter);
      }

      const { data: ordersData, error: ordersError } = await query;
      if (ordersError) throw ordersError;

      setOrders(ordersData || []);

      // 2. Fetch Top Product for this range
      // We fetch items and join with orders to filter by restaurant and date
      const { data: itemsData, error: itemsError } = await supabaseAdmin
        .from('order_items')
        .select('product_id, products(name), orders(created_at)')
        .eq('orders.restaurant_id', restaurantId);

      if (itemsError) throw itemsError;

      const filteredItems = itemsData?.filter(item => {
        const order = item.orders as any;
        if (!dateFilter) return true;
        return order?.created_at && new Date(order.created_at) >= new Date(dateFilter);
      }) || [];

      const counts: Record<string, {name: string, count: number}> = {};
      filteredItems.forEach(item => {
        const product = item.products as any;
        const name = product?.name || 'Unknown';
        const id = item.product_id;
        if (!counts[id]) counts[id] = { name, count: 0 };
        counts[id].count++;
      });

      let bestName = 'N/A';
      let max = 0;
      for (const id in counts) {
        if (counts[id].count > max) {
          max = counts[id].count;
          bestName = counts[id].name;
        }
      }
      setTopProduct(bestName);

    } catch (err) {
      console.error('Error loading reports:', err);
    } finally {
      setLoading(false);
    }
  }

  // Calculated Stats
  const totalRevenue = useMemo(() => {
    return orders.reduce((acc, o) => acc + (o.total_price || 0), 0);
  }, [orders]);

  const totalCount = orders.length;
  const avgOrder = totalCount > 0 ? totalRevenue / totalCount : 0;

  // Group by Day for the table
  const dailySales = useMemo(() => {
    const groups: Record<string, { revenue: number, count: number }> = {};
    orders.forEach(order => {
      const date = new Date(order.created_at).toLocaleDateString('es-CR', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
      });
      if (!groups[date]) groups[date] = { revenue: 0, count: 0 };
      groups[date].revenue += (order.total_price || 0);
      groups[date].count++;
    });
    return Object.entries(groups).map(([date, data]) => ({ date, ...data }));
  }, [orders]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ink-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
          <p className="text-sm text-ink-500 font-medium">Cargando analíticas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 lg:p-10 max-w-7xl mx-auto">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 animate-fade-in">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-ink-100 rounded-xl transition-colors text-ink-600"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold mb-2">
              <BarChart3 size={12} /> Analítica
            </div>
            <h1 className="text-3xl font-black text-ink-900 tracking-tight">Reportes y Ventas</h1>
            <p className="text-ink-500 mt-1">Analiza el rendimiento de tu restaurante</p>
          </div>
        </div>
        <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-ink-200 shadow-soft">
          {(['today', 'week', 'month', 'all'] as const).map(r => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                range === r ? 'bg-emerald-600 text-white shadow-md' : 'text-ink-500 hover:bg-ink-100'
              }`}
            >
              {r === 'today' ? 'Hoy' : r === 'week' ? 'Semana' : r === 'month' ? 'Mes' : 'Todo'}
            </button>
          ))}
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Ingresos Totales"
          value={`₡${totalRevenue.toLocaleString()}`}
          icon={DollarSign}
          color="text-emerald-600"
          bg="bg-emerald-100"
          delay={0}
        />
        <StatCard
          title="Pedidos"
          value={totalCount.toString()}
          icon={ShoppingBag}
          color="text-sky-600"
          bg="bg-sky-100"
          delay={100}
        />
        <StatCard
          title="Producto Estrella"
          value={topProduct}
          icon={TrendingUp}
          color="text-brand-600"
          bg="bg-brand-100"
          delay={200}
        />
        <StatCard
          title="Ticket Promedio"
          value={`₡${Math.round(avgOrder).toLocaleString()}`}
          icon={Clock}
          color="text-royal-600"
          bg="bg-royal-100"
          delay={300}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Breakdown */}
        <div className="lg:col-span-2 space-y-4">
          <div className="card overflow-hidden animate-slide-up">
            <div className="p-5 border-b border-ink-100 flex justify-between items-center">
              <h2 className="text-lg font-black text-ink-900 flex items-center gap-2">
                <span className="p-1.5 bg-emerald-100 text-emerald-600 rounded-lg">
                  <Calendar size={16} />
                </span>
                Ventas por Día
              </h2>
              <button className="text-xs font-bold text-ink-400 hover:text-emerald-600 flex items-center gap-1 transition-colors">
                <Download size={14} /> Exportar CSV
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="table-clean">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th className="text-center">Pedidos</th>
                    <th className="text-right">Total Ventas</th>
                  </tr>
                </thead>
                <tbody>
                  {dailySales.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-6 py-20 text-center text-ink-400 italic">
                        No hay datos de ventas para el periodo seleccionado.
                      </td>
                    </tr>
                  ) : (
                    dailySales.map((day, i) => (
                      <tr key={i}>
                        <td className="font-medium text-ink-900">{day.date}</td>
                        <td className="text-center text-ink-600 font-bold">{day.count}</td>
                        <td className="text-right font-black text-ink-900">₡{day.revenue.toLocaleString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Recent Orders List */}
        <div className="space-y-4">
          <div className="card p-5 animate-slide-up" style={{ animationDelay: '150ms' }}>
            <h2 className="text-lg font-black text-ink-900 mb-4 flex items-center gap-2">
              <span className="p-1.5 bg-sky-100 text-sky-600 rounded-lg">
                <ShoppingBag size={16} />
              </span>
              Últimos Pedidos
            </h2>
            <div className="space-y-2">
              {orders.slice(0, 5).map(order => (
                <div key={order.id} className="p-3 bg-ink-50/50 rounded-xl border border-ink-100 flex justify-between items-center hover:border-emerald-200 transition-colors">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-ink-900 truncate">{order.customer_name || 'Anónimo'}</p>
                    <p className="text-xs text-ink-400">{new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                  <div className="text-right shrink-0 ml-2">
                    <p className="text-sm font-black text-ink-900">₡{order.total_price.toLocaleString()}</p>
                    <span className="badge bg-ink-200 text-ink-600">{order.status}</span>
                  </div>
                </div>
              ))}
              {orders.length === 0 && (
                <p className="text-center text-ink-400 italic text-sm py-6">Sin pedidos recientes</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color, bg, delay = 0 }: any) {
  return (
    <div
      style={{ animationDelay: `${delay}ms` }}
      className="card-hover p-5 animate-slide-up opacity-0"
    >
      <div className="flex justify-between items-start mb-3">
        <span className="text-sm font-semibold text-ink-500">{title}</span>
        <div className={`p-2 rounded-xl ${bg}`}>
          <Icon size={18} className={color} />
        </div>
      </div>
      <p className="text-2xl font-black text-ink-900 tracking-tight truncate">{value}</p>
    </div>
  );
}
