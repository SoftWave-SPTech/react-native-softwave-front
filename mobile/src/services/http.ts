import { getApiBaseUrl } from '../config/api';

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

function buildUrl(path: string): string {
  const base = getApiBaseUrl();
  if (!base) {
    throw new ApiError('API não configurada (defina EXPO_PUBLIC_API_URL).');
  }
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${base}${normalized}`;
}

export async function apiFetch(
  path: string,
  options: RequestInit & { token?: string | null } = {},
): Promise<Response> {
  const { token, headers: inputHeaders, ...rest } = options;
  const headers = new Headers(inputHeaders);
  headers.set('Accept', 'application/json');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  if (rest.body != null && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  return fetch(buildUrl(path), { ...rest, headers });
}

export async function apiGetJson<T>(path: string, token: string | null): Promise<T> {
  const res = await apiFetch(path, { method: 'GET', token });
  if (!res.ok) {
    const body = await res.text();
    throw new ApiError(body || res.statusText, res.status);
  }
  return res.json() as Promise<T>;
}

export async function apiPatchJson<T>(path: string, token: string | null, body: unknown): Promise<T> {
  const res = await apiFetch(path, {
    method: 'PATCH',
    token,
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new ApiError(text || res.statusText, res.status);
  }
  return res.json() as Promise<T>;
}

export async function apiPutJson<T>(path: string, token: string | null, body?: unknown): Promise<T> {
  const res = await apiFetch(path, {
    method: 'PUT',
    token,
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new ApiError(text || res.statusText, res.status);
  }
  return res.json() as Promise<T>;
}

export async function apiPostJson<T>(path: string, token: string | null, body: unknown): Promise<T> {
  const res = await apiFetch(path, {
    method: 'POST',
    token,
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new ApiError(text || res.statusText, res.status);
  }
  return res.json() as Promise<T>;
}

export async function apiDeleteJson(path: string, token: string | null): Promise<void> {
  const res = await apiFetch(path, { method: 'DELETE', token });
  if (!res.ok) {
    const text = await res.text();
    throw new ApiError(text || res.statusText, res.status);
  }
}
