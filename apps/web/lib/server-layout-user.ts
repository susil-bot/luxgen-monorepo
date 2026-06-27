import type { IncomingMessage } from 'http';
import jwt from 'jsonwebtoken';
import type { LayoutUser } from './app-layout-user';
import { SSR_AUTH_COOKIE_NAMES } from './session';

const AUTH_COOKIE = SSR_AUTH_COOKIE_NAMES.token;
const LAYOUT_USER_COOKIE = SSR_AUTH_COOKIE_NAMES.layoutUser;

function parseCookie(req: IncomingMessage, name: string): string | null {
  const header = req.headers.cookie;
  if (!header) return null;
  const match = header.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

/** Verify JWT cookie and return layout user for SSR (UI-09). */
export function getLayoutUserFromRequest(req: IncomingMessage): LayoutUser | null {
  const secret = process.env.JWT_SECRET;
  if (!secret) return null;

  const token = parseCookie(req, AUTH_COOKIE);
  const rawUser = parseCookie(req, LAYOUT_USER_COOKIE);
  if (!token || !rawUser) return null;

  try {
    jwt.verify(token, secret);
    const parsed = JSON.parse(rawUser) as LayoutUser;
    if (!parsed?.email || !parsed?.role) return null;
    return parsed;
  } catch {
    return null;
  }
}
