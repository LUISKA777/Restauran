"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Utensils } from 'lucide-react';

export default function MenuPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-200 rounded-full transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
          <Utensils className="text-orange-500" /> Menú de Productos
        </h1>
      </div>

      <div className="bg-white p-12 rounded-3xl border border-slate-200 shadow-sm text-center space-y-4">
        <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto">
          <Utensils size={32} />
        </div>
        <h2 className="text-xl font-bold text-slate-800">Módulo en Desarrollo</h2>
        <p className="text-slate-500 max-w-md mx-auto">
          Estamos configurando la gestión de platos, precios y categorías. Esta sección estará disponible pronto.
        </p>
      </div>
    </div>
  );
}
