import Constants from 'expo-constants';

function normalizeBaseUrl(url: string): string {
  return url.replace(/\/+$/, '');
}

function getExpoHostFromRuntime(): string | null {
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri && String(hostUri).trim().length > 0) {
    return String(hostUri).split(':')[0];
  }

  const debuggerHost = (Constants.manifest2 as { extra?: { expoGo?: { debuggerHost?: string } } } | null)?.extra
    ?.expoGo?.debuggerHost;
  if (debuggerHost && String(debuggerHost).trim().length > 0) {
    return String(debuggerHost).split(':')[0];
  }

  return null;
}

function resolveMobileLoopback(url: string): string {
  if (!/(localhost|127\.0\.0\.1)/i.test(url)) return url;
  const host = getExpoHostFromRuntime();
  if (!host) return url;
  return url.replace(/localhost|127\.0\.0\.1/gi, host);
}

function getDynamicBaseUrlFromExpo(port: number, path = ''): string | null {
  const host = getExpoHostFromRuntime();
  if (!host) return null;
  const normalizedPath = path ? (path.startsWith('/') ? path : `/${path}`) : '';
  return `http://${host}:${port}${normalizedPath}`;
}

/**
 * Base da **API-AUTH-MAIL** (`POST /auth/login`). Ex.: `http://192.168.0.10:8083`
 * Se vazio, o login usa `getApiBaseUrl()` (ex.: json-server com `/auth` no mesmo host).
 */
export function getAuthBaseUrl(): string | null {
  const fromEnv = process.env.EXPO_PUBLIC_AUTH_API_URL;
  if (fromEnv && String(fromEnv).trim().length > 0) {
    return normalizeBaseUrl(resolveMobileLoopback(String(fromEnv).trim()));
  }
  const extra = Constants.expoConfig?.extra as { authApiUrl?: string } | undefined;
  if (extra?.authApiUrl && String(extra.authApiUrl).trim().length > 0) {
    return normalizeBaseUrl(resolveMobileLoopback(String(extra.authApiUrl).trim()));
  }
  return null;
}

/**
 * Base da API financeira / mock (ex.: `http://IP:8080/v1` para backend-mobile).
 * Se retornar `null`, as telas ficam sem dados da API até a URL ser definida.
 */
export function getApiBaseUrl(): string | null {
  const fromEnv = process.env.EXPO_PUBLIC_API_URL;
  if (fromEnv && String(fromEnv).trim().length > 0) {
    return normalizeBaseUrl(resolveMobileLoopback(String(fromEnv).trim()));
  }

  const extra = Constants.expoConfig?.extra as { apiUrl?: string } | undefined;
  if (extra?.apiUrl && String(extra.apiUrl).trim().length > 0) {
    return normalizeBaseUrl(resolveMobileLoopback(String(extra.apiUrl).trim()));
  }

  return null;
}

/**
 * Base da API de IA (ex.: `http://IP:8084` para API-IA-MOBILE).
 * Se não definida, retorna `null`.
 */
export function getIaApiBaseUrl(): string | null {
  const fromEnv = process.env.EXPO_PUBLIC_IA_API_URL;
  if (fromEnv && String(fromEnv).trim().length > 0) {
    return normalizeBaseUrl(resolveMobileLoopback(String(fromEnv).trim()));
  }
  const extra = Constants.expoConfig?.extra as { iaApiUrl?: string } | undefined;
  if (extra?.iaApiUrl && String(extra.iaApiUrl).trim().length > 0) {
    return normalizeBaseUrl(resolveMobileLoopback(String(extra.iaApiUrl).trim()));
  }
  const dynamic = getDynamicBaseUrlFromExpo(8084);
  if (dynamic) return normalizeBaseUrl(dynamic);
  return null;
}

/** Base da API ETL (FastAPI), ex.: `http://192.168.0.10:8000` */
export function getEtlApiBaseUrl(): string | null {
  const fromEnv = process.env.EXPO_PUBLIC_ETL_API_URL;
  if (fromEnv && String(fromEnv).trim().length > 0) {
    return normalizeBaseUrl(resolveMobileLoopback(String(fromEnv).trim()));
  }

  const extra = Constants.expoConfig?.extra as { etlApiUrl?: string } | undefined;
  if (extra?.etlApiUrl && String(extra.etlApiUrl).trim().length > 0) {
    return normalizeBaseUrl(resolveMobileLoopback(String(extra.etlApiUrl).trim()));
  }
  const dynamic = getDynamicBaseUrlFromExpo(8000);
  if (dynamic) return normalizeBaseUrl(dynamic);

  return null;
}

/** URL usada só no fluxo de login (`/auth/login`). */
export function getLoginApiBaseUrl(): string | null {
  return getAuthBaseUrl() ?? getApiBaseUrl();
}
