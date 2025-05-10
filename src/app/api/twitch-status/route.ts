import { NextRequest, NextResponse } from 'next/server';
import { get_live_streams, get_twitch_users } from '@/lib/twitch_api';
import creators from '@/data/creators.json';

// Simple in-memory cache
let cache: { data: any; expires: number } | null = null;
const CACHE_TTL = 60; // seconds

export async function GET(req: NextRequest) {
  if (cache && Date.now() < cache.expires) {
    return NextResponse.json(cache.data);
  }

  const all_creators = ['moikapy', ...creators];
  // Twitch API allows up to 100 logins per request
  const live_streams = await get_live_streams(all_creators);
  const live_map: Record<string, any> = {};
  for (const stream of live_streams) {
    live_map[stream.user_login.toLowerCase()] = stream;
  }
  // Get user info for all creators
  const users = await get_twitch_users(all_creators);
  const user_map: Record<string, any> = {};
  for (const user of users) {
    user_map[user.login.toLowerCase()] = user;
  }
  const result = all_creators.map((login) => {
    const lower = login.toLowerCase();
    return {
      login,
      live: !!live_map[lower],
      stream: live_map[lower] || null,
      user: user_map[lower] || null,
    };
  });
  cache = { data: result, expires: Date.now() + CACHE_TTL * 1000 };
  return NextResponse.json(result);
} 