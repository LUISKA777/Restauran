import React from 'react';
import { CheckCircle2 } from 'lucide-react';

interface OrderSuccessProps {
  onClose: () => void;
}

export function OrderSuccess({ onClose }: OrderSuccessProps) {
  return (
    <div className="fixed inset-0 z-[60] bg-white flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in duration-300">
      <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
        <CheckCircle2 size={48} />
      </div>
      <h2 className="text-3xl font-black text-gray-900 mb-2">¡Pedido Enviado!</h2>
      <p className="text-gray-500 mb-8 max-w-xs">
        Tu pedido ha sido recibido y la cocina ya está preparando todo. ¡Gracias por visitarnos!
      </p>
      <button
        onClick={onClose}
        className="px-8 py-3 bg-gray-900 text-white font-bold rounded-2xl hover:bg-gray-800 transition-colors"
      >
        Cerrar
      </button>
    </div>
  );
}
