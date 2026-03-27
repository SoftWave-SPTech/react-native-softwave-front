import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Header } from '../components/Header';
import { BottomNav } from '../components/BottomNav';

type Tipo = 'pagamento' | 'alerta' | 'sucesso' | 'lembrete' | 'insight';

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

interface Notificacao {
  id: number;
  tipo: Tipo;
  titulo: string;
  mensagem: string;
  data: string;
  lida: boolean;
}

/** Paleta igual à tela do cliente (iconBgColors / iconColors) */
const tipoParaIcone: Record<Tipo, { icon: IconName; colorKey: 'green' | 'blue' | 'yellow' | 'purple' | 'red' }> = {
  pagamento: { icon: 'cash', colorKey: 'green' },
  alerta: { icon: 'alert-circle-outline', colorKey: 'red' },
  sucesso: { icon: 'check-circle-outline', colorKey: 'blue' },
  lembrete: { icon: 'clock-outline', colorKey: 'yellow' },
  insight: { icon: 'trending-up', colorKey: 'purple' },
};

const iconBgColors: Record<string, string> = {
  green: '#f0fdf4',
  blue: '#eff6ff',
  yellow: '#fefce8',
  purple: '#faf5ff',
  red: '#fef2f2',
};

const iconColors: Record<string, string> = {
  green: '#16a34a',
  blue: '#2563eb',
  yellow: '#ca8a04',
  purple: '#9333ea',
  red: '#dc2626',
};

type Props = {
  onBack: () => void;
  onNavigate: (screen: string) => void;
};

export function NotificacoesScreen({ onBack, onNavigate }: Props) {
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([
    { id: 1, tipo: 'pagamento', titulo: 'Novo pagamento recebido', mensagem: 'João Silva realizou o pagamento de R$ 5.000,00', data: 'Há 2 horas', lida: false },
    { id: 2, tipo: 'alerta', titulo: 'Pagamento pendente', mensagem: 'Honorários de Maria Santos vence amanhã', data: 'Há 4 horas', lida: false },
    { id: 3, tipo: 'insight', titulo: 'Insight de IA', mensagem: 'Sua receita cresceu 15% este mês em comparação ao anterior', data: 'Há 6 horas', lida: false },
    { id: 4, tipo: 'sucesso', titulo: 'Pagamento confirmado', mensagem: 'Comprovante aprovado para o processo #1234', data: 'Ontem', lida: true },
    { id: 5, tipo: 'lembrete', titulo: 'Relatório mensal disponível', mensagem: 'O relatório financeiro de fevereiro está pronto', data: 'Ontem', lida: true },
    { id: 6, tipo: 'alerta', titulo: 'Pagamento atrasado', mensagem: 'Carlos Oliveira possui R$ 3.200,00 em atraso', data: '2 dias atrás', lida: true },
    { id: 7, tipo: 'pagamento', titulo: 'Pagamento recebido', mensagem: 'Ana Costa pagou R$ 2.500,00 de honorários', data: '3 dias atrás', lida: true },
  ]);

  const marcarComoLida = (id: number) => {
    setNotificacoes((prev) => prev.map((n) => (n.id === id ? { ...n, lida: true } : n)));
  };

  const naoLidas = notificacoes.filter((n) => !n.lida).length;

  return (
    <View style={styles.container}>
      <Header title="Notificações" showBack onBack={onBack} />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
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

        {notificacoes.map((n) => {
          const { icon, colorKey } = tipoParaIcone[n.tipo];
          return (
            <Pressable
              key={n.id}
              onPress={() => marcarComoLida(n.id)}
              style={[styles.notifCard, n.lida ? styles.notifCardLida : styles.notifCardNaoLida]}
            >
              <View style={styles.notifContent}>
                <View style={[styles.notifIconWrap, { backgroundColor: iconBgColors[colorKey] }]}>
                  <MaterialCommunityIcons name={icon} size={20} color={iconColors[colorKey]} />
                </View>
                <View style={styles.notifTextArea}>
                  <View style={styles.notifTitleRow}>
                    <Text style={[styles.notifTitulo, !n.lida && styles.notifTituloNaoLido]}>{n.titulo}</Text>
                    {!n.lida && <View style={styles.dotIndicator} />}
                  </View>
                  <Text style={styles.notifMensagem}>{n.mensagem}</Text>
                  <Text style={styles.notifData}>{n.data}</Text>
                </View>
              </View>
            </Pressable>
          );
        })}

        {notificacoes.length === 0 && (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconWrap}>
              <MaterialCommunityIcons name="bell-outline" size={32} color="#9ca3af" />
            </View>
            <Text style={styles.emptyText}>Nenhuma notificação</Text>
          </View>
        )}

        <View style={{ height: 80 }} />
      </ScrollView>
      <View style={styles.bottomNavWrap}>
        <BottomNav />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 16 },

  resumoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  resumoIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#dbeafe',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resumoTitle: { fontSize: 15, fontWeight: '600', color: '#1e3a8a' },
  resumoDesc: { fontSize: 13, color: '#1d4ed8', marginTop: 2 },

  notifCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  notifCardLida: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  notifCardNaoLida: {
    borderWidth: 2,
    borderColor: '#bfdbfe',
  },
  notifContent: { flexDirection: 'row', gap: 12 },
  notifIconWrap: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  notifTextArea: { flex: 1 },
  notifTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 4,
  },
  notifTitulo: { flex: 1, fontSize: 15, fontWeight: '500', color: '#111827' },
  notifTituloNaoLido: { fontWeight: '700' },
  dotIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2563eb',
    marginTop: 4,
    flexShrink: 0,
  },
  notifMensagem: { fontSize: 14, color: '#6b7280', marginBottom: 4, lineHeight: 20 },
  notifData: { fontSize: 12, color: '#9ca3af' },

  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 64 },
  emptyIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyText: { fontSize: 15, color: '#9ca3af' },

  bottomNavWrap: { position: 'absolute', bottom: 0, left: 0, right: 0 },
});
