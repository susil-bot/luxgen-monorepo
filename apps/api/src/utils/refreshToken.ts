import jwt, { type SignOptions } from 'jsonwebtoken';
import type { CookieOptions, Response } from 'express';

export const REFRESH_COOKIE_NAME = 'luxgen_refresh';

export interface RefreshTokenPayload {
  id: string;
  email: string;
  tenant?: string;
  role?: string;
}

const DEFAULT_REFRESH_EXPIRES_IN = '30d';
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

function getRefreshSecret(): string {
  const secret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_REFRESH_SECRET or JWT_SECRET is not configured');
  }
  return secret;
}

function refreshExpiresIn(): SignOptions['expiresIn'] {
  return (process.env.JWT_REFRESH_EXPIRES_IN || DEFAULT_REFRESH_EXPIRES_IN) as SignOptions['expiresIn'];
}

export function refreshCookieOptions(): CookieOptions {
  const isProd = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    path: '/api/auth',
    maxAge: refreshMaxAgeMs(),
  };
}

function refreshMaxAgeMs(): number {
  const raw = process.env.JWT_REFRESH_EXPIRES_IN || DEFAULT_REFRESH_EXPIRES_IN;
  const match = /^(\d+)([dhms])$/.exec(raw.trim());
  if (!match) {
    return THIRTY_DAYS_MS;
  }
  const value = Number(match[1]);
  const unit = match[2];
  switch (unit) {
    case 'd':
      return value * 24 * 60 * 60 * 1000;
    case 'h':
      return value * 60 * 60 * 1000;
    case 'm':
      return value * 60 * 1000;
    case 's':
      return value * 1000;
    default:
      return THIRTY_DAYS_MS;
  }
}

export function generateRefreshToken(payload: RefreshTokenPayload): string {
  return jwt.sign(payload, getRefreshSecret(), {
    expiresIn: refreshExpiresIn(),
  });
}

export function verifyRefreshToken(token: string): RefreshTokenPayload | null {
  try {
    return jwt.verify(token, getRefreshSecret()) as RefreshTokenPayload;
  } catch {
    return null;
  }
}

export function setRefreshCookie(res: Response, payload: RefreshTokenPayload): void {
  res.cookie(REFRESH_COOKIE_NAME, generateRefreshToken(payload), refreshCookieOptions());
}

export function clearRefreshCookie(res: Response): void {
  const { secure, sameSite, path } = refreshCookieOptions();
  res.clearCookie(REFRESH_COOKIE_NAME, {
    httpOnly: true,
    secure,
    sameSite,
    path,
  });
}
