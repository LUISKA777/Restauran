"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, TableProperties } from 'lucide-react';

export default function TablesPage() {
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
          <TableProperties className="text-purple-500" /> Control de Mesas
        </h1>
      </div>

      <div className="bg-white p-12 rounded-3xl border border-slate-200 shadow-sm text-center space-y-4">
        <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto">
          <TableProperties size={32} />
        </div>
        <h2 className="text-xl font-bold text-slate-800">Módulo en Desarrollo</h2>
        <p className="text-slate-500 max-w-md mx-auto">
          Próximamente podrás gestionar la disposición de tus mesas y sus tokens de acceso.
        </p>
      </div>
    </div>
  );
}
