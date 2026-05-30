"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, BarChart3 } from 'lucide-react';

export default function ReportsPage() {
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
          <BarChart3 className="text-green-500" /> Reportes y Ventas
        </h1>
      </div>

      <div className="bg-white p-12 rounded-3xl border border-slate-200 shadow-sm text-center space-y-4">
        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
          <BarChart3 size={32} />
        </div>
        <h2 className="text-xl font-bold text-slate-800">Módulo en Desarrollo</h2>
        <p className="text-slate-500 max-w-md mx-auto">
          Estamos integrando las analíticas de ventas y reportes de rendimiento. Muy pronto podrás ver tus estadísticas.
        </p>
      </div>
    </div>
  );
}
