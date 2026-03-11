import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

type Status = 'pago' | 'pendente' | 'atrasado' | 'em-dia' | 'cancelado' | 'encerrado';

type Props = {
  status: Status;
};

const statusConfig: Record<Status, { bg: string; text: string }> = {
  pago: { bg: '#dcfce7', text: '#15803d' },
  pendente: { bg: '#fef9c3', text: '#a16207' },
  atrasado: { bg: '#fee2e2', text: '#dc2626' },
  'em-dia': { bg: '#dbeafe', text: '#2563eb' },
  cancelado: { bg: '#f3f4f6', text: '#6b7280' },
  encerrado: { bg: '#f3f4f6', text: '#374151' },
};

const labels: Record<Status, string> = {
  pago: 'Pago',
  pendente: 'Pendente',
  atrasado: 'Atrasado',
  'em-dia': 'Em dia',
  cancelado: 'Cancelado',
  encerrado: 'Encerrado',
};

export function TagStatus({ status }: Props) {
  const { bg, text } = statusConfig[status];
  return (
    <View style={[styles.tag, { backgroundColor: bg }]}>
      <Text style={[styles.label, { color: text }]}>{labels[status]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    alignSelf: 'flex-start',
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
  },
});
