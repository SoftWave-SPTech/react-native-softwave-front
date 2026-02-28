import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

type Props = {
  percentage: number;
};

export function BarraProgresso({ percentage }: Props) {
  const pct = Math.min(percentage, 100);
  return (
    <View style={styles.container}>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${pct}%` }]} />
      </View>
      <Text style={styles.label}>{pct}%</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  track: { flex: 1, height: 8, backgroundColor: '#e5e7eb', borderRadius: 4, overflow: 'hidden' },
  fill: { height: '100%', backgroundColor: '#eab308', borderRadius: 4 },
  label: { fontSize: 12, color: '#6b7280', width: 36, textAlign: 'right' },
});
