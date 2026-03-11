import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Dimensions } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LineChart, PieChart, BarChart } from 'react-native-chart-kit';
import { Header } from '../components/Header';
import { CardKPI } from '../components/CardKPI';
import { BottomNav } from '../components/BottomNav';

type Props = {
  onBack: () => void;
  onNavigate: (screen: string) => void;
};

const SCREEN_WIDTH = Dimensions.get('window').width - 40;

const DADOS_LINHA = {
  labels: ['Jan', 'Fev', 'Mar'],
  datasets: [
    { data: [65000, 72000, 85000], color: () => '#16a34a', strokeWidth: 2 },
    { data: [38000, 42000, 35000], color: () => '#dc2626', strokeWidth: 2 },
  ],
  legend: ['Receita', 'Despesa'],
};

const DADOS_PIZZA = [
  { name: 'Honorários', value: 65000, color: '#2563eb', legendFontColor: '#374151', legendFontSize: 13 },
  { name: 'Consultoria', value: 20000, color: '#16a34a', legendFontColor: '#374151', legendFontSize: 13 },
  { name: 'Outros', value: 15000, color: '#f59e0b', legendFontColor: '#374151', legendFontSize: 13 },
];

const DADOS_BARRA = {
  labels: ['Jan', 'Fev', 'Mar'],
  datasets: [{ data: [15800, 18500, 12200] }],
};

const CLIENTES_RANKING = [
  { nome: 'João Silva', valor: 25000 },
  { nome: 'Maria Santos', valor: 18000 },
  { nome: 'Carlos Oliveira', valor: 12000 },
  { nome: 'Ana Costa', valor: 8500 },
];

const INSIGHTS = {
  linha: [
    'Receita cresceu 30% em 3 meses — ritmo acima da média do setor.',
    'Despesas caíram 8% de Fev para Mar, indicando controle de custos.',
    'Margem líquida melhorou de 41% para 59% no período analisado.',
  ],
  pizza: [
    'Honorários representam 65% da receita total — alta dependência.',
    'Consultoria tem margem maior que honorários — potencial de crescimento.',
    'Diversificar fontes de receita pode reduzir riscos operacionais.',
  ],
  barra: [
    'Janeiro foi o mês mais caro em despesas (R$ 15.800).',
    'Redução de 34% nas despesas de Fev para Mar — tendência positiva.',
    'Monitorar categorias de custo variável para manter a queda.',
  ],
  maioresClientes: [
    'João Silva é o cliente que mais gerou receita (R$ 25.000).',
    'Ana Costa é o cliente que menos gerou receita (R$ 8.500).',
  ],
};

const CHART_CONFIG = {
  backgroundGradientFrom: '#fff',
  backgroundGradientTo: '#fff',
  color: (opacity = 1) => `rgba(37, 99, 235, ${opacity})`,
  labelColor: () => '#6b7280',
  strokeWidth: 2,
  decimalPlaces: 0,
  propsForDots: { r: '4', strokeWidth: '2', stroke: '#2563eb' },
};

export function RelatoriosScreen({ onBack, onNavigate }: Props) {
  const [periodo, setPeriodo] = useState('mes');
  const [insightAberto, setInsightAberto] = useState<'linha' | 'pizza' | 'barra' | 'maioresClientes' | null>(null);

  const toggleInsight = (tipo: 'linha' | 'pizza' | 'barra' | 'maioresClientes' ) => {
    setInsightAberto((prev) => (prev === tipo ? null : tipo));
  };

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
            {(['mes', 'semestre', 'ano'] as const).map((p) => (
              <Pressable key={p} onPress={() => setPeriodo(p)} style={[styles.periodoChip, periodo === p && styles.periodoChipActive]}>
                <Text style={[styles.periodoChipText, periodo === p && styles.periodoChipTextActive]}>{p === 'semestre' ? 'Semestre' : p === 'mes' ? 'Mês' : 'Ano'}</Text>
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
          <View style={styles.iaIcon}><MaterialCommunityIcons name="creation" size={24} color="#fff" /></View>
          <View style={styles.iaContent}>
            <Text style={styles.iaTitle}>Assistente IA Personalizado</Text>
            <Text style={styles.iaSubtitle}>Faça perguntas e obtenha análises detalhadas</Text>
          </View>
          <Text style={styles.iaArrow}>→</Text>
        </Pressable>

        <Pressable onPress={() => onNavigate('ImportacaoExportacao')} style={styles.etlCard}>
          <View style={styles.etlIcon}><MaterialCommunityIcons name="folder-open" size={24} color="#2563eb" /></View>
          <View style={styles.etlContent}>
            <Text style={styles.etlTitle}>Importação & Exportação</Text>
            <Text style={styles.etlSubtitle}>ETL de extratos bancários e dados</Text>
          </View>
          <MaterialCommunityIcons name="upload" size={22} color="#2563eb" />
          <MaterialCommunityIcons name="download" size={22} color="#2563eb" />
        </Pressable>

        {/* LineChart — Receita vs Despesa */}
        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>Receita vs Despesa</Text>
            <Pressable onPress={() => toggleInsight('linha')} style={[styles.insightBtn, insightAberto === 'linha' && styles.insightBtnActive]}>
              <MaterialCommunityIcons name="creation" size={18} color={insightAberto === 'linha' ? '#fff' : '#f59e0b'} />
            </Pressable>
          </View>
          <LineChart
            data={DADOS_LINHA}
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
          {insightAberto === 'linha' && <InsightCard bullets={INSIGHTS.linha} />}
        </View>

        {/* PieChart — Receita por Categoria */}
        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>Receita por Categoria</Text>
            <Pressable onPress={() => toggleInsight('pizza')} style={[styles.insightBtn, insightAberto === 'pizza' && styles.insightBtnActive]}>
              <MaterialCommunityIcons name="creation" size={18} color={insightAberto === 'pizza' ? '#fff' : '#f59e0b'} />
            </Pressable>
          </View>
          <PieChart
            data={DADOS_PIZZA}
            width={SCREEN_WIDTH - 32}
            height={180}
            chartConfig={CHART_CONFIG}
            accessor="value"
            backgroundColor="transparent"
            paddingLeft="16"
            absolute={false}
            style={styles.chart}
          />
          {insightAberto === 'pizza' && <InsightCard bullets={INSIGHTS.pizza} />}
        </View>

        {/* BarChart — Despesa por Mês */}
        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>Despesas por Mês</Text>
            <Pressable onPress={() => toggleInsight('barra')} style={[styles.insightBtn, insightAberto === 'barra' && styles.insightBtnActive]}>
              <MaterialCommunityIcons name="creation" size={18} color={insightAberto === 'barra' ? '#fff' : '#f59e0b'} />
            </Pressable>
          </View>
          <BarChart
            data={DADOS_BARRA}
            width={SCREEN_WIDTH - 32}
            height={180}
            chartConfig={{ ...CHART_CONFIG, color: (opacity = 1) => `rgba(220, 38, 38, ${opacity})` }}
            style={styles.chart}
            fromZero
            showValuesOnTopOfBars
            yAxisLabel="R$"
            yAxisSuffix=""
          />
          {insightAberto === 'barra' && <InsightCard bullets={INSIGHTS.barra} />}
        </View>

        <View style={styles.card}>
          <View style={styles.chartHeader}>
            <Text style={styles.cardTitle}>Maiores Clientes</Text>
            <Pressable onPress={() => toggleInsight('maioresClientes')} style={[styles.insightBtn, insightAberto === 'maioresClientes' && styles.insightBtnActive]}>
              <MaterialCommunityIcons name="creation" size={18} color={insightAberto === 'maioresClientes' ? '#fff' : '#f59e0b'} />
            </Pressable>
            </View>
          {CLIENTES_RANKING.map((c, i) => (
            <View key={i} style={styles.clienteRow}>
              <View style={styles.clienteRank}><Text style={styles.clienteRankText}>{i + 1}</Text></View>
              <Text style={styles.clienteNome}>{c.nome}</Text>
              <Text style={styles.clienteValor}>R$ {c.valor.toLocaleString('pt-BR')}</Text>
            </View>
          ))}
          {insightAberto === 'maioresClientes' && <InsightCard bullets={INSIGHTS.maioresClientes} />}
        </View>

        <View style={{ height: 80 }} />
      </ScrollView>
      <View style={styles.bottomNavWrap}>
        <BottomNav />
      </View>
    </View>
  );
}

function InsightCard({ bullets }: { bullets: string[] }) {
  return (
    <View style={styles.insightCard}>
      <View style={styles.insightHeader}>
        <MaterialCommunityIcons name="creation" size={16} color="#92400e" />
        <Text style={styles.insightTitle}>Análise IA</Text>
      </View>
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
  periodoCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },
  periodoHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  periodoLabel: { fontSize: 14, color: '#6b7280' },
  periodoRow: { flexDirection: 'row', gap: 8 },
  periodoChip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, backgroundColor: '#f3f4f6' },
  periodoChipActive: { backgroundColor: '#2563eb' },
  periodoChipText: { fontSize: 14, color: '#6b7280' },
  periodoChipTextActive: { color: '#fff' },
  kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 16 },
  kpiItem: { width: '47%' },
  chartCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },
  chartHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  chartTitle: { fontSize: 16, fontWeight: '600', color: '#111827' },
  insightBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#fffbeb', alignItems: 'center', justifyContent: 'center' },
  insightBtnActive: { backgroundColor: '#f59e0b' },
  chart: { borderRadius: 8, marginLeft: -16 },
  legenda: { flexDirection: 'row', gap: 16, marginTop: 8 },
  legendaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendaDot: { width: 10, height: 10, borderRadius: 5 },
  legendaText: { fontSize: 13, color: '#6b7280' },
  insightCard: { backgroundColor: '#fffbeb', borderWidth: 1, borderColor: '#fde68a', borderRadius: 12, padding: 12, marginTop: 12 },
  insightHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  insightTitle: { fontSize: 14, fontWeight: '600', color: '#92400e' },
  insightRow: { flexDirection: 'row', gap: 6, marginBottom: 4 },
  insightBullet: { fontSize: 14, color: '#92400e', lineHeight: 20 },
  insightText: { flex: 1, fontSize: 13, color: '#78350f', lineHeight: 20 },
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
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },
  cardTitle: { fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 16 },
  clienteRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  clienteRank: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#dbeafe', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  clienteRankText: { fontSize: 14, fontWeight: '600', color: '#2563eb' },
  clienteNome: { flex: 1, fontSize: 16, color: '#111827' },
  clienteValor: { fontSize: 16, fontWeight: '600', color: '#2563eb' },
  bottomNavWrap: { position: 'absolute', bottom: 0, left: 0, right: 0 },
});
