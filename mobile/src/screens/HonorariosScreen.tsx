import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Header } from '../components/Header';
import { BarraProgresso } from '../components/BarraProgresso';
import { TagStatus } from '../components/TagStatus';
import { BottomNav } from '../components/BottomNav';
import { AccordionSelect, SelectOption } from '../components/AccordionSelect';
import { getApiBaseUrl } from '../config/api';
import { useAuth } from '../context/AuthContext';
import { fetchContratos } from '../services/resources';
import type { ContratoApi } from '../types/api';
import { formatCentavosBRL } from '../utils/money';
import { LocaisSegurosBanner } from '../components/LocaisSegurosBanner';
import { useShouldRestrictSensitiveData } from '../context/LocaisSegurosContext';
import { MASKED_MONEY_VALUE, maskIfRestricted } from '../utils/geo';
import { useScrollPaddingBottom } from '../utils/scrollPadding';

type ContratoStatus = 'pendente' | 'atrasado' | 'pago' | 'cancelado' | 'encerrado';

type Contrato = {
  id: number;
  cliente: string;
  processo: string;
  tipoContrato: string;
  status: ContratoStatus;
  progresso: number;
  vencimento: string;
  total: string;
  pago: string;
  reprovado?: boolean;
  encerrado?: boolean;
};

function mapApiToContrato(c: ContratoApi): Contrato {
  return {
    id: c.id,
    cliente: c.cliente,
    processo: c.processo,
    tipoContrato: c.tipoContrato,
    status: c.status,
    progresso: c.progresso,
    vencimento: c.vencimento,
    total: formatCentavosBRL(c.total),
    pago: formatCentavosBRL(c.pago),
    reprovado: c.reprovado,
    encerrado: c.encerrado,
  };
}

function resumoAtivos(rows: ContratoApi[]) {
  const ativos = rows.filter((c) => !c.encerrado);
  const recebido = ativos.reduce((s, c) => s + c.pago, 0);
  const aReceber = ativos.reduce((s, c) => s + Math.max(0, c.total - c.pago), 0);
  return { recebido: formatCentavosBRL(recebido), aReceber: formatCentavosBRL(aReceber) };
}

type Props = {
  /** Foco da rota (ex.: `useIsFocused` em `app/(tabs)/honorarios.tsx`) — recarrega lista ao voltar do detalhe. */
  isFocused?: boolean;
  /**
   * Path da rota (ex.: `usePathname()` no `app/(tabs)/honorarios.tsx`). Quando contém `honorarios`, dispara GET.
   * No `App.tsx` legado, use `routePath="honorarios"`.
   */
  routePath?: string;
  onBack: () => void;
  onNavigate: (screen: string, id?: string) => void;
};

export function HonorariosScreen({ isFocused = true, routePath = '', onBack, onNavigate }: Props) {
  const { token } = useAuth();
  const apiOn = !!getApiBaseUrl() && !!token;
  const restrict = useShouldRestrictSensitiveData();
  const scrollPad = useScrollPaddingBottom();

  const [rowsApi, setRowsApi] = useState<ContratoApi[]>([]);
  const [loading, setLoading] = useState(false);

  const emTelaHonorarios = routePath.includes('honorarios');

  useEffect(() => {
    if (!apiOn) {
      setRowsApi([]);
      return undefined;
    }
    if (!isFocused || !emTelaHonorarios) return undefined;
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const data = await fetchContratos(token);
        if (!cancelled) setRowsApi(Array.isArray(data) ? data : []);
      } catch {
        if (!cancelled) setRowsApi([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [routePath, emTelaHonorarios, isFocused, apiOn, token]);

  const rowsSeguros = Array.isArray(rowsApi) ? rowsApi : [];
  const lista = useMemo(() => rowsSeguros.map(mapApiToContrato), [rowsSeguros]);
  const topo = useMemo(() => resumoAtivos(rowsSeguros), [rowsSeguros]);

  const [aba, setAba] = useState<'ativos' | 'encerrados'>('ativos');
  const [filtroCliente, setFiltroCliente] = useState('todos');

  const CLIENTES_OPTIONS: SelectOption[] = useMemo(
    () => [
      { value: 'todos', label: 'Todos os Clientes' },
      ...Array.from(new Set(lista.map((c) => c.cliente))).map((nome) => ({
        value: nome,
        label: restrict ? maskIfRestricted(nome, true) : nome,
      })),
    ],
    [lista, restrict],
  );

  const contratosFiltrados = lista.filter((c) => {
    const matchCliente = filtroCliente === 'todos' || c.cliente === filtroCliente;
    const matchAba = aba === 'ativos' ? !c.encerrado : !!c.encerrado;
    return matchCliente && matchAba;
  });

  return (
    <View style={styles.container}>
      <Header title="Honorários" showBack onBack={onBack} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: scrollPad }]}
        showsVerticalScrollIndicator={false}
      >
        <LocaisSegurosBanner />

        {apiOn && loading && (
          <View style={styles.loadingRow}>
            <ActivityIndicator size="small" color="#2563eb" />
            <Text style={styles.loadingText}>Carregando contratos…</Text>
          </View>
        )}

        <View style={styles.resumoRow}>
          <View style={styles.resumoVerde}>
            <Text style={styles.resumoLabel}>Total Recebido</Text>
            <Text style={styles.resumoValue} numberOfLines={2} adjustsFontSizeToFit minimumFontScale={0.75}>
              {restrict ? MASKED_MONEY_VALUE : topo.recebido}
            </Text>
          </View>
          <LinearGradient
            colors={['#14b8a6', '#0d9488']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.resumoAzul}
          >
            <Text style={styles.resumoLabel}>A Receber</Text>
            <Text style={styles.resumoValue} numberOfLines={2} adjustsFontSizeToFit minimumFontScale={0.75}>
              {restrict ? MASKED_MONEY_VALUE : topo.aReceber}
            </Text>
          </LinearGradient>
        </View>

        <View style={styles.tabs}>
          <Pressable onPress={() => setAba('ativos')} style={[styles.tab, aba === 'ativos' && styles.tabActive]}>
            <Text style={[styles.tabText, aba === 'ativos' && styles.tabTextActive]}>Ativos</Text>
          </Pressable>
          <Pressable onPress={() => setAba('encerrados')} style={[styles.tab, aba === 'encerrados' && styles.tabActive]}>
            <Text style={[styles.tabText, aba === 'encerrados' && styles.tabTextActive]}>Encerrados</Text>
          </Pressable>
        </View>

        <View style={styles.filtroWrap}>
          <AccordionSelect
            label="Filtrar por cliente"
            placeholder="Todos os Clientes"
            options={CLIENTES_OPTIONS}
            value={filtroCliente}
            onChange={setFiltroCliente}
            icon="account"
          />
        </View>

        <View style={styles.list}>
          {contratosFiltrados.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="briefcase-outline" size={40} color="#9ca3af" />
              <Text style={styles.emptyText}>Nenhum contrato encontrado</Text>
            </View>
          ) : (
            contratosFiltrados.map((c) => (
              <Pressable key={c.id} onPress={() => onNavigate('DetalheContrato', String(c.id))} style={styles.contratoCard}>
                <View style={styles.contratoHeader}>
                  <View style={styles.contratoLeft}>
                    <View style={styles.contratoIcon}>
                      <MaterialCommunityIcons name="briefcase" size={22} color="#0d9488" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={styles.contratoClienteRow}>
                        <Text style={styles.contratoCliente}>{maskIfRestricted(c.cliente, restrict)}</Text>
                        {c.reprovado && c.status === 'pendente' && (
                          <View style={styles.reprovadoBadge}>
                            <Text style={styles.reprovadoBadgeText}>Reprovado</Text>
                          </View>
                        )}
                      </View>
                      <View style={styles.contratoProcesso}>
                        <MaterialCommunityIcons name="file-document" size={14} color="#6b7280" />
                        <Text style={styles.contratoProcessoText}>{maskIfRestricted(c.processo, restrict)}</Text>
                      </View>
                      <Text style={styles.contratoTipo}>{maskIfRestricted(c.tipoContrato, restrict)}</Text>
                    </View>
                  </View>
                  <TagStatus status={c.status as 'em-dia' | 'pendente' | 'atrasado' | 'encerrado'} />
                </View>
                <BarraProgresso percentage={c.progresso} />
                <View style={styles.contratoFooter}>
                  <View>
                    <Text style={styles.contratoFooterLabel}>Vencimento</Text>
                    <Text style={styles.contratoFooterValue}>{maskIfRestricted(c.vencimento, restrict)}</Text>
                  </View>
                  <View style={styles.contratoFooterCenter}>
                    <Text style={styles.contratoFooterLabel}>Pago</Text>
                    <Text style={styles.contratoPago}>{restrict ? MASKED_MONEY_VALUE : c.pago}</Text>
                  </View>
                  <View style={styles.contratoFooterRight}>
                    <Text style={styles.contratoFooterLabel}>Total</Text>
                    <Text style={styles.contratoTotal}>{restrict ? MASKED_MONEY_VALUE : c.total}</Text>
                  </View>
                </View>
              </Pressable>
            ))
          )}
        </View>
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
  loadingRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  loadingText: { fontSize: 13, color: '#6b7280' },
  resumoRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  resumoVerde: { flex: 1, backgroundColor: '#16a34a', borderRadius: 16, padding: 16, shadowColor: '#16a34a', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
  resumoAzul: { flex: 1, borderRadius: 16, padding: 16, shadowColor: '#0d9488', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
  resumoLabel: { fontSize: 12, color: 'rgba(255,255,255,0.8)', marginBottom: 4 },
  resumoValue: { fontSize: 20, lineHeight: 24, fontWeight: 'bold', color: '#fff', flexShrink: 1 },
  tabs: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 16, padding: 4, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },
  tab: { flex: 1, paddingVertical: 10, borderRadius: 12, alignItems: 'center' },
  tabActive: { backgroundColor: '#111827' },
  tabText: { fontSize: 14, fontWeight: '500', color: '#6b7280' },
  tabTextActive: { color: '#fff' },
  filtroWrap: { marginBottom: 16 },
  list: { gap: 12 },
  contratoCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },
  contratoHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  contratoLeft: { flexDirection: 'row', gap: 12, flex: 1 },
  contratoIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#ccfbf1', alignItems: 'center', justifyContent: 'center' },
  contratoClienteRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  contratoCliente: { fontSize: 16, fontWeight: '600', color: '#111827' },
  reprovadoBadge: { backgroundColor: '#fee2e2', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  reprovadoBadgeText: { fontSize: 11, fontWeight: '600', color: '#dc2626' },
  contratoProcesso: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  contratoProcessoText: { fontSize: 12, color: '#6b7280' },
  contratoTipo: { fontSize: 14, color: '#6b7280', marginTop: 2 },
  contratoFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#f3f4f6' },
  contratoFooterCenter: { alignItems: 'center' },
  contratoFooterRight: { alignItems: 'flex-end' },
  contratoFooterLabel: { fontSize: 12, color: '#6b7280', marginBottom: 4 },
  contratoFooterValue: { fontSize: 14, fontWeight: '500', color: '#111827' },
  contratoPago: { fontSize: 14, fontWeight: '600', color: '#16a34a' },
  contratoTotal: { fontSize: 14, fontWeight: '600', color: '#0d9488' },
  bottomNavWrap: { position: 'absolute', bottom: 0, left: 0, right: 0 },
  emptyState: { alignItems: 'center', paddingVertical: 32, gap: 8 },
  emptyText: { fontSize: 14, color: '#9ca3af' },
});
