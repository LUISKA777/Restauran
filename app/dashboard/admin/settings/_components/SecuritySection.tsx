// SecuritySection.tsx
// Configuración del PIN de acceso al rol Administrador.
// Cuando adminPin está vacío, el admin entra sin PIN extra (compat con el
// flujo actual). Cuando tiene un valor de 4-6 dígitos, role-selection
// muestra un keypad antes de redirigir al panel.

import React, { useState } from 'react';
import { Lock, ToggleLeft, ToggleRight, Eye, EyeOff, ShieldAlert, ShieldCheck, Info } from 'lucide-react';
import type { MenuSettings } from '@/types/menuSettings';
import { isValidPin } from '@/lib/pin';

interface SecuritySectionProps {
  settings: MenuSettings;
  onChange: (next: MenuSettings) => void;
}

export function SecuritySection({ settings, onChange }: SecuritySectionProps) {
  const hasPin = isValidPin(settings.security?.adminPin || '');
  const [draftPin, setDraftPin] = useState(settings.security?.adminPin || '');
  const [showDraft, setShowDraft] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updatePin = (val: string) => {
    const cleaned = val.replace(/\D/g, '').slice(0, 6);
    setDraftPin(cleaned);
    setError(null);
  };

  const applyChange = () => {
    if (draftPin === '') {
      onChange({ ...settings, security: { adminPin: '' } });
      setError(null);
      return;
    }
    if (!isValidPin(draftPin)) {
      setError('El PIN debe tener entre 4 y 6 dígitos');
      return;
    }
    onChange({ ...settings, security: { adminPin: draftPin } });
    setError(null);
  };

  const removePin = () => {
    setDraftPin('');
    onChange({ ...settings, security: { adminPin: '' } });
    setError(null);
  };

  return (
    <div className="space-y-3">
      <summary className="card p-4 flex items-center justify-between cursor-pointer list-none">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-rose-100 text-rose-600 rounded-xl">
            <Lock size={20} />
          </div>
          <div>
            <h2 className="text-base font-black text-ink-900">Seguridad y Acceso</h2>
            <p className="text-xs text-ink-500">PIN extra para el rol Administrador</p>
          </div>
        </div>
        {hasPin ? (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-600">
            <ShieldCheck size={12} /> Activo
          </span>
        ) : (
          <span className="text-[10px] font-bold uppercase tracking-wider text-ink-400">Desactivado</span>
        )}
      </summary>

      <div className="card p-6 space-y-4 mt-2">
        <div className="flex items-start gap-3 p-3 bg-ink-50 rounded-xl">
          <Info size={16} className="text-ink-500 shrink-0 mt-0.5" />
          <p className="text-xs text-ink-600 leading-relaxed">
            Si activas un PIN, cada vez que alguien elija el rol{' '}
            <span className="font-bold text-ink-900">Administrador</span> en la pantalla de selección
            se le pedirá este código. Cocina y Mesero siguen entrando con la contraseña normal.
          </p>
        </div>

        <div className="flex items-center gap-3 p-3 bg-ink-50 rounded-xl">
          {hasPin ? (
            <ShieldCheck size={20} className="text-emerald-500 shrink-0" />
          ) : (
            <ShieldAlert size={20} className="text-ink-400 shrink-0" />
          )}
          <div className="flex-1">
            <p className="text-sm font-bold text-ink-900">
              {hasPin ? 'PIN configurado' : 'Sin PIN configurado'}
            </p>
            <p className="text-xs text-ink-500">
              {hasPin
                ? `El admin debe ingresar el PIN de ${settings.security.adminPin.length} dígitos al entrar.`
                : 'Cualquier persona con la contraseña del local puede entrar al panel admin.'}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-ink-600">
            {hasPin ? 'Cambiar PIN' : 'Establecer PIN'}
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type={showDraft ? 'text' : 'password'}
                inputMode="numeric"
                pattern="\d{4,6}"
                maxLength={6}
                value={draftPin}
                onChange={(e) => updatePin(e.target.value)}
                className="input pr-10 font-mono tracking-[0.5em] text-center text-lg"
                placeholder="••••"
              />
              <button
                type="button"
                onClick={() => setShowDraft((s) => !s)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-ink-400 hover:text-ink-700 rounded-md"
                tabIndex={-1}
                aria-label={showDraft ? 'Ocultar PIN' : 'Mostrar PIN'}
              >
                {showDraft ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <button
              type="button"
              onClick={applyChange}
              disabled={!draftPin || (draftPin === settings.security?.adminPin)}
              className="btn-primary text-xs disabled:opacity-50"
            >
              {hasPin ? 'Actualizar' : 'Activar'}
            </button>
          </div>
          {error && (
            <p className="text-xs text-rose-600 font-medium flex items-center gap-1.5">
              <ShieldAlert size={12} /> {error}
            </p>
          )}
          <p className="text-[10px] text-ink-400 italic">
            Entre 4 y 6 dígitos. Solo números. Recordá que si olvidás el PIN vas a
            tener que pedirle al superadmin que lo borre desde la base de datos.
          </p>
        </div>

        {hasPin && (
          <button
            type="button"
            onClick={removePin}
            className="w-full py-2 text-sm font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl transition-colors"
          >
            Quitar PIN y permitir acceso libre
          </button>
        )}
      </div>
    </div>
  );
}
