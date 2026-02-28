import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Header } from '../components/Header';
import { CardKPI } from '../components/CardKPI';
import { CardTransacao } from '../components/CardTransacao';
import { BottomNav } from '../components/BottomNav';
import { FAB } from '../components/FAB';

type Props = {
  onBack?: () => void;
  onNavigate: (screen: string, id?: string) => void;
};

export function HomeScreen({ onBack, onNavigate }: Props) {
  return (
    <View style={styles.container}>
      <Header
        showNotification
        showAvatar
        onNotification={() => onNavigate('Notificacoes')}
        onAvatar={() => onNavigate('Perfil')}
      />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Hero Card */}
        <View style={styles.heroCard}>
          <Text style={styles.heroLabel}>Valor disponível</Text>
          <Text style={styles.heroValue}>R$ 145.280,00</Text>
          <View style={styles.heroRow}>
            <MaterialCommunityIcons name="trending-up" size={16} color="#bfdbfe" />
            <Text style={styles.heroSubtext}>Lucro líquido do mês: R$ 42.500,00</Text>
          </View>
        </View>

        {/* KPIs Grid */}
        <View style={styles.kpiGrid}>
          <View style={styles.kpiItem}>
            <CardKPI icon="cash" title="Receita Mensal" value="R$ 85.400" variation="+12%" variationType="positive" />
          </View>
          <View style={styles.kpiItem}>
            <CardKPI icon="clock-outline" title="Pendentes" value="R$ 28.300" variation="-5%" variationType="positive" />
          </View>
          <View style={styles.kpiItem}>
            <CardKPI icon="trending-down" title="Despesa Mensal" value="R$ 42.900" variation="+8%" variationType="negative" />
          </View>
          <View style={styles.kpiItem}>
            <CardKPI icon="trending-up" title="Lucro Líquido" value="R$ 42.500" variation="+15%" variationType="positive" />
          </View>
        </View>

        {/* Insights IA */}
        <View style={styles.insightsCard}>
          <View style={styles.insightsIconWrap}>
            <MaterialCommunityIcons name="lightbulb-outline" size={20} color="#b45309" />
          </View>
          <View style={styles.insightsContent}>
            <Text style={styles.insightsTitle}>Insights Inteligentes</Text>
            <Text style={styles.insightsText}>60% da receita vem de 2 clientes principais</Text>
            <Text style={styles.insightsText}>Você possui R$ 40.000 a receber nos próximos 30 dias</Text>
            <Pressable onPress={() => onNavigate('AssistenteIA')} style={styles.insightsLink}>
              <Text style={styles.insightsLinkText}>Ver Assistente IA</Text>
              <Text style={styles.insightsLinkArrow}>→</Text>
            </Pressable>
          </View>
        </View>

        {/* Transações Recentes */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Transações Recentes</Text>
            <Pressable onPress={() => onNavigate('Transacoes')}>
              <Text style={styles.sectionLink}>Ver todas</Text>
            </Pressable>
          </View>
          <View style={styles.transactionsList}>
            <CardTransacao
              icon="briefcase"
              title="Honorários - Processo 1234"
              subtitle="João Silva"
              value="R$ 5.000,00"
              type="receita"
              status="pago"
              onPress={() => onNavigate('DetalheTransacao', '1')}
            />
            <CardTransacao
              icon="file-document"
              title="Custas Judiciais"
              subtitle="Processo 5678"
              value="R$ 850,00"
              type="despesa"
              status="pendente"
              onPress={() => onNavigate('DetalheTransacao', '2')}
            />
            <CardTransacao
              icon="credit-card"
              title="Honorários - Consultoria"
              subtitle="Maria Santos"
              value="R$ 3.200,00"
              type="receita"
              status="atrasado"
              onPress={() => onNavigate('DetalheTransacao', '3')}
            />
          </View>
        </View>

        {/* Ações Rápidas */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ações Rápidas</Text>
          <View style={styles.actionsGrid}>
            <Pressable style={styles.actionCard} onPress={() => onNavigate('Honorarios')}>
              <View style={[styles.actionIcon, styles.actionIconBlue]}>
                <MaterialCommunityIcons name="briefcase" size={20} color="#2563eb" />
              </View>
              <Text style={styles.actionLabel}>Honorários</Text>
            </Pressable>
            <Pressable style={styles.actionCard} onPress={() => onNavigate('Relatorios')}>
              <View style={[styles.actionIcon, styles.actionIconGreen]}>
                <MaterialCommunityIcons name="trending-up" size={20} color="#16a34a" />
              </View>
              <Text style={styles.actionLabel}>Relatórios</Text>
            </Pressable>
            <Pressable style={[styles.actionCard, styles.actionCardBadge]} onPress={() => onNavigate('PagamentosConferir')}>
              <View style={[styles.actionIcon, styles.actionIconAmber]}>
                <MaterialCommunityIcons name="file-document" size={20} color="#d97706" />
              </View>
              <Text style={styles.actionLabel}>Pagamentos</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>3</Text>
              </View>
            </Pressable>
            <Pressable style={styles.actionCard} onPress={() => onNavigate('NovaTransacao')}>
              <View style={[styles.actionIcon, styles.actionIconPurple]}>
                <MaterialCommunityIcons name="credit-card" size={20} color="#7c3aed" />
              </View>
              <Text style={styles.actionLabel}>Nova Transação</Text>
            </Pressable>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <FAB onPress={() => onNavigate('NovaTransacao')} />
      <View style={styles.bottomNavWrap}>
        <BottomNav activeScreen="Home" onNavigate={onNavigate} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
  },
  heroCard: {
    backgroundColor: '#3b82f6',
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
  },
  heroLabel: {
    fontSize: 14,
    color: '#bfdbfe',
    marginBottom: 8,
  },
  heroValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  heroSubtext: {
    fontSize: 14,
    color: '#bfdbfe',
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  kpiItem: {
    width: '47%',
  },
  insightsCard: {
    flexDirection: 'row',
    backgroundColor: '#fffbeb',
    borderWidth: 1,
    borderColor: '#fde68a',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  insightsIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#fef3c7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  insightsContent: {
    flex: 1,
  },
  insightsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  insightsText: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  insightsLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  insightsLinkText: {
    fontSize: 14,
    color: '#b45309',
    fontWeight: '500',
  },
  insightsLinkArrow: {
    fontSize: 18,
    color: '#b45309',
  },
  section: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  sectionLink: {
    fontSize: 14,
    color: '#2563eb',
  },
  transactionsList: {
    gap: 12,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
    width: '47%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  actionCardBadge: {
    position: 'relative',
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  actionIconBlue: { backgroundColor: '#dbeafe' },
  actionIconGreen: { backgroundColor: '#dcfce7' },
  actionIconAmber: { backgroundColor: '#fef3c7' },
  actionIconPurple: { backgroundColor: '#f3e8ff' },
  actionLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  badge: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#ef4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  bottomNavWrap: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
});
