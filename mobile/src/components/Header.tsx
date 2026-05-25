import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Image } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { getApiBaseUrl } from '../config/api';
import { fetchPerfilEscritorio, fetchClientePerfil } from '../services/resources';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type Props = {
  title?: string;
  showBack?: boolean;
  showNotification?: boolean;
  showAvatar?: boolean;
  avatarUri?: string | null;
  avatarHeaders?: Record<string, string> | undefined;
  onBack?: () => void;
  onNotification?: () => void;
  onAvatar?: () => void;
};

export function Header({
  title,
  showBack = false,
  showNotification = false,
  showAvatar = false,
  avatarUri,
  avatarHeaders,
  onBack,
  onNotification,
  onAvatar,
}: Props) {
  const { token } = useAuth();
  const [internalAvatar, setInternalAvatar] = useState<string | null>(null);

  function resolverFotoPerfilUri(raw: string | null | undefined): string | null {
    if (!raw) return null;
    if (/^https?:\/\//i.test(raw)) return raw;
    if (raw.startsWith('file://')) return raw;
    if (raw.startsWith('/')) {
      const base = getApiBaseUrl();
      if (!base) return null;
      const origin = base.replace(/\/v1\/?$/i, '');
      return `${origin}${raw}`;
    }
    return raw;
  }

  useEffect(() => {
    let mounted = true;
    // If parent passed an avatarUri, prefer it. If not, try to fetch profile.
    if (avatarUri) {
      setInternalAvatar(null);
      return () => {
        mounted = false;
      };
    }
    if (!token) {
      setInternalAvatar(null);
      return () => {
        mounted = false;
      };
    }

    (async () => {
      try {
        let p = await fetchPerfilEscritorio(token);
        if (!p) {
          const cp = await fetchClientePerfil(token);
          if (cp) {
            // adapt cliente profile shape
            p = { id: '0', nome: cp.nome, email: cp.email, telefone: cp.telefone, oab: '', endereco: '', fotoPerfil: cp.fotoPerfil } as any;
          }
        }
        const raw = p?.fotoPerfil ?? null;
        const resolved = resolverFotoPerfilUri(raw);
        if (mounted) setInternalAvatar(resolved);
      } catch {
        if (mounted) setInternalAvatar(null);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [avatarUri, token]);
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
            {(avatarUri || internalAvatar) ? (
              <Image source={{ uri: avatarUri ?? internalAvatar ?? undefined }} style={styles.avatarImage} />
            ) : (
              <Text style={styles.avatarText}>SA</Text>
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
  },
  avatarText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  avatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
});
