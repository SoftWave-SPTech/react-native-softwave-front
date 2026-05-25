import React from 'react';
import { View, Text, Pressable, StyleSheet, Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaPaddingTop } from '../utils/scrollPadding';

type Props = {
  title?: string;
  showBack?: boolean;
  showNotification?: boolean;
  notificationBadgeCount?: number;
  showAvatar?: boolean;
  avatarUri?: string | null;
  avatarInitials?: string;
  avatarHeaders?: Record<string, string>;
  onBack?: () => void;
  onNotification?: () => void;
  onAvatar?: () => void;
};

export function Header({
  title,
  showBack = false,
  showNotification = false,
  notificationBadgeCount = 0,
  showAvatar = false,
  avatarUri,
  avatarInitials,
  avatarHeaders,
  onBack,
  onNotification,
  onAvatar,
}: Props) {
  const paddingTop = useSafeAreaPaddingTop(8);

  return (
    <View style={[styles.container, { paddingTop }]}>
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
            {notificationBadgeCount > 0 && (
              <View style={styles.badge}>
                {notificationBadgeCount > 9 ? (
                  <Text style={styles.badgeCountText}>9+</Text>
                ) : notificationBadgeCount > 1 ? (
                  <Text style={styles.badgeCountText}>{notificationBadgeCount}</Text>
                ) : null}
              </View>
            )}
          </Pressable>
        )}
        {showAvatar && (
          <Pressable onPress={onAvatar} style={styles.avatar}>
            {avatarUri ? (
              <Image
                source={{ uri: avatarUri, headers: avatarHeaders }}
                style={styles.avatarImage}
              />
            ) : (
              <Text style={styles.avatarText}>{avatarInitials || 'SA'}</Text>
            )}
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
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
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
    top: 6,
    right: 6,
    minWidth: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ef4444',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  badgeCountText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#fff',
    lineHeight: 10,
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
    backgroundColor: '#0d9488',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
