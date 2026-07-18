import React from 'react';

interface BrandingHeaderProps {
  name: string;
  settings?: any;
}

export function BrandingHeader({ name, settings }: BrandingHeaderProps) {
  return (
    <header className="p-6 pt-8 text-center space-y-3 relative z-10 animate-fade-in">
      <div className="w-24 h-24 backdrop-blur-md rounded-3xl mx-auto mb-4 flex items-center justify-center font-black text-3xl shadow-2xl overflow-hidden border-4 border-white/20 transition-transform hover:scale-105 hover:rotate-3"
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.08)',
          color: 'var(--color-primary)',
          boxShadow: '0 0 0 4px var(--color-primary)',
        }}
      >
        {settings?.logoUrl ? (
          <img src={settings.logoUrl} alt={name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-[var(--color-primary)]">{name.charAt(0).toUpperCase()}</span>
        )}
      </div>
      <h1 className="text-4xl lg:text-5xl font-black text-white tracking-tight drop-shadow-sm text-balance">
        {name}
      </h1>
      <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-widest text-white/60 border border-white/10">
        <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)] animate-pulse" />
        Menú Digital
      </div>
    </header>
  );
}
