import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export function LocaisSegurosRestrictedNote() {
  return (
    <View style={styles.wrap}>
      <MaterialCommunityIcons name="shield-lock-outline" size={18} color="#0f766e" />
      <Text style={styles.text}>
        Ações e dados sensíveis disponíveis apenas em um local seguro.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    backgroundColor: '#f0fdfa',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#99f6e4',
    marginTop: 8,
  },
  text: { flex: 1, fontSize: 13, color: '#0f766e', lineHeight: 18 },
});
