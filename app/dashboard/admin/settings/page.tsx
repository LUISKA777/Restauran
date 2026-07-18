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
    backgroundColor: '#f8fafc',
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
        primaryColor: '#16a34a',
        secondaryColor: '#ffffff',
        accentColor: '#f3f4f6',
        logoUrl: '',
        backgroundImageUrl: '',
        backgroundColor: '#f8fafc',
        categories: ['General'],
        ...data.settings
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
      <div className="min-h-screen flex items-center justify-center bg-ink-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-brand-200 border-t-brand-500 rounded-full animate-spin" />
          <p className="text-sm text-ink-500 font-medium">Cargando identidad de marca...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 lg:p-10">
      <div className="max-w-5xl mx-auto space-y-6">
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-2 animate-fade-in">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-ink-100 rounded-xl transition-colors text-ink-600"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-brand-100 text-brand-700 rounded-full text-xs font-bold mb-2">
                <Palette size={12} /> Identidad
              </div>
              <h1 className="text-3xl font-black text-ink-900 tracking-tight">Configuración de Marca</h1>
              <p className="text-ink-500 mt-1">Define la personalidad visual de tu restaurante</p>
            </div>
          </div>
          <button
            onClick={saveSettings}
            disabled={saving}
            className="btn-primary disabled:opacity-50"
          >
            {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={18} />}
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Color Section */}
          <div className="lg:col-span-2 space-y-6">
            <div className="card p-6 space-y-6 animate-slide-up">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-brand-100 text-brand-600 rounded-xl">
                  <Layout size={20} />
                </div>
                <h2 className="text-lg font-black text-ink-900">Paleta de Colores</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {(['primaryColor', 'secondaryColor', 'accentColor'] as const).map((field, idx) => {
                  const labels: any = { primaryColor: 'Color Primario', secondaryColor: 'Color Secundario', accentColor: 'Color de Acento' };
                  return (
                    <div key={field} className="space-y-2">
                      <label className="text-sm font-bold text-ink-600">{labels[field]}</label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={(settings as any)[field]}
                          onChange={(e) => setSettings({ ...settings, [field]: e.target.value })}
                          className="w-12 h-12 rounded-xl cursor-pointer bg-transparent border border-ink-200"
                        />
                        <input
                          type="text"
                          value={(settings as any)[field]}
                          onChange={(e) => setSettings({ ...settings, [field]: e.target.value })}
                          className="input flex-grow text-xs font-mono"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2 border-t border-ink-100">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-ink-600">URL del Logo</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={settings.logoUrl}
                      onChange={(e) => setSettings({ ...settings, logoUrl: e.target.value })}
                      className="input flex-grow"
                      placeholder="https://example.com/logo.png"
                    />
                    <div className="w-10 h-10 border border-ink-200 rounded-xl overflow-hidden bg-ink-100 flex items-center justify-center shrink-0">
                      {settings.logoUrl ? <img src={settings.logoUrl} alt="Logo" className="w-full h-full object-cover" /> : <span className="text-xs text-ink-400">?</span>}
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-ink-600">Imagen de Fondo</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={settings.backgroundImageUrl}
                      onChange={(e) => setSettings({ ...settings, backgroundImageUrl: e.target.value })}
                      className="input flex-grow"
                      placeholder="https://example.com/bg.jpg"
                    />
                    <div className="w-10 h-10 border border-ink-200 rounded-xl overflow-hidden bg-ink-100 flex items-center justify-center shrink-0">
                      {settings.backgroundImageUrl ? <img src={settings.backgroundImageUrl} alt="BG" className="w-full h-full object-cover" /> : <span className="text-xs text-ink-400">?</span>}
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-ink-600">Color de Fondo del Menú</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={settings.backgroundColor}
                      onChange={(e) => setSettings({ ...settings, backgroundColor: e.target.value })}
                      className="w-12 h-12 rounded-xl cursor-pointer bg-transparent border border-ink-200"
                    />
                    <input
                      type="text"
                      value={settings.backgroundColor}
                      onChange={(e) => setSettings({ ...settings, backgroundColor: e.target.value })}
                      className="input flex-grow text-xs font-mono"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-ink-600">Modo Sugerido</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSettings({ ...settings, backgroundColor: '#ffffff' })}
                      className="btn-secondary text-xs"
                    >
                      Claro
                    </button>
                    <button
                      onClick={() => setSettings({ ...settings, backgroundColor: '#0f172a' })}
                      className="btn bg-ink-900 text-white hover:bg-ink-800 text-xs"
                    >
                      Oscuro
                    </button>
                    <button
                      onClick={() => setSettings({ ...settings, backgroundColor: '#fdf2f8' })}
                      className="btn bg-pink-50 text-pink-700 hover:bg-pink-100 text-xs"
                    >
                      Pastel
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-ink-100 space-y-3">
                <p className="text-sm font-bold text-ink-500 flex items-center gap-2">
                  <Sparkles size={14} className="text-brand-500" /> Paletas Recomendadas
                </p>
                <div className="flex flex-wrap gap-2">
                  {COLOR_PRESETS.map(preset => (
                    <button
                      key={preset.name}
                      onClick={() => applyPreset(preset)}
                      className="flex items-center gap-2 px-3 py-2 rounded-full border border-ink-200 hover:border-brand-500 transition-all text-xs font-bold text-ink-600 hover:text-brand-600 bg-white"
                    >
                      <div className="flex gap-0.5">
                        <div className="w-3 h-3 rounded-full ring-1 ring-ink-200" style={{ backgroundColor: preset.primary }} />
                        <div className="w-3 h-3 rounded-full ring-1 ring-ink-200" style={{ backgroundColor: preset.secondary }} />
                        <div className="w-3 h-3 rounded-full ring-1 ring-ink-200" style={{ backgroundColor: preset.accent }} />
                      </div>
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="card p-6 space-y-5 animate-slide-up" style={{ animationDelay: '100ms' }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-royal-100 text-royal-600 rounded-xl">
                    <Tag size={20} />
                  </div>
                  <h2 className="text-lg font-black text-ink-900">Categorías del Menú</h2>
                </div>
                <button
                  onClick={addCategory}
                  className="btn-royal text-xs"
                  title="Agregar Categoría"
                >
                  <Plus size={16} /> Agregar
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {settings.categories.map((cat, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-ink-50 rounded-xl border border-ink-100 group hover:border-royal-300 transition-all">
                    <span className="font-bold text-ink-700 text-sm">{cat}</span>
                    <button
                      onClick={() => removeCategory(cat)}
                      className="p-1.5 text-ink-300 hover:text-rose-600 hover:bg-rose-50 opacity-0 group-hover:opacity-100 transition-all rounded-md"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
              <p className="text-xs text-ink-400 italic">
                * Las categorías definidas aquí aparecerán como opciones al crear productos.
              </p>
            </div>
          </div>

          {/* Preview Panel */}
          <div className="space-y-4 animate-slide-up" style={{ animationDelay: '150ms' }}>
            <div className="bg-gradient-night p-6 rounded-2xl border border-ink-800 shadow-2xl text-white space-y-5 sticky top-6 overflow-hidden">
              <div className="absolute -top-12 -right-12 w-40 h-40 bg-brand-500/20 rounded-full blur-2xl" />
              <div className="relative flex items-center gap-3">
                <div className="p-2 bg-white/10 backdrop-blur-md rounded-xl text-white border border-white/20">
                  <Layout size={18} />
                </div>
                <h2 className="text-lg font-black">Vista Previa</h2>
              </div>

              <div className="relative space-y-4">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                  <p className="text-[10px] font-bold text-white/50 uppercase tracking-wider">Simulador de Menú</p>
                  <div
                    className="h-32 w-full rounded-xl flex flex-col items-center justify-center transition-all duration-500"
                    style={{ backgroundColor: settings.primaryColor, color: settings.secondaryColor }}
                  >
                    <span className="font-black text-lg">Nombre Restaurante</span>
                    <span className="text-xs opacity-80">Estilo Aplicado</span>
                  </div>
                  <div className="flex gap-1.5">
                    <div className="h-3 flex-grow rounded-full" style={{ backgroundColor: settings.primaryColor }} />
                    <div className="h-3 flex-grow rounded-full" style={{ backgroundColor: settings.secondaryColor }} />
                    <div className="h-3 flex-grow rounded-full" style={{ backgroundColor: settings.accentColor }} />
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                  <p className="text-[10px] font-bold text-white/50 uppercase tracking-wider">Categorías Activas</p>
                  <div className="flex flex-wrap gap-1.5">
                    {settings.categories.map((cat, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-full bg-white/10 text-[11px] font-medium border border-white/10">
                        {cat}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="relative p-3 rounded-xl bg-brand-500/10 border border-brand-500/20 text-brand-200 text-xs leading-relaxed">
                <div className="flex items-center gap-2 mb-1 font-bold">
                  <Sparkles size={12} /> Tip de Diseño
                </div>
                Usa colores contrastantes para el primario y secundario para asegurar que tu menú sea legible en exteriores.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
