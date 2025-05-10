"use client";
import './globals.css';
import { ReactNode, useEffect } from 'react';

function ThemeHydrationFix({ children }: { children: ReactNode }) {
  useEffect(() => {
    const theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', theme);
  }, []);
  return <>{children}</>;
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-base-200 min-h-screen">
        <ThemeHydrationFix>{children}</ThemeHydrationFix>
      </body>
    </html>
  );
}
