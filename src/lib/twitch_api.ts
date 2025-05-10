import axios from 'axios';

const TWITCH_TOKEN_URL = 'https://id.twitch.tv/oauth2/token';
const TWITCH_HELIX_URL = 'https://api.twitch.tv/helix';

let cached_token: string = '';
let token_expiry = 0;

export interface TwitchUser {
  id: string;
  login: string;
  display_name: string;
  type: string;
  broadcaster_type: string;
  description: string;
  profile_image_url: string;
  offline_image_url: string;
  view_count: number;
  email?: string;
  created_at: string;
}

export interface TwitchStream {
  id: string;
  user_id: string;
  user_login: string;
  user_name: string;
  game_id: string;
  game_name: string;
  type: string;
  title: string;
  viewer_count: number;
  started_at: string;
  language: string;
  thumbnail_url: string;
  tag_ids?: string[];
  is_mature: boolean;
}

/**
 * Get an app access token from Twitch, with in-memory caching.
 */
export async function get_twitch_app_token(): Promise<string> {
  if (cached_token && Date.now() < token_expiry) {
    return cached_token;
  }
  const params = new URLSearchParams({
    client_id: process.env.TWITCH_CLIENT_ID!,
    client_secret: process.env.TWITCH_CLIENT_SECRET!,
    grant_type: 'client_credentials',
  });
  const { data } = await axios.post(TWITCH_TOKEN_URL, params);
  cached_token = data.access_token;
  token_expiry = Date.now() + (data.expires_in - 60) * 1000; // buffer 60s
  return cached_token;
}

/**
 * Get user info for a list of usernames.
 */
export async function get_twitch_users(usernames: string[]): Promise<TwitchUser[]> {
  const token = await get_twitch_app_token();
  const { data } = await axios.get(`${TWITCH_HELIX_URL}/users`, {
    headers: {
      'Client-ID': process.env.TWITCH_CLIENT_ID!,
      Authorization: `Bearer ${token}`,
    },
    params: { login: usernames },
  });
  return data.data;
}

/**
 * Get live stream info for a list of usernames.
 */
export async function get_live_streams(usernames: string[]): Promise<TwitchStream[]> {
  const token = await get_twitch_app_token();
  const { data } = await axios.get(`${TWITCH_HELIX_URL}/streams`, {
    headers: {
      'Client-ID': process.env.TWITCH_CLIENT_ID!,
      Authorization: `Bearer ${token}`,
    },
    params: { user_login: usernames },
  });
  return data.data;
} 