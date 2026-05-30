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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 font-medium">Cargando mesas...</p>
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
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <TableProperties className="text-purple-500" /> Control de Mesas
          </h1>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-2xl font-bold hover:bg-purple-700 transition-all shadow-lg shadow-purple-200 active:scale-95"
        >
          <Plus size={20} /> Agregar Mesa
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {tables.length === 0 ? (
          <div className="col-span-full bg-white p-20 rounded-3xl border border-slate-200 shadow-sm text-center space-y-4">
            <LayoutGrid size={48} className="mx-auto text-slate-300" />
            <h3 className="text-xl font-bold text-slate-800">No hay mesas configuradas</h3>
            <p className="text-slate-500">Agrega las mesas de tu restaurante para que los clientes puedan hacer pedidos.</p>
          </div>
        ) : (
          tables.map(table => (
            <div
              key={table.id}
              className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm group hover:border-purple-500 transition-all flex flex-col items-center text-center space-y-4"
            >
              <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center text-2xl font-black group-hover:bg-purple-600 group-hover:text-white transition-colors">
                {table.table_number}
              </div>
              <div>
                <h3 className="font-bold text-slate-900">Mesa {table.table_number}</h3>
                <p className="text-xs text-slate-400">ID: {table.id.substring(0, 8)}...</p>
              </div>
              <div className="flex gap-2 w-full">
                <button
                  onClick={() => handleOpenModal(table)}
                  className="flex-1 py-2 text-sm font-medium text-slate-600 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDeleteTable(table.id)}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                  title="Eliminar mesa"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Table Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                {editingTable ? <TableProperties size={20} /> : <Plus size={20} />}
                {editingTable ? 'Editar Mesa' : 'Nueva Mesa'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-1 hover:bg-slate-200 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  Número de Mesa
                </label>
                <input
                  type="number"
                  value={formData.table_number}
                  onChange={(e) => setFormData({ ...formData, table_number: e.target.value })}
                  className="w-full px-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                  placeholder="Ej: 1, 2, 3..."
                  required
                />
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
                onClick={handleSaveTable}
                className="flex-1 px-4 py-3 bg-purple-600 text-white font-bold rounded-2xl hover:bg-purple-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-200"
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
