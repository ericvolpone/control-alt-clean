import type { Metadata, Viewport } from 'next';
import { Baloo_2, Quicksand } from 'next/font/google';
import './globals.css';

const quicksand = Quicksand({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

const baloo = Baloo_2({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  variable: '--font-display',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Control Alt Clean',
  description: 'A bubbly pastel chore tracker that keeps your home sparkling.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#ff8fc7',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${quicksand.variable} ${baloo.variable}`}>
      <body
        style={{
          fontFamily: 'var(--font-body), system-ui, sans-serif',
        }}
      >
        {children}
      </body>
    </html>
  );
}
