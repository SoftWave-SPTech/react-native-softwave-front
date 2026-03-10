import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, usePathname } from 'expo-router';

type NavItem = {
  path: string;
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  label: string;
};

const items: NavItem[] = [
  { path: '/home',        icon: 'home',          label: 'Home' },
  { path: '/transacoes',  icon: 'receipt',        label: 'Transações' },
  { path: '/pagamentos',  icon: 'file-document',  label: 'Pagamentos' },
  { path: '/honorarios',  icon: 'briefcase',      label: 'Honorários' },
  { path: '/relatorios',  icon: 'chart-bar',      label: 'Relatórios' },
];

export function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <View style={styles.container}>
      {items.map((item) => {
        const isActive = pathname === item.path;
        return (
          <Pressable
            key={item.path}
            onPress={() => router.navigate(item.path as any)}
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
