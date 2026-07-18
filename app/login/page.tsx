"use client";
import React, { useState } from 'react';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { useRouter } from 'next/navigation';
import { Utensils, Lock, Mail, Sparkles, ShieldCheck, Store, ArrowRight, ChefHat, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const [restaurantName, setRestaurantName] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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

      // Login como restaurante (usando supabaseAdmin para bypasear RLS)
      const { data, error: supabaseError } = await supabaseAdmin
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
    <div className="min-h-screen flex flex-col lg:flex-row bg-ink-50">
      {/* === LEFT BRAND PANEL === */}
      <div className="relative lg:w-1/2 bg-gradient-night text-white overflow-hidden flex flex-col justify-between p-8 lg:p-14">
        {/* Decorative shapes */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-brand-500/30 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-32 w-96 h-96 bg-royal-500/30 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-brand-400/20 rounded-full blur-3xl" />

        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }}
        />

        {/* Header */}
        <div className="relative z-10 flex items-center gap-3 animate-fade-in">
          <div className="p-2.5 bg-gradient-brand rounded-xl shadow-glow-brand">
            <Utensils size={22} />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight">RestaurantOS</h1>
            <p className="text-xs text-white/60">Plataforma multi-tenant</p>
          </div>
        </div>

        {/* Center content */}
        <div className="relative z-10 space-y-8 max-w-lg animate-slide-up">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-xs font-medium">
            <Sparkles size={14} className="text-brand-300" />
            <span>Hecho para restaurantes modernos</span>
          </div>

          <h2 className="text-4xl lg:text-5xl font-black leading-tight tracking-tight text-balance">
            Controla tu restaurante
            <br />
            <span className="bg-gradient-to-r from-brand-300 via-brand-400 to-royal-400 bg-clip-text text-transparent">
              desde un solo lugar
            </span>
          </h2>

          <p className="text-white/70 text-lg leading-relaxed">
            Mesas, menú, cocina, meseros, facturas y reportes — todo conectado en tiempo real para que tu operación fluya sin fricciones.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4">
            <FeaturePill icon={<Store size={16} />} label="Multi-tenant" />
            <FeaturePill icon={<ChefHat size={16} />} label="Tiempo real" />
            <FeaturePill icon={<ShieldCheck size={16} />} label="Seguro" />
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 text-xs text-white/40 animate-fade-in">
          © {new Date().getFullYear()} RestaurantOS — v2
        </div>
      </div>

      {/* === RIGHT FORM PANEL === */}
      <div className="lg:w-1/2 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md animate-scale-in">
          {/* Mobile-only header */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="p-2.5 bg-gradient-brand rounded-xl shadow-glow-brand">
              <Utensils size={22} className="text-white" />
            </div>
            <h1 className="text-xl font-black tracking-tight">RestaurantOS</h1>
          </div>

          <div className="space-y-2 mb-8">
            <div
              className={`inline-flex p-3 rounded-2xl transition-colors duration-300 ${
                isSuperadminLogin ? 'bg-royal-100 text-royal-600' : 'bg-brand-100 text-brand-600'
              }`}
            >
              {isSuperadminLogin ? <Lock size={24} /> : <Utensils size={24} />}
            </div>
            <h2 className="text-3xl font-black text-ink-900 tracking-tight">
              {isSuperadminLogin ? 'Panel de Superadmin' : 'Bienvenido de vuelta'}
            </h2>
            <p className="text-ink-500">
              {isSuperadminLogin
                ? 'Accede como administrador de la plataforma'
                : 'Ingresa las credenciales de tu restaurante'}
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-ink-700 block">
                {isSuperadminLogin ? 'Usuario' : 'Nombre del Restaurante'}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={restaurantName}
                  onChange={(e) => setRestaurantName(e.target.value)}
                  className={`input pl-11 ${
                    isSuperadminLogin ? 'input-royal border-royal-300' : ''
                  }`}
                  placeholder={isSuperadminLogin ? 'superadmin' : 'Ej: Restaurante R'}
                  required
                />
                <Store
                  size={18}
                  className={`absolute left-3.5 top-3 transition-colors ${
                    isSuperadminLogin ? 'text-royal-400' : 'text-ink-400'
                  }`}
                />
              </div>
              {isSuperadminLogin && (
                <p className="text-xs text-royal-600 font-medium flex items-center gap-1.5 mt-1.5">
                  <ShieldCheck size={12} /> Modo superadmin detectado
                </p>
              )}
            </div>

            {isSuperadminLogin && (
              <div className="space-y-2 animate-fade-in">
                <label className="text-sm font-semibold text-ink-700 block">Email</label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input pl-11 input-royal border-royal-300"
                    placeholder="tu@email.com"
                    required
                  />
                  <Mail size={18} className="absolute left-3.5 top-3 text-royal-400" />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-semibold text-ink-700 block">
                {isSuperadminLogin ? 'Contraseña' : 'Contraseña General'}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`input pl-11 pr-11 ${
                    isSuperadminLogin ? 'input-royal border-royal-300' : ''
                  }`}
                  placeholder="••••••••"
                  required
                />
                <Lock
                  size={18}
                  className={`absolute left-3.5 top-3 transition-colors ${
                    isSuperadminLogin ? 'text-royal-400' : 'text-ink-400'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-2.5 p-1 text-ink-400 hover:text-ink-700 transition-colors rounded-md"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3.5 text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-xl animate-fade-in font-medium">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3.5 text-white font-bold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-[0.98] ${
                isSuperadminLogin
                  ? 'bg-royal-600 hover:bg-royal-700 shadow-glow-royal'
                  : 'bg-brand-500 hover:bg-brand-600 shadow-glow-brand'
              }`}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Entrando...
                </>
              ) : (
                <>
                  {isSuperadminLogin ? 'Acceder como Superadmin' : 'Entrar al Sistema'}
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-xs text-ink-400 mt-8">
            ¿Problemas para entrar? Contacta al administrador de la plataforma.
          </p>
        </div>
      </div>
    </div>
  );
}

function FeaturePill({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-white/5 backdrop-blur-md rounded-xl border border-white/10 text-sm">
      <span className="text-brand-300">{icon}</span>
      <span className="font-medium text-white/90">{label}</span>
    </div>
  );
}
