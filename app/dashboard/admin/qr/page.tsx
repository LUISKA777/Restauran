"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  QrCode,
  Download,
  ExternalLink,
  ArrowLeft,
  CheckCircle2,
  Info
} from 'lucide-react';

export default function QRCenter() {
  const router = useRouter();
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [menuUrl, setMenuUrl] = useState('');

  useEffect(() => {
    const id = localStorage.getItem('restaurant_id');
    if (id) {
      setRestaurantId(id);
      // Construct the menu URL.
      // In production, replace localhost:3000 with the actual domain.
      const baseUrl = window.location.origin;
      setMenuUrl(`${baseUrl}/menu/${id}`);
    }
  }, []);

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
      {/* Sidebar - Consistent with Admin Panel */}
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
          <div>
            <h1 className="text-3xl font-black text-slate-900">Centro de Control de QR</h1>
            <p className="text-slate-500">Genera y gestiona la entrada digital a tu restaurante</p>
          </div>
          <button
            onClick={() => window.open(menuUrl, '_blank')}
            className="flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-2xl font-bold hover:bg-orange-600 transition-all shadow-lg shadow-orange-200 active:scale-95"
          >
            <ExternalLink size={20} /> Probar Menú
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* QR Display Card */}
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl flex flex-col items-center text-center space-y-6">
            <div className="p-4 bg-gray-50 rounded-2xl border-4 border-white shadow-inner">
              <img
                src={qrImageUrl}
                alt="QR Menu"
                className="w-64 h-64 object-contain"
              />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Tu Código QR Universal</h3>
              <p className="text-sm text-slate-500 mt-1">Este código es el mismo para todas tus mesas</p>
            </div>

            <div className="w-full p-3 bg-slate-100 rounded-xl text-slate-600 text-xs font-mono break-all border border-slate-200">
              {menuUrl}
            </div>

            <a
              href={qrImageUrl}
              download="restaurant-qr.png"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 px-8 py-3 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-lg active:scale-95"
            >
              <Download size={20} /> Descargar Imagen QR
            </a>
          </div>

          {/* Instructions Card */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-800">Guía de Implementación</h2>

            <div className="space-y-4">
              {[
                {
                  title: 'Impresión',
                  text: 'Imprime este código en el tamaño que prefieras. Puedes ponerlo en la entrada o en cada mesa.',
                  icon: <Download className="text-indigo-500" />
                },
                {
                  title: 'Ubicación',
                  text: 'Coloca el QR en un lugar visible y limpio. Recomendamos usar soportes de acrílico sobre las mesas.',
                  icon: <TableProperties className="text-purple-500" />
                },
                {
                  title: 'Experiencia',
                  text: 'El cliente escanea, elige su mesa y comienza a pedir. ¡Todo ocurre en segundos!',
                  icon: <CheckCircle2 className="text-green-500" />
                }
              ].map((step, i) => (
                <div key={i} className="flex items-start gap-4 p-4 bg-white rounded-2xl border border-slate-200 hover:border-orange-300 transition-colors">
                  <div className="p-2 bg-gray-50 rounded-lg">
                    {step.icon}
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-slate-900">{step.title}</h4>
                    <p className="text-sm text-slate-500">{step.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// Simple mock for missing icon in this file
function TableProperties(props: any) {
  return <div className="w-5 h-5 border-2 border-current rounded-sm" {...props} />;
}
