import { getStoredLocale } from '@/lib/locale';

export const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/v1';
export const TENANT_ID = process.env.NEXT_PUBLIC_TENANT_ID ?? 'default-tenant';

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public body?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    phone: string;
    role: string;
    name?: string;
  };
}

const STORAGE_KEY = 'suqya_auth';

export function getStoredAuth(): AuthSession | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthSession;
  } catch {
    return null;
  }
}

export function setStoredAuth(session: AuthSession | null) {
  if (typeof window === 'undefined') return;
  if (session) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
}

async function refreshAccessToken(refreshToken: string): Promise<AuthSession | null> {
  const res = await fetch(`${API_BASE}/auth/refresh`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept-Language': getStoredLocale(),
    },
    body: JSON.stringify({ refreshToken }),
  });
  if (!res.ok) return null;
  const tokens = await res.json();
  const existing = getStoredAuth();
  if (!existing) return null;
  const updated = { ...existing, ...tokens };
  setStoredAuth(updated);
  return updated;
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  auth = true,
): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set('X-Tenant-Id', TENANT_ID);
  headers.set('Accept-Language', getStoredLocale());
  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json');
  }

  let session = getStoredAuth();
  if (auth && session?.accessToken) {
    headers.set('Authorization', `Bearer ${session.accessToken}`);
  }

  let res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (res.status === 401 && auth && session?.refreshToken) {
    session = await refreshAccessToken(session.refreshToken);
    if (session?.accessToken) {
      headers.set('Authorization', `Bearer ${session.accessToken}`);
      res = await fetch(`${API_BASE}${path}`, { ...options, headers });
    }
  }

  if (!res.ok) {
    let body: unknown;
    try {
      body = await res.json();
    } catch {
      body = await res.text();
    }
    const message =
      typeof body === 'object' && body && 'message' in body
        ? String((body as { message: unknown }).message)
        : `Request failed (${res.status})`;
    throw new ApiError(message, res.status, body);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export async function sendOtp(phone: string) {
  return apiFetch<{ message: string; expiresIn: number }>(
    '/auth/otp/send',
    { method: 'POST', body: JSON.stringify({ phone }) },
    false,
  );
}

export async function verifyOtp(phone: string, code: string, role?: string) {
  const result = await apiFetch<AuthSession>(
    '/auth/otp/verify',
    { method: 'POST', body: JSON.stringify({ phone, code, role }) },
    false,
  );
  setStoredAuth(result);
  return result;
}

export function logout() {
  setStoredAuth(null);
}
