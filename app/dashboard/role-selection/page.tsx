"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LayoutDashboard, UtensilsCrossed, UserCheck, ChevronRight, LogOut, Store, Sparkles } from 'lucide-react';

const roles = [
  {
    id: 'admin',
    title: 'Administrador',
    description: 'Gestión de usuarios, mesas, reportes y estadísticas.',
    icon: LayoutDashboard,
    color: 'from-sky-500 to-blue-600',
    shadow: 'shadow-sky-200',
    text: 'text-sky-600',
    bg: 'bg-sky-50',
    path: '/dashboard/admin'
  },
  {
    id: 'kitchen',
    title: 'Cocina',
    description: 'Tablero visual de pedidos y gestión de estados de preparación.',
    icon: UtensilsCrossed,
    color: 'from-brand-400 to-brand-600',
    shadow: 'shadow-brand-200',
    text: 'text-brand-600',
    bg: 'bg-brand-50',
    path: '/dashboard/kitchen'
  },
  {
    id: 'waiter',
    title: 'Mesero / Pedidos',
    description: 'Toma de pedidos manuales y seguimiento de entrega.',
    icon: UserCheck,
    color: 'from-emerald-500 to-emerald-700',
    shadow: 'shadow-emerald-200',
    text: 'text-emerald-600',
    bg: 'bg-emerald-50',
    path: '/dashboard/waiter'
  },
];

export default function RoleSelection() {
  const router = useRouter();
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);

  useEffect(() => {
    const id = localStorage.getItem('restaurant_id');
    setRestaurantId(id);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-royal-500/10 rounded-full blur-3xl" />

      <div className="max-w-5xl w-full space-y-12 relative z-10">
        {/* Top bar */}
        <div className="flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-brand rounded-xl shadow-glow-brand">
              <Store size={20} className="text-white" />
            </div>
            <div>
              <p className="text-xs font-bold text-ink-400 uppercase tracking-wider">Sesión activa</p>
              <p className="text-sm font-mono text-ink-600">{restaurantId ? restaurantId.substring(0, 8) : '—'}</p>
            </div>
          </div>
          <button
            onClick={() => {
              localStorage.removeItem('restaurant_id');
              router.push('/login');
            }}
            className="btn-ghost"
          >
            <LogOut size={16} /> Cerrar sesión
          </button>
        </div>

        {/* Header */}
        <div className="text-center space-y-4 animate-slide-up">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-ink-200 rounded-full text-xs font-semibold text-ink-600 shadow-soft">
            <Sparkles size={14} className="text-brand-500" />
            Selecciona cómo quieres operar hoy
          </div>
          <h1 className="text-4xl lg:text-5xl font-black text-ink-900 tracking-tight text-balance">
            ¿Qué quieres hacer?
          </h1>
          <p className="text-ink-500 text-lg max-w-2xl mx-auto">
            Cada rol tiene su propio panel optimizado. Puedes cambiar entre ellos cuando quieras.
          </p>
        </div>

        {/* Role cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {roles.map((role, idx) => {
            const Icon = role.icon;
            const isHovered = hovered === role.id;
            return (
              <button
                key={role.id}
                onClick={() => router.push(role.path)}
                onMouseEnter={() => setHovered(role.id)}
                onMouseLeave={() => setHovered(null)}
                style={{ animationDelay: `${idx * 100}ms` }}
                className="group relative bg-white rounded-3xl p-7 shadow-soft border border-ink-200/60 hover:border-transparent hover:shadow-2xl transition-all duration-500 flex flex-col items-start text-left overflow-hidden animate-slide-up opacity-0"
              >
                {/* Hover gradient overlay */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${role.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                />

                <div className="relative z-10 w-full space-y-5">
                  <div className="flex items-start justify-between">
                    <div
                      className={`p-3.5 rounded-2xl ${role.bg} group-hover:bg-white/20 transition-all duration-500 ${
                        isHovered ? 'scale-110' : ''
                      }`}
                    >
                      <Icon
                        size={28}
                        className={`${role.text} group-hover:text-white transition-colors duration-500`}
                      />
                    </div>
                    <ChevronRight
                      size={22}
                      className="text-ink-300 group-hover:text-white group-hover:translate-x-1 transition-all duration-300"
                    />
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-2xl font-black text-ink-900 group-hover:text-white transition-colors duration-500">
                      {role.title}
                    </h3>
                    <p className="text-sm text-ink-500 group-hover:text-white/90 transition-colors duration-500 leading-relaxed">
                      {role.description}
                    </p>
                  </div>

                  <div className="pt-3 flex items-center gap-2 text-sm font-bold text-ink-700 group-hover:text-white transition-colors duration-500">
                    Acceder
                    <ChevronRight
                      size={16}
                      className="group-hover:translate-x-1 transition-transform"
                    />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
