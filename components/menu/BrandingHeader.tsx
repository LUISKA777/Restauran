import React from 'react';
import type { MenuSettings } from '@/types/menuSettings';
import { isLightColor } from '@/lib/color';

interface BrandingHeaderProps {
  name: string;
  settings: MenuSettings;
}

export function BrandingHeader({ name, settings }: BrandingHeaderProps) {
  const { variant, tagline, showBadge, badgeText } = settings.hero;
  const light = isLightColor(settings.backgroundColor);

  // Adaptamos color de textos y pill al theme.
  // dark theme (default): textos blancos / pills white/10
  // light theme (bistro-light): textos ink / pills ink/5
  const titleColor = light ? 'text-ink-900' : 'text-white';
  const subTextColor = light ? 'text-ink-500' : 'text-white/60';
  const pillBg = light
    ? 'bg-ink-900/5 border-ink-900/10'
    : 'bg-white/10 border-white/10';
  const logoBoxBg = light ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.08)';
  const logoBoxBorder = light ? 'border-ink-900/20' : 'border-white/20';

  if (variant === 'image-fullbleed') {
    const heroImg = settings.backgroundImageUrl || settings.logoUrl;
    if (!heroImg) {
      // Si no hay imagen, fallback a la variante logo-name (no podemos renderizar
      // un fullbleed sin imagen: quedaría un bloque vacío/roto).
      return renderLogoName();
    }
    return (
      <header
        className="relative h-64 -mt-6 -mx-4 mb-4 overflow-hidden animate-fade-in"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.45),rgba(0,0,0,0.55)), url(${heroImg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center p-6">
          {settings.logoUrl && (
            <img
              src={settings.logoUrl}
              alt={name}
              className="w-20 h-20 rounded-2xl object-cover border-4 border-white/30 mb-3 shadow-2xl"
            />
          )}
          <h1
            className="text-3xl lg:text-4xl font-black drop-shadow-lg text-balance"
            style={{ fontWeight: settings.typography.titleWeight }}
          >
            {name}
          </h1>
          {tagline && (
            <p className="mt-2 text-sm font-medium italic max-w-xs drop-shadow font-handwritten">
              {tagline}
            </p>
          )}
        </div>
      </header>
    );
  }

  // 'logo-name' o 'logo-name-tagline' comparten el mismo layout base.
  function renderLogoName() {
    return (
      <header className="p-6 pt-8 text-center space-y-3 relative z-10 animate-fade-in">
        <div
          className={`w-24 h-24 backdrop-blur-md rounded-3xl mx-auto mb-4 flex items-center justify-center font-black text-3xl shadow-2xl overflow-hidden border-4 ${logoBoxBorder} transition-transform hover:scale-105 hover:rotate-3`}
          style={{
            backgroundColor: logoBoxBg,
            color: 'var(--color-primary)',
            boxShadow: '0 0 0 4px var(--color-primary)',
          }}
        >
          {settings.logoUrl ? (
            <img
              src={settings.logoUrl}
              alt={name}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-[var(--color-primary)]">
              {name.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        <h1
          className={`text-4xl lg:text-5xl tracking-tight drop-shadow-sm text-balance ${titleColor}`}
          style={{ fontWeight: settings.typography.titleWeight }}
        >
          {name}
        </h1>
        {variant === 'logo-name-tagline' && tagline && (
          <p
            className={`text-sm font-medium italic max-w-xs mx-auto ${subTextColor} font-handwritten`}
          >
            {tagline}
          </p>
        )}
        {showBadge && (
          <div
            className={`inline-flex items-center gap-1.5 px-3 py-1 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-widest border ${pillBg} ${subTextColor}`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)] animate-pulse" />
            {badgeText}
          </div>
        )}
      </header>
    );
  }

  return renderLogoName();
}
