"use client";
import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Utensils, Lock } from 'lucide-react';

export default function LoginPage() {
  const [restaurantName, setRestaurantName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Search for restaurant with this name and password
    const { data, error: supabaseError } = await supabase
      .from('restaurants')
      .select('id')
      .eq('name', restaurantName)
      .eq('general_password', password)
      .single();

    if (supabaseError || !data) {
      setError('Credenciales incorrectas. Por favor, verifica el nombre del restaurante y la contraseña.');
      return;
    }

    // Store restaurant context (simplified for this example, in real app use cookies/session)
    localStorage.setItem('restaurant_id', data.id);
    router.push('/dashboard/role-selection');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 bg-orange-100 rounded-full text-orange-600 mb-2">
            <Utensils size={32} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Restaurante</h1>
          <p className="text-gray-500">Ingresa las credenciales generales para acceder</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Nombre del Restaurante</label>
            <input
              type="text"
              value={restaurantName}
              onChange={(e) => setRestaurantName(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
              placeholder="Ej: Restaurante R"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Contraseña General</label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                placeholder="••••••••"
                required
              />
              <Lock className="absolute right-3 top-2.5 text-gray-400" size={18} />
            </div>
          </div>

          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 transition-colors"
          >
            Entrar al Sistema
          </button>
        </form>
      </div>
    </div>
  );
}
