// lib/useRestaurantSettings.ts
// Hook compartido para leer y cachear los settings del restaurante actual.
// Cache en memoria a nivel de módulo por restaurant_id para no re-fetchear
// en cada navegación.
//
// Uso:
//   const { settings, loading, reload } = useRestaurantSettings();
//   const adminPin = settings?.security?.adminPin || '';
//
// Para forzar recarga tras un save: llamar a `reload()`.

import { useEffect, useState, useCallback } from 'react';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { mergeSettings, type MenuSettings } from '@/types/menuSettings';

// Cache en memoria: restaurant_id -> { settings, ts }
const cache = new Map<string, { settings: MenuSettings; ts: number }>();
const CACHE_TTL_MS = 30_000; // 30s

export function useRestaurantSettings() {
  const [settings, setSettings] = useState<MenuSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = useCallback(async (force = false) => {
    if (typeof window === 'undefined') return;
    const restaurantId = localStorage.getItem('restaurant_id');
    if (!restaurantId) {
      setLoading(false);
      setError('No hay sesión activa');
      return;
    }

    // Cache hit (si no se fuerza)
    if (!force) {
      const cached = cache.get(restaurantId);
      if (cached && Date.now() - cached.ts < CACHE_TTL_MS) {
        setSettings(cached.settings);
        setLoading(false);
        return;
      }
    }

    setLoading(true);
    try {
      const { data, error: err } = await supabaseAdmin
        .from('restaurants')
        .select('settings')
        .eq('id', restaurantId)
        .single();

      if (err) {
        setError(err.message);
        setSettings(null);
        return;
      }

      const merged = mergeSettings(data?.settings);
      cache.set(restaurantId, { settings: merged, ts: Date.now() });
      setSettings(merged);
      setError(null);
    } catch (e: any) {
      setError(e?.message || 'Error desconocido');
      setSettings(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const reload = useCallback(() => fetchSettings(true), [fetchSettings]);

  return { settings, loading, error, reload };
}

/**
 * Invalida la cache para un restaurant_id (o para todos si se omite).
 * Útil después de guardar settings desde otra página.
 */
export function invalidateRestaurantSettingsCache(restaurantId?: string) {
  if (restaurantId) {
    cache.delete(restaurantId);
  } else {
    cache.clear();
  }
}
