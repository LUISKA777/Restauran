"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  QrCode,
  Download,
  ExternalLink,
  ArrowLeft,
  CheckCircle2,
  Info,
  Globe,
  Link as LinkIcon
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function QRCenter() {
  const router = useRouter();
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [baseUrl, setBaseUrl] = useState('');
  const [menuUrl, setMenuUrl] = useState('');
  const [tables, setTables] = useState<any[]>([]);
  const [loadingTables, setLoadingTables] = useState(false);

  useEffect(() => {
    const id = localStorage.getItem('restaurant_id');
    if (id) {
      setRestaurantId(id);
      // Set a reasonable default: use production URL if we are on localhost
      const origin = window.location.origin;
      if (origin.includes('localhost')) {
        setBaseUrl('https://restaurant-navy.vercel.app');
      } else {
        setBaseUrl(origin);
      }
    }
  }, []);

  useEffect(() => {
    if (restaurantId) {
      async function fetchTables() {
        setLoadingTables(true);
        const { data, error } = await supabase
          .from('restaurant_tables')
          .select('id, table_number')
          .eq('restaurant_id', restaurantId)
          .order('table_number', { ascending: true });

        if (error) {
          console.error('Error fetching tables:', error);
        } else {
          setTables(data || []);
        }
        setLoadingTables(false);
      }
      fetchTables();
    }
  }, [restaurantId]);

  useEffect(() => {
    if (restaurantId && baseUrl) {
      const cleanBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
      setMenuUrl(`${cleanBase}/menu/${restaurantId}`);
    }
  }, [restaurantId, baseUrl]);

  if (!restaurantId) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-ink-50">
        <div className="text-center space-y-4 card p-8 max-w-md">
          <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
            <Info size={32} />
          </div>
          <h1 className="text-2xl font-black text-ink-900">ID de Restaurante no encontrado</h1>
          <p className="text-ink-500">No pudimos determinar el ID de tu restaurante. Por favor, intenta cerrar sesión e iniciar de nuevo.</p>
          <button
            onClick={() => window.location.href = '/dashboard/role-selection'}
            className="btn-primary"
          >
            Volver al Inicio
          </button>
        </div>
      </div>
    );
  }

  const qrImageUrl = menuUrl
    ? `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(menuUrl)}`
    : undefined;

  return (
    <div className="min-h-screen bg-ink-50 flex flex-col lg:flex-row">
      {/* Sidebar */}
      <aside className="w-64 bg-gradient-night text-white p-5 flex-col space-y-8 hidden lg:flex sticky top-0 h-screen">
        <div className="flex items-center gap-3 px-2">
          <div className="p-2.5 bg-gradient-brand rounded-xl shadow-glow-brand">
            <QrCode size={22} />
          </div>
          <div>
            <span className="font-black text-lg tracking-tight block">QR Center</span>
            <span className="text-[10px] text-white/50 uppercase tracking-wider">RestaurantOS</span>
          </div>
        </div>

        <button
          onClick={() => router.push('/dashboard/admin')}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/70 hover:bg-white/10 hover:text-white transition-all"
        >
          <ArrowLeft size={18} />
          <span className="text-sm font-semibold">Volver al Panel</span>
        </button>
      </aside>

      <main className="flex-grow p-6 lg:p-10 space-y-8 max-w-6xl mx-auto w-full">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fade-in">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-royal-100 text-royal-700 rounded-full text-xs font-bold mb-2">
              <QrCode size={12} /> Generación
            </div>
            <h1 className="text-3xl lg:text-4xl font-black text-ink-900 tracking-tight">
              Centro de Control de QR
            </h1>
            <p className="text-ink-500 mt-1">Genera la puerta de entrada digital a tu restaurante</p>
          </div>
          <button
            onClick={() => window.open(menuUrl, '_blank')}
            className="btn-primary"
          >
            <ExternalLink size={18} /> Probar Menú
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* Left: Configuration & Preview */}
          <div className="space-y-5">
            <div className="card p-6 space-y-5 animate-slide-up">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-royal-100 text-royal-600 rounded-xl">
                  <Globe size={20} />
                </div>
                <h2 className="text-lg font-black text-ink-900">Configuración del Dominio</h2>
              </div>

              <div className="space-y-3">
                <p className="text-sm text-ink-500">
                  Para que el QR funcione en los celulares de tus clientes, debe apuntar a la URL de tu sitio publicado (ej. Vercel).
                </p>
                <div className="flex items-center gap-3">
                  <div className="flex-grow relative">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-ink-400">
                      <LinkIcon size={18} />
                    </div>
                    <input
                      type="text"
                      value={baseUrl}
                      onChange={(e) => setBaseUrl(e.target.value)}
                      className="input pl-11 font-mono text-sm"
                      placeholder="https://tusitio.vercel.app"
                    />
                  </div>
                </div>
                <div className="p-3 bg-sky-50 rounded-xl border border-sky-100 flex gap-3">
                  <Info size={18} className="text-sky-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-sky-900 leading-relaxed">
                    <strong className="font-bold">Importante:</strong> Si estás configurando esto desde tu computadora (localhost), asegúrate de escribir la dirección de tu sitio en Vercel para que los clientes puedan abrir el menú.
                  </p>
                </div>
              </div>
            </div>

            <div className="card p-6 space-y-4 animate-slide-up" style={{ animationDelay: '100ms' }}>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 text-emerald-600 rounded-xl">
                  <CheckCircle2 size={20} />
                </div>
                <h2 className="text-lg font-black text-ink-900">Vista Previa del Enlace</h2>
              </div>
              <div className="p-4 bg-ink-900 rounded-2xl text-emerald-400 font-mono text-xs break-all border border-ink-800">
                {menuUrl}
              </div>
            </div>
          </div>

          {/* Right: QR Display Area */}
          <div className="space-y-6">
            {/* Universal QR Card */}
            <div className="card p-6 flex flex-col items-center text-center space-y-5 relative overflow-hidden animate-slide-up" style={{ animationDelay: '150ms' }}>
              <div className="absolute top-0 right-0 p-4">
                <div className="badge-brand">
                  Universal QR
                </div>
              </div>

              <div className="p-5 bg-ink-50 rounded-3xl border-4 border-white shadow-xl">
                {qrImageUrl ? (
                  <img
                    src={qrImageUrl}
                    alt="QR Menu"
                    className="w-64 h-64 object-contain"
                  />
                ) : (
                  <div className="w-64 h-64 bg-ink-100 animate-pulse flex items-center justify-center text-ink-300 rounded-2xl">
                    <QrCode size={64} />
                  </div>
                )}
              </div>
              <div className="space-y-1.5">
                <h3 className="text-lg font-black text-ink-900">QR Digital General</h3>
                <p className="text-sm text-ink-500 max-w-xs">
                  Este código lleva a la selección general de mesas. Útil para la entrada del restaurante.
                </p>
              </div>

              <a
                href={qrImageUrl}
                download="restaurant-universal-qr.png"
                target="_blank"
                rel="noreferrer"
                className="w-full max-w-xs btn-primary"
              >
                <Download size={18} /> Descargar QR General
              </a>
            </div>

            {/* Tables QR Grid */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 px-2">
                <div className="p-2 bg-royal-100 text-royal-600 rounded-xl">
                  <QrCode size={20} />
                </div>
                <h2 className="text-lg font-black text-ink-900">QRs Individuales por Mesa</h2>
              </div>

              {loadingTables ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="card p-5 skeleton h-64" />
                  ))}
                </div>
              ) : tables.length === 0 ? (
                <div className="card p-8 text-center text-ink-500 text-sm">
                  No hay mesas configuradas. Crea mesas en el panel de control para generar sus QRs.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {tables.map((table, idx) => {
                    const tableUrl = `${menuUrl}?table=${table.id}`;
                    const tableQrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(tableUrl)}`;

                    return (
                      <div
                        key={table.id}
                        style={{ animationDelay: `${idx * 50}ms` }}
                        className="card-hover p-5 flex flex-col items-center text-center space-y-3 animate-slide-up opacity-0"
                      >
                        <div className="p-3 bg-ink-50 rounded-2xl border-2 border-white shadow-md">
                          <img
                            src={tableQrImageUrl}
                            alt={`QR Mesa ${table.table_number}`}
                            className="w-32 h-32 object-contain"
                          />
                        </div>
                        <div>
                          <h3 className="font-bold text-ink-900">Mesa {table.table_number}</h3>
                          <p className="text-[10px] text-ink-400 font-mono">ID: {table.id.substring(0, 8)}…</p>
                        </div>
                        <a
                          href={tableQrImageUrl}
                          download={`mesa-${table.table_number}-qr.png`}
                          target="_blank"
                          rel="noreferrer"
                          className="w-full btn-secondary text-xs"
                        >
                          <Download size={14} /> Descargar
                        </a>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
