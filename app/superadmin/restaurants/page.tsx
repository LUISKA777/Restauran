"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Save,
  X,
  Search,
  Store,
  Power,
  KeyRound,
  CheckCircle2,
  XCircle,
  Shield,
  Sparkles
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
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-royal-200 border-t-royal-600 rounded-full animate-spin" />
          <p className="text-sm text-ink-500 font-medium">Cargando restaurantes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/superadmin')}
            className="p-2 hover:bg-ink-100 rounded-xl transition-colors text-ink-600"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-3xl font-black text-ink-900 flex items-center gap-3 tracking-tight">
              <span className="p-2 bg-royal-100 text-royal-600 rounded-xl">
                <Store size={20} />
              </span>
              Gestión de Restaurantes
            </h1>
            <p className="text-ink-500 mt-1">Crea, suspende o elimina restaurantes de tu plataforma</p>
          </div>
        </div>
        <button
          onClick={() => { setIsCreateOpen(true); setFormData({ name: '', password: '' }); }}
          className="btn-royal"
        >
          <Plus size={20} /> Crear Restaurante
        </button>
      </header>

      {/* Search */}
      <div className="card p-4 animate-fade-in">
        <div className="flex items-center gap-3 bg-ink-50 p-3 rounded-xl border border-ink-200 focus-within:border-royal-400 focus-within:ring-2 focus-within:ring-royal-100 transition-all">
          <div className="p-2 bg-white rounded-lg border border-ink-200">
            <Search size={18} className="text-ink-400" />
          </div>
          <input
            type="text"
            placeholder="Buscar restaurante por nombre..."
            className="flex-grow bg-transparent outline-none text-sm font-medium text-ink-900 placeholder-ink-400"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="p-1 hover:bg-ink-200 rounded-md text-ink-400 hover:text-ink-700"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden animate-slide-up">
        <div className="overflow-x-auto">
          <table className="table-clean">
            <thead>
              <tr>
                <th>Restaurante</th>
                <th>Estado</th>
                <th>Creado</th>
                <th className="text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-20 text-center text-ink-400">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-14 h-14 bg-ink-100 rounded-2xl flex items-center justify-center">
                        <Store size={28} className="opacity-50" />
                      </div>
                      <p className="font-semibold italic">No se encontraron restaurantes</p>
                      {searchQuery && <p className="text-sm">Intenta con otro nombre</p>}
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((r, idx) => {
                  const isActive = r.is_active !== false;
                  return (
                    <tr
                      key={r.id}
                      style={{ animationDelay: `${idx * 40}ms` }}
                      className="animate-fade-in"
                    >
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 bg-gradient-royal text-white rounded-xl flex items-center justify-center font-black text-lg shadow-glow-royal">
                            {r.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-ink-900">{r.name}</p>
                            <p className="text-xs text-ink-400 font-mono">ID: {r.id.substring(0, 8)}…</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            isActive ? 'bg-emerald-500' : 'bg-rose-500'
                          }`} />
                          {isActive ? 'Activo' : 'Suspendido'}
                        </span>
                      </td>
                      <td className="text-ink-600 font-medium">
                        {new Date(r.created_at).toLocaleDateString('es-CR', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <IconButton
                            onClick={() => { setEditingPassword(r); setFormData({ name: r.name, password: '' }); }}
                            icon={KeyRound}
                            hoverColor="hover:text-sky-600 hover:bg-sky-50"
                            title="Cambiar contraseña"
                          />
                          <IconButton
                            onClick={() => toggleActive(r)}
                            icon={Power}
                            hoverColor={
                              isActive
                                ? 'hover:text-amber-600 hover:bg-amber-50'
                                : 'hover:text-emerald-600 hover:bg-emerald-50'
                            }
                            title={isActive ? 'Suspender' : 'Reactivar'}
                          />
                          <IconButton
                            onClick={() => handleDelete(r)}
                            icon={Trash2}
                            hoverColor="hover:text-rose-600 hover:bg-rose-50"
                            title="Eliminar"
                          />
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
        <Modal onClose={() => setIsCreateOpen(false)}>
          <ModalHeader
            icon={<Plus size={20} className="text-royal-600" />}
            title="Nuevo Restaurante"
            onClose={() => setIsCreateOpen(false)}
          />
          <div className="p-6 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-ink-700">Nombre del Restaurante</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input"
                placeholder="Ej: Restaurante XYZ"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-ink-700">Contraseña General</label>
              <input
                type="text"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="input"
                placeholder="Contraseña que el cliente usará para entrar"
              />
              <p className="text-xs text-ink-500 flex items-start gap-1.5">
                <Sparkles size={12} className="mt-0.5 shrink-0 text-royal-500" />
                Esta contraseña se la das al dueño del restaurante para que pueda entrar a su panel.
              </p>
            </div>
          </div>
          <ModalFooter
            onCancel={() => setIsCreateOpen(false)}
            onConfirm={handleCreate}
            confirmLabel="Crear"
            confirmIcon={Save}
            variant="royal"
          />
        </Modal>
      )}

      {/* Edit Password Modal */}
      {editingPassword && (
        <Modal onClose={() => setEditingPassword(null)}>
          <ModalHeader
            icon={<KeyRound size={20} className="text-sky-600" />}
            title="Cambiar Contraseña"
            onClose={() => setEditingPassword(null)}
          />
          <div className="p-6 space-y-4">
            <div className="p-3 bg-sky-50 border border-sky-100 rounded-xl text-sm text-sky-900">
              Cambiar contraseña para: <strong>{editingPassword.name}</strong>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-ink-700">Nueva Contraseña</label>
              <input
                type="text"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="input"
                placeholder="Nueva contraseña"
                autoFocus
              />
            </div>
          </div>
          <ModalFooter
            onCancel={() => setEditingPassword(null)}
            onConfirm={handleUpdatePassword}
            confirmLabel="Actualizar"
            confirmIcon={Save}
            variant="primary"
          />
        </Modal>
      )}
    </div>
  );
}

// === Helper components ===

function IconButton({ onClick, icon: Icon, hoverColor, title }: any) {
  return (
    <button
      onClick={onClick}
      className={`p-2 text-ink-400 ${hoverColor} rounded-lg transition-all active:scale-90`}
      title={title}
    >
      <Icon size={18} />
    </button>
  );
}

function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-900/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

function ModalHeader({ icon, title, onClose }: { icon: React.ReactNode; title: string; onClose: () => void }) {
  return (
    <div className="p-5 border-b border-ink-100 flex items-center justify-between bg-ink-50/50">
      <h2 className="text-lg font-black text-ink-900 flex items-center gap-2">
        {icon} {title}
      </h2>
      <button onClick={onClose} className="p-1.5 hover:bg-ink-200 rounded-lg transition-colors text-ink-500">
        <X size={18} />
      </button>
    </div>
  );
}

function ModalFooter({ onCancel, onConfirm, confirmLabel, confirmIcon: Icon, variant }: any) {
  return (
    <div className="p-5 border-t border-ink-100 flex gap-3 bg-ink-50/30">
      <button onClick={onCancel} className="btn-secondary flex-1">
        Cancelar
      </button>
      <button
        onClick={onConfirm}
        className={`flex-1 ${variant === 'royal' ? 'btn-royal' : 'btn-primary'}`}
      >
        <Icon size={18} /> {confirmLabel}
      </button>
    </div>
  );
}
