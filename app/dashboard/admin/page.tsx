"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  TableProperties,
  Utensils,
  BarChart3,
  RotateCcw,
  Settings,
  TrendingUp,
  ShoppingBag,
  DollarSign,
  QrCode,
  Receipt,
  Bell,
  Sparkles
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState({
    revenue: 0,
    activeOrders: 0,
    topProduct: 'Cargando...',
    loading: true
  });

  const quickLinks = [
    {
      name: 'Configuración de Marca',
      path: '/dashboard/admin/settings',
      icon: Settings,
      color: 'from-slate-500 to-slate-700',
      shadow: 'shadow-slate-200',
      description: 'Personaliza los colores y la identidad de tu restaurante.',
    },
    {
      name: 'Control de Mesas',
      path: '/dashboard/admin/tables',
      icon: TableProperties,
      color: 'from-royal-500 to-royal-700',
      shadow: 'shadow-royal-200',
      description: 'Crea mesas y genera códigos QR de acceso.',
    },
    {
      name: 'Centro de QR',
      path: '/dashboard/admin/qr',
      icon: QrCode,
      color: 'from-indigo-500 to-indigo-700',
      shadow: 'shadow-indigo-200',
      description: 'Genera y descarga el QR universal de tu menú.',
    },
    {
      name: 'Menú de Productos',
      path: '/dashboard/admin/menu',
      icon: Utensils,
      color: 'from-brand-400 to-brand-600',
      shadow: 'shadow-brand-200',
      description: 'Gestiona platillos, precios y disponibilidad.',
    },
    {
      name: 'Facturas y Cobros',
      path: '/dashboard/admin/invoices',
      icon: Receipt,
      color: 'from-sky-500 to-sky-700',
      shadow: 'shadow-sky-200',
      description: 'Gestiona cuentas pendientes y procesa pagos.',
    },
    {
      name: 'Reportes y Ventas',
      path: '/dashboard/admin/reports',
      icon: BarChart3,
      color: 'from-emerald-500 to-emerald-700',
      shadow: 'shadow-emerald-200',
      description: 'Analiza las ventas y los platillos más vendidos.',
    },
  ];

  useEffect(() => {
    async function fetchDashboardStats() {
      const restaurantId = localStorage.getItem('restaurant_id');
      if (!restaurantId) return;

      try {
        // Usamos supabaseAdmin (service_role) porque `orders` y
        // `order_items` no tienen policy de SELECT para anon.
        // 1. Total Revenue (Fallback calculation using order_items)
        const { data: orderDetails, error: odError } = await supabaseAdmin
          .from('order_items')
          .select('quantity, products(price), orders(restaurant_id, status)')
          .eq('orders.restaurant_id', restaurantId)
          .neq('orders.status', 'cancelled');

        if (odError) throw odError;

        const revenue = orderDetails.reduce((acc, item) => {
          const product = Array.isArray(item.products) ? item.products[0] : item.products;
          const price = product?.price || 0;
          return acc + (price * item.quantity);
        }, 0);

        const active = (await supabaseAdmin
          .from('orders')
          .select('id')
          .eq('restaurant_id', restaurantId)
          .neq('status', 'delivered')
          .neq('status', 'cancelled')
        ).data?.length || 0;

        // 2. Top Product
        const { data: orderItems, error: oiError } = await supabaseAdmin
          .from('order_items')
          .select('product_id, products(name), orders(restaurant_id)')
          .eq('orders.restaurant_id', restaurantId);

        let bestName = 'N/A';
        if (oiError) {
          console.error('Error fetching top product:', oiError);
        } else if (orderItems) {
          const counts: Record<string, {name: string, count: number}> = {};
          orderItems.forEach(item => {
            const product = Array.isArray(item.products) ? item.products[0] : item.products;
            const name = product?.name || 'Unknown';
            const id = item.product_id;
            if (!counts[id]) counts[id] = { name, count: 0 };
            counts[id].count++;
          });

          let max = 0;
          for (const id in counts) {
            if (counts[id].count > max) {
              max = counts[id].count;
              bestName = counts[id].name;
            }
          }
        }

        setStats({
          revenue,
          activeOrders: active,
          topProduct: bestName,
          loading: false
        });

      } catch (err) {
        console.error('Error fetching stats:', err);
        setStats(prev => ({ ...prev, loading: false }));
      }
    }

    fetchDashboardStats();
  }, []);

  return (
    <div className="min-h-screen flex bg-ink-50">
      {/* === SIDEBAR === */}
      <aside className="w-64 bg-gradient-night text-white p-5 flex flex-col gap-6 hidden lg:flex sticky top-0 h-screen">
        <div className="flex items-center gap-3 px-2 pt-2">
          <div className="p-2 bg-gradient-brand rounded-xl shadow-glow-brand">
            <LayoutDashboard size={20} />
          </div>
          <div>
            <span className="font-black text-lg tracking-tight block">Admin Panel</span>
            <span className="text-[10px] text-white/50 uppercase tracking-wider">RestaurantOS</span>
          </div>
        </div>

        <nav className="flex-grow space-y-1 overflow-y-auto">
          <p className="text-[10px] text-white/40 uppercase font-bold tracking-wider px-3 mb-2">Navegación</p>
          {quickLinks.map(link => {
            const Icon = link.icon;
            return (
              <button
                key={link.path}
                onClick={() => router.push(link.path)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/70 hover:bg-white/10 hover:text-white transition-all duration-200 group"
              >
                <Icon size={18} className="group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium">{link.name}</span>
              </button>
            );
          })}
        </nav>

        <div className="space-y-2 pt-3 border-t border-white/10">
          <button
            onClick={() => window.location.href = '/dashboard/role-selection'}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-colors"
          >
            <RotateCcw size={18} />
            <span className="text-sm font-medium">Cambiar rol</span>
          </button>
        </div>
      </aside>

      {/* === MAIN === */}
      <main className="flex-grow p-6 lg:p-10 space-y-8 max-w-7xl mx-auto w-full">
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-brand-100 text-brand-700 rounded-full text-xs font-bold mb-2">
              <Sparkles size={12} /> Centro de control
            </div>
            <h1 className="text-3xl lg:text-4xl font-black text-ink-900 tracking-tight">
              Panel de Administración
            </h1>
            <p className="text-ink-500 mt-1">Bienvenido al centro de control de tu restaurante</p>
          </div>
          <button
            onClick={() => router.push('/dashboard/admin/settings')}
            className="card-hover p-2 px-4 flex items-center gap-2 self-start"
          >
            <div className="w-9 h-9 bg-gradient-brand rounded-full flex items-center justify-center text-white font-bold text-sm shadow-glow-brand">
              A
            </div>
            <div className="text-left">
              <p className="text-sm font-bold text-ink-900">Administrador</p>
              <p className="text-[11px] text-ink-500">Ver perfil</p>
            </div>
          </button>
        </header>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 animate-slide-up">
          <StatCard
            title="Ventas Totales"
            value={stats.loading ? '...' : `₡${stats.revenue.toLocaleString()}`}
            icon={DollarSign}
            color="text-emerald-600"
            bg="bg-emerald-100"
            trend="Acumulado histórico"
            delay={0}
          />
          <StatCard
            title="Pedidos Activos"
            value={stats.loading ? '...' : stats.activeOrders.toString()}
            icon={ShoppingBag}
            color="text-sky-600"
            bg="bg-sky-100"
            trend="Pendientes de entrega"
            delay={100}
          />
          <StatCard
            title="Platillo Top"
            value={stats.topProduct}
            icon={TrendingUp}
            color="text-brand-600"
            bg="bg-brand-100"
            trend="Más pedido"
            delay={200}
          />
        </div>

        {/* Quick access */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black text-ink-900">Accesos rápidos</h2>
            <span className="text-xs text-ink-500">6 módulos disponibles</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {quickLinks.map((link, idx) => {
              const Icon = link.icon;
              return (
                <button
                  key={link.path}
                  onClick={() => router.push(link.path)}
                  style={{ animationDelay: `${idx * 80}ms` }}
                  className="group relative bg-white rounded-2xl p-6 border border-ink-200/60 shadow-soft hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 text-left overflow-hidden animate-slide-up opacity-0"
                >
                  {/* Decorative gradient blob on hover */}
                  <div className={`absolute -top-12 -right-12 w-40 h-40 bg-gradient-to-br ${link.color} opacity-0 group-hover:opacity-20 rounded-full blur-2xl transition-opacity duration-500`} />

                  <div className="relative space-y-4">
                    <div className={`w-12 h-12 bg-gradient-to-br ${link.color} rounded-2xl flex items-center justify-center text-white shadow-lg ${link.shadow} group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
                      <Icon size={22} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-ink-900 mb-1 group-hover:text-brand-600 transition-colors">
                        {link.name}
                      </h3>
                      <p className="text-sm text-ink-500 leading-relaxed">
                        {link.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 text-sm font-semibold text-ink-400 group-hover:text-brand-600 transition-colors">
                      Abrir
                      <span className="group-hover:translate-x-1 transition-transform">→</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color, bg, trend, delay = 0 }: any) {
  return (
    <div
      style={{ animationDelay: `${delay}ms` }}
      className="card-hover p-6 relative overflow-hidden animate-slide-up opacity-0"
    >
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-transparent to-ink-50 rounded-full" />
      <div className="relative space-y-4">
        <div className="flex justify-between items-start">
          <span className="text-sm font-semibold text-ink-500">{title}</span>
          <div className={`p-2.5 rounded-xl ${bg}`}>
            <Icon size={20} className={color} />
          </div>
        </div>
        <div>
          <p className="text-3xl font-black text-ink-900 tracking-tight truncate">{value}</p>
          <p className="text-xs text-ink-400 mt-1 font-medium flex items-center gap-1">
            <span className="inline-block w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            {trend}
          </p>
        </div>
      </div>
    </div>
  );
}
