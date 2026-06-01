import React from 'react';

interface BrandingHeaderProps {
  name: string;
  settings?: any;
}

export function BrandingHeader({ name, settings }: BrandingHeaderProps) {
  return (
    <header className="p-6 text-center space-y-2 relative z-10">
      <div className="w-24 h-24 bg-white/80 backdrop-blur-md rounded-full mx-auto mb-4 flex items-center justify-center text-white font-bold text-2xl shadow-2xl overflow-hidden border-4 border-white ring-4 ring-[var(--color-primary)]/20">
        {settings?.logoUrl ? (
          <img src={settings.logoUrl} alt={name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-[var(--color-primary)] text-4xl font-black">{name.charAt(0)}</span>
        )}
      </div>
      <h1 className="text-4xl font-black text-slate-900 tracking-tight drop-shadow-sm">
        {name}
      </h1>
      <p className="text-slate-600 text-sm font-medium italic opacity-80">
        ¡Bienvenido a nuestro menú digital!
      </p>
    </header>
  );
}
