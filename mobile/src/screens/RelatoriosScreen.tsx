import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Header } from '../components/Header';
import { CardKPI } from '../components/CardKPI';
import { BottomNav } from '../components/BottomNav';

type Props = {
  onBack: () => void;
  onNavigate: (screen: string) => void;
};

const CLIENTES_RANKING = [
  { nome: 'João Silva', valor: 25000 },
  { nome: 'Maria Santos', valor: 18000 },
  { nome: 'Carlos Oliveira', valor: 12000 },
  { nome: 'Ana Costa', valor: 8500 },
];

export function RelatoriosScreen({ onBack, onNavigate }: Props) {
  const [periodo, setPeriodo] = useState('mes');

  return (
    <View style={styles.container}>
      <Header title="Relatórios" showBack onBack={onBack} />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.periodoCard}>
          <View style={styles.periodoHeader}>
            <MaterialCommunityIcons name="calendar" size={22} color="#6b7280" />
            <Text style={styles.periodoLabel}>Período</Text>
          </View>
          <View style={styles.periodoRow}>
            {(['semana', 'mes', 'ano'] as const).map((p) => (
              <Pressable key={p} onPress={() => setPeriodo(p)} style={[styles.periodoChip, periodo === p && styles.periodoChipActive]}>
                <Text style={[styles.periodoChipText, periodo === p && styles.periodoChipTextActive]}>{p === 'semana' ? 'Semana' : p === 'mes' ? 'Mês' : 'Ano'}</Text>
              </Pressable>
            ))}
          </View>
        </View>
        <View style={styles.kpiGrid}>
          <View style={styles.kpiItem}><CardKPI icon="chart-line" title="Margem de Lucro" value="49.8%" variation="+2.3%" variationType="positive" /></View>
          <View style={styles.kpiItem}><CardKPI icon="cash" title="Ticket Médio" value="R$ 8.540" variation="+5%" variationType="positive" /></View>
          <View style={styles.kpiItem}><CardKPI icon="alert-circle" title="Inadimplência" value="12%" variation="-3%" variationType="positive" /></View>
          <View style={styles.kpiItem}><CardKPI icon="trending-up" title="Crescimento" value="15%" variation="+8%" variationType="positive" /></View>
        </View>
        <Pressable onPress={() => onNavigate('AssistenteIA')} style={styles.iaBanner}>
          <View style={styles.iaIcon}><MaterialCommunityIcons name="sparkles" size={24} color="#fff" /></View>
          <View style={styles.iaContent}>
            <Text style={styles.iaTitle}>Assistente IA Personalizado</Text>
            <Text style={styles.iaSubtitle}>Faça perguntas e obtenha análises detalhadas</Text>
          </View>
          <Text style={styles.iaArrow}>→</Text>
        </Pressable>
        <Pressable onPress={() => onNavigate('ImportacaoExportacao')} style={styles.etlCard}>
          <View style={styles.etlIcon}><MaterialCommunityIcons name="database" size={24} color="#2563eb" /></View>
          <View style={styles.etlContent}>
            <Text style={styles.etlTitle}>Importação & Exportação</Text>
            <Text style={styles.etlSubtitle}>ETL de extratos bancários e dados</Text>
          </View>
          <MaterialCommunityIcons name="upload" size={22} color="#2563eb" />
          <MaterialCommunityIcons name="download" size={22} color="#2563eb" />
        </Pressable>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Maiores Clientes</Text>
          {CLIENTES_RANKING.map((c, i) => (
            <View key={i} style={styles.clienteRow}>
              <View style={styles.clienteRank}><Text style={styles.clienteRankText}>{i + 1}</Text></View>
              <Text style={styles.clienteNome}>{c.nome}</Text>
              <Text style={styles.clienteValor}>R$ {c.valor.toLocaleString('pt-BR')}</Text>
            </View>
          ))}
        </View>
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
  periodoCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 16 },
  periodoHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  periodoLabel: { fontSize: 14, color: '#6b7280' },
  periodoRow: { flexDirection: 'row', gap: 8 },
  periodoChip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, backgroundColor: '#f3f4f6' },
  periodoChipActive: { backgroundColor: '#2563eb' },
  periodoChipText: { fontSize: 14, color: '#6b7280' },
  periodoChipTextActive: { color: '#fff' },
  kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 16 },
  kpiItem: { width: '47%' },
  iaBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#7c3aed', borderRadius: 16, padding: 16, marginBottom: 16 },
  iaIcon: { width: 48, height: 48, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  iaContent: { flex: 1 },
  iaTitle: { fontSize: 16, fontWeight: '600', color: '#fff', marginBottom: 4 },
  iaSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.8)' },
  iaArrow: { fontSize: 24, color: '#fff' },
  etlCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderWidth: 2, borderColor: '#bfdbfe', borderRadius: 16, padding: 16, marginBottom: 16 },
  etlIcon: { width: 48, height: 48, borderRadius: 12, backgroundColor: '#dbeafe', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  etlContent: { flex: 1 },
  etlTitle: { fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 4 },
  etlSubtitle: { fontSize: 14, color: '#6b7280' },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 16 },
  cardTitle: { fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 16 },
  clienteRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  clienteRank: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#dbeafe', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  clienteRankText: { fontSize: 14, fontWeight: '600', color: '#2563eb' },
  clienteNome: { flex: 1, fontSize: 16, color: '#111827' },
  clienteValor: { fontSize: 16, fontWeight: '600', color: '#2563eb' },
  bottomNavWrap: { position: 'absolute', bottom: 0, left: 0, right: 0 },
});
