import React from 'react';
import { useAuth } from '../context/AuthContext';
import { View, Text, Pressable, StyleSheet, Image } from 'react-native';
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
  const { user } = useAuth();

  const API_URL = process.env.EXPO_PUBLIC_API_URL;

  if (!user) return null;

  const isValid = (value?: string | null) => {
    return value && value.trim() !== '';
  };

  const getDisplayName = () => {
    if (isValid(user.nomeFantasia)) {
      return user.nomeFantasia;
    }

    if (isValid(user.nome)) {
      return user.nome;
    }

    return 'Usuário';
  };

  const displayName = getDisplayName();

  const getInitials = (name?: string) => {
    if (!name) return 'U';

    const parts = name.split(' ');
    if (parts.length === 1) return parts[0][0];

    return parts[0][0] + parts[parts.length - 1][0];
  };

  const fotoUrl = user?.foto && API_URL
    ? `${API_URL}/${user.foto}`
    : null;

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
              <Text style={styles.subtitle}>Bem-vindo,</Text>
              <Text style={styles.title}>
                {displayName}
              </Text>
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
            {fotoUrl ? (
              <Image source={{ uri: fotoUrl }} style={styles.avatarImage} />
            ) : (
              <Text style={styles.avatarText}>
                {getInitials(displayName)}
              </Text>
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
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    backgroundColor: '#0d9488',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatarText: {
    color: '#fff',
    fontWeight: '600',
  },
});