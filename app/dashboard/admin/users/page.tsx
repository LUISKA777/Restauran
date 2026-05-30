"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Users } from 'lucide-react';

export default function UsersPage() {
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
          <Users className="text-blue-500" /> Gestión de Usuarios
        </h1>
      </div>

      <div className="bg-white p-12 rounded-3xl border border-slate-200 shadow-sm text-center space-y-4">
        <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto">
          <Users size={32} />
        </div>
        <h2 className="text-xl font-bold text-slate-800">Módulo en Desarrollo</h2>
        <p className="text-slate-500 max-w-md mx-auto">
          Estamos terminando de pulir la gestión de usuarios y roles. Esta sección estará disponible muy pronto.
        </p>
      </div>
    </div>
  );
}
