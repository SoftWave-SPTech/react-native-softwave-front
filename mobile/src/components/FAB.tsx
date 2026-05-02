import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Props = {
  onPress: () => void;
};

export function FAB({ onPress }: Props) {
  const insets = useSafeAreaInsets();
  return (
    <Pressable onPress={onPress} style={[styles.fab, { bottom: 88 + insets.bottom }]}>
      <MaterialCommunityIcons name="plus" size={28} color="#fff" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#0d9488',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: 'rgb(13, 148, 136)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
});
