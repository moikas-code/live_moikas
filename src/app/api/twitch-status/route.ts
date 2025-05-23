import { NextResponse } from 'next/server';
import { get_live_streams, get_twitch_users } from '@/lib/twitch_api';
import creators from '@/data/creators.json';
import type { TwitchUser, TwitchStream } from '@/lib/twitch_api';

// Simple in-memory cache
let cache: { data: CreatorStatus[]; expires: number } | null = null;
const CACHE_TTL = 60; // seconds

interface CreatorStatus {
  login: string;
  live: boolean;
  stream: TwitchStream | null;
  user: TwitchUser | null;
  affiliate?: boolean;
  affiliate_code: string | undefined;
  user_added?: boolean;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const users_param = url.searchParams.get('users');
  if (users_param) {
    // Fetch arbitrary users
    const logins = users_param
      .split(',')
      .map((u) => u.trim().toLowerCase())
      .filter((u) => u.length > 0);
    if (logins.length === 0) {
      return NextResponse.json([]);
    }
    // Twitch API allows up to 100 logins per request
    const live_streams: TwitchStream[] = await get_live_streams(logins);
    const live_map: Record<string, TwitchStream> = {};
    for (const stream of live_streams) {
      live_map[stream.user_login.toLowerCase()] = stream;
    }
    const users: TwitchUser[] = await get_twitch_users(logins);
    const user_map: Record<string, TwitchUser> = {};
    for (const user of users) {
      user_map[user.login.toLowerCase()] = user;
    }
    const result: CreatorStatus[] = logins.map((login) => {
      const lower = login.toLowerCase();
      return {
        login,
        live: !!live_map[lower],
        stream: live_map[lower] || null,
        user: user_map[lower] || null,
        affiliate: false,
        affiliate_code: undefined,
        user_added: true,
      };
    });
    const response = NextResponse.json(result);
    response.headers.set('Cache-Control', 's-maxage=30, stale-while-revalidate=60');
    return response;
  }

  if (cache && Date.now() < cache.expires) {
    const response = NextResponse.json(cache.data);
    response.headers.set('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
    return response;
  }

  // Extract user_name, affiliate, and affiliate_code from creators.json
  const creator_objs: { user_name: string; affiliate: boolean; affiliate_code: string }[] = creators;
  const all_creators: { login: string; affiliate: boolean; affiliate_code: string }[] = [
    { login: 'moikapy', affiliate: true, affiliate_code: 'moikapy' },
    ...creator_objs.map((c) => ({ login: c.user_name, affiliate: c.affiliate, affiliate_code: c.affiliate_code })),
  ];
  const all_logins = all_creators.map((c) => c.login);

  // Twitch API allows up to 100 logins per request
  const live_streams: TwitchStream[] = await get_live_streams(all_logins);
  const live_map: Record<string, TwitchStream> = {};
  for (const stream of live_streams) {
    live_map[stream.user_login.toLowerCase()] = stream;
  }
  // Get user info for all creators
  const users: TwitchUser[] = await get_twitch_users(all_logins);
  const user_map: Record<string, TwitchUser> = {};
  for (const user of users) {
    user_map[user.login.toLowerCase()] = user;
  }
  const result = all_creators.map(({ login, affiliate, affiliate_code }) => {
    const lower = login.toLowerCase();
    return {
      login,
      live: !!live_map[lower],
      stream: live_map[lower] || null,
      user: user_map[lower] || null,
      affiliate,
      affiliate_code,
    };
  });
  cache = { data: result, expires: Date.now() + CACHE_TTL * 1000 };
  const response = NextResponse.json(result);
  response.headers.set('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
  return response;
} 