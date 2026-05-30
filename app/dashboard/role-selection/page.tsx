import React from 'react';
import { useRouter } from 'next/navigation';
import { LayoutDashboard, UtensilsCrossed, UserCheck, ChevronRight } from 'lucide-react';

const roles = [
  {
    id: 'admin',
    title: 'Administrador',
    description: 'Gestión de usuarios, mesas, reportes y estadísticas.',
    icon: <LayoutDashboard className="text-blue-600" />,
    color: 'bg-blue-50',
    path: '/dashboard/admin'
  },
  {
    id: 'kitchen',
    title: 'Cocina',
    description: 'Tablero visual de pedidos y gestión de estados de preparación.',
    icon: <UtensilsCrossed className="text-orange-600" />,
    color: 'bg-orange-50',
    path: '/dashboard/kitchen'
  },
  {
    id: 'waiter',
    title: 'Mesero / Pedir a Cocina',
    description: 'Toma de pedidos manuales y seguimiento de entrega.',
    icon: <UserCheck className="text-green-600" />,
    color: 'bg-green-50',
    path: '/dashboard/waiter'
  },
];

export default function RoleSelection() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex flex-col items-center justify-center">
      <div className="max-w-4xl w-full space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Bienvenido al Panel de Control</h1>
          <p className="text-gray-500 text-lg">Selecciona tu rol para comenzar a operar</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {roles.map((role) => (
            <div
              key={role.id}
              onClick={() => router.push(role.path)}
              className="group cursor-pointer bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:border-orange-500 hover:shadow-md transition-all duration-300 flex flex-col items-center text-center space-y-4"
            >
              <div className={`p-4 rounded-2xl ${role.color} transition-transform group-hover:scale-110 duration-300`}>
                {role.icon}
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-gray-800">{role.title}</h3>
                <p className="text-gray-500 text-sm">{role.description}</p>
              </div>
              <div className="mt-4 flex items-center text-orange-600 font-medium text-sm group-hover:translate-x-1 transition-transform">
                Acceder <ChevronRight size={16} className="ml-1" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
