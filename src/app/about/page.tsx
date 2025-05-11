'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';

const SKELETON_DELAY_MS = 800;

function AboutSkeleton() {
  return (
    <div className="animate-pulse space-y-4 p-6 max-w-2xl mx-auto">
      <div className="h-8 bg-base-200 rounded w-1/3 shimmer" />
      <div className="h-4 bg-base-200 rounded w-2/3 shimmer" />
      <div className="h-4 bg-base-200 rounded w-1/2 shimmer" />
      <div className="h-4 bg-base-200 rounded w-full shimmer" />
      <div className="h-4 bg-base-200 rounded w-5/6 shimmer" />
      <div className="h-4 bg-base-200 rounded w-3/4 shimmer" />
    </div>
  );
}

export default function AboutPage() {
  const [is_loading, set_is_loading] = useState(true);

  useEffect(() => {
    const timeout_id = setTimeout(() => set_is_loading(false), SKELETON_DELAY_MS);
    return () => clearTimeout(timeout_id);
  }, []);

  if (is_loading) {
    return <AboutSkeleton />;
  }

  return (
    <main className="max-w-2xl mx-auto p-6">
      <div className="flex justify-start mb-4">
        <Link href="/" className="btn btn-primary btn-xs font-semibold">
          Home
        </Link>
      </div>
      <h1 className="text-3xl font-bold mb-4">About Live Moikas</h1>
      <p className="mb-2">
        <strong>Live Moikas</strong> is a high-quality web application built to showcase Twitch creators, with a focus on performance, accessibility, and a modern user experience.
      </p>
      <ul className="list-disc list-inside mb-4">
        <li>Main stream display for <code>moikapy</code> with live/offline detection</li>
        <li>Searchable, filterable grid of other Twitch creators</li>
        <li>Responsive, accessible UI using DaisyUI and Tailwind CSS</li>
        <li>Twitch Helix API integration with secure server-side calls</li>
        <li>Performance optimizations (dynamic imports, SSR/SSG, caching)</li>
        <li>ESLint and Prettier for code quality</li>
      </ul>
      <h2 className="text-xl font-semibold mt-6 mb-2">Technologies Used</h2>
      <ul className="list-disc list-inside mb-4">
        <li>Next.js (App Router)</li>
        <li>React 19</li>
        <li>Tailwind CSS & DaisyUI</li>
        <li>TypeScript</li>
        <li>Bun (package manager)</li>
      </ul>
      <p className="text-sm text-base-content/60">
        All code follows strict linting and formatting rules, and uses <span className="font-mono">snake_case</span> for all identifiers. For more details, see the project README.
      </p>
    </main>
  );
}

// Add shimmer effect styling
if (typeof window !== 'undefined') {
  const style_id = 'about-shimmer-style';
  if (!document.getElementById(style_id)) {
    const style = document.createElement('style');
    style.id = style_id;
    style.innerHTML = `
      .shimmer {
        position: relative;
        overflow: hidden;
      }
      .shimmer::after {
        content: '';
        position: absolute;
        top: 0; left: -150%;
        width: 200%; height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent);
        animation: shimmer-move 1.2s infinite;
      }
      @keyframes shimmer-move {
        100% { left: 100%; }
      }
    `;
    document.head.appendChild(style);
  }
} 