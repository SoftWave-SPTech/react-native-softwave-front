import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Header } from '../components/Header';

type Props = {
  onBack: () => void;
};

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

interface Notificacao {
  id: number;
  tipo: string;
  titulo: string;
  mensagem: string;
  data: string;
  lida: boolean;
  icon: IconName;
  color: string;
}

const notificacoes: Notificacao[] = [
  {
    id: 1,
    tipo: 'pagamento',
    titulo: 'Pagamento confirmado',
    mensagem: 'Seu pagamento de R$ 6.000,00 foi confirmado',
    data: 'Hoje, 14:30',
    lida: false,
    icon: 'check-circle-outline',
    color: 'green',
  },
  {
    id: 2,
    tipo: 'cobranca',
    titulo: 'Nova cobrança disponível',
    mensagem: 'Parcela de R$ 7.000,00 vence em 15/04/2026',
    data: 'Hoje, 09:15',
    lida: false,
    icon: 'currency-usd',
    color: 'blue',
  },
  {
    id: 3,
    tipo: 'vencimento',
    titulo: 'Cobrança próxima ao vencimento',
    mensagem: 'Sua parcela vence em 3 dias',
    data: 'Ontem, 10:00',
    lida: true,
    icon: 'alert-circle-outline',
    color: 'yellow',
  },
  {
    id: 4,
    tipo: 'processo',
    titulo: 'Atualização no processo',
    mensagem: 'Processo 1234/2025 teve movimentação',
    data: '23/02/2026',
    lida: true,
    icon: 'file-document-outline',
    color: 'purple',
  },
];

const iconBgColors: Record<string, string> = {
  green: '#f0fdf4',
  blue: '#eff6ff',
  yellow: '#fefce8',
  purple: '#faf5ff',
};

const iconColors: Record<string, string> = {
  green: '#16a34a',
  blue: '#2563eb',
  yellow: '#ca8a04',
  purple: '#9333ea',
};

export function ClienteNotificacoesScreen({ onBack }: Props) {
  const naoLidas = notificacoes.filter(n => !n.lida).length;

  return (
    <View style={styles.container}>
      <Header title="Notificações" showBack onBack={onBack} />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Resumo de não lidas */}
        {naoLidas > 0 && (
          <View style={styles.resumoCard}>
            <View style={styles.resumoIconWrap}>
              <MaterialCommunityIcons name="bell-outline" size={20} color="#2563eb" />
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
          <View
            key={notif.id}
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
          </View>
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

  resumoCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#eff6ff', borderWidth: 1, borderColor: '#bfdbfe',
    borderRadius: 16, padding: 16, marginBottom: 16,
  },
  resumoIconWrap: {
    width: 40, height: 40, borderRadius: 10,
    backgroundColor: '#dbeafe', alignItems: 'center', justifyContent: 'center',
  },
  resumoTitle: { fontSize: 15, fontWeight: '600', color: '#1e3a8a' },
  resumoDesc: { fontSize: 13, color: '#1d4ed8', marginTop: 2 },

  notifCard: {
    backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 8, elevation: 3,
  },
  notifCardLida: {
    borderWidth: 1, borderColor: '#e5e7eb',
  },
  notifCardNaoLida: {
    borderWidth: 2, borderColor: '#bfdbfe',
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
    backgroundColor: '#2563eb', marginTop: 4, flexShrink: 0,
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
