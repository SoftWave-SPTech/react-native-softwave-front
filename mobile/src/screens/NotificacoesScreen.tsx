import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Header } from '../components/Header';
import { BottomNav } from '../components/BottomNav';

type Tipo = 'pagamento' | 'alerta' | 'sucesso' | 'lembrete' | 'insight';

interface Notificacao {
  id: number;
  tipo: Tipo;
  titulo: string;
  mensagem: string;
  data: string;
  lida: boolean;
}

const ICON_CONFIG: Record<Tipo, { icon: string; bg: string; color: string }> = {
  pagamento: { icon: 'cash', bg: '#dcfce7', color: '#16a34a' },
  alerta: { icon: 'alert-circle', bg: '#fee2e2', color: '#dc2626' },
  sucesso: { icon: 'check-circle', bg: '#dbeafe', color: '#2563eb' },
  lembrete: { icon: 'clock-outline', bg: '#fef3c7', color: '#d97706' },
  insight: { icon: 'trending-up', bg: '#f3e8ff', color: '#7c3aed' },
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

  const marcarTodasComoLidas = () => {
    setNotificacoes((prev) => prev.map((n) => ({ ...n, lida: true })));
  };

  const naoLidas = notificacoes.filter((n) => !n.lida).length;

  return (
    <View style={styles.container}>
      <Header title="Notificações" showBack onBack={onBack} />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {naoLidas > 0 && (
          <View style={styles.headerRow}>
            <Text style={styles.headerText}>{naoLidas} {naoLidas === 1 ? 'notificação não lida' : 'notificações não lidas'}</Text>
            <Pressable onPress={marcarTodasComoLidas}><Text style={styles.marcarTodas}>Marcar todas como lidas</Text></Pressable>
          </View>
        )}
        {notificacoes.map((n) => {
          const cfg = ICON_CONFIG[n.tipo];
          return (
            <Pressable key={n.id} onPress={() => marcarComoLida(n.id)} style={[styles.card, !n.lida && styles.cardNaoLida]}>
              <View style={[styles.iconWrap, { backgroundColor: cfg.bg }]}>
                <MaterialCommunityIcons name={cfg.icon as any} size={22} color={cfg.color} />
              </View>
              <View style={styles.content}>
                <View style={styles.titleRow}>
                  <Text style={[styles.titulo, !n.lida && styles.tituloBold]}>{n.titulo}</Text>
                  {!n.lida && <View style={styles.dot} />}
                </View>
                <Text style={styles.mensagem}>{n.mensagem}</Text>
                <Text style={styles.data}>{n.data}</Text>
              </View>
            </Pressable>
          );
        })}
        {notificacoes.length === 0 && (
          <View style={styles.empty}>
            <View style={styles.emptyIcon}><MaterialCommunityIcons name="file-document-outline" size={32} color="#9ca3af" /></View>
            <Text style={styles.emptyTitle}>Nenhuma notificação</Text>
            <Text style={styles.emptySubtitle}>Você está em dia com tudo!</Text>
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
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  headerText: { fontSize: 14, color: '#6b7280' },
  marcarTodas: { fontSize: 14, color: '#2563eb', fontWeight: '500' },
  card: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12 },
  cardNaoLida: { borderLeftWidth: 4, borderLeftColor: '#2563eb' },
  iconWrap: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  content: { flex: 1 },
  titleRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 4 },
  titulo: { flex: 1, fontSize: 16, fontWeight: '500', color: '#111827' },
  tituloBold: { fontWeight: '700' },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#2563eb', marginTop: 6 },
  mensagem: { fontSize: 14, color: '#6b7280', marginBottom: 4 },
  data: { fontSize: 12, color: '#9ca3af' },
  empty: { alignItems: 'center', paddingVertical: 48 },
  emptyIcon: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: '#111827', marginBottom: 8 },
  emptySubtitle: { fontSize: 14, color: '#6b7280' },
  bottomNavWrap: { position: 'absolute', bottom: 0, left: 0, right: 0 },
});
