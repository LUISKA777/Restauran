"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Palette, Sparkles } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { getDefaultSettings, mergeSettings, type MenuSettings } from '@/types/menuSettings';

import { ThemePresetsSection } from './_components/ThemePresetsSection';
import { ColorsSection } from './_components/ColorsSection';
import { LayoutSection } from './_components/LayoutSection';
import { TypographySection } from './_components/TypographySection';
import { HeroSection } from './_components/HeroSection';
import { CopySection } from './_components/CopySection';
import { ContactSection } from './_components/ContactSection';
import { CategoriesSection } from './_components/CategoriesSection';
import { SecuritySection } from './_components/SecuritySection';
import { LivePreview } from './_components/LivePreview';

export default function BrandSettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<MenuSettings>(getDefaultSettings());
  const [restaurantName, setRestaurantName] = useState('Tu Restaurante');

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
    setLoading(true);
    const restaurantId = localStorage.getItem('restaurant_id');
    if (!restaurantId) {
      setLoading(false);
      return;
    }

    const [{ data: restData }, { data: settingsData }] = await Promise.all([
      supabase.from('restaurants').select('name').eq('id', restaurantId).single(),
      supabase.from('restaurants').select('settings').eq('id', restaurantId).single(),
    ]);

    if (restData?.name) setRestaurantName(restData.name);
    if (settingsData?.settings) {
      setSettings(mergeSettings(settingsData.settings));
    } else {
      setSettings(getDefaultSettings());
    }
    setLoading(false);
  }

  async function saveSettings() {
    setSaving(true);
    const restaurantId = localStorage.getItem('restaurant_id');
    if (!restaurantId) {
      setSaving(false);
      alert('No hay sesión activa. Vuelve a iniciar sesión como restaurante.');
      router.push('/login');
      return;
    }

    // Limpiar antes de enviar: settings no debe tener valores `undefined`
    // ni referencias circulares. Aplicamos mergeSettings para garantizar shape.
    const cleaned = mergeSettings(settings);
    const json = JSON.stringify(cleaned);
    console.log('[saveSettings] payload size:', json.length, 'bytes');

    try {
      // Usamos supabaseAdmin (service_role) porque la policy RLS de la tabla
      // `restaurants` solo permite SELECT público; los UPDATE/INSERT deben
      // pasar por service_role. Mismo patrón que /superadmin.
      const { data, error } = await supabaseAdmin
        .from('restaurants')
        .update({ settings: cleaned })
        .eq('id', restaurantId)
        .select('id, settings');

      if (error) {
        console.error('[saveSettings] Supabase error:', error);
        alert(`Error al guardar: ${error.message}\n\nCódigo: ${error.code || 'N/A'}\nDetalles: ${error.details || 'N/A'}`);
        return;
      }
      if (!data || data.length === 0) {
        alert('No se actualizó ninguna fila. Verifica que el restaurante exista y vuelve a intentar.');
        return;
      }
      console.log('[saveSettings] OK, rows updated:', data.length);
      alert('Configuración guardada con éxito ✨');
    } catch (err: any) {
      console.error('[saveSettings] Exception:', err);
      alert(`Error al guardar: ${err?.message || 'Error desconocido'}`);
    } finally {
      setSaving(false);
    }
  }

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
        {/* Header */}
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
              <h1 className="text-3xl font-black text-ink-900 tracking-tight">
                Configuración de Marca
              </h1>
              <p className="text-ink-500 mt-1">Define la personalidad visual de tu menú</p>
            </div>
          </div>
          <button onClick={saveSettings} disabled={saving} className="btn-primary disabled:opacity-50">
            {saving ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Save size={18} />
            )}
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column */}
          <div className="lg:col-span-2 space-y-6">
            <ThemePresetsSection settings={settings} onChange={setSettings} />
            <ColorsSection settings={settings} onChange={setSettings} />
            <LayoutSection settings={settings} onChange={setSettings} />
            <TypographySection settings={settings} onChange={setSettings} />

            <details className="group">
              <HeroSection settings={settings} onChange={setSettings} />
            </details>

            <details className="group">
              <CopySection settings={settings} onChange={setSettings} />
            </details>

            <details className="group">
              <ContactSection settings={settings} onChange={setSettings} />
            </details>

            <details className="group">
              <SecuritySection settings={settings} onChange={setSettings} />
            </details>

            <CategoriesSection settings={settings} onChange={setSettings} />
          </div>

          {/* Right column: live preview */}
          <div className="space-y-4 animate-slide-up" style={{ animationDelay: '150ms' }}>
            <LivePreview settings={settings} restaurantName={restaurantName} />

            <div className="p-3 rounded-xl bg-brand-50 border border-brand-200 text-brand-700 text-xs leading-relaxed">
              <div className="flex items-center gap-2 mb-1 font-bold">
                <Sparkles size={12} /> Tip
              </div>
              Los cambios se reflejan en la vista previa. Pulsa "Guardar" para que los clientes los vean.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
