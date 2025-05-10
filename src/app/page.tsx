'use client';
import { useEffect, useState } from 'react';
import CreatorCard from '@/components/CreatorCard';

const PARENT_DOMAINS = [typeof window !== 'undefined' ? window.location.hostname : 'localhost'];

interface CreatorStatus {
  login: string;
  live: boolean;
  stream: any;
  user: any;
}

export default function HomePage() {
  const [creators, setCreators] = useState<CreatorStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function fetchStatus() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/twitch-status');
        if (!res.ok) throw new Error('Failed to fetch Twitch status');
        const data = await res.json();
        setCreators(data);
      } catch (e: any) {
        setError(e.message || 'Unknown error');
      } finally {
        setLoading(false);
      }
    }
    fetchStatus();
  }, []);

  const main = creators.find((c) => c.login.toLowerCase() === 'moikapy');
  const others = creators.filter((c) => c.login.toLowerCase() !== 'moikapy');
  const filtered = others.filter((c) =>
    c.login.toLowerCase().includes(search.toLowerCase()) ||
    c.user?.display_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="container mx-auto px-2 py-8 max-w-6xl">
      <nav className="navbar bg-base-100 rounded-lg mb-8 flex flex-col md:flex-row gap-2 md:gap-0 justify-between items-center">
        <div className="text-3xl font-extrabold">Live Moikas</div>
        <div className="flex gap-2 items-center w-full md:w-auto">
          <input
            type="text"
            className="input input-bordered w-full md:w-64"
            placeholder="Search creators..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search creators"
          />
        </div>
      </nav>
      <section className="mb-12">
        <h1 className="text-4xl font-extrabold mb-4">Moikapy Main Stream</h1>
        {loading ? (
          <div className="skeleton h-64 w-full rounded-lg" aria-busy="true" />
        ) : error ? (
          <div className="alert alert-error">{error}</div>
        ) : main ? (
          <CreatorCard {...main} parent={PARENT_DOMAINS} />
        ) : null}
      </section>
      <div className="my-8 flex items-center" aria-hidden="true">
        <hr className="flex-grow border-t-2 border-base-300" />
        <span className="mx-4 text-lg font-bold text-base-content/60">Other Creators</span>
        <hr className="flex-grow border-t-2 border-base-300" />
      </div>
      <section className="bg-base-200 rounded-lg p-6">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="skeleton h-80 w-full rounded-lg" aria-busy="true" />
            ))}
          </div>
        ) : error ? (
          <div className="alert alert-error">{error}</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {filtered.length === 0 ? (
              <div className="col-span-full text-center text-base-content/60">No creators found.</div>
            ) : (
              filtered.map((c) => (
                <CreatorCard key={c.login} {...c} parent={PARENT_DOMAINS} />
              ))
            )}
          </div>
        )}
      </section>
    </main>
  );
}
