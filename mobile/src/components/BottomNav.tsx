import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/Ionicons';
import { useRouter, usePathname } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type NavItem = {
  path: string;
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  label: string;
};

const items: NavItem[] = [
  { path: '/home',        icon: 'home',          label: 'Home' },
  { path: '/transacoes',  icon: 'receipt',        label: 'Transações' },
  { path: '/pagamentos',  icon: 'document-text-outline',  label: 'Pagamentos' },
  { path: '/honorarios',  icon: 'briefcase',      label: 'Honorários' },
  { path: '/relatorios',  icon: 'bar-chart-outline',      label: 'Relatórios' },
];

export function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingBottom: 12 + Math.max(insets.bottom, 8) }]}>
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
              color={isActive ? '#0d9488' : '#9ca3af'}
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
    borderTopColor: '#f3f4f6',
    paddingHorizontal: 20,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
  },
  item: {
    alignItems: 'center',
    gap: 4,
  },
  label: {
    fontSize: 12,
  },
  labelActive: {
    color: '#0d9488',
    fontWeight: '500',
  },
  labelInactive: {
    color: '#9ca3af',
  },
});
