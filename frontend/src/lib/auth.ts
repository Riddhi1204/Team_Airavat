/**
 * Client-side auth token management.
 * Stores JWT in localStorage (adequate for V1 admin auth).
 */

import type { AuthUser, TokenResponse } from '@/types';

const TOKEN_KEY = 'civicpulse_token';
const USER_KEY = 'civicpulse_user';

export function saveAuth(data: TokenResponse): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, data.access_token);
  localStorage.setItem(USER_KEY, JSON.stringify(data.user));
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getUser(): AuthUser | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function clearAuth(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function isAuthenticated(): boolean {
  return !!getToken();
}
