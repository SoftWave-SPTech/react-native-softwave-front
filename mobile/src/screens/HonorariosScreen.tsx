import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Header } from '../components/Header';
import { BarraProgresso } from '../components/BarraProgresso';
import { TagStatus } from '../components/TagStatus';
import { BottomNav } from '../components/BottomNav';

const CONTRATOS = [
  { id: 1, cliente: 'João Silva', processo: 'Processo 1234/2025', tipoContrato: 'Êxito', status: 'em-dia' as const, progresso: 60, vencimento: '15/03/2026', total: 'R$ 25.000,00', pago: 'R$ 15.000,00' },
  { id: 2, cliente: 'Maria Santos', processo: 'Processo 5678/2025', tipoContrato: 'Parcelas', status: 'pendente' as const, progresso: 33, vencimento: '20/02/2026', total: 'R$ 18.000,00', pago: 'R$ 6.000,00' },
  { id: 3, cliente: 'Carlos Oliveira', processo: 'Processo 9012/2025', tipoContrato: 'Fixo Mensal', status: 'atrasado' as const, progresso: 75, vencimento: '10/02/2026', total: 'R$ 12.000,00', pago: 'R$ 9.000,00' },
];

type Props = {
  onBack: () => void;
  onNavigate: (screen: string, id?: string) => void;
};

export function HonorariosScreen({ onBack, onNavigate }: Props) {
  const [aba, setAba] = useState<'ativos' | 'encerrados'>('ativos');
  const [filtroCliente, setFiltroCliente] = useState('todos');
  const contratosFiltrados = filtroCliente === 'todos' ? CONTRATOS : CONTRATOS.filter((c) => c.cliente === filtroCliente);

  return (
    <View style={styles.container}>
      <Header title="Honorários" showBack onBack={onBack} />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.resumoRow}>
          <View style={styles.resumoVerde}><Text style={styles.resumoLabel}>Total Recebido</Text><Text style={styles.resumoValue}>R$ 30.000</Text></View>
          <View style={styles.resumoAzul}><Text style={styles.resumoLabel}>A Receber</Text><Text style={styles.resumoValue}>R$ 25.000</Text></View>
        </View>
        <View style={styles.tabs}>
          <Pressable onPress={() => setAba('ativos')} style={[styles.tab, aba === 'ativos' && styles.tabActive]}>
            <Text style={[styles.tabText, aba === 'ativos' && styles.tabTextActive]}>Ativos</Text>
          </Pressable>
          <Pressable onPress={() => setAba('encerrados')} style={[styles.tab, aba === 'encerrados' && styles.tabActive]}>
            <Text style={[styles.tabText, aba === 'encerrados' && styles.tabTextActive]}>Encerrados</Text>
          </Pressable>
        </View>
        <Pressable onPress={() => setFiltroCliente(filtroCliente === 'todos' ? 'João Silva' : 'todos')} style={styles.filtroBtn}>
          <MaterialCommunityIcons name="account" size={22} color="#6b7280" />
          <Text style={styles.filtroBtnText}>{filtroCliente === 'todos' ? 'Todos os Clientes' : filtroCliente}</Text>
          <MaterialCommunityIcons name="chevron-down" size={22} color="#6b7280" />
        </Pressable>
        <View style={styles.list}>
          {contratosFiltrados.map((c) => (
            <Pressable key={c.id} onPress={() => onNavigate('DetalheContrato', String(c.id))} style={styles.contratoCard}>
              <View style={styles.contratoHeader}>
                <View style={styles.contratoLeft}>
                  <View style={styles.contratoIcon}><MaterialCommunityIcons name="briefcase" size={22} color="#2563eb" /></View>
                  <View>
                    <Text style={styles.contratoCliente}>{c.cliente}</Text>
                    <View style={styles.contratoProcesso}><MaterialCommunityIcons name="file-document" size={14} color="#6b7280" /><Text style={styles.contratoProcessoText}>{c.processo}</Text></View>
                    <Text style={styles.contratoTipo}>{c.tipoContrato}</Text>
                  </View>
                </View>
                <TagStatus status={c.status} />
              </View>
              <BarraProgresso percentage={c.progresso} />
              <View style={styles.contratoFooter}>
                <View><Text style={styles.contratoFooterLabel}>Vencimento</Text><Text style={styles.contratoFooterValue}>{c.vencimento}</Text></View>
                <View style={styles.contratoFooterRight}><Text style={styles.contratoFooterLabel}>Total</Text><Text style={styles.contratoTotal}>{c.total}</Text></View>
              </View>
            </Pressable>
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
  resumoRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  resumoVerde: { flex: 1, backgroundColor: '#16a34a', borderRadius: 16, padding: 16 },
  resumoAzul: { flex: 1, backgroundColor: '#2563eb', borderRadius: 16, padding: 16 },
  resumoLabel: { fontSize: 12, color: 'rgba(255,255,255,0.8)', marginBottom: 4 },
  resumoValue: { fontSize: 22, fontWeight: 'bold', color: '#fff' },
  tabs: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 16, padding: 4, marginBottom: 16 },
  tab: { flex: 1, paddingVertical: 10, borderRadius: 12, alignItems: 'center' },
  tabActive: { backgroundColor: '#2563eb' },
  tabText: { fontSize: 14, fontWeight: '500', color: '#6b7280' },
  tabTextActive: { color: '#fff' },
  filtroBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 },
  filtroBtnText: { flex: 1, fontSize: 16, color: '#6b7280' },
  list: { gap: 12 },
  contratoCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 },
  contratoHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  contratoLeft: { flexDirection: 'row', gap: 12 },
  contratoIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#dbeafe', alignItems: 'center', justifyContent: 'center' },
  contratoCliente: { fontSize: 16, fontWeight: '600', color: '#111827' },
  contratoProcesso: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  contratoProcessoText: { fontSize: 12, color: '#6b7280' },
  contratoTipo: { fontSize: 14, color: '#6b7280', marginTop: 2 },
  contratoFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#f3f4f6' },
  contratoFooterRight: { alignItems: 'flex-end' },
  contratoFooterLabel: { fontSize: 12, color: '#6b7280', marginBottom: 4 },
  contratoFooterValue: { fontSize: 14, fontWeight: '500', color: '#111827' },
  contratoTotal: { fontSize: 14, fontWeight: '600', color: '#2563eb' },
  bottomNavWrap: { position: 'absolute', bottom: 0, left: 0, right: 0 },
});
