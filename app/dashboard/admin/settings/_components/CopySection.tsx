// CopySection.tsx
// Textos editables del menú. Cada campo con su label y un placeholder de
// ayuda.

import React from 'react';
import { MessageSquare, List } from 'lucide-react';
import type { MenuSettings } from '@/types/menuSettings';

interface CopySectionProps {
  settings: MenuSettings;
  onChange: (next: MenuSettings) => void;
}

const COPY_FIELDS: {
  key: keyof MenuSettings['copy'];
  label: string;
  placeholder: string;
  multiline?: boolean;
}[] = [
  { key: 'welcomeHeading', label: 'Encabezado bienvenida', placeholder: '¡Bienvenido a' },
  { key: 'welcomeMessage', label: 'Mensaje bienvenida', placeholder: 'Para comenzar a disfrutar...', multiline: true },
  { key: 'cartButtonLabel', label: 'Botón "Ver pedido"', placeholder: 'Ver mi pedido' },
  { key: 'emptyCartMessage', label: 'Mensaje carrito vacío', placeholder: 'Tu carrito está vacío' },
  { key: 'orderNotesPlaceholder', label: 'Placeholder de notas', placeholder: 'Ej: sin cebolla...' },
  { key: 'submitButtonLabel', label: 'Botón confirmar pedido', placeholder: 'Confirmar y Enviar a Cocina' },
  { key: 'successTitle', label: 'Título pedido enviado', placeholder: '¡Pedido Enviado!' },
  { key: 'successMessage', label: 'Mensaje de éxito', placeholder: 'Tu pedido ha sido recibido...', multiline: true },
  { key: 'productFallbackDescription', label: 'Descripción fallback producto', placeholder: 'Un sabor excepcional...', multiline: true },
];

export function CopySection({ settings, onChange }: CopySectionProps) {
  const setCopy = (key: keyof MenuSettings['copy'], value: string) => {
    onChange({ ...settings, copy: { ...settings.copy, [key]: value } });
  };

  return (
    <div className="space-y-3">
      <summary className="card p-4 flex items-center justify-between cursor-pointer list-none">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-violet-100 text-violet-600 rounded-xl">
            <MessageSquare size={20} />
          </div>
          <div>
            <h2 className="text-base font-black text-ink-900">Textos del Menú</h2>
            <p className="text-xs text-ink-500">Mensajes que verá el cliente</p>
          </div>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider text-ink-400">Opcional</span>
      </summary>

      <div className="card p-6 space-y-4 mt-2">
        {COPY_FIELDS.map((f) => (
          <div key={f.key} className="space-y-1">
            <label className="text-sm font-bold text-ink-600 flex items-center gap-2">
              <List size={12} className="text-ink-400" /> {f.label}
            </label>
            {f.multiline ? (
              <textarea
                value={settings.copy[f.key]}
                onChange={(e) => setCopy(f.key, e.target.value)}
                placeholder={f.placeholder}
                rows={2}
                className="input text-sm resize-none"
              />
            ) : (
              <input
                type="text"
                value={settings.copy[f.key]}
                onChange={(e) => setCopy(f.key, e.target.value)}
                placeholder={f.placeholder}
                className="input text-sm"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
