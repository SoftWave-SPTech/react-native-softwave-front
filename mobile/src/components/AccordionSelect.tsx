import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export type SelectOption = {
  value: string;
  label: string;
};

type Props = {
  label: string;
  required?: boolean;
  placeholder?: string;
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  icon?: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
};

export function AccordionSelect({
  label,
  required,
  placeholder = 'Selecione...',
  options,
  value,
  onChange,
  icon = 'chevron-down',
}: Props) {
  const [open, setOpen] = useState(false);

  const selectedLabel = options.find((o) => o.value === value)?.label ?? '';

  return (
    <View>
      <Pressable
        onPress={() => setOpen((v) => !v)}
        style={[styles.trigger, open && styles.triggerOpen]}
      >
        <View style={styles.triggerLeft}>
          <Text style={styles.label}>
            {label}
            {required && <Text style={styles.required}> *</Text>}
          </Text>
          <Text style={[styles.value, !selectedLabel && styles.placeholder]}>
            {selectedLabel || placeholder}
          </Text>
        </View>
        <MaterialCommunityIcons
          name={open ? 'chevron-up' : 'chevron-down'}
          size={22}
          color="#6b7280"
        />
      </Pressable>

      {open && (
        <View style={styles.dropdown}>
          {options.map((opt, idx) => {
            const isSelected = opt.value === value;
            const isLast = idx === options.length - 1;
            return (
              <Pressable
                key={opt.value}
                onPress={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                style={[styles.option, !isLast && styles.optionBorder]}
              >
                <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                  {opt.label}
                </Text>
                {isSelected && (
                  <MaterialCommunityIcons name="check" size={18} color="#2563eb" />
                )}
              </Pressable>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  trigger: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 2,
  },
  triggerOpen: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    shadowOpacity: 0,
    elevation: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  triggerLeft: {
    flex: 1,
  },
  label: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 4,
  },
  required: {
    color: '#ef4444',
  },
  value: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '500',
  },
  placeholder: {
    color: '#9ca3af',
    fontWeight: '400',
  },
  dropdown: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  optionBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  optionText: {
    fontSize: 16,
    color: '#374151',
  },
  optionTextSelected: {
    color: '#2563eb',
    fontWeight: '600',
  },
});
