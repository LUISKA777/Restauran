"use client";
import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { LayoutDashboard, UtensilsCrossed, UserCheck, ChevronRight, LogOut, Store, Sparkles, Lock, X, Delete, ShieldAlert } from 'lucide-react';
import { useRestaurantSettings } from '@/lib/useRestaurantSettings';
import { normalizePin, isValidPin, pinLength, pinsMatch } from '@/lib/pin';

const roles = [
  {
    id: 'admin',
    title: 'Administrador',
    description: 'Gestión de usuarios, mesas, reportes y estadísticas.',
    icon: LayoutDashboard,
    color: 'from-sky-500 to-blue-600',
    shadow: 'shadow-sky-200',
    text: 'text-sky-600',
    bg: 'bg-sky-50',
    path: '/dashboard/admin',
  },
  {
    id: 'kitchen',
    title: 'Cocina',
    description: 'Tablero visual de pedidos y gestión de estados de preparación.',
    icon: UtensilsCrossed,
    color: 'from-brand-400 to-brand-600',
    shadow: 'shadow-brand-200',
    text: 'text-brand-600',
    bg: 'bg-brand-50',
    path: '/dashboard/kitchen',
  },
  {
    id: 'waiter',
    title: 'Mesero / Pedidos',
    description: 'Toma de pedidos manuales y seguimiento de entrega.',
    icon: UserCheck,
    color: 'from-emerald-500 to-emerald-700',
    shadow: 'shadow-emerald-200',
    text: 'text-emerald-600',
    bg: 'bg-emerald-50',
    path: '/dashboard/waiter',
  },
];

export default function RoleSelection() {
  const router = useRouter();
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);

  // PIN gate
  const { settings, loading: settingsLoading } = useRestaurantSettings();
  const [pinOpen, setPinOpen] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState<string | null>(null);
  const [pinShake, setPinShake] = useState(false);
  const pinErrorTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const id = localStorage.getItem('restaurant_id');
    setRestaurantId(id);
  }, []);

  // Auto-submit cuando se llega al largo del PIN configurado
  const adminPin = settings?.security?.adminPin || '';
  const hasPin = isValidPin(adminPin);
  const targetLen = pinLength(adminPin);

  useEffect(() => {
    if (!pinOpen) return;
    if (pinInput.length === targetLen) {
      // Pequeño delay para que el usuario vea el último dot
      const t = setTimeout(() => verifyPin(pinInput), 120);
      return () => clearTimeout(t);
    }
  }, [pinInput, targetLen, pinOpen]);

  const verifyPin = (candidate: string) => {
    if (pinsMatch(candidate, adminPin)) {
      setPinOpen(false);
      setPinInput('');
      setPinError(null);
      router.push('/dashboard/admin');
    } else {
      setPinError('PIN incorrecto. Intenta de nuevo.');
      setPinShake(true);
      if (pinErrorTimeout.current) clearTimeout(pinErrorTimeout.current);
      pinErrorTimeout.current = setTimeout(() => {
        setPinShake(false);
      }, 400);
      setTimeout(() => {
        setPinInput('');
      }, 400);
    }
  };

  const handleRoleClick = (role: typeof roles[number]) => {
    if (role.id === 'admin' && hasPin) {
      setPinInput('');
      setPinError(null);
      setPinOpen(true);
      return;
    }
    router.push(role.path);
  };

  const onKeyPress = (digit: string) => {
    if (pinInput.length >= targetLen) return;
    setPinInput((p) => p + digit);
    setPinError(null);
  };

  const onBackspace = () => {
    setPinInput((p) => p.slice(0, -1));
    setPinError(null);
  };

  const closePin = () => {
    setPinOpen(false);
    setPinInput('');
    setPinError(null);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-royal-500/10 rounded-full blur-3xl" />

      <div className="max-w-5xl w-full space-y-12 relative z-10">
        {/* Top bar */}
        <div className="flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-brand rounded-xl shadow-glow-brand">
              <Store size={20} className="text-white" />
            </div>
            <div>
              <p className="text-xs font-bold text-ink-400 uppercase tracking-wider">Sesión activa</p>
              <p className="text-sm font-mono text-ink-600">{restaurantId ? restaurantId.substring(0, 8) : '—'}</p>
            </div>
          </div>
          <button
            onClick={() => {
              localStorage.removeItem('restaurant_id');
              router.push('/login');
            }}
            className="btn-ghost"
          >
            <LogOut size={16} /> Cerrar sesión
          </button>
        </div>

        {/* Header */}
        <div className="text-center space-y-4 animate-slide-up">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-ink-200 rounded-full text-xs font-semibold text-ink-600 shadow-soft">
            <Sparkles size={14} className="text-brand-500" />
            Selecciona cómo quieres operar hoy
          </div>
          <h1 className="text-4xl lg:text-5xl font-black text-ink-900 tracking-tight text-balance">
            ¿Qué quieres hacer?
          </h1>
          <p className="text-ink-500 text-lg max-w-2xl mx-auto">
            Cada rol tiene su propio panel optimizado. Puedes cambiar entre ellos cuando quieras.
          </p>
        </div>

        {/* Role cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {roles.map((role, idx) => {
            const Icon = role.icon;
            const isHovered = hovered === role.id;
            const requiresPin = role.id === 'admin' && hasPin;
            return (
              <button
                key={role.id}
                onClick={() => handleRoleClick(role)}
                onMouseEnter={() => setHovered(role.id)}
                onMouseLeave={() => setHovered(null)}
                style={{ animationDelay: `${idx * 100}ms` }}
                className="group relative bg-white rounded-3xl p-7 shadow-soft border border-ink-200/60 hover:border-transparent hover:shadow-2xl transition-all duration-500 flex flex-col items-start text-left overflow-hidden animate-slide-up opacity-0"
              >
                {/* Hover gradient overlay */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${role.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                />

                <div className="relative z-10 w-full space-y-5">
                  <div className="flex items-start justify-between">
                    <div
                      className={`p-3.5 rounded-2xl ${role.bg} group-hover:bg-white/20 transition-all duration-500 ${
                        isHovered ? 'scale-110' : ''
                      }`}
                    >
                      <Icon
                        size={28}
                        className={`${role.text} group-hover:text-white transition-colors duration-500`}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      {requiresPin && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-rose-500 bg-rose-50 px-2 py-1 rounded-full">
                          <Lock size={10} /> PIN
                        </span>
                      )}
                      <ChevronRight
                        size={22}
                        className="text-ink-300 group-hover:text-white group-hover:translate-x-1 transition-all duration-300"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-2xl font-black text-ink-900 group-hover:text-white transition-colors duration-500">
                      {role.title}
                    </h3>
                    <p className="text-sm text-ink-500 group-hover:text-white/90 transition-colors duration-500 leading-relaxed">
                      {role.description}
                    </p>
                  </div>

                  <div className="pt-3 flex items-center gap-2 text-sm font-bold text-ink-700 group-hover:text-white transition-colors duration-500">
                    {requiresPin ? 'Ingresar PIN' : 'Acceder'}
                    <ChevronRight
                      size={16}
                      className="group-hover:translate-x-1 transition-transform"
                    />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ═══ MODAL: PIN de Administrador ═══ */}
      {pinOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-900/60 backdrop-blur-sm animate-fade-in"
          onClick={closePin}
        >
          <div
            className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-ink-100 flex items-center justify-between bg-gradient-to-br from-ink-900 to-ink-800 text-white">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-rose-500/20 text-rose-300 rounded-xl">
                  <Lock size={20} />
                </div>
                <div>
                  <h2 className="text-base font-black">PIN de Administrador</h2>
                  <p className="text-xs text-white/60">Solo personal autorizado</p>
                </div>
              </div>
              <button
                onClick={closePin}
                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-white/70 hover:text-white"
                aria-label="Cerrar"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Dots */}
              <div
                className={`flex justify-center gap-3 ${pinShake ? 'animate-shake' : ''}`}
                key={pinShake ? 'err' : 'ok'}
              >
                {Array.from({ length: targetLen }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-4 h-4 rounded-full border-2 transition-all duration-150 ${
                      i < pinInput.length
                        ? pinError
                          ? 'bg-rose-500 border-rose-500 scale-110'
                          : 'bg-gradient-brand border-transparent scale-110'
                        : 'border-ink-300'
                    }`}
                  />
                ))}
              </div>

              {pinError && (
                <div className="flex items-center justify-center gap-2 text-rose-600 text-sm font-bold animate-fade-in">
                  <ShieldAlert size={14} /> {pinError}
                </div>
              )}

              {!pinError && (
                <p className="text-center text-xs text-ink-500 font-medium">
                  Ingresa el PIN de {targetLen} dígitos
                </p>
              )}

              {/* Keypad */}
              <div className="grid grid-cols-3 gap-2">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => (
                  <KeypadButton key={d} onClick={() => onKeyPress(d)} disabled={pinInput.length >= targetLen}>
                    {d}
                  </KeypadButton>
                ))}
                <div /> {/* spacer */}
                <KeypadButton onClick={() => onKeyPress('0')} disabled={pinInput.length >= targetLen}>
                  0
                </KeypadButton>
                <KeypadButton onClick={onBackspace} disabled={pinInput.length === 0} variant="ghost">
                  <Delete size={20} />
                </KeypadButton>
              </div>

              <button
                type="button"
                onClick={closePin}
                className="w-full py-2 text-sm font-bold text-ink-500 hover:text-ink-700 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Estilos para el shake de error */}
      <style jsx global>{`
        @keyframes pin-shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-6px); }
          80% { transform: translateX(6px); }
        }
        .animate-shake { animation: pin-shake 0.4s ease-in-out; }
      `}</style>
    </div>
  );
}

function KeypadButton({
  children,
  onClick,
  disabled,
  variant = 'default',
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  variant?: 'default' | 'ghost';
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`h-14 rounded-xl text-xl font-black transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed ${
        variant === 'ghost'
          ? 'text-ink-500 hover:bg-ink-100'
          : 'text-ink-900 bg-ink-50 hover:bg-ink-100 hover:shadow-md'
      }`}
    >
      {children}
    </button>
  );
}
