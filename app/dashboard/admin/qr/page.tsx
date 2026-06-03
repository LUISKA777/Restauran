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
        setBaseUrl('https://restauran-navy.vercel.app');
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
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center space-y-4 bg-white p-8 rounded-3xl shadow-sm border border-gray-200 max-w-md">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
            <Info size={32} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">ID de Restaurante no encontrado</h1>
          <p className="text-gray-500">No pudimos determinar el ID de tu restaurante. Por favor, intenta cerrar sesión e iniciar de nuevo.</p>
          <button
            onClick={() => window.location.href = '/dashboard/role-selection'}
            className="px-6 py-2 bg-gray-900 text-white rounded-xl font-bold"
          >
            Volver al Inicio
          </button>
        </div>
      </div>
    );
  }

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(menuUrl)}`;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white p-6 flex flex-col space-y-8 hidden lg:flex">
        <div className="flex items-center gap-3 px-2">
          <div className="p-2 bg-orange-500 rounded-lg">
            <QrCode size={24} />
          </div>
          <span className="font-bold text-xl">QR Center</span>
        </div>

        <button
          onClick={() => router.push('/dashboard/admin')}
          className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={20} />
          <span className="font-medium">Volver al Panel</span>
        </button>
      </aside>

      <main className="flex-grow p-6 lg:p-12 space-y-12">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-black text-slate-900">Centro de Control de QR</h1>
            <p className="text-slate-500">Genera la puerta de entrada digital a tu restaurante</p>
          </div>
          <button
            onClick={() => window.open(menuUrl, '_blank')}
            className="flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-2xl font-bold hover:bg-orange-600 transition-all shadow-lg shadow-orange-200 active:scale-95"
          >
            <ExternalLink size={20} /> Probar Menú
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Left: Configuration & Preview */}
          <div className="space-y-8">
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                  <Globe size={20} />
                </div>
                <h2 className="text-xl font-bold text-slate-900">Configuración del Dominio</h2>
              </div>

              <div className="space-y-4">
                <p className="text-sm text-slate-500">
                  Para que el QR funcione en los celulares de tus clientes, debe apuntar a la URL de tu sitio publicado (ej. Vercel).
                </p>
                <div className="flex items-center gap-3">
                  <div className="flex-grow relative">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400">
                      <LinkIcon size={18} />
                    </div>
                    <input
                      type="text"
                      value={baseUrl}
                      onChange={(e) => setBaseUrl(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-mono text-sm"
                      placeholder="https://tusitio.vercel.app"
                    />
                  </div>
                </div>
                <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-100 flex gap-3">
                  <Info size={18} className="text-indigo-500 shrink-0" />
                  <p className="text-xs text-indigo-700 leading-relaxed">
                    <strong className="font-bold">Importante:</strong> Si estás configurando esto desde tu computadora (localhost), asegúrate de escribir la dirección de tu sitio en Vercel para que los clientes puedan abrir el menú.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                  <CheckCircle2 size={20} />
                </div>
                <h2 className="text-xl font-bold text-slate-900">Vista Previa del Enlace</h2>
              </div>
              <div className="p-4 bg-slate-900 rounded-2xl text-indigo-400 font-mono text-sm break-all border border-slate-800 shadow-inner">
                {menuUrl}
              </div>
            </div>
          </div>

          {/* Right: QR Display Area */}
          <div className="space-y-8">
            {/* Universal QR Card */}
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl flex flex-col items-center text-center space-y-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4">
                <div className="bg-orange-100 text-orange-600 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                  Universal QR
                </div>
              </div>

              <div className="p-6 bg-gray-50 rounded-3xl border-4 border-white shadow-2xl">
                <img
                  src={qrImageUrl}
                  alt="QR Menu"
                  className="w-64 h-64 object-contain"
                />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-slate-900">QR Digital General</h3>
                <p className="text-sm text-slate-500 max-w-xs">
                  Este código lleva a la selección general de mesas. Útil para la entrada del restaurante.
                </p>
              </div>

              <a
                href={qrImageUrl}
                download="restaurant-universal-qr.png"
                target="_blank"
                rel="noreferrer"
                className="w-full max-w-xs flex items-center justify-center gap-2 px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-lg active:scale-95"
              >
                <Download size={20} /> Descargar QR General
              </a>
            </div>

            {/* Tables QR Grid */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 px-2">
                <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                  <QrCode size={20} />
                </div>
                <h2 className="text-xl font-bold text-slate-900">QRs Individuales por Mesa</h2>
              </div>

              {loadingTables ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-white p-6 rounded-3xl border border-slate-200 animate-pulse h-64" />
                  ))}
                </div>
              ) : tables.length === 0 ? (
                <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center space-y-3">
                  <p className="text-slate-500">No hay mesas configuradas. Crea mesas en el panel de control para generar sus QRs.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {tables.map(table => {
                    const tableUrl = `${menuUrl}?table=${table.id}`;
                    const tableQrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(tableUrl)}`;

                    return (
                      <div key={table.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col items-center text-center space-y-4 hover:border-purple-500 transition-all group">
                        <div className="p-3 bg-gray-50 rounded-2xl border-2 border-white shadow-md">
                          <img
                            src={tableQrImageUrl}
                            alt={`QR Mesa ${table.table_number}`}
                            className="w-32 h-32 object-contain"
                          />
                        </div>
                        <div className="space-y-1">
                          <h3 className="font-bold text-slate-900">Mesa {table.table_number}</h3>
                          <p className="text-xs text-slate-400 font-mono">ID: {table.id.substring(0, 8)}</p>
                        </div>
                        <a
                          href={tableQrImageUrl}
                          download={`mesa-${table.table_number}-qr.png`}
                          target="_blank"
                          rel="noreferrer"
                          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-sm font-bold hover:bg-purple-600 hover:text-white transition-all"
                        >
                          <Download size={16} /> Descargar
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
