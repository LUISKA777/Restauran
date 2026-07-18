"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import {
  ArrowLeft,
  Plus,
  Pencil,
  Trash2,
  Save,
  X,
  Search,
  Store,
  Power,
  KeyRound,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { Restaurant } from '@/types/restaurant';

export default function RestaurantsPage() {
  const router = useRouter();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingPassword, setEditingPassword] = useState<Restaurant | null>(null);
  const [formData, setFormData] = useState({ name: '', password: '' });

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
      setRestaurants(data || []);
    } catch (err) {
      console.error('Error fetching restaurants:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate() {
    if (!formData.name || !formData.password) {
      alert('Nombre y contraseña son obligatorios');
      return;
    }

    try {
      const { error } = await supabaseAdmin
        .from('restaurants')
        .insert([{ name: formData.name, general_password: formData.password, is_active: true }]);

      if (error) {
        if (error.code === '23505') {
          alert('Ya existe un restaurante con ese nombre');
        } else {
          throw error;
        }
        return;
      }

      setIsCreateOpen(false);
      setFormData({ name: '', password: '' });
      await fetchRestaurants();
    } catch (err) {
      console.error('Error creating restaurant:', err);
      alert('Error al crear el restaurante');
    }
  }

  async function handleUpdatePassword() {
    if (!editingPassword || !formData.password) {
      alert('La contraseña no puede estar vacía');
      return;
    }

    try {
      const { error } = await supabaseAdmin
        .from('restaurants')
        .update({ general_password: formData.password })
        .eq('id', editingPassword.id);

      if (error) throw error;

      setEditingPassword(null);
      setFormData({ name: '', password: '' });
      await fetchRestaurants();
    } catch (err) {
      console.error('Error updating password:', err);
      alert('Error al actualizar la contraseña');
    }
  }

  async function toggleActive(r: Restaurant) {
    const newState = !(r.is_active !== false);
    const action = newState ? 'reactivar' : 'suspender';
    if (!confirm(`¿${action.charAt(0).toUpperCase() + action.slice(1)} el restaurante "${r.name}"?`)) return;

    try {
      const { error } = await supabaseAdmin
        .from('restaurants')
        .update({ is_active: newState })
        .eq('id', r.id);

      if (error) throw error;
      await fetchRestaurants();
    } catch (err) {
      console.error('Error toggling active:', err);
      alert(`Error al ${action} el restaurante`);
    }
  }

  async function handleDelete(r: Restaurant) {
    if (!confirm(`¿ELIMINAR el restaurante "${r.name}"? Esto borrará también todas sus mesas, productos, órdenes y usuarios. Esta acción NO se puede deshacer.`)) return;
    if (!confirm(`Confirmación final: ¿Realmente quieres eliminar "${r.name}"?`)) return;

    try {
      // Borrar en orden: order_items -> orders -> products -> tables -> profiles -> restaurant
      const { data: orderIds } = await supabaseAdmin.from('orders').select('id').eq('restaurant_id', r.id);
      if (orderIds && orderIds.length > 0) {
        await supabaseAdmin.from('order_items').delete().in('order_id', orderIds.map(o => o.id));
        await supabaseAdmin.from('orders').delete().eq('restaurant_id', r.id);
      }
      await supabaseAdmin.from('products').delete().eq('restaurant_id', r.id);
      await supabaseAdmin.from('restaurant_tables').delete().eq('restaurant_id', r.id);
      await supabaseAdmin.from('profiles').delete().eq('restaurant_id', r.id);

      const { error } = await supabaseAdmin.from('restaurants').delete().eq('id', r.id);
      if (error) throw error;

      await fetchRestaurants();
    } catch (err) {
      console.error('Error deleting restaurant:', err);
      alert('Error al eliminar el restaurante');
    }
  }

  const filtered = restaurants.filter(r =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/superadmin')}
            className="p-2 hover:bg-slate-200 rounded-full transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
              <Store className="text-purple-500" /> Gestión de Restaurantes
            </h1>
            <p className="text-slate-500">Crea, suspende o elimina restaurantes de tu plataforma</p>
          </div>
        </div>
        <button
          onClick={() => { setIsCreateOpen(true); setFormData({ name: '', password: '' }); }}
          className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition-all shadow-lg shadow-purple-200 active:scale-95"
        >
          <Plus size={20} /> Crear Restaurante
        </button>
      </header>

      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
          <div className="p-2 bg-white rounded-lg border border-slate-200">
            <Search size={20} className="text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Buscar restaurante por nombre..."
            className="flex-grow bg-transparent outline-none text-sm font-medium"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-slate-400 text-xs font-bold uppercase tracking-wider border-b border-slate-100 bg-slate-50">
                <th className="px-6 py-4">Restaurante</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4">Creado</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-16 text-center text-slate-400 italic">
                    No se encontraron restaurantes.
                  </td>
                </tr>
              ) : (
                filtered.map(r => {
                  const isActive = r.is_active !== false;
                  return (
                    <tr key={r.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center font-bold">
                            {r.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{r.name}</p>
                            <p className="text-xs text-slate-400 font-mono">{r.id.substring(0, 8)}...</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1 ${
                            isActive ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                          }`}
                        >
                          {isActive ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                          {isActive ? 'Activo' : 'Suspendido'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">
                        {new Date(r.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => { setEditingPassword(r); setFormData({ name: r.name, password: '' }); }}
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                            title="Cambiar contraseña"
                          >
                            <KeyRound size={18} />
                          </button>
                          <button
                            onClick={() => toggleActive(r)}
                            className={`p-2 rounded-lg transition-all ${
                              isActive
                                ? 'text-slate-400 hover:text-orange-600 hover:bg-orange-50'
                                : 'text-slate-400 hover:text-green-600 hover:bg-green-50'
                            }`}
                            title={isActive ? 'Suspender' : 'Reactivar'}
                          >
                            <Power size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(r)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                            title="Eliminar"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Plus size={20} className="text-purple-600" /> Nuevo Restaurante
              </h2>
              <button onClick={() => setIsCreateOpen(false)} className="p-1 hover:bg-slate-200 rounded-full">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Nombre del Restaurante</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Ej: Restaurante XYZ"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Contraseña General</label>
                <input
                  type="text"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Contraseña que el cliente usará para entrar"
                />
                <p className="text-xs text-slate-500">Esta contraseña se la das al dueño del restaurante para que pueda entrar a su panel.</p>
              </div>
            </div>
            <div className="p-6 border-t border-slate-100 flex gap-3">
              <button
                onClick={() => setIsCreateOpen(false)}
                className="flex-1 px-4 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreate}
                className="flex-1 px-4 py-3 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 flex items-center justify-center gap-2"
              >
                <Save size={20} /> Crear
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Password Modal */}
      {editingPassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <KeyRound size={20} className="text-blue-600" /> Cambiar Contraseña
              </h2>
              <button onClick={() => setEditingPassword(null)} className="p-1 hover:bg-slate-200 rounded-full">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-slate-600">
                Cambiar contraseña para: <strong>{editingPassword.name}</strong>
              </p>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Nueva Contraseña</label>
                <input
                  type="text"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nueva contraseña"
                />
              </div>
            </div>
            <div className="p-6 border-t border-slate-100 flex gap-3">
              <button
                onClick={() => setEditingPassword(null)}
                className="flex-1 px-4 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200"
              >
                Cancelar
              </button>
              <button
                onClick={handleUpdatePassword}
                className="flex-1 px-4 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 flex items-center justify-center gap-2"
              >
                <Save size={20} /> Actualizar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
