"use client";
import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { LayoutDashboard, Store, LogOut, Shield, Sparkles } from 'lucide-react';

export default function SuperadminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const superadminEmail = localStorage.getItem('superadmin_email');
    if (!superadminEmail) {
      router.push('/login');
      return;
    }
    setEmail(superadminEmail);
    setLoading(false);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('superadmin_id');
    localStorage.removeItem('superadmin_email');
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ink-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-royal-200 border-t-royal-600 rounded-full animate-spin" />
          <p className="text-sm text-ink-500 font-medium">Cargando panel...</p>
        </div>
      </div>
    );
  }

  const navItems = [
    {
      name: 'Dashboard',
      path: '/superadmin',
      icon: LayoutDashboard,
    },
    {
      name: 'Restaurantes',
      path: '/superadmin/restaurants',
      icon: Store,
    },
  ];

  return (
    <div className="min-h-screen flex bg-ink-50">
      {/* === SIDEBAR === */}
      <aside className="w-64 bg-gradient-to-b from-royal-700 via-royal-800 to-royal-900 text-white p-5 flex flex-col gap-6 hidden lg:flex sticky top-0 h-screen overflow-hidden">
        {/* Decorative shapes */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-royal-400/30 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-brand-500/20 rounded-full blur-3xl" />

        <div className="relative flex items-center gap-3 px-2 pt-2">
          <div className="p-2.5 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 shadow-glow-royal">
            <Shield size={22} />
          </div>
          <div>
            <span className="font-black text-lg tracking-tight block">Superadmin</span>
            <span className="text-[10px] text-white/50 uppercase tracking-wider flex items-center gap-1">
              <Sparkles size={10} /> Plataforma SaaS
            </span>
          </div>
        </div>

        <nav className="relative flex-grow space-y-1 overflow-y-auto">
          <p className="text-[10px] text-white/40 uppercase font-bold tracking-wider px-3 mb-2">
            Navegación
          </p>
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => router.push(item.path)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                  isActive
                    ? 'bg-white text-royal-700 shadow-lg'
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon size={18} className="group-hover:scale-110 transition-transform" />
                <span className="text-sm font-semibold">{item.name}</span>
              </button>
            );
          })}
        </nav>

        <div className="relative space-y-2 pt-3 border-t border-white/10">
          <div className="px-3 py-3 bg-white/5 backdrop-blur-md rounded-xl border border-white/10">
            <p className="text-[10px] text-white/50 uppercase tracking-wider font-bold">Sesión activa</p>
            <p className="text-sm font-medium truncate mt-0.5">{email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <LogOut size={18} />
            <span className="text-sm font-semibold">Cerrar sesión</span>
          </button>
        </div>
      </aside>

      {/* === MAIN === */}
      <main className="flex-grow p-6 lg:p-10 overflow-y-auto max-w-7xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
}
