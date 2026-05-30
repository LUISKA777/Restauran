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
      // Calculate date filter
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

      // 1. Fetch Orders
      let query = supabase
        .from('orders')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .neq('status', 'cancelled');

      if (dateFilter) {
        query = query.gte('created_at', dateFilter);
      }

      const { data: ordersData, error: ordersError } = await query;
      if (ordersError) throw ordersError;
      setOrders(ordersData || []);

      // 2. Fetch Top Product for this range
      const { data: itemsData, error: itemsError } = await supabase
        .from('order_items')
        .select('product_id, products(name), orders(created_at)')
        .eq('orders.restaurant_id', restaurantId);

      if (itemsError) throw itemsError;

      const filteredItems = itemsData?.filter(item => {
        if (!dateFilter) return true;
        const order = Array.isArray(item.orders) ? item.orders[0] : item.orders;
        return order?.created_at && new Date(order.created_at) >= new Date(dateFilter);
      }) || [];

      const counts: Record<string, {name: string, count: number}> = {};
      filteredItems.forEach(item => {
        const product = Array.isArray(item.products) ? item.products[0] : item.products;
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 font-medium">Cargando analíticas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <BarChart3 className="text-green-500" /> Reportes y Ventas
          </h1>
        </div>
        <div className="flex items-center gap-2 bg-white p-1 rounded-2xl border shadow-sm">
          <button
            onClick={() => setRange('today')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${range === 'today' ? 'bg-green-600 text-white shadow-md' : 'text-slate-500 hover:bg-gray-100'}`}
          >
            Hoy
          </button>
          <button
            onClick={() => setRange('week')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${range === 'week' ? 'bg-green-600 text-white shadow-md' : 'text-slate-500 hover:bg-gray-100'}`}
          >
            Semana
          </button>
          <button
            onClick={() => setRange('month')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${range === 'month' ? 'bg-green-600 text-white shadow-md' : 'text-slate-500 hover:bg-gray-100'}`}
          >
            Mes
          </button>
          <button
            onClick={() => setRange('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${range === 'all' ? 'bg-green-600 text-white shadow-md' : 'text-slate-500 hover:bg-gray-100'}`}
          >
            Todo
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <StatCard
          title="Ingresos Totales"
          value={`₡${totalRevenue.toLocaleString()}`}
          icon={<DollarSign />}
          color="text-green-600"
          bg="bg-green-100"
        />
        <StatCard
          title="Pedidos"
          value={totalCount.toString()}
          icon={<ShoppingBag />}
          color="text-blue-600"
          bg="bg-blue-100"
        />
        <StatCard
          title="Producto Estrella"
          value={topProduct}
          icon={<TrendingUp />}
          color="text-orange-600"
          bg="bg-orange-100"
        />
        <StatCard
          title="Ticket Promedio"
          value={`₡${Math.round(avgOrder).toLocaleString()}`}
          icon={<Clock />}
          color="text-purple-600"
          bg="bg-purple-100"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Daily Breakdown */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Calendar size={20} className="text-green-600" /> Ventas por Día
              </h2>
              <button className="text-xs font-bold text-slate-400 hover:text-green-600 flex items-center gap-1 transition-colors">
                <Download size={14} /> Exportar CSV
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr className="text-slate-600">
                    <th className="px-6 py-4 text-sm font-bold">Fecha</th>
                    <th className="px-6 py-4 text-sm font-bold text-center">Pedidos</th>
                    <th className="px-6 py-4 text-sm font-bold text-right">Total Ventas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {dailySales.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-6 py-20 text-center text-slate-400 italic">
                        No hay datos de ventas para el periodo seleccionado.
                      </td>
                    </tr>
                  ) : (
                    dailySales.map((day, i) => (
                      <tr key={i} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 font-medium text-slate-900">{day.date}</td>
                        <td className="px-6 py-4 text-center text-slate-600 font-bold">{day.count}</td>
                        <td className="px-6 py-4 text-right font-black text-slate-900">₡{day.revenue.toLocaleString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Recent Orders List */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <ShoppingBag size={20} className="text-green-600" /> Últimos Pedidos
            </h2>
            <div className="space-y-4">
              {orders.slice(0, 5).map(order => (
                <div key={order.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex justify-between items-center group hover:border-green-200 transition-colors">
                  <div>
                    <p className="text-sm font-bold text-slate-900">{order.customer_name || 'Anónimo'}</p>
                    <p className="text-xs text-slate-400">{new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} la hora</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-slate-900">₡{order.total_price.toLocaleString()}</p>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-slate-200 text-slate-500">
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
              {orders.length === 0 && <p className="text-center text-slate-400 italic text-sm py-4">Sin pedidos recientes</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color, bg }: any) {
  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col space-y-4">
      <div className="flex justify-between items-start">
        <span className="text-slate-500 font-medium">{title}</span>
        <div className={`p-2 rounded-lg ${bg} ${color}`}>
          {icon}
        </div>
      </div>
      <div>
        <p className="text-2xl font-black text-slate-900">{value}</p>
      </div>
    </div>
  );
}
