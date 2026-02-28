import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type Props = {
  title?: string;
  showBack?: boolean;
  showNotification?: boolean;
  showAvatar?: boolean;
  onBack?: () => void;
  onNotification?: () => void;
  onAvatar?: () => void;
};

export function Header({
  title,
  showBack = false,
  showNotification = false,
  showAvatar = false,
  onBack,
  onNotification,
  onAvatar,
}: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.left}>
        {showBack && (
          <Pressable onPress={onBack} style={styles.iconButton}>
            <MaterialCommunityIcons name="arrow-left" size={22} color="#374151" />
          </Pressable>
        )}
        <View>
          {title ? (
            <Text style={styles.title}>{title}</Text>
          ) : (
            <>
              <Text style={styles.subtitle}>Bem-vindo ao</Text>
              <Text style={styles.title}>Silva & Associados</Text>
            </>
          )}
        </View>
      </View>
      <View style={styles.right}>
        {showNotification && (
          <Pressable onPress={onNotification} style={[styles.iconButton, styles.notificationBtn]}>
            <MaterialCommunityIcons name="bell-outline" size={22} color="#374151" />
            <View style={styles.badge} />
          </Pressable>
        )}
        {showAvatar && (
          <Pressable onPress={onAvatar} style={styles.avatar}>
            <Text style={styles.avatarText}>SA</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    padding: 8,
  },
  notificationBtn: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ef4444',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  subtitle: {
    fontSize: 12,
    color: '#6b7280',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
