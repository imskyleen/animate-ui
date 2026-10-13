import { RootProvider } from 'fumadocs-ui/provider/next';
import type { Metadata } from 'next';
import { Outfit } from 'next/font/google';

import { Toaster } from '@/components/ui/sonner';

import './global.css';

export const metadata: Metadata = {
  title: {
    template: '%s - Animate UI',
    default: 'Animate UI - Animated primitives for React',
  },
  description:
    'Animated drop-in primitives for Radix UI, Base UI and React Aria, built with Motion. Swap the import and your shadcn/ui components animate.',
  metadataBase: new URL('https://animate-ui.com'),
  icons: [
    {
      rel: 'icon',
      type: 'image/png',
      sizes: '32x32',
      url: '/favicon-32x32.png',
    },
    {
      rel: 'icon',
      type: 'image/png',
      sizes: '16x16',
      url: '/favicon-16x16.png',
    },
    { rel: 'apple-touch-icon', sizes: '180x180', url: '/apple-touch-icon.png' },
  ],
};

const outfit = Outfit({ subsets: ['latin'] });

export default function Layout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" className={outfit.className} suppressHydrationWarning>
      <body className="flex min-h-screen flex-col">
        <RootProvider>
          {children}
          <Toaster position="top-center" />
        </RootProvider>
      </body>
    </html>
  );
}
