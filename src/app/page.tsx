'use client';
import { useEffect, useState } from 'react';
import CreatorCard from '@/components/CreatorCard';
import StreamEmbed from '@/components/StreamEmbed';
import Image from 'next/image';
import TwitchChatPanel from '@/components/TwitchChatPanel';
import Link from 'next/link';
import {
  get_user_added_streamers,
  add_user_streamer,
  remove_user_streamer,
} from '@/lib/local_storage';

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
  offline_image_url?: string;
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
  user_added?: boolean;
}

export default function HomePage() {
  const [creators, setCreators] = useState<CreatorStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [parent_domains, set_parent_domains] = useState<string[]>(['localhost']);
  const filtered_offline = creators.filter((c) => !c.live);
  const [show_offline, set_show_offline] = useState(false);
  const [tv_mode_open, set_tv_mode_open] = useState(false);
  const [chat_open, set_chat_open] = useState(false);
  const [tv_mode_login, set_tv_mode_login] = useState<string | null>(null);
  const [selected_main_login, set_selected_main_login] = useState<string | null>(null);
  const [user_streamers, set_user_streamers] = useState<string[]>([]);
  const [add_streamer_input, set_add_streamer_input] = useState('');
  const [add_streamer_error, set_add_streamer_error] = useState<string | null>(null);
  const [user_streamers_collapsed, set_user_streamers_collapsed] = useState(true);

  // Load user-added streamers from localStorage
  useEffect(() => {
    set_user_streamers(get_user_added_streamers());
  }, []);

  // Merge user-added streamers with creators
  useEffect(() => {
    async function fetchStatus() {
      setLoading(true);
      setError(null);
      try {
        // Merge user streamers with default creators
        const res = await fetch('/api/twitch-status');
        if (!res.ok) throw new Error('Failed to fetch Twitch status');
        let data = await res.json();
        // Add user streamers if not already present
        const user_only = user_streamers.filter(
          (u) => !data.some((c: CreatorStatus) => c.login.toLowerCase() === u.toLowerCase())
        );
        if (user_only.length > 0) {
          // Fetch Twitch info for user-only streamers
          const user_res = await fetch(`/api/twitch-status?users=${user_only.join(',')}`);
          if (user_res.ok) {
            const user_data: CreatorStatus[] = await user_res.json();
            // Mark as not affiliate and with a badge
            user_data.forEach((c) => {
              c.affiliate = false;
              c.affiliate_code = undefined;
              c.user_added = true;
            });
            data = data.concat(user_data);
          }
        }
        // Mark user-added streamers
        (data as CreatorStatus[]).forEach((c) => {
          if (user_streamers.some((u) => u.toLowerCase() === c.login.toLowerCase())) {
            c.user_added = true;
          }
        });
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user_streamers]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      set_parent_domains([window.location.hostname]);
    }
  }, []);

  // Determine main stream logic
  const online_creators = creators.filter((c) => c.live);
  const main_login = selected_main_login
    || (online_creators.some((c) => c.login.toLowerCase() === 'moikapy')
      ? creators.find((c) => c.login.toLowerCase() === 'moikapy')?.login
      : online_creators.length > 0
        ? online_creators.reduce((min, c) => ((c.stream?.viewer_count ?? 0) < (min.stream?.viewer_count ?? 0) ? c : min), online_creators[0]).login
        : creators.find((c) => c.login.toLowerCase() === 'moikapy')?.login
    );
  const main_login_safe = main_login || 'moikapy';
  const main: CreatorStatus | undefined = creators.find((c) => c.login === main_login_safe);
  const others = creators.filter((c) => c.login.toLowerCase() !== main_login_safe.toLowerCase());
  const filtered = others
    .filter((c) => c.live)
    .filter(
      (c) =>
        c.login.toLowerCase().includes(search.toLowerCase()) ||
        c.user?.display_name?.toLowerCase().includes(search.toLowerCase()),
    );

  // Set tv_mode_login to the current main stream when TV Mode is opened
  useEffect(() => {
    if (tv_mode_open && online_creators.length > 0) {
      set_tv_mode_login((prev) => {
        if (prev && online_creators.some((c) => c.login === prev)) return prev;
        return main_login || null;
      });
    }
    if (!tv_mode_open) {
      set_tv_mode_login(null);
    }
  }, [tv_mode_open, main_login, online_creators]);

  // Get the current TV Mode stream
  const tv_mode_index = online_creators.findIndex((c) => c.login === tv_mode_login);
  const tv_mode_stream = tv_mode_index >= 0 ? online_creators[tv_mode_index] : undefined;

  // Handlers for arrow navigation
  const handle_prev = () => {
    if (online_creators.length < 2 || tv_mode_index === -1) return;
    const prev_index = (tv_mode_index - 1 + online_creators.length) % online_creators.length;
    set_tv_mode_login(online_creators[prev_index].login);
  };
  const handle_next = () => {
    if (online_creators.length < 2 || tv_mode_index === -1) return;
    const next_index = (tv_mode_index + 1) % online_creators.length;
    set_tv_mode_login(online_creators[next_index].login);
  };

  // Add streamer handler
  const handle_add_streamer = () => {
    const username = add_streamer_input.trim().toLowerCase();
    if (!username) {
      set_add_streamer_error('Please enter a Twitch username.');
      return;
    }
    if (user_streamers.includes(username)) {
      set_add_streamer_error('This user is already added.');
      return;
    }
    // Prevent adding streamers already in the main creators list
    if (creators.some((c) => c.login.toLowerCase() === username && !c.user_added)) {
      set_add_streamer_error('This streamer is already on the page.');
      return;
    }
    add_user_streamer(username);
    set_user_streamers(get_user_added_streamers());
    set_add_streamer_input('');
    set_add_streamer_error(null);
  };
  // Remove streamer handler
  const handle_remove_streamer = (username: string) => {
    remove_user_streamer(username);
    set_user_streamers(get_user_added_streamers());
  };

  return (
    <>
      {/* TV Mode Overlay */}
      {tv_mode_open && tv_mode_stream && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90">
          <div className="relative flex flex-row w-full max-w-7xl h-[80vh]">
            {/* Stream Video and Chat in a row */}
            <div className="flex flex-row w-full h-full">
              {/* Video: takes remaining space when chat is open, full width when chat is closed */}
              <div className={`relative transition-all duration-300 ${chat_open ? 'flex-1 md:mr-0' : 'w-full'} flex items-center justify-center`}>
                <div className="w-full h-full max-w-4xl aspect-[16/9] bg-black rounded-lg overflow-hidden md:max-w-4xl max-w-full" style={{ width: '100vw' }}>
                  <StreamEmbed
                    channel={tv_mode_stream.login}
                    live={tv_mode_stream.live}
                    parent={parent_domains}
                    should_autoplay={true}
                  />
                  {/* TV Mode Controls and Support Button: bottom row, left/right aligned */}
                  <div className="absolute bottom-2 left-0 right-0 flex flex-row justify-between items-end z-10 px-4">
                    {/* Left: nav, exit, chat */}
                    <div className="flex flex-col gap-2">
                      <div className="flex flex-row gap-2 mb-2">
                        <button
                          className="btn btn-sm btn-circle btn-neutral"
                          aria-label="Previous live user"
                          onClick={handle_prev}
                          disabled={online_creators.length < 2}
                        >
                          &#8592;
                        </button>
                        <button
                          className="btn btn-sm btn-circle btn-neutral"
                          aria-label="Next live user"
                          onClick={handle_next}
                          disabled={online_creators.length < 2}
                        >
                          &#8594;
                        </button>
                      </div>
                      <button
                        className="btn btn-sm btn-error"
                        onClick={() => set_tv_mode_open(false)}
                      >
                        Exit TV Mode
                      </button>
                      <button
                        className="btn btn-sm btn-primary hidden md:block"
                        onClick={() => set_chat_open((v) => !v)}
                      >
                        {chat_open ? 'Hide Chat' : 'Show Chat'}
                      </button>
                    </div>
                    {/* Right: Support Me button */}
                    {tv_mode_stream.affiliate && tv_mode_stream.affiliate_code && tv_mode_stream.affiliate_code !== 'none' && (
                      <a
                        href={`https://moikas.com/${(tv_mode_stream.user?.display_name || tv_mode_stream.login) === 'MOIKAPY' ? 'discount/' : ''}${tv_mode_stream.affiliate_code}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-info btn-xs font-semibold mb-2"
                        aria-label={`Get discount for ${tv_mode_stream.user?.display_name || tv_mode_stream.login}`}
                      >
                        Get Discount ({tv_mode_stream.affiliate_code.toUpperCase()})
                      </a>
                    )}
                  </div>
                </div>
              </div>
              {/* Chat Panel: only visible if chat_open and on md+ */}
              <div className={`transition-all duration-300 hidden md:block ${chat_open ? 'w-[350px]' : 'w-0'} overflow-hidden`} style={{ minWidth: chat_open ? 350 : 0 }}>
                <TwitchChatPanel
                  channel={tv_mode_stream.login}
                  open={chat_open}
                  onClose={() => set_chat_open(false)}
                />
              </div>
            </div>
          </div>
        </div>
      )}
      <main className="container mx-auto px-2 py-8 max-w-6xl">
        <nav className="navbar bg-base-100 rounded-lg mb-8 flex flex-col md:flex-row gap-2 md:gap-0 justify-between items-center">
          <div
            className="text-3xl font-extrabold mb-2 md:mb-0 tracking-wide select-none"
            style={{
              fontFamily: `'M PLUS Rounded 1c', 'Montserrat', 'ui-rounded', 'ui-sans-serif', 'system-ui', sans-serif`,
              background: 'linear-gradient(90deg, #f43f5e 0%, #6366f1 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: '#000',
              textShadow: '0 2px 8px rgba(99,102,241,0.12), 0 1px 0 #fff',
              letterSpacing: '0.04em',
            }}
            aria-label="Live Moikas Home"
          >
            live.moikas
          </div>
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
          ) : main && !tv_mode_open ? (
            <div className="relative w-full max-w-4xl mx-auto rounded-4xl p-6 shadow-2xl">
              <div className="flex flex-row">
                <div className="flex-1 transition-all duration-300">
                  <div className="w-full aspect-[16/9] rounded-lg overflow-hidden bg-black mb-4">
                    <StreamEmbed
                      channel={main.login}
                      live={main.live}
                      parent={parent_domains}
                      should_autoplay={true}
                    />
                  </div>
                  {/* Stream info and controls below video */}
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
                      <div className="flex flex-col gap-1 max-w-[500px]">
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
                              href={`https://moikas.com/${(main.user?.display_name || main.login) === 'MOIKAPY' ? 'discount/' : ''}${main.affiliate_code}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-info btn-xs font-semibold mt-2"
                              aria-label={`Get discount for ${main.user?.display_name || main.login}`}
                            >
                              Get Discount ({main.affiliate_code.toUpperCase()})
                            </a>
                          )}
                          {/* TV Mode button */}
                          <button
                            className="btn btn-sm btn-primary mt-2"
                            onClick={() => set_tv_mode_open(true)}
                          >
                            TV Mode
                          </button>
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
              </div>
            </div>
          ) : null}
        </section>
        <div className="my-8 flex items-center" aria-hidden="true">
          <hr className="flex-grow border-t-2 border-base-300" />
          <span className="mx-4 text-lg font-bold text-base-content/60">Other Creators</span>
          <hr className="flex-grow border-t-2 border-base-300" />
        </div>
        {/* Add streamer UI */}
        <section className="mb-8 bg-base-100 rounded-lg p-4 flex flex-col md:flex-row items-center gap-4">
          <input
            type="text"
            className="input input-bordered w-full md:w-64"
            placeholder="Add Twitch username..."
            value={add_streamer_input}
            onChange={(e) => {
              set_add_streamer_input(e.target.value);
              set_add_streamer_error(null);
            }}
            aria-label="Add Twitch username"
            onKeyDown={(e) => {
              if (e.key === 'Enter') handle_add_streamer();
            }}
          />
          <button className="btn btn-primary" onClick={handle_add_streamer}>
            Add Streamer
          </button>
          {add_streamer_error && <span className="text-error text-sm">{add_streamer_error}</span>}
        </section>
        {/* User-added streamers section */}
        {creators.some((c) => c.user_added) && (
          <section className="mb-8 bg-base-200 rounded-lg p-6">
            <button
              className="btn btn-sm btn-ghost mb-4"
              onClick={() => set_user_streamers_collapsed((v) => !v)}
              aria-expanded={!user_streamers_collapsed}
              aria-controls="user-added-streamers-section"
            >
              {user_streamers_collapsed
                ? `Show My Added Streamers (${creators.filter((c) => c.user_added).length})`
                : 'Hide My Added Streamers'}
            </button>
            <div
              id="user-added-streamers-section"
              className={user_streamers_collapsed ? 'hidden' : 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8'}
            >
              {creators.filter((c) => c.user_added).map((c) => (
                <div key={c.login} className="relative">
                  <CreatorCard
                    {...c}
                    affiliate={c.affiliate}
                    affiliate_code={c.affiliate_code}
                  />
                  <button
                    className="absolute top-2 right-2 btn btn-xs btn-error"
                    onClick={() => handle_remove_streamer(c.login)}
                    aria-label={`Remove ${c.login}`}
                  >
                    Remove
                  </button>
                  <span className="absolute top-2 left-2 badge badge-info">User Added</span>
                </div>
              ))}
            </div>
          </section>
        )}
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
                        set_selected_main_login(c.login);
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
        <span className="text-base-content/60 text-xs mb-4">
          Licensed under the <a href="https://opensource.org/licenses/MIT" target="_blank" rel="noopener noreferrer" className="underline">MIT License</a>
        </span>
        {/* Mobile action buttons: flex on mobile, hidden on md+ */}
        <div className="flex flex-col gap-2 w-full px-4 md:hidden">
          <Link href="/" className="btn btn-primary btn-xs font-semibold w-full">
            Home
          </Link>
          <a href="/about" className="btn btn-secondary btn-xs font-semibold w-full">
            About
          </a>
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
            href="https://x.com/moikas_official"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline btn-xs font-semibold w-full"
            aria-label="Contact Me on X"
          >
            {/* X (Twitter) SVG icon */}
            <svg height="16" width="16" viewBox="0 0 1200 1227" fill="currentColor" aria-hidden="true" className="inline-block align-text-bottom mr-1"><path d="M1200 24.6L741.1 623.2 1192.2 1202.4H1017.6L661.2 749.2 259.2 1202.4H0L484.2 642.7 55.2 24.6H238.8L561.6 445.2 936 24.6H1200ZM960.6 1122.6H1066.8L340.2 104.2H228.6L960.6 1122.6Z"/></svg>
            Contact Me
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
          <Link href="/" className="btn btn-primary btn-xs font-semibold">
            Home
          </Link>
          <a href="/about" className="btn btn-secondary btn-xs font-semibold">
            About
          </a>
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
            href="https://x.com/moikas_official"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline btn-xs font-semibold"
            aria-label="Contact Me on X"
          >
            <svg height="16" width="16" viewBox="0 0 1200 1227" fill="currentColor" aria-hidden="true" className="inline-block align-text-bottom mr-1"><path d="M1200 24.6L741.1 623.2 1192.2 1202.4H1017.6L661.2 749.2 259.2 1202.4H0L484.2 642.7 55.2 24.6H238.8L561.6 445.2 936 24.6H1200ZM960.6 1122.6H1066.8L340.2 104.2H228.6L960.6 1122.6Z"/></svg>
            Contact Me
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
