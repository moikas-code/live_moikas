import './globals.css';
import { ReactNode } from 'react';
import { Analytics } from "@vercel/analytics/next";
import { default_metadata } from '@/lib/seo_metadata';
import { ThemeHydrationFix } from '@/components/ThemeHydrationFix';
import type { Metadata } from 'next';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-base-200 min-h-screen">
        <ThemeHydrationFix>{children}</ThemeHydrationFix>
        <Analytics />
      </body>
    </html>
  );
}

export const metadata: Metadata = default_metadata;
