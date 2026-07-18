"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { Store, CheckCircle2, XCircle, TrendingUp, ArrowRight, Sparkles, Activity } from 'lucide-react';
import { Restaurant } from '@/types/restaurant';

export default function SuperadminDashboard() {
  const router = useRouter();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    suspended: 0,
    recent: [] as Restaurant[]
  });

  useEffect(() => {
    fetchRestaurants();
  }, []);

  async function fetchRestaurants() {
    try {
      const { data, error } = await supabaseAdmin
        .from('restaurants')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const list = data || [];
      const active = list.filter(r => r.is_active !== false).length;
      const suspended = list.filter(r => r.is_active === false).length;
      const recent = list.slice(0, 5);

      setRestaurants(list);
      setStats({ total: list.length, active, suspended, recent });
    } catch (err) {
      console.error('Error fetching restaurants:', err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-royal-200 border-t-royal-600 rounded-full animate-spin" />
          <p className="text-sm text-ink-500 font-medium">Cargando panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header className="animate-fade-in">
        <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-royal-100 text-royal-700 rounded-full text-xs font-bold mb-2">
          <Sparkles size={12} /> Plataforma RestaurantOS
        </div>
        <h1 className="text-3xl lg:text-4xl font-black text-ink-900 tracking-tight">
          Dashboard de Plataforma
        </h1>
        <p className="text-ink-500 mt-1">Resumen general de restaurantes en tu plataforma</p>
      </header>

      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <StatCard
          title="Total Restaurantes"
          value={stats.total}
          icon={Store}
          color="text-royal-600"
          bg="bg-royal-100"
          gradient="from-royal-500/20 to-transparent"
          delay={0}
        />
        <StatCard
          title="Activos"
          value={stats.active}
          icon={CheckCircle2}
          color="text-emerald-600"
          bg="bg-emerald-100"
          gradient="from-emerald-500/20 to-transparent"
          delay={100}
        />
        <StatCard
          title="Suspendidos"
          value={stats.suspended}
          icon={XCircle}
          color="text-rose-600"
          bg="bg-rose-100"
          gradient="from-rose-500/20 to-transparent"
          delay={200}
        />
      </div>

      {/* Quick access */}
      <div className="relative overflow-hidden bg-gradient-to-br from-royal-600 to-royal-800 p-8 rounded-3xl text-white shadow-glow-royal animate-slide-up">
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-brand-500/20 rounded-full blur-3xl" />
        <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-bold mb-3 border border-white/20">
              <Activity size={12} /> Acción sugerida
            </div>
            <h2 className="text-2xl font-black mb-2">Gestión de Restaurantes</h2>
            <p className="text-white/80 max-w-md">
              Crea, suspende, edita o elimina restaurantes de tu plataforma desde un solo lugar.
            </p>
          </div>
          <button
            onClick={() => router.push('/superadmin/restaurants')}
            className="px-6 py-3 bg-white text-royal-700 font-bold rounded-xl hover:bg-white/95 transition-all flex items-center gap-2 shadow-lg active:scale-95 whitespace-nowrap"
          >
            Ir a Gestión <ArrowRight size={20} />
          </button>
        </div>
      </div>

      {/* Recent restaurants */}
      <div className="card p-6 animate-slide-up">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-black text-ink-900">Restaurantes Recientes</h2>
            <p className="text-sm text-ink-500 mt-0.5">Últimos registrados en la plataforma</p>
          </div>
          <button
            onClick={() => router.push('/superadmin/restaurants')}
            className="text-sm text-royal-600 font-semibold hover:underline flex items-center gap-1"
          >
            Ver todos →
          </button>
        </div>

        {stats.recent.length === 0 ? (
          <div className="text-center py-16 text-ink-400">
            <div className="w-16 h-16 bg-ink-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Store size={32} className="opacity-50" />
            </div>
            <p className="font-semibold">No hay restaurantes todavía</p>
            <p className="text-sm mt-1">Crea el primero desde Gestión de Restaurantes</p>
          </div>
        ) : (
          <div className="space-y-2">
            {stats.recent.map((r, idx) => (
              <div
                key={r.id}
                style={{ animationDelay: `${idx * 60}ms` }}
                className="flex items-center justify-between p-4 bg-ink-50/50 rounded-xl hover:bg-ink-50 hover:shadow-soft transition-all border border-transparent hover:border-ink-200 animate-slide-up opacity-0"
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 bg-gradient-royal text-white rounded-xl flex items-center justify-center font-black text-lg shadow-glow-royal">
                    {r.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-ink-900">{r.name}</p>
                    <p className="text-xs text-ink-500 flex items-center gap-1.5">
                      <span className="inline-block w-1 h-1 bg-ink-400 rounded-full" />
                      Creado {new Date(r.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <span
                  className={`badge ${
                    r.is_active === false
                      ? 'bg-rose-100 text-rose-700'
                      : 'bg-emerald-100 text-emerald-700'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    r.is_active === false ? 'bg-rose-500' : 'bg-emerald-500'
                  }`} />
                  {r.is_active === false ? 'Suspendido' : 'Activo'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color, bg, gradient, delay = 0 }: any) {
  return (
    <div
      style={{ animationDelay: `${delay}ms` }}
      className="card-hover p-6 relative overflow-hidden animate-slide-up opacity-0"
    >
      <div className={`absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br ${gradient} rounded-full blur-2xl`} />
      <div className="relative space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-ink-500">{title}</span>
          <div className={`p-2.5 rounded-xl ${bg}`}>
            <Icon size={20} className={color} />
          </div>
        </div>
        <p className="text-4xl font-black text-ink-900 tracking-tight">{value}</p>
      </div>
    </div>
  );
}
