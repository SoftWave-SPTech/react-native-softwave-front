import { StyleSheet } from 'react-native';

/** Card informativo (ex.: orientações / FAQ) — mesmo visual em Ajuda e Locais Seguros. */
export const infoCardStyles = StyleSheet.create({
  card: {
    backgroundColor: '#f0fdfa',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#99f6e4',
    marginBottom: 16,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: '#115e59',
    marginBottom: 8,
  },
  text: {
    fontSize: 13,
    color: '#0f766e',
    lineHeight: 19,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 6,
  },
  bullet: {
    fontSize: 14,
    lineHeight: 20,
    color: '#0f766e',
  },
  item: {
    flex: 1,
    fontSize: 13,
    color: '#0f766e',
    lineHeight: 20,
  },
});
