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

const LOG_API = true;

function logApi(message: string, extra?: unknown): void {
  if (!LOG_API && !__DEV__) return;
  if (extra !== undefined) {
    // eslint-disable-next-line no-console
    console.log(`[API] ${message}`, extra);
    return;
  }
  // eslint-disable-next-line no-console
  console.log(`[API] ${message}`);
}

function trimForLog(value: string, max = 500): string {
  if (value.length <= max) return value;
  return `${value.slice(0, max)}... [truncated ${value.length - max} chars]`;
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
  const method = (rest.method || 'GET').toUpperCase();
  const url = buildUrl(path);
  const headers = new Headers(inputHeaders);
  headers.set('Accept', 'application/json');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  if (rest.body != null && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  logApi(`${method} ${url} -> request`, {
    hasToken: Boolean(token),
    contentType: headers.get('Content-Type'),
    bodyPreview: typeof rest.body === 'string' ? trimForLog(rest.body) : undefined,
  });

  try {
    const res = await fetch(url, { ...rest, headers });
    logApi(`${method} ${url} -> response ${res.status} ${res.statusText}`);
    return res;
  } catch (error) {
    logApi(`${method} ${url} -> network error`, error);
    throw error;
  }
}

async function throwHttpError(res: Response, path: string): Promise<never> {
  const method = (res.url ? 'HTTP' : 'REQUEST');
  const body = await res.text();
  const details = trimForLog(body || res.statusText || 'Sem corpo de erro');
  logApi(`${method} ${path} -> HTTP ${res.status}`, {
    url: res.url,
    status: res.status,
    statusText: res.statusText,
    body: details,
  });
  throw new ApiError(
    `[${res.status}] ${res.statusText} em ${path}${body ? ` | body: ${details}` : ''}`,
    res.status,
  );
}

export async function apiGetJson<T>(path: string, token: string | null): Promise<T> {
  const res = await apiFetch(path, { method: 'GET', token, cache: 'no-store' });
  if (!res.ok) {
    await throwHttpError(res, path);
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
    await throwHttpError(res, path);
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
    await throwHttpError(res, path);
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
    await throwHttpError(res, path);
  }
  return res.json() as Promise<T>;
}

export async function apiDeleteJson(path: string, token: string | null): Promise<void> {
  const res = await apiFetch(path, { method: 'DELETE', token });
  if (!res.ok) {
    await throwHttpError(res, path);
  }
}
