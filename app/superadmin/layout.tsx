"use client";
import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { LayoutDashboard, Store, LogOut, Shield } from 'lucide-react';
import { supabase } from '@/lib/supabase';

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
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  const navItems = [
    {
      name: 'Dashboard',
      path: '/superadmin',
      icon: <LayoutDashboard size={20} />,
    },
    {
      name: 'Restaurantes',
      path: '/superadmin/restaurants',
      icon: <Store size={20} />,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white p-6 flex flex-col space-y-8">
        <div className="flex items-center gap-3 px-2">
          <div className="p-2 bg-purple-500 rounded-lg">
            <Shield size={24} />
          </div>
          <span className="font-bold text-xl">Superadmin</span>
        </div>

        <nav className="flex-grow space-y-2">
          {navItems.map(item => {
            const isActive = pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => router.push(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors group ${
                  isActive
                    ? 'bg-purple-600 text-white'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <span className="group-hover:scale-110 transition-transform">{item.icon}</span>
                <span className="font-medium">{item.name}</span>
              </button>
            );
          })}
        </nav>

        <div className="space-y-2">
          <div className="px-4 py-3 bg-slate-800 rounded-xl">
            <p className="text-xs text-slate-400">Sesión activa</p>
            <p className="text-sm font-medium truncate">{email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <LogOut size={20} />
            <span className="font-medium">Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
