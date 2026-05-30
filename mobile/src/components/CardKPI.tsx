import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useShouldRestrictSensitiveData } from '../context/LocaisSegurosContext';
import { MASKED_MONEY_VALUE } from '../utils/geo';
import { resumoKpiTypography } from '../utils/money';

type Props = {
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  title: string;
  value: string;
  variation?: string;
  variationType?: 'positive' | 'negative';
  /** Percentuais e textos curtos não usam redução de fonte monetária. */
  valueKind?: 'money' | 'text';
};

export function CardKPI({ icon, title, value, variation, variationType, valueKind = 'money' }: Props) {
  const restrict = useShouldRestrictSensitiveData();
  const displayValue = restrict ? MASKED_MONEY_VALUE : value;
  const typo = valueKind === 'money' ? resumoKpiTypography(displayValue) : null;

  return (
    <View style={styles.card}>
      <View style={styles.iconWrap}>
        <MaterialCommunityIcons name={icon} size={18} color="#0d9488" />
      </View>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.valueWrap}>
        {typo ? (
          <Text
            style={[styles.value, { fontSize: typo.fontSize, lineHeight: typo.lineHeight }]}
            numberOfLines={typo.numberOfLines}
            adjustsFontSizeToFit={typo.adjustsFontSizeToFit}
            minimumFontScale={typo.minimumFontScale}
          >
            {displayValue}
          </Text>
        ) : (
          <Text style={styles.value} numberOfLines={1}>
            {displayValue}
          </Text>
        )}
      </View>
      {variation && !restrict && (
        <Text style={[styles.variation, variationType === 'negative' ? styles.negative : styles.positive]}>
          {variation}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#f0fdfa',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  valueWrap: {
    minHeight: 28,
    justifyContent: 'center',
  },
  value: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
  },
  variation: {
    fontSize: 12,
    marginTop: 4,
  },
  positive: {
    color: '#16a34a',
  },
  negative: {
    color: '#dc2626',
  },
});
