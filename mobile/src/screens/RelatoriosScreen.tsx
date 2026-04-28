import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Dimensions, ActivityIndicator, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LineChart, PieChart, BarChart } from 'react-native-chart-kit';
import { Header } from '../components/Header';
import { CardKPI } from '../components/CardKPI';
import { BottomNav } from '../components/BottomNav';
import { getApiBaseUrl, getIaApiBaseUrl } from '../config/api';
import { useAuth } from '../context/AuthContext';
import {
  fetchRelatorioDespesasMes,
  fetchRelatorioInsights,
  fetchRelatorioKpis,
  fetchRelatorioRankingClientes,
  fetchRelatorioReceitaCategoria,
  fetchRelatorioReceitaDespesa,
  postInsightGerar,
} from '../services/resources';
import type {
  InsightFinanceiroResponseApi,
  RelatorioDespesasMesApi,
  RelatorioInsightsApi,
  RelatorioKpisApi,
  RelatorioRankingClientesApi,
  RelatorioReceitaCategoriaApi,
  RelatorioReceitaDespesaApi,
  TipoInsightApi,
} from '../types/api';
import { formatCentavosBRL } from '../utils/money';

type Props = {
  onBack: () => void;
  onNavigate: (screen: string) => void;
};

const SCREEN_WIDTH = Dimensions.get('window').width - 40;

/** Estrutura mínima para os gráficos quando a API ainda não retornou dados. */
const CHART_VAZIO_LINHA = {
  labels: ['—'],
  datasets: [
    { data: [0], color: () => '#16a34a', strokeWidth: 2 },
    { data: [0], color: () => '#dc2626', strokeWidth: 2 },
  ],
  legend: ['Receita', 'Despesa'],
};
const CHART_VAZIO_PIZZA = [
  { name: '—', value: 1, color: '#e5e7eb', legendFontColor: '#9ca3af', legendFontSize: 13 },
];
const CHART_VAZIO_BARRA = { labels: ['—'], datasets: [{ data: [0] }] };

const CHART_CONFIG = {
  backgroundGradientFrom: '#fff',
  backgroundGradientTo: '#fff',
  color: (opacity = 1) => `rgba(13, 148, 136, ${opacity})`,
  labelColor: () => '#6b7280',
  strokeWidth: 2,
  decimalPlaces: 0,
  propsForDots: { r: '4', strokeWidth: '2', stroke: '#0d9488' },
};

const PIE_PALETTE = ['#2563eb', '#16a34a', '#f59e0b', '#8b5cf6', '#ec4899', '#0ea5e9'];
type InsightCardKey = 'linha' | 'pizza' | 'barra' | 'maioresClientes';

const TIPO_INSIGHT_POR_CARD: Record<InsightCardKey, TipoInsightApi> = {
  linha: 'RECEITA_DESPESA',
  pizza: 'RECEITA_POR_CATEGORIA',
  barra: 'DESPESA_POR_CATEGORIA',
  maioresClientes: 'MAIORES_CLIENTES',
};

function centavosParaReaisChart(v: number): number {
  return Math.round((v / 100) * 100) / 100;
}

function periodoParaFaixaIso(periodo: string): { dataInicio: string; dataFim: string } {
  const fim = new Date();
  const inicio = new Date(fim);
  if (periodo === 'ano') {
    inicio.setFullYear(fim.getFullYear() - 1);
  } else if (periodo === 'semestre') {
    inicio.setMonth(fim.getMonth() - 6);
  } else {
    inicio.setMonth(fim.getMonth() - 1);
  }
  const toIso = (d: Date) => d.toISOString().slice(0, 10);
  return { dataInicio: toIso(inicio), dataFim: toIso(fim) };
}

function bulletsDoInsightGerado(insight: InsightFinanceiroResponseApi): string[] {
  const bullets = Array.isArray(insight.bullets) ? insight.bullets.filter((b) => b?.trim()) : [];
  if (bullets.length > 0) return bullets;
  if (insight.resumoIA?.trim()) return [insight.resumoIA.trim()];
  return [];
}

function periodoLabel(periodo: string): string {
  if (periodo === 'ano') return 'Ano';
  if (periodo === 'semestre') return 'Semestre';
  return 'Mês';
}

function formatGeradoEm(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** Exibe valor principal do KPI com fallback quando a API omite campos ou usa formato alternativo. */
function valorPrincipalKpi(
  k: RelatorioKpisApi | null,
  chave: keyof RelatorioKpisApi,
  fallback: string,
): string {
  if (!k) return fallback;
  const item = k[chave];
  if (!item || item.valor === undefined || item.valor === null) return fallback;
  if (chave === 'ticketMedio' && typeof item.valor === 'number') {
    return formatCentavosBRL(item.valor);
  }
  return String(item.valor);
}

export function RelatoriosScreen({ onBack, onNavigate }: Props) {
  const { token } = useAuth();
  const apiOn = !!getApiBaseUrl() && !!token;
  const iaOn = !!getIaApiBaseUrl()?.trim() && !!token;

  const [periodo, setPeriodo] = useState('mes');
  const [insightAberto, setInsightAberto] = useState<InsightCardKey | null>(null);
  const [insightsGerados, setInsightsGerados] = useState<
    Partial<Record<InsightCardKey, { bullets: string[]; periodo: string; geradoEm?: string }>>
  >({});
  const [gerandoInsightCard, setGerandoInsightCard] = useState<InsightCardKey | null>(null);

  const [loading, setLoading] = useState(false);
  const [rd, setRd] = useState<RelatorioReceitaDespesaApi | null>(null);
  const [rc, setRc] = useState<RelatorioReceitaCategoriaApi | null>(null);
  const [dm, setDm] = useState<RelatorioDespesasMesApi | null>(null);
  const [kpis, setKpis] = useState<RelatorioKpisApi | null>(null);
  const [ranking, setRanking] = useState<RelatorioRankingClientesApi | null>(null);
  const [insightsApi, setInsightsApi] = useState<RelatorioInsightsApi | null>(null);

  const carregar = useCallback(async () => {
    if (!apiOn || !token) {
      setRd(null);
      setRc(null);
      setDm(null);
      setKpis(null);
      setRanking(null);
      setInsightsApi(null);
      return;
    }
    setLoading(true);
    try {
      const [a, b, c, d, e, f] = await Promise.all([
        fetchRelatorioReceitaDespesa(token, periodo),
        fetchRelatorioReceitaCategoria(token, periodo),
        fetchRelatorioDespesasMes(token, periodo),
        fetchRelatorioKpis(token, periodo),
        fetchRelatorioRankingClientes(token, periodo),
        fetchRelatorioInsights(token, periodo),
      ]);
      setRd(a);
      setRc(b);
      setDm(c);
      setKpis(d);
      setRanking(e);
      setInsightsApi(f);
    } finally {
      setLoading(false);
    }
  }, [apiOn, token, periodo]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  useEffect(() => {
    // Mudou período => invalida insights gerados anteriormente.
    setInsightsGerados({});
    setInsightAberto(null);
  }, [periodo]);

  const dadosLinha = useMemo(() => {
    if (rd?.labels?.length && rd.receita?.length && rd.despesa?.length) {
      return {
        labels: rd.labels,
        datasets: [
          { data: rd.receita.map(centavosParaReaisChart), color: () => '#16a34a', strokeWidth: 2 },
          { data: rd.despesa.map(centavosParaReaisChart), color: () => '#dc2626', strokeWidth: 2 },
        ],
        legend: ['Receita', 'Despesa'],
      };
    }
    return CHART_VAZIO_LINHA;
  }, [rd]);

  const dadosPizza = useMemo(() => {
    const cats = rc?.categorias;
    if (cats && cats.length > 0) {
      return cats.map((cat, i) => ({
        name: cat.nome,
        value: centavosParaReaisChart(cat.valor),
        color: PIE_PALETTE[i % PIE_PALETTE.length],
        legendFontColor: '#374151',
        legendFontSize: 13,
      }));
    }
    return CHART_VAZIO_PIZZA;
  }, [rc]);

  const dadosBarra = useMemo(() => {
    if (dm?.labels?.length && dm.despesas?.length) {
      return {
        labels: dm.labels,
        datasets: [{ data: dm.despesas.map(centavosParaReaisChart) }],
      };
    }
    return CHART_VAZIO_BARRA;
  }, [dm]);

  const clientesRanking = useMemo(() => {
    const list = ranking?.clientes;
    if (list && list.length > 0) {
      return list.map((c) => ({ nome: c.nome, valorLabel: formatCentavosBRL(c.valor) }));
    }
    return [];
  }, [ranking]);

  const insights = useMemo(() => {
    return {
      linha: insightsGerados.linha?.bullets ?? (insightsApi?.linha?.length ? insightsApi.linha : []),
      pizza: insightsGerados.pizza?.bullets ?? (insightsApi?.pizza?.length ? insightsApi.pizza : []),
      barra: insightsGerados.barra?.bullets ?? (insightsApi?.barra?.length ? insightsApi.barra : []),
      maioresClientes:
        insightsGerados.maioresClientes?.bullets
        ?? (insightsApi?.maioresClientes && insightsApi.maioresClientes.length > 0 ? insightsApi.maioresClientes : []),
    };
  }, [insightsApi, insightsGerados]);

  const gerarInsightPorCard = async (tipo: InsightCardKey) => {
    if (!iaOn || !token) {
      Alert.alert('API IA', 'URL da API de IA não configurada.');
      return;
    }
    const insightGeradoAtual = insightsGerados[tipo];
    if (insightGeradoAtual?.periodo === periodo) {
      setInsightAberto((prev) => (prev === tipo ? null : tipo));
      return;
    }

    setGerandoInsightCard(tipo);
    const { dataInicio, dataFim } = periodoParaFaixaIso(periodo);
    try {
      const insight = await postInsightGerar(token, {
        tipoInsight: TIPO_INSIGHT_POR_CARD[tipo],
        dataInicio,
        dataFim,
        incluirComparativoPeriodoAnterior: true,
      });
      if (!insight) {
        Alert.alert('Erro', 'Não foi possível gerar o insight deste card.');
        return;
      }
      setInsightsGerados((prev) => ({
        ...prev,
        [tipo]: { bullets: bulletsDoInsightGerado(insight), periodo, geradoEm: insight.criadoEm },
      }));
      setInsightAberto(tipo);
    } finally {
      setGerandoInsightCard(null);
    }
  };

  const k = kpis;

  return (
    <View style={styles.container}>
      <Header title="Relatórios" showBack onBack={onBack} />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {apiOn && loading && (
          <View style={styles.loadingRow}>
            <ActivityIndicator size="small" color="#2563eb" />
            <Text style={styles.loadingText}>Atualizando relatórios…</Text>
          </View>
        )}
        <View style={styles.periodoCard}>
          <View style={styles.periodoHeader}>
            <MaterialCommunityIcons name="calendar" size={22} color="#6b7280" />
            <Text style={styles.periodoLabel}>Período</Text>
          </View>
          <View style={styles.periodoRow}>
            {(['mes', 'semestre', 'ano'] as const).map((p) => (
              <Pressable key={p} onPress={() => setPeriodo(p)} style={[styles.periodoChip, periodo === p && styles.periodoChipActive]}>
                <Text style={[styles.periodoChipText, periodo === p && styles.periodoChipTextActive]}>{p === 'semestre' ? 'Semestre' : p === 'mes' ? 'Mês' : 'Ano'}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.kpiGrid}>
          <View style={styles.kpiItem}>
            <CardKPI
              icon="chart-line"
              title="Margem de Lucro"
              value={valorPrincipalKpi(k, 'margemLucro', '—')}
              variation={k?.margemLucro?.variacao}
              variationType={k?.margemLucro?.tipo === 'negativo' ? 'negative' : 'positive'}
            />
          </View>
          <View style={styles.kpiItem}>
            <CardKPI
              icon="cash"
              title="Ticket Médio"
              value={valorPrincipalKpi(k, 'ticketMedio', '—')}
              variation={k?.ticketMedio?.variacao}
              variationType={k?.ticketMedio?.tipo === 'negativo' ? 'negative' : 'positive'}
            />
          </View>
          <View style={styles.kpiItem}>
            <CardKPI
              icon="alert-circle"
              title="Inadimplência"
              value={valorPrincipalKpi(k, 'inadimplencia', '—')}
              variation={k?.inadimplencia?.variacao}
              variationType={k?.inadimplencia?.tipo === 'negativo' ? 'negative' : 'positive'}
            />
          </View>
          <View style={styles.kpiItem}>
            <CardKPI
              icon="trending-up"
              title="Crescimento"
              value={valorPrincipalKpi(k, 'crescimento', '—')}
              variation={k?.crescimento?.variacao}
              variationType={k?.crescimento?.tipo === 'negativo' ? 'negative' : 'positive'}
            />
          </View>
        </View>

        <Pressable onPress={() => onNavigate('AssistenteIA')} style={styles.iaBanner}>
          <View style={styles.iaIcon}><MaterialCommunityIcons name="creation" size={24} color="#fff" /></View>
          <View style={styles.iaContent}>
            <Text style={styles.iaTitle}>Assistente IA Personalizado</Text>
            <Text style={styles.iaSubtitle}>Faça perguntas e obtenha análises detalhadas</Text>
          </View>
          <Text style={styles.iaArrow}>→</Text>
        </Pressable>

        <Pressable onPress={() => onNavigate('ImportacaoExportacao')} style={styles.etlCard}>
          <View style={styles.etlIcon}><MaterialCommunityIcons name="folder-open" size={24} color="#0d9488" /></View>
          <View style={styles.etlContent}>
            <Text style={styles.etlTitle}>Importação & Exportação</Text>
            <Text style={styles.etlSubtitle}>ETL de extratos bancários e dados</Text>
          </View>
          <MaterialCommunityIcons name="upload" size={22} color="#0d9488" />
          <MaterialCommunityIcons name="download" size={22} color="#0d9488" />
        </Pressable>

        {/* LineChart — Receita vs Despesa */}
        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>Receita vs Despesa</Text>
            <Pressable
              onPress={() => void gerarInsightPorCard('linha')}
              style={[styles.insightBtn, insightAberto === 'linha' && styles.insightBtnActive]}
            >
              {gerandoInsightCard === 'linha' ? (
                <ActivityIndicator size="small" color="#0d9488" />
              ) : (
                <MaterialCommunityIcons name="creation" size={18} color={insightAberto === 'linha' ? '#0f766e' : '#0d9488'} />
              )}
            </Pressable>
          </View>
          <LineChart
            data={dadosLinha}
            width={SCREEN_WIDTH - 32}
            height={180}
            chartConfig={CHART_CONFIG}
            bezier
            style={styles.chart}
            withInnerLines={false}
            fromZero
          />
          <View style={styles.legenda}>
            <View style={styles.legendaItem}><View style={[styles.legendaDot, { backgroundColor: '#16a34a' }]} /><Text style={styles.legendaText}>Receita</Text></View>
            <View style={styles.legendaItem}><View style={[styles.legendaDot, { backgroundColor: '#dc2626' }]} /><Text style={styles.legendaText}>Despesa</Text></View>
          </View>
          {insightAberto === 'linha' && (
            <InsightCard
              bullets={insights.linha}
              periodo={periodoLabel(periodo)}
              geradoEm={insightsGerados.linha?.geradoEm}
            />
          )}
        </View>

        {/* PieChart — Receita por Categoria */}
        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>Receita por Categoria</Text>
            <Pressable
              onPress={() => void gerarInsightPorCard('pizza')}
              style={[styles.insightBtn, insightAberto === 'pizza' && styles.insightBtnActive]}
            >
              {gerandoInsightCard === 'pizza' ? (
                <ActivityIndicator size="small" color="#0d9488" />
              ) : (
                <MaterialCommunityIcons name="creation" size={18} color={insightAberto === 'pizza' ? '#0f766e' : '#0d9488'} />
              )}
            </Pressable>
          </View>
          <PieChart
            data={dadosPizza}
            width={SCREEN_WIDTH - 32}
            height={180}
            chartConfig={CHART_CONFIG}
            accessor="value"
            backgroundColor="transparent"
            paddingLeft="16"
            absolute={false}
            style={styles.chart}
          />
          {insightAberto === 'pizza' && (
            <InsightCard
              bullets={insights.pizza}
              periodo={periodoLabel(periodo)}
              geradoEm={insightsGerados.pizza?.geradoEm}
            />
          )}
        </View>

        {/* BarChart — Despesa por Mês */}
        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>Despesas por Mês</Text>
            <Pressable
              onPress={() => void gerarInsightPorCard('barra')}
              style={[styles.insightBtn, insightAberto === 'barra' && styles.insightBtnActive]}
            >
              {gerandoInsightCard === 'barra' ? (
                <ActivityIndicator size="small" color="#0d9488" />
              ) : (
                <MaterialCommunityIcons name="creation" size={18} color={insightAberto === 'barra' ? '#0f766e' : '#0d9488'} />
              )}
            </Pressable>
          </View>
          <BarChart
            data={dadosBarra}
            width={SCREEN_WIDTH - 32}
            height={180}
            chartConfig={{ ...CHART_CONFIG, color: (opacity = 1) => `rgba(220, 38, 38, ${opacity})` }}
            style={styles.chart}
            fromZero
            showValuesOnTopOfBars
            yAxisLabel="R$"
            yAxisSuffix=""
          />
          {insightAberto === 'barra' && (
            <InsightCard
              bullets={insights.barra}
              periodo={periodoLabel(periodo)}
              geradoEm={insightsGerados.barra?.geradoEm}
            />
          )}
        </View>

        <View style={styles.card}>
          <View style={styles.chartHeader}>
            <Text style={styles.cardTitle}>Maiores Clientes</Text>
            <Pressable
              onPress={() => void gerarInsightPorCard('maioresClientes')}
              style={[styles.insightBtn, insightAberto === 'maioresClientes' && styles.insightBtnActive]}
            >
              {gerandoInsightCard === 'maioresClientes' ? (
                <ActivityIndicator size="small" color="#0d9488" />
              ) : (
                <MaterialCommunityIcons name="creation" size={18} color={insightAberto === 'maioresClientes' ? '#0f766e' : '#0d9488'} />
              )}
            </Pressable>
            </View>
          {clientesRanking.length === 0 ? (
            <Text style={styles.rankingVazio}>Nenhum cliente no ranking para este período.</Text>
          ) : (
            clientesRanking.map((c, i) => (
              <View key={i} style={styles.clienteRow}>
                <View style={styles.clienteRank}><Text style={styles.clienteRankText}>{i + 1}</Text></View>
                <Text style={styles.clienteNome}>{c.nome}</Text>
                <Text style={styles.clienteValor}>{c.valorLabel}</Text>
              </View>
            ))
          )}
          {insightAberto === 'maioresClientes' && (
            <InsightCard
              bullets={insights.maioresClientes}
              periodo={periodoLabel(periodo)}
              geradoEm={insightsGerados.maioresClientes?.geradoEm}
            />
          )}
        </View>

        <View style={{ height: 80 }} />
      </ScrollView>
      <View style={styles.bottomNavWrap}>
        <BottomNav />
      </View>
    </View>
  );
}

function InsightCard({ bullets, periodo, geradoEm }: { bullets: string[]; periodo: string; geradoEm?: string }) {
  const geradoEmLabel = geradoEm ? formatGeradoEm(geradoEm) : '';
  return (
    <View style={styles.insightCard}>
      <View style={styles.insightHeader}>
        <MaterialCommunityIcons name="creation" size={16} color="#0d9488" />
        <Text style={styles.insightTitle}>Análise IA</Text>
      </View>
      <Text style={styles.insightMeta}>
        {geradoEmLabel ? `Gerado para: ${periodo} • ${geradoEmLabel}` : `Gerado para: ${periodo}`}
      </Text>
      {bullets.map((b, i) => (
        <View key={i} style={styles.insightRow}>
          <Text style={styles.insightBullet}>•</Text>
          <Text style={styles.insightText}>{b}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 16 },
  loadingRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  loadingText: { fontSize: 13, color: '#6b7280' },
  periodoCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },
  periodoHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  periodoLabel: { fontSize: 14, color: '#6b7280' },
  periodoRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  periodoChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  periodoChipActive: { backgroundColor: '#111827', borderColor: '#111827' },
  periodoChipText: { fontSize: 14, color: '#6b7280' },
  periodoChipTextActive: { color: '#fff' },
  kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 16 },
  kpiItem: { width: '47%' },
  chartCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },
  chartHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  chartTitle: { fontSize: 16, fontWeight: '600', color: '#111827' },
  insightBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#f0fdfa', alignItems: 'center', justifyContent: 'center' },
  insightBtnActive: { backgroundColor: '#ccfbf1' },
  chart: { borderRadius: 8, marginLeft: -16 },
  legenda: { flexDirection: 'row', gap: 16, marginTop: 8 },
  legendaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendaDot: { width: 10, height: 10, borderRadius: 5 },
  legendaText: { fontSize: 13, color: '#6b7280' },
  insightCard: { backgroundColor: '#f0fdfa', borderWidth: 1, borderColor: '#99f6e4', borderRadius: 12, padding: 12, marginTop: 12 },
  insightHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  insightTitle: { fontSize: 14, fontWeight: '600', color: '#115e59' },
  insightMeta: { fontSize: 12, color: '#0f766e', marginBottom: 8 },
  insightRow: { flexDirection: 'row', gap: 6, marginBottom: 4 },
  insightBullet: { fontSize: 14, color: '#0d9488', lineHeight: 20 },
  insightText: { flex: 1, fontSize: 13, color: '#334155', lineHeight: 20 },
  iaBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0d9488', borderRadius: 16, padding: 16, marginBottom: 16 },
  iaIcon: { width: 48, height: 48, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  iaContent: { flex: 1 },
  iaTitle: { fontSize: 16, fontWeight: '600', color: '#fff', marginBottom: 4 },
  iaSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.8)' },
  iaArrow: { fontSize: 24, color: '#fff' },
  etlCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderWidth: 2, borderColor: '#99f6e4', borderRadius: 16, padding: 16, marginBottom: 16 },
  etlIcon: { width: 48, height: 48, borderRadius: 12, backgroundColor: '#ccfbf1', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  etlContent: { flex: 1 },
  etlTitle: { fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 4 },
  etlSubtitle: { fontSize: 14, color: '#6b7280' },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },
  cardTitle: { fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 16 },
  rankingVazio: { fontSize: 14, color: '#9ca3af', paddingVertical: 8 },
  clienteRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  clienteRank: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#ccfbf1', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  clienteRankText: { fontSize: 14, fontWeight: '600', color: '#0d9488' },
  clienteNome: { flex: 1, fontSize: 16, color: '#111827' },
  clienteValor: { fontSize: 16, fontWeight: '600', color: '#0d9488' },
  bottomNavWrap: { position: 'absolute', bottom: 0, left: 0, right: 0 },
});
