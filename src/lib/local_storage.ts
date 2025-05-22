// Utility for managing user-added streamers in localStorage

const USER_STREAMERS_KEY = 'user_added_streamers';

export function get_user_added_streamers(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(USER_STREAMERS_KEY);
    if (!data) return [];
    const parsed = JSON.parse(data);
    if (Array.isArray(parsed)) {
      return parsed.filter((x) => typeof x === 'string');
    }
    return [];
  } catch {
    return [];
  }
}

export function set_user_added_streamers(usernames: string[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(USER_STREAMERS_KEY, JSON.stringify(usernames));
}

export function add_user_streamer(username: string): void {
  const current = get_user_added_streamers();
  if (!current.includes(username)) {
    set_user_added_streamers([...current, username]);
  }
}

export function remove_user_streamer(username: string): void {
  const current = get_user_added_streamers();
  set_user_added_streamers(current.filter((u) => u !== username));
} 