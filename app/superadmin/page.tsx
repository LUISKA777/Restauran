"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { Store, CheckCircle2, XCircle, TrendingUp, ArrowRight } from 'lucide-react';
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl">
      <header>
        <h1 className="text-3xl font-black text-slate-900">Dashboard de Plataforma</h1>
        <p className="text-slate-500 mt-1">Resumen general de restaurantes en tu plataforma</p>
      </header>

      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-slate-500 font-medium">Total Restaurantes</span>
            <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
              <Store size={20} />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900">{stats.total}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-slate-500 font-medium">Activos</span>
            <div className="p-2 bg-green-100 text-green-600 rounded-lg">
              <CheckCircle2 size={20} />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900">{stats.active}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-slate-500 font-medium">Suspendidos</span>
            <div className="p-2 bg-red-100 text-red-600 rounded-lg">
              <XCircle size={20} />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900">{stats.suspended}</p>
        </div>
      </div>

      {/* Quick access */}
      <div className="bg-gradient-to-br from-purple-600 to-purple-700 p-8 rounded-2xl text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Gestión de Restaurantes</h2>
            <p className="text-purple-100">Crea, suspende, edita o elimina restaurantes de tu plataforma</p>
          </div>
          <button
            onClick={() => router.push('/superadmin/restaurants')}
            className="px-6 py-3 bg-white text-purple-700 font-bold rounded-xl hover:bg-purple-50 transition-all flex items-center gap-2 shadow-lg"
          >
            Ir a Gestión <ArrowRight size={20} />
          </button>
        </div>
      </div>

      {/* Recent restaurants */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-900">Restaurantes Recientes</h2>
          <button
            onClick={() => router.push('/superadmin/restaurants')}
            className="text-sm text-purple-600 font-medium hover:underline"
          >
            Ver todos →
          </button>
        </div>

        {stats.recent.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <Store size={48} className="mx-auto mb-3 opacity-50" />
            <p>No hay restaurantes todavía</p>
          </div>
        ) : (
          <div className="space-y-3">
            {stats.recent.map(r => (
              <div
                key={r.id}
                className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center font-bold">
                    {r.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{r.name}</p>
                    <p className="text-xs text-slate-500">
                      Creado {new Date(r.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <span
                  className={`px-3 py-1 text-xs font-bold rounded-full ${
                    r.is_active === false
                      ? 'bg-red-100 text-red-600'
                      : 'bg-green-100 text-green-600'
                  }`}
                >
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
