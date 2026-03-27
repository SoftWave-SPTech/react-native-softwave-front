import Constants from 'expo-constants';

function normalizeBaseUrl(url: string): string {
  return url.replace(/\/+$/, '');
}

/**
 * Base URL da API quando `EXPO_PUBLIC_API_URL` está definida (ex.: JSON Server).
 * Se retornar `null`, o app pode usar mocks locais sem rede.
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
