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
  affiliate_code?: string;
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
    main = online_creators.reduce(
      (min, c) => ((c.stream?.viewer_count ?? 0) < (min.stream?.viewer_count ?? 0) ? c : min),
      online_creators[0],
    );
  } else {
    main = creators.find((c) => c.login.toLowerCase() === 'moikapy');
  }
  const mainLogin = main?.login || 'moikapy';
  const others = creators.filter((c) => c.login.toLowerCase() !== mainLogin.toLowerCase());
  const filtered = others
    .filter((c) => c.live)
    .filter(
      (c) =>
        c.login.toLowerCase().includes(search.toLowerCase()) ||
        c.user?.display_name?.toLowerCase().includes(search.toLowerCase()),
    );

  return (
    <>
      <main className="container mx-auto px-2 py-8 max-w-6xl">
        <nav className="navbar bg-base-100 rounded-lg mb-8 flex flex-col md:flex-row gap-2 md:gap-0 justify-between items-center">
          <div className="text-3xl font-extrabold mb-2 md:mb-0">live.moikas</div>
          <div className="flex flex-col md:flex-row w-full md:w-auto gap-2 md:gap-2 items-stretch md:items-center">
            <input
              type="text"
              className="input input-bordered w-full md:w-64 mb-2 md:mb-0"
              placeholder="Search creators..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search creators"
            />
            {/* Navbar action buttons: hidden on mobile, flex on md+ */}
            <div className="hidden md:flex flex-row gap-2 w-full md:w-auto">
              <a href="/join" className="btn btn-accent btn-sm font-semibold w-full md:w-auto">
                Join
              </a>
              <a
                href="https://moikas.com"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-success btn-sm font-semibold w-full md:w-auto"
                aria-label="Support Us by buying merch"
              >
                Support Us
              </a>
              <a
                href="https://github.com/moikas-code/live_moikas"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-neutral btn-sm font-semibold flex items-center gap-1 w-full md:w-auto"
                aria-label="Contribute on GitHub"
              >
                {/* GitHub SVG icon */}
                <svg
                  height="18"
                  width="18"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                  aria-hidden="true"
                  className="inline-block align-text-bottom"
                >
                  <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z"></path>
                </svg>
                Contribute
              </a>
            </div>
          </div>
        </nav>
        <section className="mb-12">
          {loading ? (
            <div className="skeleton h-96 w-full rounded-lg" aria-busy="true" />
          ) : error ? (
            <div className="alert alert-error">{error}</div>
          ) : main ? (
            <div className="w-full max-w-4xl mx-auto rounded-4xl p-6 shadow-2xl">
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
                    <div className="text-sm md:text-2xl font-bold">
                      {main.user?.display_name || main.login}
                    </div>
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
                      <div className="text-xs text-base-content/60 mt-1">
                        {main.user.description}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-start md:items-end gap-1">
                  {main.live && main.stream ? (
                    <>
                      {main.stream.game_name && (
                        <span
                          className="text-xs text-purple-800 bg-purple-100 rounded px-2 py-1 w-fit mb-1"
                          style={{ letterSpacing: '0.5px' }}
                        >
                          {main.stream.game_name}
                        </span>
                      )}
                      <span className="text-xs">Viewers: {main.stream.viewer_count}</span>
                      <a
                        href={`https://twitch.tv/${main.login}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-primary btn-xs font-semibold mt-2"
                        aria-label={`Visit ${main.login}'s Twitch channel`}
                      >
                        Visit Stream
                      </a>
                      {main.affiliate && main.affiliate_code && main.affiliate_code !== 'none' && (
                        <a
                          href={`https://moikas.com/${(main?.display_name || main.login) === 'MOIKAPY' ? '/discount/' : ''}${main.affiliate_code}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-info btn-xs font-semibold mt-2"
                          aria-label={`Get merch discount for ${main.user?.display_name || main.login}`}
                        >
                          Get Merch Discount ({main.affiliate_code.toUpperCase()})
                        </a>
                      )}
                    </>
                  ) : (
                    <span
                      className="text-sm font-bold text-red-800 bg-red-100 rounded px-2 py-1 w-fit"
                      style={{ letterSpacing: '0.5px' }}
                    >
                      Offline
                    </span>
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
                <div className="col-span-full text-center text-base-content/60">
                  No creators found.
                </div>
              ) : (
                filtered
                  .sort((a, b) => (a.stream?.viewer_count ?? 0) - (b.stream?.viewer_count ?? 0))
                  .map((c) => (
                    <CreatorCard
                      key={c.login}
                      {...c}
                      affiliate={c.affiliate}
                      affiliate_code={c.affiliate_code}
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
              {show_offline
                ? 'Hide Offline Creators'
                : `Show Offline Creators (${filtered_offline.length})`}
            </button>
            <div
              id="offline-creators-section"
              className={
                show_offline ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8' : 'hidden'
              }
            >
              {filtered_offline.map((c) => (
                <CreatorCard
                  key={c.login}
                  {...c}
                  affiliate={c.affiliate}
                  affiliate_code={c.affiliate_code}
                />
              ))}
            </div>
          </section>
        )}
      </main>
      <footer className="w-full mt-12 py-6 flex flex-col items-center bg-base-100 rounded-lg shadow-inner">
        <span className="text-base-content/60 text-sm mb-2">
          &copy; {new Date().getFullYear()} live.moikas
        </span>
        {/* Mobile action buttons: flex on mobile, hidden on md+ */}
        <div className="flex flex-col gap-2 w-full px-4 md:hidden">
          <a href="/join" className="btn btn-accent btn-xs font-semibold w-full">
            Join
          </a>
          <a
            href="https://moikas.com"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-success btn-xs font-semibold w-full"
            aria-label="Support Us by buying merch"
          >
            Support Us
          </a>
          <a
            href="/changelog"
            className="btn btn-info btn-xs font-semibold w-full"
            aria-label="View Changelog"
          >
            Changelog
          </a>
          <a
            href="https://github.com/moikas-code/live_moikas"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-neutral btn-xs font-semibold flex items-center gap-1 w-full"
            aria-label="Contribute on GitHub"
          >
            <svg
              height="16"
              width="16"
              viewBox="0 0 16 16"
              fill="currentColor"
              aria-hidden="true"
              className="inline-block align-text-bottom"
            >
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z"></path>
            </svg>
            Contribute on GitHub
          </a>
        </div>
        {/* Desktop footer buttons remain as before */}
        <div className="hidden md:flex gap-2">
          <a href="/join" className="btn btn-accent btn-xs font-semibold">
            Join
          </a>
          <a
            href="https://moikas.com"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-success btn-xs font-semibold"
            aria-label="Support Us by buying merch"
          >
            Support Us
          </a>
          <a
            href="/changelog"
            className="btn btn-info btn-xs font-semibold"
            aria-label="View Changelog"
          >
            Changelog
          </a>
          <a
            href="https://github.com/moikas-code/live_moikas"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-neutral btn-xs font-semibold flex items-center gap-1"
            aria-label="Contribute on GitHub"
          >
            <svg
              height="16"
              width="16"
              viewBox="0 0 16 16"
              fill="currentColor"
              aria-hidden="true"
              className="inline-block align-text-bottom"
            >
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z"></path>
            </svg>
            Contribute on GitHub
          </a>
        </div>
      </footer>
    </>
  );
}
