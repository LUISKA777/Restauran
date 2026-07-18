// ContactSection.tsx
// Bloque de contacto opcional (WhatsApp, dirección, horario).

import React from 'react';
import { Phone, ToggleLeft, ToggleRight } from 'lucide-react';
import type { MenuSettings } from '@/types/menuSettings';

interface ContactSectionProps {
  settings: MenuSettings;
  onChange: (next: MenuSettings) => void;
}

export function ContactSection({ settings, onChange }: ContactSectionProps) {
  const setContact = <K extends keyof MenuSettings['contact']>(
    key: K,
    value: MenuSettings['contact'][K]
  ) => {
    onChange({ ...settings, contact: { ...settings.contact, [key]: value } });
  };

  return (
    <div className="space-y-3">
      <summary className="card p-4 flex items-center justify-between cursor-pointer list-none">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-100 text-emerald-600 rounded-xl">
            <Phone size={20} />
          </div>
          <div>
            <h2 className="text-base font-black text-ink-900">Contacto y Horario</h2>
            <p className="text-xs text-ink-500">WhatsApp, dirección y horario del restaurante</p>
          </div>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider text-ink-400">Opcional</span>
      </summary>

      <div className="card p-6 space-y-4 mt-2">
        <label className="flex items-center gap-3 cursor-pointer p-3 bg-ink-50 rounded-xl">
          <button
            type="button"
            onClick={() => setContact('showContactBlock', !settings.contact.showContactBlock)}
            className="transition-colors"
          >
            {settings.contact.showContactBlock ? (
              <ToggleRight size={28} className="text-emerald-500" />
            ) : (
              <ToggleLeft size={28} className="text-ink-400" />
            )}
          </button>
          <span className="text-sm font-bold text-ink-700">Mostrar bloque de contacto en el menú</span>
        </label>

        <div className="space-y-2">
          <label className="text-sm font-bold text-ink-600">Número de WhatsApp</label>
          <input
            type="text"
            value={settings.contact.whatsappNumber}
            onChange={(e) => setContact('whatsappNumber', e.target.value)}
            className="input"
            placeholder="+506 8888 8888"
            disabled={!settings.contact.showContactBlock}
          />
          <p className="text-[10px] text-ink-400 italic">Se genera un link wa.me con este número.</p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-ink-600">Dirección</label>
          <input
            type="text"
            value={settings.contact.address}
            onChange={(e) => setContact('address', e.target.value)}
            className="input"
            placeholder="Av. Central, San José"
            disabled={!settings.contact.showContactBlock}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-ink-600">Horario</label>
          <input
            type="text"
            value={settings.contact.schedule}
            onChange={(e) => setContact('schedule', e.target.value)}
            className="input"
            placeholder="Lun–Dom 11:00–22:00"
            disabled={!settings.contact.showContactBlock}
          />
        </div>
      </div>
    </div>
  );
}
