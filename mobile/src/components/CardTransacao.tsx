import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { TagStatus } from './TagStatus';
import { useShouldRestrictSensitiveData } from '../context/LocaisSegurosContext';
import { MASKED_MONEY_VALUE, maskIfRestricted } from '../utils/geo';

type Props = {
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  title: string;
  subtitle: string;
  value: string;
  type: 'receita' | 'despesa';
  status: 'pago' | 'pendente' | 'atrasado' | 'em-dia' | 'cancelado';
  onPress?: () => void;
};

export function CardTransacao({ icon, title, subtitle, value, type, status, onPress }: Props) {
  const restrict = useShouldRestrictSensitiveData();
  const displayValue = restrict ? MASKED_MONEY_VALUE : value;
  const displayTitle = maskIfRestricted(title, restrict);
  const displaySubtitle = maskIfRestricted(subtitle, restrict);
  const isReceita = type === 'receita';
  return (
    <Pressable onPress={onPress} style={styles.card}>
      <View style={[styles.iconWrap, isReceita ? styles.iconReceita : styles.iconDespesa]}>
        <MaterialCommunityIcons
          name={icon}
          size={20}
          color={isReceita ? '#16a34a' : '#dc2626'}
        />
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>{displayTitle}</Text>
        <Text style={styles.subtitle}>{displaySubtitle}</Text>
      </View>
      <View style={styles.right}>
        <Text style={[styles.value, isReceita ? styles.valueReceita : styles.valueDespesa]}>
          {restrict ? displayValue : `${isReceita ? '+' : '-'} ${displayValue}`}
        </Text>
        <TagStatus status={status} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconReceita: {
    backgroundColor: '#dcfce7',
  },
  iconDespesa: {
    backgroundColor: '#fee2e2',
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  right: {
    alignItems: 'flex-end',
  },
  value: {
    fontSize: 16,
    fontWeight: '600',
  },
  valueReceita: {
    color: '#16a34a',
  },
  valueDespesa: {
    color: '#dc2626',
  },
});
