"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Save,
  X,
  TableProperties,
  LayoutGrid
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface RestaurantTable {
  id: string;
  table_number: number;
  status: string;
  created_at: string;
}

export default function TablesPage() {
  const router = useRouter();
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<RestaurantTable | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    table_number: '',
  });

  useEffect(() => {
    fetchTables();
  }, []);

  async function fetchTables() {
    setLoading(true);
    const restaurantId = localStorage.getItem('restaurant_id');
    if (!restaurantId) {
      console.error("No restaurant ID found in localStorage");
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('restaurant_tables')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .order('table_number', { ascending: true });

    if (error) {
      console.error('Error fetching tables:', error);
    } else {
      setTables(data || []);
    }
    setLoading(false);
  }

  const handleOpenModal = (table?: RestaurantTable) => {
    if (table) {
      setEditingTable(table);
      setFormData({
        table_number: table.table_number.toString(),
      });
    } else {
      setEditingTable(null);
      setFormData({
        table_number: '',
      });
    }
    setIsModalOpen(true);
  };

  async function handleSaveTable() {
    const restaurantId = localStorage.getItem('restaurant_id');
    if (!restaurantId) return;

    const payload = {
      table_number: parseInt(formData.table_number),
      restaurant_id: restaurantId,
    };

    try {
      if (editingTable) {
        const { error } = await supabase
          .from('restaurant_tables')
          .update(payload)
          .eq('id', editingTable.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('restaurant_tables')
          .insert([payload]);
        if (error) throw error;
      }

      await fetchTables();
      setIsModalOpen(false);
    } catch (err) {
      console.error('Error saving table:', err);
      alert('Error al guardar la mesa. Verifica que el número no esté duplicado.');
    }
  }

  async function handleDeleteTable(id: string) {
    if (!confirm('¿Estás seguro de que deseas eliminar esta mesa?')) return;

    try {
      const { error } = await supabase
        .from('restaurant_tables')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchTables();
    } catch (err) {
      console.error('Error deleting table:', err);
      alert('Error al eliminar la mesa');
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ink-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-royal-200 border-t-royal-600 rounded-full animate-spin" />
          <p className="text-sm text-ink-500 font-medium">Cargando mesas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 lg:p-10 max-w-7xl mx-auto">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 animate-fade-in">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-ink-100 rounded-xl transition-colors text-ink-600"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-royal-100 text-royal-700 rounded-full text-xs font-bold mb-2">
              <TableProperties size={12} /> Mesas
            </div>
            <h1 className="text-3xl font-black text-ink-900 tracking-tight">Control de Mesas</h1>
            <p className="text-ink-500 mt-1">{tables.length} mesas configuradas</p>
          </div>
        </div>
        <button onClick={() => handleOpenModal()} className="btn-royal">
          <Plus size={20} /> Agregar Mesa
        </button>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {tables.length === 0 ? (
          <div className="col-span-full card p-20 text-center space-y-3 animate-fade-in">
            <div className="w-16 h-16 bg-ink-100 rounded-2xl flex items-center justify-center mx-auto">
              <LayoutGrid size={28} className="text-ink-400" />
            </div>
            <h3 className="text-xl font-bold text-ink-900">No hay mesas configuradas</h3>
            <p className="text-ink-500">Agrega las mesas de tu restaurante para que los clientes puedan hacer pedidos.</p>
          </div>
        ) : (
          tables.map((table, idx) => (
            <div
              key={table.id}
              style={{ animationDelay: `${idx * 50}ms` }}
              className="card-hover p-5 group flex flex-col items-center text-center space-y-3 animate-slide-up opacity-0"
            >
              <div className="w-16 h-16 bg-gradient-royal text-white rounded-2xl flex items-center justify-center text-2xl font-black shadow-glow-royal group-hover:scale-110 group-hover:-rotate-3 transition-transform">
                {table.table_number}
              </div>
              <div>
                <h3 className="font-bold text-ink-900">Mesa {table.table_number}</h3>
                <p className="text-[10px] text-ink-400 font-mono">ID: {table.id.substring(0, 8)}…</p>
              </div>
              <div className="flex gap-1 w-full">
                <button
                  onClick={() => handleOpenModal(table)}
                  className="flex-1 py-1.5 text-xs font-bold text-ink-600 bg-ink-100 rounded-lg hover:bg-ink-200 transition-colors"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDeleteTable(table.id)}
                  className="p-1.5 text-ink-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                  title="Eliminar"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Table Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-900/60 backdrop-blur-sm animate-fade-in"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-ink-100 flex items-center justify-between bg-ink-50/50">
              <h2 className="text-lg font-black text-ink-900 flex items-center gap-2">
                <span className="p-1.5 bg-royal-100 text-royal-600 rounded-lg">
                  <TableProperties size={16} />
                </span>
                {editingTable ? 'Editar Mesa' : 'Nueva Mesa'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-1.5 hover:bg-ink-200 rounded-lg transition-colors text-ink-500">
                <X size={18} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-ink-700">Número de Mesa</label>
                <input
                  type="number"
                  value={formData.table_number}
                  onChange={(e) => setFormData({ ...formData, table_number: e.target.value })}
                  className="input"
                  placeholder="Ej: 1, 2, 3..."
                  required
                  autoFocus
                />
              </div>
            </div>
            <div className="p-5 border-t border-ink-100 flex gap-3 bg-ink-50/30">
              <button onClick={() => setIsModalOpen(false)} className="btn-secondary flex-1">
                Cancelar
              </button>
              <button onClick={handleSaveTable} className="btn-royal flex-1">
                <Save size={18} /> Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
