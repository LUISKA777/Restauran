import React from 'react';

interface BrandingHeaderProps {
  name: string;
  settings?: any;
}

export function BrandingHeader({ name, settings }: BrandingHeaderProps) {
  return (
    <header className="p-6 text-center space-y-2">
      <div className="w-20 h-20 bg-[var(--color-primary)] rounded-full mx-auto mb-4 flex items-center justify-center text-white font-bold text-2xl shadow-lg">
        {name.charAt(0)}
      </div>
      <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
        {name}
      </h1>
      <p className="text-gray-500 text-sm italic">
        ¡Bienvenido a nuestro menú digital!
      </p>
    </header>
  );
}
