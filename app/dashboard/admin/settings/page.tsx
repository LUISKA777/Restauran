"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Save,
  Palette,
  Layout,
  Tag,
  CheckCircle2,
  Plus,
  Trash2,
  Sparkles
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

const COLOR_PRESETS = [
  { name: 'Elegante Oro', primary: '#D4AF37', secondary: '#FFFFFF', accent: '#FDFBF2' },
  { name: 'Moderno Oscuro', primary: '#1A1A1A', secondary: '#FFFFFF', accent: '#F3F4F6' },
  { name: 'Verde Fresco', primary: '#16A34A', secondary: '#FFFFFF', accent: '#F0FDF4' },
  { name: 'Océano Profundo', primary: '#1E3A8A', secondary: '#FFFFFF', accent: '#EEF2FF' },
  { name: 'Bebidas & Licores', primary: '#B45309', secondary: '#FFFFFF', accent: '#FFFBEB' },
];

export default function BrandSettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    primaryColor: '#16a34a',
    secondaryColor: '#ffffff',
    accentColor: '#f3f4f6',
    logoUrl: '',
    backgroundImageUrl: '',
    categories: ['General', 'Bebidas', 'Platos Fuertes']
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
    setLoading(true);
    const restaurantId = localStorage.getItem('restaurant_id');
    if (!restaurantId) return;

    const { data, error } = await supabase
      .from('restaurants')
      .select('settings')
      .eq('id', restaurantId)
      .single();

    if (error) {
      console.error('Error fetching settings:', error);
    } else if (data?.settings) {
      setSettings({
        primaryColor: data.settings.primaryColor || '#16a34a',
        secondaryColor: data.settings.secondaryColor || '#ffffff',
        accentColor: data.settings.accentColor || '#f3f4f6',
        categories: data.settings.categories || ['General']
      });
    }
    setLoading(false);
  }

  async function saveSettings() {
    setSaving(true);
    const restaurantId = localStorage.getItem('restaurant_id');
    if (!restaurantId) return;

    try {
      const { error } = await supabase
        .from('restaurants')
        .update({ settings })
        .eq('id', restaurantId);

      if (error) throw error;
      alert('Configuración guardada con éxito ✨');
    } catch (err) {
      console.error('Error saving settings:', err);
      alert('Error al guardar la configuración');
    } finally {
      setSaving(false);
    }
  }

  const applyPreset = (preset: typeof COLOR_PRESETS[0]) => {
    setSettings(prev => ({
      ...prev,
      primaryColor: preset.primary,
      secondaryColor: preset.secondary,
      accentColor: preset.accent,
    }));
  };

  const addCategory = () => {
    const name = prompt('Nombre de la nueva categoría (ej. Licores):');
    if (name && !settings.categories.includes(name)) {
      setSettings(prev => ({
        ...prev,
        categories: [...prev.categories, name]
      }));
    }
  };

  const removeCategory = (cat: string) => {
    if (settings.categories.length <= 1) return;
    setSettings(prev => ({
      ...prev,
      categories: prev.categories.filter(c => c !== cat)
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 font-medium">Cargando identidad de marca...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-200 rounded-full transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
                <Palette className="text-orange-500" /> Configuración de Marca
              </h1>
              <p className="text-slate-500">Define la personalidad visual de tu restaurante</p>
            </div>
          </div>
          <button
            onClick={saveSettings}
            disabled={saving}
            className="flex items-center gap-2 px-8 py-3 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-lg active:scale-95 disabled:opacity-50"
          >
            {saving ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save size={20} />}
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Color Section */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-8">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
                  <Layout size={20} />
                </div>
                <h2 className="text-xl font-bold text-slate-900">Paleta de Colores</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <label className="text-sm font-bold text-slate-600 flex items-center gap-2">
                    Color Primario
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={settings.primaryColor}
                      onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                      className="w-12 h-12 rounded-lg cursor-pointer bg-transparent border-none"
                    />
                    <input
                      type="text"
                      value={settings.primaryColor}
                      onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                      className="flex-grow px-3 py-2 border rounded-xl text-sm font-mono"
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-sm font-bold text-slate-600 flex items-center gap-2">
                    Color Secundario
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={settings.secondaryColor}
                      onChange={(e) => setSettings({ ...settings, secondaryColor: e.target.value })}
                      className="w-12 h-12 rounded-lg cursor-pointer bg-transparent border-none"
                    />
                    <input
                      type="text"
                      value={settings.secondaryColor}
                      onChange={(e) => setSettings({ ...settings, secondaryColor: e.target.value })}
                      className="flex-grow px-3 py-2 border rounded-xl text-sm font-mono"
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-sm font-bold text-slate-600 flex items-center gap-2">
                    Color de Acento
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={settings.accentColor}
                      onChange={(e) => setSettings({ ...settings, accentColor: e.target.value })}
                      className="w-12 h-12 rounded-lg cursor-pointer bg-transparent border-none"
                    />
                    <input
                      type="text"
                      value={settings.accentColor}
                      onChange={(e) => setSettings({ ...settings, accentColor: e.target.value })}
                      className="flex-grow px-3 py-2 border rounded-xl text-sm font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
                <div className="space-y-3">
                  <label className="text-sm font-bold text-slate-600 flex items-center gap-2">
                    URL del Logo
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={settings.logoUrl}
                      onChange={(e) => setSettings({ ...settings, logoUrl: e.target.value })}
                      className="flex-grow px-3 py-2 border rounded-xl text-sm"
                      placeholder="https://example.com/logo.png"
                    />
                    <div className="w-10 h-10 border rounded-lg overflow-hidden bg-slate-100 flex items-center justify-center">
                      {settings.logoUrl ? <img src={settings.logoUrl} alt="Logo" className="w-full h-full object-cover" /> : <span className="text-xs text-slate-400">?</span>}
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-sm font-bold text-slate-600 flex items-center gap-2">
                    Imagen de Fondo
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={settings.backgroundImageUrl}
                      onChange={(e) => setSettings({ ...settings, backgroundImageUrl: e.target.value })}
                      className="flex-grow px-3 py-2 border rounded-xl text-sm"
                      placeholder="https://example.com/bg.jpg"
                    />
                    <div className="w-10 h-10 border rounded-lg overflow-hidden bg-slate-100 flex items-center justify-center">
                      {settings.backgroundImageUrl ? <img src={settings.backgroundImageUrl} alt="BG" className="w-full h-full object-cover" /> : <span className="text-xs text-slate-400">?</span>}
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 space-y-4">
                <p className="text-sm font-bold text-slate-500 flex items-center gap-2">
                  <Sparkles size={16} className="text-orange-400" /> Paletas Recomendadas
                </p>
                <div className="flex flex-wrap gap-3">
                  {COLOR_PRESETS.map(preset => (
                    <button
                      key={preset.name}
                      onClick={() => applyPreset(preset)}
                      className="flex items-center gap-2 px-4 py-2 rounded-full border border-slate-200 hover:border-orange-500 transition-all text-xs font-bold text-slate-600 hover:text-orange-600 bg-white shadow-sm"
                    >
                      <div className="flex gap-1">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: preset.primary }} />
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: preset.secondary }} />
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: preset.accent }} />
                      </div>
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                    <Tag size={20} />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">Categorías del Menú</h2>
                </div>
                <button
                  onClick={addCategory}
                  className="p-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-all"
                  title="Agregar Categoría"
                >
                  <Plus size={20} />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {settings.categories.map((cat, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-indigo-200 transition-all">
                    <span className="font-bold text-slate-700">{cat}</span>
                    <button
                      onClick={() => removeCategory(cat)}
                      className="p-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-400 italic">
                * Las categorías definidas aquí aparecerán como opciones al crear productos.
              </p>
            </div>
          </div>

          {/* Preview Panel */}
          <div className="space-y-6">
            <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-xl text-white space-y-6 sticky top-8">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/10 rounded-lg text-white">
                  <Layout size={20} />
                </div>
                <h2 className="text-xl font-bold">Vista Previa</h2>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Simulador de Menú</p>
                  <div
                    className="h-32 w-full rounded-xl flex flex-col items-center justify-center transition-all duration-500"
                    style={{ backgroundColor: settings.primaryColor, color: settings.secondaryColor }}
                  >
                    <span className="font-black text-lg">Nombre Restaurante</span>
                    <span className="text-xs opacity-80">Estilo Aplicado</span>
                  </div>
                  <div className="flex gap-2">
                    <div className="h-4 flex-grow rounded-full" style={{ backgroundColor: settings.primaryColor }} />
                    <div className="h-4 flex-grow rounded-full" style={{ backgroundColor: settings.secondaryColor }} />
                    <div className="h-4 flex-grow rounded-full" style={{ backgroundColor: settings.accentColor }} />
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Categorías Activas</p>
                  <div className="flex flex-wrap gap-2">
                    {settings.categories.map((cat, i) => (
                      <span key={i} className="px-3 py-1 rounded-full bg-white/10 text-xs font-medium border border-white/10">
                        {cat}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-200 text-xs leading-relaxed">
                <div className="flex items-center gap-2 mb-1 font-bold">
                  <Sparkles size={14} /> Tip de Diseño
                </div>
                Usa colores contrastantes para el color primario y secundario para asegurar que tu menú sea legible en exteriores.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
