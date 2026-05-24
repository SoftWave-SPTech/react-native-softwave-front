import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

type Props = {
  value: boolean;
  onValueChange: (v: boolean) => void;
  disabled?: boolean;
};

export function ToggleSwitch({ value, onValueChange, disabled = false }: Props) {
  return (
    <Pressable
      onPress={() => {
        if (!disabled) onValueChange(!value);
      }}
      disabled={disabled}
      style={[styles.track, value && styles.trackOn, disabled && styles.trackDisabled]}
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
    >
      <View style={[styles.thumb, value ? styles.thumbOn : styles.thumbOff]} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  track: {
    width: 52,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#d1d5db',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  trackOn: {
    backgroundColor: '#14b8a6',
  },
  trackDisabled: {
    opacity: 0.45,
  },
  thumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  thumbOff: {
    alignSelf: 'flex-start',
  },
  thumbOn: {
    alignSelf: 'flex-end',
  },
});
