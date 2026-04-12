import { useAuthStore } from '@/stores/auth.store';
import i18n from '@/lib/i18n';

const API_BASE = '/api';

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      const res = await fetch(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!res.ok) return null;
      const data = await res.json();
      const { accessToken, user, teams } = data.data;
      useAuthStore.getState().setAuth(user, accessToken, teams);
      return accessToken;
    } catch {
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const store = useAuthStore.getState();
  let token = store.accessToken;

  const headers = new Headers(options.headers);
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  // Add team ID header
  if (store.activeTeamId) {
    headers.set('X-Team-Id', store.activeTeamId);
  }
  if (options.body && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  let res = await fetch(`${API_BASE}${path}`, { ...options, headers, credentials: 'include' });

  if (res.status === 401 && token) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      headers.set('Authorization', `Bearer ${newToken}`);
      res = await fetch(`${API_BASE}${path}`, { ...options, headers, credentials: 'include' });
    } else {
      useAuthStore.getState().logout();
      throw new Error(i18n.t('errors.sessionExpired'));
    }
  }

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: i18n.t('errors.requestFailed', { status: res.status }) }));
    throw new Error(error.message || i18n.t('errors.httpStatus', { status: res.status }));
  }

  return res.json();
}

export function apiGet<T>(path: string) {
  return apiFetch<T>(path);
}

export function apiPost<T>(path: string, body?: unknown) {
  return apiFetch<T>(path, {
    method: 'POST',
    body: body instanceof FormData ? body : JSON.stringify(body ?? {}),
  });
}

export function apiPut<T>(path: string, body?: unknown) {
  return apiFetch<T>(path, {
    method: 'POST',
    body: body instanceof FormData ? body : JSON.stringify(body ?? {}),
  });
}

export function apiDelete<T>(path: string) {
  return apiFetch<T>(path + '/delete', { method: 'POST', body: JSON.stringify({}) });
}
