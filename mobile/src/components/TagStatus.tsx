import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

type Status = 'pago' | 'pendente' | 'atrasado' | 'cancelado' | 'encerrado';

type Props = {
  status: Status | string;
};

const statusConfig: Record<Status, { bg: string; text: string }> = {
  pago: { bg: '#dcfce7', text: '#15803d' },
  pendente: { bg: '#fef9c3', text: '#a16207' },
  atrasado: { bg: '#fee2e2', text: '#dc2626' },
  cancelado: { bg: '#f3f4f6', text: '#6b7280' },
  encerrado: { bg: '#f3f4f6', text: '#374151' },
};

const labels: Record<Status, string> = {
  pago: 'Pago',
  pendente: 'Pendente',
  atrasado: 'Atrasado',
  cancelado: 'Cancelado',
  encerrado: 'Encerrado',
};

function normalizeStatus(input: string): Status {
  const normalized = String(input || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')
    .replace(/_/g, '-');

  const aliases: Record<string, Status> = {
    pago: 'pago',
    paga: 'pago',
    paid: 'pago',
    pendente: 'pendente',
    pending: 'pendente',
    atrasado: 'atrasado',
    vencido: 'atrasado',
    overdue: 'atrasado',
    'em-dia': 'pendente',
    emdia: 'pendente',
    'em-dia.': 'pendente',
    adimplente: 'pendente',
    cancelado: 'cancelado',
    cancelada: 'cancelado',
    encerrado: 'encerrado',
    encerrada: 'encerrado',
  };

  return aliases[normalized] ?? 'pendente';
}

export function TagStatus({ status }: Props) {
  const safeStatus = normalizeStatus(status);
  const { bg, text } = statusConfig[safeStatus];
  return (
    <View style={[styles.tag, { backgroundColor: bg }]}>
      <Text style={[styles.label, { color: text }]}>{labels[safeStatus]}</Text>
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
