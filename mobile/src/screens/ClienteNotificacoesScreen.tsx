import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Header } from '../components/Header';
import { getApiBaseUrl } from '../config/api';
import { useAuth } from '../context/AuthContext';
import { fetchNotificacoesCliente, putClienteNotificacaoLida } from '../services/resources';

type Props = {
  onBack: () => void;
};

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

interface Notificacao {
  id: string;
  tipo: string;
  titulo: string;
  mensagem: string;
  data: string;
  lida: boolean;
  icon: IconName;
  color: string;
}

const iconBgColors: Record<string, string> = {
  green: '#f0fdf4',
  blue: '#f0fdfa',
  yellow: '#fefce8',
  purple: '#ccfbf1',
};

const iconColors: Record<string, string> = {
  green: '#16a34a',
  blue: '#0d9488',
  yellow: '#ca8a04',
  purple: '#0d9488',
};

export function ClienteNotificacoesScreen({ onBack }: Props) {
  const { token } = useAuth();
  const apiOn = !!getApiBaseUrl() && !!token;

  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!apiOn) {
      setNotificacoes([]);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const rows = await fetchNotificacoesCliente(token);
        if (!cancelled) {
          setNotificacoes(
            rows.map((r) => ({
              id: r.id,
              tipo: r.tipo,
              titulo: r.titulo,
              mensagem: r.mensagem,
              data: r.data,
              lida: r.lida,
              icon: r.icon as IconName,
              color: r.color,
            })),
          );
        }
      } catch {
        if (!cancelled) setNotificacoes([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [apiOn, token]);

  const marcarComoLida = async (id: string) => {
    const anterior = notificacoes;
    setNotificacoes((prev) => prev.map((n) => (n.id === id ? { ...n, lida: true } : n)));
    if (!apiOn || !token) return;
    try {
      await putClienteNotificacaoLida(token, id);
    } catch {
      setNotificacoes(anterior);
    }
  };

  const naoLidas = notificacoes.filter(n => !n.lida).length;

  return (
    <View style={styles.container}>
      <Header title="Notificações" showBack onBack={onBack} />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {apiOn && loading && (
          <View style={styles.loadingRow}>
            <ActivityIndicator size="small" color="#2563eb" />
            <Text style={styles.loadingText}>Carregando…</Text>
          </View>
        )}
        {/* Resumo de não lidas */}
        {naoLidas > 0 && (
          <View style={styles.resumoCard}>
            <View style={styles.resumoIconWrap}>
              <MaterialCommunityIcons name="bell-outline" size={20} color="#0d9488" />
            </View>
            <View>
              <Text style={styles.resumoTitle}>
                {naoLidas} {naoLidas === 1 ? 'nova notificação' : 'novas notificações'}
              </Text>
              <Text style={styles.resumoDesc}>Toque para marcar como lida</Text>
            </View>
          </View>
        )}

        {/* Lista de Notificações */}
        {notificacoes.map(notif => (
          <Pressable
            key={notif.id}
            onPress={() => marcarComoLida(notif.id)}
            style={[styles.notifCard, notif.lida ? styles.notifCardLida : styles.notifCardNaoLida]}
          >
            <View style={styles.notifContent}>
              <View style={[styles.notifIconWrap, { backgroundColor: iconBgColors[notif.color] }]}>
                <MaterialCommunityIcons
                  name={notif.icon}
                  size={20}
                  color={iconColors[notif.color]}
                />
              </View>
              <View style={styles.notifTextArea}>
                <View style={styles.notifTitleRow}>
                  <Text style={[styles.notifTitulo, !notif.lida && styles.notifTituloNaoLido]}>
                    {notif.titulo}
                  </Text>
                  {!notif.lida && <View style={styles.dotIndicator} />}
                </View>
                <Text style={styles.notifMensagem}>{notif.mensagem}</Text>
                <Text style={styles.notifData}>{notif.data}</Text>
              </View>
            </View>
          </Pressable>
        ))}

        {/* Estado Vazio */}
        {notificacoes.length === 0 && (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconWrap}>
              <MaterialCommunityIcons name="bell-outline" size={32} color="#9ca3af" />
            </View>
            <Text style={styles.emptyText}>Nenhuma notificação</Text>
          </View>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 16 },
  loadingRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  loadingText: { fontSize: 13, color: '#6b7280' },

  resumoCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#f0fdfa', borderWidth: 1, borderColor: '#99f6e4',
    borderRadius: 16, padding: 16, marginBottom: 16,
  },
  resumoIconWrap: {
    width: 40, height: 40, borderRadius: 10,
    backgroundColor: '#ccfbf1', alignItems: 'center', justifyContent: 'center',
  },
  resumoTitle: { fontSize: 15, fontWeight: '600', color: '#115e59' },
  resumoDesc: { fontSize: 13, color: '#0f766e', marginTop: 2 },

  notifCard: {
    backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 8, elevation: 3,
  },
  notifCardLida: {
    borderWidth: 1, borderColor: '#e5e7eb',
  },
  notifCardNaoLida: {
    borderWidth: 2, borderColor: '#99f6e4',
  },
  notifContent: { flexDirection: 'row', gap: 12 },
  notifIconWrap: {
    width: 46, height: 46, borderRadius: 23,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  notifTextArea: { flex: 1 },
  notifTitleRow: {
    flexDirection: 'row', alignItems: 'flex-start',
    justifyContent: 'space-between', gap: 8, marginBottom: 4,
  },
  notifTitulo: { flex: 1, fontSize: 15, fontWeight: '500', color: '#111827' },
  notifTituloNaoLido: { fontWeight: '700' },
  dotIndicator: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: '#0d9488', marginTop: 4, flexShrink: 0,
  },
  notifMensagem: { fontSize: 14, color: '#6b7280', marginBottom: 4, lineHeight: 20 },
  notifData: { fontSize: 12, color: '#9ca3af' },

  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 64 },
  emptyIconWrap: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center', marginBottom: 16,
  },
  emptyText: { fontSize: 15, color: '#9ca3af' },
});
