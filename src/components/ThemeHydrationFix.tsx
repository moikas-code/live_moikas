"use client";
import { ReactNode, useEffect } from "react";

export function ThemeHydrationFix({ children }: { children: ReactNode }) {
  useEffect(() => {
    const theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', theme);
  }, []);
  return <>{children}</>;
} 