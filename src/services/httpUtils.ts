import type { ApiError, AuthResponse } from '../types';

export const BASE_URL = import.meta.env.VITE_API_URL ?? '';

function statusFallback(status: number): string {
  if (status === 400) return 'Невірний запит. Перевірте введені дані.';
  if (status === 401) return 'Сесія закінчилась. Увійдіть знову.';
  if (status === 403) return 'У вас немає доступу до цієї дії.';
  if (status === 404) return 'Запитаний ресурс не знайдено.';
  if (status === 409) return 'Конфлікт — ресурс вже існує або зайнятий.';
  if (status >= 500) return 'Щось пішло не так на сервері. Спробуйте ще раз пізніше.';
  return 'Щось пішло не так. Спробуйте ще раз.';
}

export async function parseError(res: Response): Promise<never> {
  let body: ApiError;
  try {
    body = await res.json();
  } catch {
    body = { message: statusFallback(res.status) };
  }
  const message = body.message || statusFallback(res.status);
  const err = new Error(message) as Error & { errors?: ApiError['errors'] };
  err.errors = body.errors;
  throw err;
}

// ---------------------------------------------------------------------------
// Token store + 401-driven refresh-and-retry
// ---------------------------------------------------------------------------

interface TokenStore {
  getAccessToken: () => string | null;
  getRefreshToken: () => string | null;
  onRefreshed: (data: AuthResponse) => void;
  onRefreshFailed: () => void;
}

let store: TokenStore | null = null;

export function registerTokenStore(s: TokenStore): void {
  store = s;
}

let refreshInFlight: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  if (!store) return null;
  const rt = store.getRefreshToken();
  if (!rt) {
    store.onRefreshFailed();
    return null;
  }
  if (refreshInFlight) return refreshInFlight;

  refreshInFlight = (async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: rt }),
      });
      if (!res.ok) {
        store!.onRefreshFailed();
        return null;
      }
      const data = (await res.json()) as AuthResponse;
      store!.onRefreshed(data);
      return data.accessToken;
    } catch {
      store!.onRefreshFailed();
      return null;
    } finally {
      refreshInFlight = null;
    }
  })();

  return refreshInFlight;
}

function withAuthHeader(init: RequestInit | undefined, token: string): RequestInit {
  const headers = new Headers(init?.headers);
  headers.set('Authorization', `Bearer ${token}`);
  return { ...init, headers };
}

/**
 * Authenticated fetch. Attaches the current access token, and on a 401 it
 * silently calls /api/auth/refresh once, then retries the original request.
 * If the refresh itself fails, the registered store is told to log out.
 */
export async function authFetch(input: string, init?: RequestInit): Promise<Response> {
  const token = store?.getAccessToken() ?? null;
  const firstInit = token ? withAuthHeader(init, token) : init;
  const res = await fetch(input, firstInit);
  if (res.status !== 401) return res;

  const newToken = await refreshAccessToken();
  if (!newToken) return res; // refresh failed → return the original 401

  return fetch(input, withAuthHeader(init, newToken));
}
