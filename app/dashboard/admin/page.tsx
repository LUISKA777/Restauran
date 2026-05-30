import React from 'react';
import { useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  TableProperties,
  Utensils,
  BarChart3,
  RotateCcw,
  Settings,
  TrendingUp,
  ShoppingBag,
  DollarSign
} from 'lucide-react';

export default function AdminDashboard() {
  const router = useRouter();

  const quickLinks = [
    {
      name: 'Gestión de Usuarios',
      path: '/dashboard/admin/users',
      icon: <Users />,
      color: 'bg-blue-500',
      description: 'Administra el acceso y roles del personal.'
    },
    {
      name: 'Control de Mesas',
      path: '/dashboard/admin/tables',
      icon: <TableProperties />,
      color: 'bg-purple-500',
      description: 'Crea mesas y genera códigos QR de acceso.'
    },
    {
      name: 'Menú de Productos',
      path: '/dashboard/admin/menu',
      icon: <Utensils />,
      color: 'bg-orange-500',
      description: 'Gestiona platillos, precios y disponibilidad.'
    },
    {
      name: 'Reportes y Ventas',
      path: '/dashboard/admin/reports',
      icon: <BarChart3 />,
      color: 'bg-green-500',
      description: 'Analiza las ventas y los platillos más vendidos.'
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white p-6 flex flex-col space-y-8">
        <div className="flex items-center gap-3 px-2">
          <div className="p-2 bg-orange-500 rounded-lg">
            <LayoutDashboard size={24} />
          </div>
          <span className="font-bold text-xl">Admin Panel</span>
        </div>

        <nav className="flex-grow space-y-2">
          {quickLinks.map(link => (
            <button
              key={link.path}
              onClick={() => router.push(link.path)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 transition-colors text-slate-300 hover:text-white group"
            >
              <span className="group-hover:scale-110 transition-transform">{link.icon}</span>
              <span className="font-medium">{link.name}</span>
            </button>
          ))}
        </nav>

        <button
          onClick={() => window.location.href = '/dashboard/role-selection'}
          className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors"
        >
          <RotateCcw size={20} />
          <span className="font-medium">Cerrar Sesión</span>
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-grow p-8 space-y-8">
        <header className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Panel de Administración</h1>
            <p className="text-slate-500">Bienvenido al centro de control de tu restaurante</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="p-2 bg-white border rounded-full text-slate-600">
              <Settings size={20} />
            </div>
            <div className="flex items-center gap-3 bg-white p-2 rounded-full border shadow-sm">
              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold">
                A
              </div>
              <span className="text-sm font-medium pr-2">Administrador</span>
            </div>
          </div>
        </header>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title="Ventas Hoy"
            value="$1,240.00"
            icon={<DollarSign />}
            color="text-green-600"
            bg="bg-green-100"
            trend="+12% vs ayer"
          />
          <StatCard
            title="Pedidos Activos"
            value="12"
            icon={<ShoppingBag />}
            color="text-blue-600"
            bg="bg-blue-100"
            trend="3 mesas en espera"
          />
          <StatCard
            title="Platillo Top"
            value="Hamburguesa Deluxe"
            icon={<TrendingUp />}
            color="text-orange-600"
            bg="bg-orange-100"
            trend="45 pedidos hoy"
          />
        </div>

        {/* Quick Access Grid */}
        <h2 className="text-xl font-bold text-slate-800 mt-12 mb-6">Accesos Rápidos</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickLinks.map(link => (
            <div
              key={link.path}
              onClick={() => router.push(link.path)}
              className="p-6 bg-white rounded-2xl border border-slate-200 hover:border-orange-500 hover:shadow-lg transition-all cursor-pointer group"
            >
              <div className={`w-12 h-12 ${link.color} rounded-xl flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform`}>
                {link.icon}
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">{link.name}</h3>
              <p className="text-sm text-slate-500 mb-4">{link.description}</p>
              <div className="text-orange-600 text-sm font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                Abrir sección $\rightarrow$
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

function StatCard({ title, value, icon, color, bg, trend }: any) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
      <div className="flex justify-between items-start">
        <span className="text-slate-500 font-medium">{title}</span>
        <div className={`p-2 rounded-lg ${bg} ${color}`}>
          {icon}
        </div>
      </div>
      <div>
        <p className="text-3xl font-bold text-slate-900">{value}</p>
        <p className="text-xs text-slate-400 mt-1 font-medium">{trend}</p>
      </div>
    </div>
  );
}
