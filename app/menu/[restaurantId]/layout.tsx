import { Inter, Playfair_Display, Bebas_Neue, Caveat } from 'next/font/google';

// Inter también se carga aquí (con --font-sans) para que `font-sans` en Tailwind
// apunte a Inter sin depender de variables heredadas del root layout.
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-serif',
});

const bebas = Bebas_Neue({
  subsets: ['latin'],
  display: 'swap',
  weight: '400',
  variable: '--font-display',
});

const caveat = Caveat({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-handwritten',
});

export default function MenuLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`${inter.variable} ${playfair.variable} ${bebas.variable} ${caveat.variable}`}
    >
      {children}
    </div>
  );
}
