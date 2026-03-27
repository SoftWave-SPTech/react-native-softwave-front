import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, ScrollView, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Header } from '../components/Header';
import { CardTransacao } from '../components/CardTransacao';
import { BottomNav } from '../components/BottomNav';
import { FAB } from '../components/FAB';
import { getApiBaseUrl } from '../config/api';
import { useAuth } from '../context/AuthContext';
import { mapTransacaoApiToCard, type TransacaoCardModel } from '../mappers/transacao';
import { fetchTransacoes } from '../services/resources';

type TipoFiltro = 'todas' | 'receita' | 'despesa';
type StatusFiltro = 'todos' | 'pago' | 'pendente' | 'atrasado' | 'em-dia' | 'cancelado';

const TRANSOES_FALLBACK: TransacaoCardModel[] = [
  { id: '1', icon: 'briefcase', title: 'Honorários - Processo 1234', subtitle: 'João Silva', value: 'R$ 5.000,00', type: 'receita', status: 'pago' },
  { id: '2', icon: 'file-document', title: 'Custas Judiciais', subtitle: 'Processo 5678', value: 'R$ 850,00', type: 'despesa', status: 'pendente' },
  { id: '3', icon: 'credit-card', title: 'Honorários - Consultoria', subtitle: 'Maria Santos', value: 'R$ 3.200,00', type: 'receita', status: 'atrasado' },
  { id: '4', icon: 'receipt', title: 'Aluguel do Escritório', subtitle: 'Despesa Fixa', value: 'R$ 4.500,00', type: 'despesa', status: 'pago' },
  { id: '5', icon: 'briefcase', title: 'Honorários - Processo 9012', subtitle: 'Carlos Oliveira', value: 'R$ 8.000,00', type: 'receita', status: 'em-dia' },
];

type Props = {
  onBack: () => void;
  onNavigate: (screen: string, id?: string) => void;
};

export function TransacoesScreen({ onBack, onNavigate }: Props) {
  const { token } = useAuth();
  const apiOn = !!getApiBaseUrl() && !!token;

  const [lista, setLista] = useState<TransacaoCardModel[]>(TRANSOES_FALLBACK);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!apiOn) {
      setLista(TRANSOES_FALLBACK);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const data = await fetchTransacoes(token);
        if (!cancelled && data.length > 0) {
          setLista(data.map(mapTransacaoApiToCard));
        }
      } catch {
        if (!cancelled) setLista(TRANSOES_FALLBACK);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [apiOn, token]);

  const [busca, setBusca] = useState('');
  const [tipoFiltro, setTipoFiltro] = useState<TipoFiltro>('todas');
  const [statusFiltro, setStatusFiltro] = useState<StatusFiltro>('todos');

  const transacoesFiltradas = lista.filter((t) => {
    const matchBusca = busca.trim() === '' || t.title.toLowerCase().includes(busca.toLowerCase()) || t.subtitle.toLowerCase().includes(busca.toLowerCase());
    const matchTipo = tipoFiltro === 'todas' || t.type === tipoFiltro;
    const matchStatus = statusFiltro === 'todos' || t.status === statusFiltro;
    return matchBusca && matchTipo && matchStatus;
  });

  return (
    <View style={styles.container}>
      <Header title="Transações" showBack onBack={onBack} />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {apiOn && loading && (
          <View style={styles.loadingRow}>
            <ActivityIndicator size="small" color="#2563eb" />
            <Text style={styles.loadingText}>Carregando transações…</Text>
          </View>
        )}
        <View style={styles.searchBox}>
          <MaterialCommunityIcons name="magnify" size={22} color="#9ca3af" />
          <TextInput value={busca} onChangeText={setBusca} placeholder="Buscar transação ou cliente" placeholderTextColor="#9ca3af" style={styles.searchInput} />
        </View>
        {/* <View style={styles.resumoRow}>
          <View style={styles.resumoCard}><Text style={styles.resumoLabel}>Saldo</Text><Text style={styles.resumoValue}>{formatK(saldo)}</Text></View>
          <View style={styles.resumoCard}><Text style={styles.resumoLabel}>Receitas</Text><Text style={[styles.resumoValue, styles.receita]}>{formatK(totalReceitas)}</Text></View>
          <View style={styles.resumoCard}><Text style={styles.resumoLabel}>Despesas</Text><Text style={[styles.resumoValue, styles.despesa]}>{formatK(totalDespesas)}</Text></View>
        </View> */}
        <Text style={styles.filterLabel}>Tipo</Text>
        <View style={styles.filterRow}>
          {(['todas', 'receita', 'despesa'] as const).map((t) => (
            <Pressable
              key={t}
              onPress={() => setTipoFiltro(t)}
              style={[styles.filterChip, tipoFiltro === t && styles.chipAtivo]}
            >
              <Text style={[styles.filterChipText, tipoFiltro === t && styles.chipTextActive]}>
                {t === 'todas' ? 'Todas' : t === 'receita' ? 'Receita' : 'Despesa'}
              </Text>
            </Pressable>
          ))}
        </View>
        <Text style={styles.filterLabel}>Status</Text>
        <View style={[styles.filterRow, { flexWrap: 'wrap' }]}>
          {(['todos', 'pago', 'pendente', 'atrasado', 'em-dia', 'cancelado'] as const).map((s) => (
            <Pressable
              key={s}
              onPress={() => setStatusFiltro(s)}
              style={[styles.filterChip, statusFiltro === s && styles.chipAtivo]}
            >
              <Text style={[styles.filterChipText, statusFiltro === s && styles.chipTextActive]}>
                {s === 'todos'
                  ? 'Todos'
                  : s === 'pago'
                    ? 'Pago'
                    : s === 'pendente'
                      ? 'Pendente'
                      : s === 'atrasado'
                        ? 'Atrasado'
                        : s === 'em-dia'
                          ? 'Em Dia'
                          : 'Cancelado'}
              </Text>
            </Pressable>
          ))}
        </View>
        <View style={styles.list}>
          {transacoesFiltradas.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="magnify-close" size={40} color="#9ca3af" />
              <Text style={styles.emptyText}>Nenhuma transação encontrada</Text>
            </View>
          ) : (
            transacoesFiltradas.map((t) => (
              <CardTransacao key={t.id} icon={t.icon} title={t.title} subtitle={t.subtitle} value={t.value} type={t.type} status={t.status} onPress={() => onNavigate('DetalheTransacao', t.id)} />
            ))
          )}
        </View>
        <View style={{ height: 100 }} />
      </ScrollView>
      <FAB onPress={() => onNavigate('NovaTransacao')} />
      <View style={styles.bottomNavWrap}>
        <BottomNav />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 32 },
  searchBox: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },
  searchInput: { flex: 1, fontSize: 16, color: '#111827' },
  resumoRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  resumoCard: { flex: 1, backgroundColor: '#fff', borderRadius: 16, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },
  resumoLabel: { fontSize: 12, color: '#6b7280', marginBottom: 4 },
  resumoValue: { fontSize: 18, fontWeight: '600', color: '#111827' },
  receita: { color: '#16a34a' },
  despesa: { color: '#dc2626' },
  filterLabel: { fontSize: 14, color: '#6b7280', marginBottom: 8 },
  filterRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  filterChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 999, backgroundColor: '#fff' },
  chipAtivo: { backgroundColor: '#111827' },
  chipTextActive: { color: '#fff' },
  filterChipText: { fontSize: 14, color: '#6b7280' },
  loadingRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  loadingText: { fontSize: 13, color: '#6b7280' },
  list: { gap: 12 },
  bottomNavWrap: { position: 'absolute', bottom: 0, left: 0, right: 0 },
  emptyState: { alignItems: 'center', paddingVertical: 32, gap: 8 },
  emptyText: { fontSize: 14, color: '#9ca3af' },
});
