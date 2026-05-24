import { StyleSheet } from 'react-native';

export type LocalSeguroMapPreviewProps = {
  latitude: number;
  longitude: number;
  raioMetros: number;
  height?: number;
};

export const mapPreviewStyles = StyleSheet.create({
  mapWrap: {
    width: '100%',
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#e5e7eb',
  },
  placeholder: {
    width: '100%',
    borderRadius: 14,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  placeholderText: {
    marginTop: 8,
    fontSize: 13,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 18,
  },
});

export function hasValidCoords(latitude: number, longitude: number): boolean {
  return Number.isFinite(latitude) && Number.isFinite(longitude) && (latitude !== 0 || longitude !== 0);
}
