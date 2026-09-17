import type { Lang, Platform } from '../types.ts';

/**
 * Shared by the client (to label what you pasted) and the server (to reject
 * links it cannot read). Kept erasable so Node's type stripping can load it
 * straight from `server/`.
 */

const HOSTS: [Platform, string[]][] = [
  ['YOUTUBE', ['youtube.com', 'youtu.be']],
  ['INSTAGRAM', ['instagram.com']],
  ['TIKTOK', ['tiktok.com']],
  ['X', ['x.com', 'twitter.com']],
  ['FACEBOOK', ['facebook.com', 'fb.com', 'fb.watch']],
];

export const PLATFORM_LABEL: Record<Platform, string> = {
  YOUTUBE: 'YouTube',
  INSTAGRAM: 'Instagram',
  TIKTOK: 'TikTok',
  X: 'X',
  FACEBOOK: 'Facebook',
};

/** Prose list for error messages and hints. */
export const PLATFORM_LIST: Record<Lang, string> = {
  id: 'YouTube, Instagram, TikTok, X, atau Facebook',
  en: 'YouTube, Instagram, TikTok, X or Facebook',
};

/** Matches the host itself or any subdomain, so `m.` and `www.` variants resolve. */
export function detectPlatform(href: string): Platform | null {
  let host: string;
  try {
    host = new URL(href).hostname.toLowerCase();
  } catch {
    return null;
  }
  const hit = HOSTS.find(([, hosts]) => hosts.some((h) => host === h || host.endsWith(`.${h}`)));
  return hit ? hit[0] : null;
}
