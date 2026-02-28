import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type NavItem = {
  id: string;
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  label: string;
};

const items: NavItem[] = [
  { id: 'Home', icon: 'home', label: 'Home' },
  { id: 'Transacoes', icon: 'receipt', label: 'Transações' },
  { id: 'PagamentosConferir', icon: 'file-document', label: 'Pagamentos' },
  { id: 'Honorarios', icon: 'briefcase', label: 'Honorários' },
  { id: 'Relatorios', icon: 'chart-bar', label: 'Relatórios' },
];

type Props = {
  activeScreen: string;
  onNavigate: (screen: string) => void;
};

export function BottomNav({ activeScreen, onNavigate }: Props) {
  return (
    <View style={styles.container}>
      {items.map((item) => {
        const isActive = activeScreen === item.id;
        return (
          <Pressable
            key={item.id}
            onPress={() => onNavigate(item.id)}
            style={styles.item}
          >
            <MaterialCommunityIcons
              name={item.icon}
              size={24}
              color={isActive ? '#2563eb' : '#9ca3af'}
            />
            <Text style={[styles.label, isActive ? styles.labelActive : styles.labelInactive]}>
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingHorizontal: 20,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  item: {
    alignItems: 'center',
    gap: 4,
  },
  label: {
    fontSize: 12,
  },
  labelActive: {
    color: '#2563eb',
    fontWeight: '500',
  },
  labelInactive: {
    color: '#9ca3af',
  },
});
