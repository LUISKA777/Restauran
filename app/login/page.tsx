"use client";
import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { useRouter } from 'next/navigation';
import { Utensils, Lock, Mail } from 'lucide-react';

export default function LoginPage() {
  const [restaurantName, setRestaurantName] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Si el nombre es "superadmin", mostrar campo de email
  const isSuperadminLogin = restaurantName.toLowerCase().trim() === 'superadmin';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSuperadminLogin) {
        // Login como superadmin
        if (!email) {
          setError('Ingresa tu email de superadmin');
          setLoading(false);
          return;
        }

        const { data, error: supabaseError } = await supabaseAdmin
          .from('superadmins')
          .select('id, email, name')
          .eq('email', email.trim().toLowerCase())
          .eq('password', password)
          .single();

        if (supabaseError || !data) {
          setError('Credenciales de superadmin incorrectas');
          setLoading(false);
          return;
        }

        localStorage.setItem('superadmin_id', data.id);
        localStorage.setItem('superadmin_email', data.email);
        router.push('/superadmin');
        return;
      }

      // Login como restaurante (flujo original)
      const { data, error: supabaseError } = await supabase
        .from('restaurants')
        .select('id, is_active')
        .eq('name', restaurantName)
        .eq('general_password', password)
        .single();

      if (supabaseError || !data) {
        setError('Credenciales incorrectas. Por favor, verifica el nombre del restaurante y la contraseña.');
        setLoading(false);
        return;
      }

      // Verificar si el restaurante está activo
      if (data.is_active === false) {
        setError('Este restaurante está suspendido. Contacta al administrador de la plataforma.');
        setLoading(false);
        return;
      }

      localStorage.setItem('restaurant_id', data.id);
      router.push('/dashboard/role-selection');
    } catch (err) {
      setError('Error inesperado. Intenta de nuevo.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className={`inline-flex p-3 rounded-full mb-2 ${isSuperadminLogin ? 'bg-purple-100 text-purple-600' : 'bg-orange-100 text-orange-600'}`}>
            {isSuperadminLogin ? <Lock size={32} /> : <Utensils size={32} />}
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isSuperadminLogin ? 'Panel de Superadmin' : 'Gestión de Restaurante'}
          </h1>
          <p className="text-gray-500">
            {isSuperadminLogin
              ? 'Accede como administrador de la plataforma'
              : 'Ingresa las credenciales generales para acceder'}
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              {isSuperadminLogin ? 'Usuario' : 'Nombre del Restaurante'}
            </label>
            <input
              type="text"
              value={restaurantName}
              onChange={(e) => setRestaurantName(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
              placeholder={isSuperadminLogin ? 'superadmin' : 'Ej: Restaurante R'}
              required
            />
            {isSuperadminLogin && (
              <p className="text-xs text-purple-600">
                Modo superadmin detectado
              </p>
            )}
          </div>

          {isSuperadminLogin && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Email</label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                  placeholder="tu@email.com"
                  required
                />
                <Mail className="absolute right-3 top-2.5 text-gray-400" size={18} />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              {isSuperadminLogin ? 'Contraseña' : 'Contraseña General'}
            </label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg outline-none ${
                  isSuperadminLogin ? 'focus:ring-2 focus:ring-purple-500' : 'focus:ring-2 focus:ring-orange-500'
                }`}
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
            disabled={loading}
            className={`w-full py-3 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 ${
              isSuperadminLogin
                ? 'bg-purple-600 hover:bg-purple-700'
                : 'bg-orange-600 hover:bg-orange-700'
            }`}
          >
            {loading ? 'Entrando...' : isSuperadminLogin ? 'Acceder como Superadmin' : 'Entrar al Sistema'}
          </button>
        </form>
      </div>
    </div>
  );
}
