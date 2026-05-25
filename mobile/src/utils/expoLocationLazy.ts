type ExpoLocationModule = typeof import('expo-location');

let cached: ExpoLocationModule | null = null;

/** Carrega expo-location só quando necessário (evita crash na abertura no Expo Go). */
export async function loadExpoLocation(): Promise<ExpoLocationModule> {
  if (!cached) {
    cached = await import('expo-location');
  }
  return cached;
}
