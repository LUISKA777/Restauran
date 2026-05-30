"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Plus,
  Pencil,
  Trash2,
  Save,
  X,
  Users,
  ShieldCheck,
  Utensils,
  User
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

type UserRole = 'admin' | 'kitchen' | 'waiter';

interface Profile {
  id: string;
  full_name: string;
  role: UserRole;
  created_at: string;
}

export default function UsersPage() {
  const router = useRouter();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);

  const [formData, setFormData] = useState({
    full_name: '',
    role: 'waiter' as UserRole,
  });

  useEffect(() => {
    fetchProfiles();
  }, []);

  async function fetchProfiles() {
    setLoading(true);
    const restaurantId = localStorage.getItem('restaurant_id');
    if (!restaurantId) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .order('full_name', { ascending: true });

    if (error) {
      console.error('Error fetching profiles:', error);
    } else {
      setProfiles(data || []);
    }
    setLoading(false);
  }

  const handleOpenModal = (profile?: Profile) => {
    if (profile) {
      setEditingProfile(profile);
      setFormData({
        full_name: profile.full_name || '',
        role: profile.role,
      });
    } else {
      setEditingProfile(null);
      setFormData({
        full_name: '',
        role: 'waiter',
      });
    }
    setIsModalOpen(true);
  };

  async function handleSaveProfile() {
    const restaurantId = localStorage.getItem('restaurant_id');
    if (!restaurantId) return;

    try {
      if (editingProfile) {
        const { error } = await supabase
          .from('profiles')
          .update({
            full_name: formData.full_name,
            role: formData.role,
          })
          .eq('id', editingProfile.id);
        if (error) throw error;
      } else {
        // Note: In a real app, user creation is handled by Supabase Auth.
        // Here we are simulating profile management.
        alert('La creación de usuarios debe hacerse a través del sistema de autenticación. Puedes editar perfiles existentes.');
        setIsModalOpen(false);
        return;
      }

      await fetchProfiles();
      setIsModalOpen(false);
    } catch (err) {
      console.error('Error saving profile:', err);
      alert('Error al guardar el perfil');
    }
  }

  async function handleDeleteProfile(id: string) {
    if (!confirm('¿Estás seguro de que deseas eliminar este usuario?')) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchProfiles();
    } catch (err) {
      console.error('Error deleting profile:', err);
      alert('Error al eliminar el usuario');
    }
  }

  const roleIcons: Record<UserRole, any> = {
    admin: <ShieldCheck size={16} />,
    kitchen: <Utensils size={16} />,
    waiter: <User size={16} />,
  };

  const roleColors: Record<UserRole, string> = {
    admin: 'bg-red-100 text-red-600',
    kitchen: 'bg-yellow-100 text-yellow-600',
    waiter: 'bg-blue-100 text-blue-600',
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 font-medium">Cargando usuarios...</p>
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
          <h1 className="text-3 la-font-bold text-slate-900 flex items-center gap-3">
            <Users className="text-blue-500" /> Gestión de Usuarios
          </h1>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-95"
        >
          <Plus size={20} /> Agregar Usuario
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 text-sm font-bold text-slate-600">Nombre Completo</th>
              <th className="px-6 py-4 text-sm font-bold text-slate-600">Rol</th>
              <th className="px-6 py-4 text-sm font-bold text-slate-600 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {profiles.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-6 py-20 text-center text-slate-400 italic">
                  No hay usuarios registrados para este restaurante.
                </td>
              </tr>
            ) : (
              profiles.map(profile => (
                <tr key={profile.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900">{profile.full_name || 'Sin nombre'}</td>
                  <td className="px-6 py-4">
                    <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold w-fit ${roleColors[profile.role]}`}>
                      {roleIcons[profile.role]}
                      {profile.role === 'admin' ? 'Administrador' : profile.role === 'kitchen' ? 'Cocina' : 'Mesero'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleOpenModal(profile)}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                      >
                        <Pencil size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteProfile(profile.id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                {editingProfile ? <Pencil size={20} /> : <Plus size={20} />}
                {editingProfile ? 'Editar Usuario' : 'Nuevo Usuario'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-1 hover:bg-slate-200 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Nombre Completo</label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full px-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  placeholder="Ej: Juan Pérez"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Rol del Usuario</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                  className="w-full px-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                >
                  <option value="admin">Administrador</option>
                  <option value="kitchen">Cocina</option>
                  <option value="waiter">Mesero</option>
                </select>
              </div>
            </div>
            <div className="p-6 border-t border-slate-100 flex gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="flex-1 px-4 py-3 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveProfile}
                className="flex-1 px-4 py-3 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-200"
              >
                <Save size={20} /> Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
