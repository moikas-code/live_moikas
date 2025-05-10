'use client';
import { useEffect, useState } from 'react';
import CreatorCard from '@/components/CreatorCard';
import StreamEmbed from '@/components/StreamEmbed';
import Image from 'next/image';

export interface StreamData {
  title: string;
  game_name?: string;
  viewer_count: number;
  thumbnail_url?: string;
  // add other fields as needed
}

export interface UserData {
  display_name: string;
  profile_image_url: string;
  description?: string;
  // add other fields as needed
}

interface CreatorStatus {
  login: string;
  live: boolean;
  stream: StreamData | null;
  user: UserData | null;
  affiliate: boolean;
}

export default function HomePage() {
  const [creators, setCreators] = useState<CreatorStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [parent_domains, set_parent_domains] = useState<string[]>(['localhost']);
  const filtered_offline = creators.filter((c) => !c.live);
  const [show_offline, set_show_offline] = useState(false);

  useEffect(() => {
    async function fetchStatus() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/twitch-status');
        if (!res.ok) throw new Error('Failed to fetch Twitch status');
        const data = await res.json();
        setCreators(data);
      } catch (e: unknown) {
        if (e instanceof Error) {
          setError(e.message);
        } else {
          setError('Unknown error');
        }
      } finally {
        setLoading(false);
      }
    }
    fetchStatus();
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      set_parent_domains([window.location.hostname]);
    }
  }, []);

  // Determine main stream logic
  const online_creators = creators.filter((c) => c.live);
  let main: CreatorStatus | undefined;
  if (online_creators.some((c) => c.login.toLowerCase() === 'moikapy')) {
    main = creators.find((c) => c.login.toLowerCase() === 'moikapy');
  } else if (online_creators.length > 0) {
    main = online_creators.reduce((min, c) =>
      (c.stream?.viewer_count ?? 0) < (min.stream?.viewer_count ?? 0) ? c : min,
      online_creators[0]
    );
  } else {
    main = creators.find((c) => c.login.toLowerCase() === 'moikapy');
  }
  const mainLogin = main?.login || 'moikapy';
  const others = creators.filter((c) => c.login.toLowerCase() !== mainLogin.toLowerCase());
  const filtered = others.filter((c) => c.live).filter((c) =>
    c.login.toLowerCase().includes(search.toLowerCase()) ||
    c.user?.display_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="container mx-auto px-2 py-8 max-w-6xl">
      <nav className="navbar bg-base-100 rounded-lg mb-8 flex flex-col md:flex-row gap-2 md:gap-0 justify-between items-center">
        <div className="text-3xl font-extrabold">live.moikas</div>
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
        {loading ? (
          <div className="skeleton h-96 w-full rounded-lg" aria-busy="true" />
        ) : error ? (
          <div className="alert alert-error">{error}</div>
        ) : main ? (
          <div className="w-full max-w-4xl mx-auto">
            <div className="w-full aspect-[16/9] rounded-lg overflow-hidden bg-black mb-4">
              <StreamEmbed
                channel={main.login}
                live={main.live}
                parent={parent_domains}
                should_autoplay={true}
              />
            </div>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
              <div className="flex items-center gap-4">
                {main.user?.profile_image_url && (
                  <Image
                    src={main.user.profile_image_url}
                    alt={main.user.display_name || main.login}
                    width={64}
                    height={64}
                    className="w-16 h-16 rounded-full border-2 border-base-300 shadow object-cover hidden md:block"
                  />
                )}
                <div className="flex flex-col gap-1 max-w-[600px]">
                  <div className="text-sm md:text-2xl font-bold">{main.user?.display_name || main.login}</div>
                  {main.live && main.stream?.title && (
                    <div
                      className="text-xs font-semibold mt-1 mb-1 text-ellipsis overflow-hidden"
                      title={main.stream.title}
                    >
                      {main.stream.title.length > 100
                        ? main.stream.title.slice(0, 100) + '...'
                        : main.stream.title}
                    </div>
                  )}
                  {main.user?.description && (
                    <div className="text-xs text-base-content/60 mt-1">{main.user.description}</div>
                  )}
                </div>
              </div>
              <div className="flex flex-col items-start md:items-end gap-1">
                {main.live && main.stream ? (
                  <>
                    {main.stream.game_name && (
                      <span className="text-xs text-purple-800 bg-purple-100 rounded px-2 py-1 w-fit mb-1" style={{letterSpacing: '0.5px'}}>{main.stream.game_name}</span>
                    )}
                    <span className="text-xs">Viewers: {main.stream.viewer_count}</span>
                  </>
                ) : (
                  <span className="text-sm font-bold text-red-800 bg-red-100 rounded px-2 py-1 w-fit" style={{letterSpacing: '0.5px'}}>Offline</span>
                )}
              </div>
            </div>
          </div>
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
              filtered.sort((a, b) => (a.stream?.viewer_count ?? 0) - (b.stream?.viewer_count ?? 0)).map((c) => (
                <CreatorCard
                  key={c.login}
                  {...c}
                  affiliate={c.affiliate}
                  onViewStream={() => {
                    if (typeof window !== 'undefined') {
                      localStorage.setItem('main_stream_login', c.login);
                    }
                    window.location.reload();
                  }}
                />
              ))
            )}
          </div>
        )}
      </section>
      {/* Offline section */}
      {filtered_offline.length > 0 && (
        <section className="bg-base-200 rounded-lg p-6 mt-4">
          <button
            className="btn btn-sm btn-ghost mb-4"
            onClick={() => set_show_offline((v) => !v)}
            aria-expanded={show_offline}
            aria-controls="offline-creators-section"
          >
            {show_offline ? 'Hide Offline Creators' : `Show Offline Creators (${filtered_offline.length})`}
          </button>
          <div
            id="offline-creators-section"
            className={show_offline ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8' : 'hidden'}
          >
            {filtered_offline.map((c) => (
              <CreatorCard key={c.login} {...c} affiliate={c.affiliate} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
