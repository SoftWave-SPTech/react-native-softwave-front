/** Distância em metros entre dois pontos (fórmula de Haversine). */
export function distanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function isWithinRadiusMeters(
  userLat: number,
  userLon: number,
  placeLat: number,
  placeLon: number,
  radiusMeters: number,
): boolean {
  return distanceMeters(userLat, userLon, placeLat, placeLon) <= radiusMeters;
}

export const MASKED_MONEY_VALUE = '••••••';
export const MASKED_TEXT_VALUE = '••••••••';

export function maskIfRestricted(value: string, restrict: boolean): string {
  return restrict ? MASKED_TEXT_VALUE : value;
}
