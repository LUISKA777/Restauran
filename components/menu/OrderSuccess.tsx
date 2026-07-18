import React from 'react';
import { CheckCircle2 } from 'lucide-react';

interface OrderSuccessProps {
  onClose: () => void;
  title?: string;
  message?: string;
}

export function OrderSuccess({
  onClose,
  title = '¡Pedido Enviado!',
  message = 'Tu pedido ha sido recibido y la cocina ya está preparando todo. ¡Gracias por visitarnos!',
}: OrderSuccessProps) {
  return (
    <div className="fixed inset-0 z-[60] bg-slate-900 flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in duration-300">
      <div className="w-24 h-24 bg-[var(--color-primary)]/20 text-[var(--color-primary)] rounded-full flex items-center justify-center mb-6 border border-[var(--color-primary)]/30">
        <CheckCircle2 size={48} />
      </div>
      <h2 className="text-3xl font-black text-white mb-2">{title}</h2>
      <p className="text-white/50 mb-8 max-w-xs">{message}</p>
      <button
        onClick={onClose}
        className="px-8 py-3 bg-white/10 border border-white/20 text-white font-bold rounded-2xl hover:bg-white/20 transition-colors"
      >
        Cerrar
      </button>
    </div>
  );
}
