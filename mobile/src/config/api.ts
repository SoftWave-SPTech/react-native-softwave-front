import Constants from 'expo-constants';

function normalizeBaseUrl(url: string): string {
  return url.replace(/\/+$/, '');
}

/**
 * Base da **API-AUTH-MAIL** (`POST /auth/login`). Ex.: `http://192.168.0.10:8083`
 * Se vazio, o login usa `getApiBaseUrl()` (ex.: json-server com `/auth` no mesmo host).
 */
export function getAuthBaseUrl(): string | null {
  const fromEnv = process.env.EXPO_PUBLIC_AUTH_API_URL;
  if (fromEnv && String(fromEnv).trim().length > 0) {
    return normalizeBaseUrl(String(fromEnv).trim());
  }
  const extra = Constants.expoConfig?.extra as { authApiUrl?: string } | undefined;
  if (extra?.authApiUrl && String(extra.authApiUrl).trim().length > 0) {
    return normalizeBaseUrl(String(extra.authApiUrl).trim());
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
    return normalizeBaseUrl(String(fromEnv).trim());
  }

  const extra = Constants.expoConfig?.extra as { apiUrl?: string } | undefined;
  if (extra?.apiUrl && String(extra.apiUrl).trim().length > 0) {
    return normalizeBaseUrl(String(extra.apiUrl).trim());
  }

  return null;
}

/** URL usada só no fluxo de login (`/auth/login`). */
export function getLoginApiBaseUrl(): string | null {
  return getAuthBaseUrl() ?? getApiBaseUrl();
}
