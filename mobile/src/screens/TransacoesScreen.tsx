import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, ScrollView, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Header } from '../components/Header';
import { CardTransacao } from '../components/CardTransacao';
import { BottomNav } from '../components/BottomNav';
import { FAB } from '../components/FAB';
import { getApiBaseUrl } from '../config/api';
import { useAuth } from '../context/AuthContext';
import { mapTransacaoApiToCard, type TransacaoCardModel } from '../mappers/transacao';
import { fetchTransacoes } from '../services/resources';
import { parseDateBRToIso } from '../utils/money';

type TipoFiltro = 'todas' | 'receita' | 'despesa';
type StatusFiltro = 'todos' | 'pago' | 'pendente' | 'atrasado' | 'em-dia' | 'cancelado';
type PeriodoFiltro = '15' | '30' | '60' | '90' | 'custom';

type Props = {
  onBack: () => void;
  onNavigate: (screen: string, id?: string) => void;
};

export function TransacoesScreen({ onBack, onNavigate }: Props) {
  const { token } = useAuth();
  const apiOn = !!getApiBaseUrl() && !!token;

  const [lista, setLista] = useState<TransacaoCardModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [tipoFiltro, setTipoFiltro] = useState<TipoFiltro>('todas');
  const [statusFiltro, setStatusFiltro] = useState<StatusFiltro>('todos');
  const [periodoFiltro, setPeriodoFiltro] = useState<PeriodoFiltro>('30');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');

  const carregar = React.useCallback(async () => {
    if (!apiOn) {
      setLista([]);
      setTotalPaginas(1);
      return;
    }
    setLoading(true);
    try {
      const data = await fetchTransacoes(token, {
        tipo: tipoFiltro === 'todas' ? undefined : tipoFiltro,
        status: statusFiltro === 'todos' || statusFiltro === 'em-dia' ? undefined : statusFiltro,
        periodoDias: periodoFiltro !== 'custom' ? Number(periodoFiltro) as 15 | 30 | 60 | 90 : undefined,
        dataInicio: periodoFiltro === 'custom' ? parseDateBRToIso(dataInicio) ?? undefined : undefined,
        dataFim: periodoFiltro === 'custom' ? parseDateBRToIso(dataFim) ?? undefined : undefined,
        page: pagina,
        limit: 20,
      });
      setLista(data.transacoes.map(mapTransacaoApiToCard));
      setTotalPaginas(Math.max(1, data.totalPages));
    } catch {
      setLista([]);
      setTotalPaginas(1);
    } finally {
      setLoading(false);
    }
  }, [apiOn, token, tipoFiltro, statusFiltro, periodoFiltro, dataInicio, dataFim, pagina]);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  useFocusEffect(
    React.useCallback(() => {
      void carregar();
      return undefined;
    }, [carregar]),
  );

  useEffect(() => {
    setPagina(1);
  }, [tipoFiltro, statusFiltro, periodoFiltro, dataInicio, dataFim]);

  const paginasVisiveis = React.useMemo(() => {
    const ini = Math.max(1, pagina - 2);
    const fim = Math.min(totalPaginas, ini + 4);
    const pages: number[] = [];
    for (let p = ini; p <= fim; p += 1) pages.push(p);
    return pages;
  }, [pagina, totalPaginas]);

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
        <Text style={styles.filterLabel}>Período</Text>
        <View style={[styles.filterRow, { flexWrap: 'wrap' }]}>
          {([
            { id: '15', label: '15 dias' },
            { id: '30', label: '30 dias' },
            { id: '60', label: '60 dias' },
            { id: '90', label: '90 dias' },
            { id: 'custom', label: 'Personalizado' },
          ] as const).map((p) => (
            <Pressable
              key={p.id}
              onPress={() => setPeriodoFiltro(p.id)}
              style={[styles.filterChip, periodoFiltro === p.id && styles.chipAtivo]}
            >
              <Text style={[styles.filterChipText, periodoFiltro === p.id && styles.chipTextActive]}>
                {p.label}
              </Text>
            </Pressable>
          ))}
        </View>
        {periodoFiltro === 'custom' && (
          <View style={styles.customDateRow}>
            <TextInput
              value={dataInicio}
              onChangeText={setDataInicio}
              placeholder="Início DD/MM/AAAA"
              placeholderTextColor="#9ca3af"
              style={styles.customDateInput}
            />
            <TextInput
              value={dataFim}
              onChangeText={setDataFim}
              placeholder="Fim DD/MM/AAAA"
              placeholderTextColor="#9ca3af"
              style={styles.customDateInput}
            />
          </View>
        )}
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
          {lista.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="magnify-close" size={40} color="#9ca3af" />
              <Text style={styles.emptyText}>Nenhuma transação encontrada</Text>
            </View>
          ) : (
            lista.map((t) => (
              <CardTransacao key={t.id} icon={t.icon} title={t.title} subtitle={t.subtitle} value={t.value} type={t.type} status={t.status} onPress={() => onNavigate('DetalheTransacao', t.id)} />
            ))
          )}
        </View>
        {totalPaginas > 1 && (
          <View style={styles.paginacao}>
            <Pressable
              style={[styles.pageBtn, pagina <= 1 && styles.pageBtnDisabled]}
              disabled={pagina <= 1}
              onPress={() => setPagina((p) => Math.max(1, p - 1))}
            >
              <Text style={styles.pageBtnText}>Anterior</Text>
            </Pressable>
            {paginasVisiveis.map((p) => (
              <Pressable
                key={p}
                style={[styles.pageChip, pagina === p && styles.pageChipAtivo]}
                onPress={() => setPagina(p)}
              >
                <Text style={[styles.pageChipText, pagina === p && styles.pageChipTextAtivo]}>{p}</Text>
              </Pressable>
            ))}
            <Pressable
              style={[styles.pageBtn, pagina >= totalPaginas && styles.pageBtnDisabled]}
              disabled={pagina >= totalPaginas}
              onPress={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
            >
              <Text style={styles.pageBtnText}>Próxima</Text>
            </Pressable>
          </View>
        )}
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
  customDateRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  customDateInput: { flex: 1, backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: '#111827' },
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
  chipReceita: { backgroundColor: '#16a34a' },
  chipDespesa: { backgroundColor: '#dc2626' },
  chipStatusAtivo: { backgroundColor: '#111827' },
  chipTextActive: { color: '#fff' },
  filterChipText: { fontSize: 14, color: '#6b7280' },
  loadingRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  loadingText: { fontSize: 13, color: '#6b7280' },
  list: { gap: 12 },
  paginacao: { marginTop: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, flexWrap: 'wrap' },
  pageBtn: { backgroundColor: '#fff', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8 },
  pageBtnDisabled: { opacity: 0.5 },
  pageBtnText: { color: '#374151', fontSize: 13, fontWeight: '500' },
  pageChip: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  pageChipAtivo: { backgroundColor: '#111827' },
  pageChipText: { fontSize: 13, color: '#374151' },
  pageChipTextAtivo: { color: '#fff', fontWeight: '600' },
  bottomNavWrap: { position: 'absolute', bottom: 0, left: 0, right: 0 },
  emptyState: { alignItems: 'center', paddingVertical: 32, gap: 8 },
  emptyText: { fontSize: 14, color: '#9ca3af' },
});
