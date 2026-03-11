import { StyleSheet } from 'react-native';

export const shadow = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.08,
  shadowRadius: 8,
  elevation: 3,
} as const;

export const shadowSm = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.05,
  shadowRadius: 4,
  elevation: 2,
} as const;

export const card = {
  backgroundColor: '#fff',
  borderRadius: 16,
  padding: 16,
  ...shadow,
} as const;
