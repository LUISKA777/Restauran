"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Users, UserPlus, Trash2, ShieldCheck, Mail, User as UserIcon } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Profile {
  id: string;
  full_name: string;
  role: 'admin' | 'kitchen' | 'waiter';
  restaurant_id: string;
  created_at: string;
}

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    setLoading(true);
    const restaurantId = localStorage.getItem('restaurant_id');
    if (!restaurantId) {
      console.error('No restaurant ID found in localStorage');
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .order('full_name', { ascending: true });

    if (error) {
      console.error('Error fetching users:', error);
    } else {
      setUsers(data || []);
    }
    setLoading(false);
  }

  const filteredUsers = users.filter(u =>
    (u.full_name || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="text-slate-500 font-medium">Cargando lista de usuarios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-slate-200 rounded-full transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
              <Users className="text-orange-500" /> Gestión de Usuarios
            </h1>
          </div>
          <button
            className="px-4 py-2 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600 transition-all flex items-center gap-2 shadow-lg shadow-orange-100"
            onClick={() => alert('La creación de usuarios requiere autenticación de Supabase Auth y no puede realizarse directamente desde el panel administrativo sin un flujo de invitación.')}
          >
            <UserPlus size={18} /> Agregar Usuario
          </button>
        </header>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200">
            <div className="p-2 bg-white rounded-lg border border-slate-200">
              <ShieldCheck size={20} className="text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar usuario por nombre..."
              className="flex-grow bg-transparent outline-none text-sm font-medium"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-slate-400 text-xs font-bold uppercase tracking-wider border-b border-slate-100">
                  <th className="px-4 py-3">Usuario</th>
                  <th className="px-4 py-3">Rol</th>
                  <th className="px-4 py-3">Fecha de Creación</th>
                  <th className="px-4 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-12 text-center text-slate-400 italic">
                      No se encontraron usuarios.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map(user => (
                    <tr key={user.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-slate-100 rounded-full text-slate-500 group-hover:bg-orange-100 group-hover:text-orange-600 transition-colors">
                            <UserIcon size={16} />
                          </div>
                          <span className="font-bold text-slate-700">{user.full_name || 'Sin nombre'}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase ${
                          user.role === 'admin' ? 'bg-purple-100 text-purple-600' :
                          user.role === 'kitchen' ? 'bg-blue-100 text-blue-600' :
                          'bg-green-100 text-green-600'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-500">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <button
                          className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                          onClick={() => alert('Eliminar usuarios requiere permisos de super-administrador y gestión de Auth.')}
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
