import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  Modal,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Header } from '../components/Header';
import { BottomNav } from '../components/BottomNav';

type Props = {
  onBack: () => void;
  onNavigate: (screen: string, id?: string) => void;
};

interface HistoricoItem {
  id: number;
  tipo: string;
  periodo: string;
  resposta: string;
  data: string;
}

const tiposAnalise = [
  { value: 'receita-despesa', label: 'Receita vs Despesa' },
  { value: 'receita-categoria', label: 'Receita por Categoria' },
  { value: 'despesa-categoria', label: 'Despesa por Categoria' },
  { value: 'maiores-clientes', label: 'Maiores Clientes' },
  { value: 'margem-lucro', label: 'Margem de Lucro' },
  { value: 'inadimplencia', label: 'Inadimplência' },
];

const respostasIA: Record<string, string> = {
  'receita-despesa': 'Analisando o período selecionado, sua receita apresentou crescimento consistente de 17%. As despesas aumentaram apenas 7%, indicando boa gestão de custos. A margem de lucro está em expansão, com tendência positiva para os próximos meses.',
  'receita-categoria': 'Os Honorários representam 76% da sua receita total. Consultoria está crescendo 12% ao mês e pode ser uma boa oportunidade de diversificação.',
  'despesa-categoria': 'O Aluguel representa 35% das suas despesas fixas. Há uma oportunidade de reduzir custos operacionais em aproximadamente 15%.',
  'maiores-clientes': 'Seus top 2 clientes representam 68% da receita total. João Silva sozinho é responsável por 40% do faturamento.',
  'margem-lucro': 'Sua margem de lucro atual está em 49.8%, acima da média do mercado jurídico (35-40%). O crescimento de 2.3% nos últimos meses indica tendência positiva.',
  'inadimplencia': 'A taxa de inadimplência está em 12%, dentro da média do setor jurídico (10-15%). A redução de 3% indica melhoria nos processos de cobrança.',
};

const filtrosHistorico = [
  { value: 'todos', label: 'Todos' },
  ...tiposAnalise,
];

export function AssistenteIAScreen({ onBack, onNavigate }: Props) {
  const [tipoAnalise, setTipoAnalise] = useState('');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [respostaIA, setRespostaIA] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [filtroHistorico, setFiltroHistorico] = useState('todos');
  const [modalTipo, setModalTipo] = useState(false);
  const [modalFiltro, setModalFiltro] = useState(false);

  const [historico, setHistorico] = useState<HistoricoItem[]>([
    {
      id: 1,
      tipo: 'Receita vs Despesa',
      periodo: '01/01/2024 - 31/03/2024',
      resposta: 'Sua receita cresceu 17% de Janeiro a Março. Despesas aumentaram apenas 7%, mantendo boa margem. Tendência positiva: lucro líquido crescente.',
      data: '22/02/2024 14:30',
    },
    {
      id: 2,
      tipo: 'Maiores Clientes',
      periodo: '01/02/2024 - 28/02/2024',
      resposta: 'Top 2 clientes representam 68% da receita. João Silva é responsável por 40% do faturamento. Risco: alta dependência de poucos clientes.',
      data: '20/02/2024 09:15',
    },
    {
      id: 3,
      tipo: 'Despesa por Categoria',
      periodo: '01/01/2024 - 31/01/2024',
      resposta: 'Aluguel representa 35% das despesas fixas. Custas judiciais com volume acima da média. Oportunidade de reduzir custos operacionais em 15%.',
      data: '15/02/2024 16:45',
    },
  ]);

  const tipoLabel = tiposAnalise.find(t => t.value === tipoAnalise)?.label ?? '';

  const handleGerarInsight = () => {
    if (!tipoAnalise || !dataInicio || !dataFim) return;
    setIsLoading(true);
    setTimeout(() => {
      const resposta = respostasIA[tipoAnalise] ?? 'Análise não disponível.';
      setRespostaIA(resposta);
      const novoItem: HistoricoItem = {
        id: historico.length + 1,
        tipo: tipoLabel,
        periodo: `${dataInicio} - ${dataFim}`,
        resposta,
        data: new Date().toLocaleString('pt-BR', {
          day: '2-digit', month: '2-digit', year: 'numeric',
          hour: '2-digit', minute: '2-digit',
        }),
      };
      setHistorico(prev => [novoItem, ...prev]);
      setIsLoading(false);
    }, 1500);
  };

  const historicoFiltrado = historico.filter(
    item => filtroHistorico === 'todos' || item.tipo === filtroHistorico,
  );

  const filtroLabel = filtrosHistorico.find(f => f.value === filtroHistorico)?.label ?? 'Todos';

  const canSubmit = !!tipoAnalise && !!dataInicio && !!dataFim && !isLoading;

  return (
    <View style={styles.container}>
      <Header title="Assistente IA" showBack onBack={onBack} />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Card Principal */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.iconWrap}>
              <MaterialCommunityIcons name="shimmer" size={24} color="#9333ea" />
            </View>
            <View>
              <Text style={styles.cardTitle}>Consultoria Inteligente</Text>
              <Text style={styles.cardSubtitle}>Obtenha insights personalizados</Text>
            </View>
          </View>

          {/* Tipo de Análise */}
          <Text style={styles.label}>Tipo de Análise</Text>
          <Pressable style={styles.selectBtn} onPress={() => setModalTipo(true)}>
            <Text style={[styles.selectText, !tipoAnalise && styles.placeholder]}>
              {tipoLabel || 'Selecione o tipo de análise'}
            </Text>
            <MaterialCommunityIcons name="chevron-down" size={20} color="#9ca3af" />
          </Pressable>

          {/* Período */}
          <Text style={[styles.label, { marginTop: 16 }]}>Período de Análise</Text>
          <View style={styles.dateRow}>
            <View style={styles.dateField}>
              <MaterialCommunityIcons name="calendar" size={18} color="#9ca3af" style={styles.dateIcon} />
              <TextInput
                style={styles.dateInput}
                placeholder="DD/MM/AAAA"
                placeholderTextColor="#9ca3af"
                value={dataInicio}
                onChangeText={setDataInicio}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.dateField}>
              <MaterialCommunityIcons name="calendar" size={18} color="#9ca3af" style={styles.dateIcon} />
              <TextInput
                style={styles.dateInput}
                placeholder="DD/MM/AAAA"
                placeholderTextColor="#9ca3af"
                value={dataFim}
                onChangeText={setDataFim}
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Botão Gerar */}
          <Pressable
            style={[styles.submitBtn, !canSubmit && styles.submitBtnDisabled]}
            onPress={handleGerarInsight}
            disabled={!canSubmit}
          >
            {isLoading ? (
              <>
                <ActivityIndicator color="#fff" size="small" />
                <Text style={styles.submitBtnText}>Analisando...</Text>
              </>
            ) : (
              <>
                <MaterialCommunityIcons name="send" size={18} color="#fff" />
                <Text style={styles.submitBtnText}>Gerar Insight</Text>
              </>
            )}
          </Pressable>
        </View>

        {/* Resposta IA */}
        {!!respostaIA && (
          <View style={styles.respostaCard}>
            <View style={styles.respostaHeader}>
              <View style={styles.respostaIconWrap}>
                <MaterialCommunityIcons name="shimmer" size={20} color="#9333ea" />
              </View>
              <View style={styles.respostaContent}>
                <Text style={styles.respostaTitle}>Análise Gerada</Text>
                <Text style={styles.respostaText}>{respostaIA}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Histórico */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <MaterialCommunityIcons name="clock-outline" size={18} color="#374151" />
              <Text style={styles.sectionTitle}>Histórico de Insights</Text>
            </View>
            <Pressable style={styles.filtroBtn} onPress={() => setModalFiltro(true)}>
              <MaterialCommunityIcons name="filter-variant" size={16} color="#374151" />
              <Text style={styles.filtroText}>{filtroLabel}</Text>
              <MaterialCommunityIcons name="chevron-down" size={16} color="#374151" />
            </Pressable>
          </View>

          {historicoFiltrado.map(item => (
            <View key={item.id} style={styles.historicoCard}>
              <View style={styles.historicoTop}>
                <View style={styles.tipoTag}>
                  <Text style={styles.tipoTagText}>{item.tipo}</Text>
                </View>
                <Text style={styles.historicoData}>{item.data}</Text>
              </View>
              <Text style={styles.historicoPeriodo}>{item.periodo}</Text>
              <Text style={styles.historicoResposta}>{item.resposta}</Text>
            </View>
          ))}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <View style={styles.bottomNavWrap}>
        <BottomNav />
      </View>

      {/* Modal Tipo de Análise */}
      <Modal visible={modalTipo} transparent animationType="slide">
        <Pressable style={styles.modalOverlay} onPress={() => setModalTipo(false)}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>Tipo de Análise</Text>
            {tiposAnalise.map(tipo => (
              <Pressable
                key={tipo.value}
                style={[styles.modalOption, tipoAnalise === tipo.value && styles.modalOptionActive]}
                onPress={() => { setTipoAnalise(tipo.value); setModalTipo(false); }}
              >
                <Text style={[styles.modalOptionText, tipoAnalise === tipo.value && styles.modalOptionTextActive]}>
                  {tipo.label}
                </Text>
                {tipoAnalise === tipo.value && (
                  <MaterialCommunityIcons name="check" size={18} color="#9333ea" />
                )}
              </Pressable>
            ))}
            <Pressable style={styles.modalCancel} onPress={() => setModalTipo(false)}>
              <Text style={styles.modalCancelText}>Cancelar</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>

      {/* Modal Filtro Histórico */}
      <Modal visible={modalFiltro} transparent animationType="slide">
        <Pressable style={styles.modalOverlay} onPress={() => setModalFiltro(false)}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>Filtrar Histórico</Text>
            {filtrosHistorico.map(f => (
              <Pressable
                key={f.value}
                style={[styles.modalOption, filtroHistorico === f.value && styles.modalOptionActive]}
                onPress={() => { setFiltroHistorico(f.value); setModalFiltro(false); }}
              >
                <Text style={[styles.modalOptionText, filtroHistorico === f.value && styles.modalOptionTextActive]}>
                  {f.label}
                </Text>
                {filtroHistorico === f.value && (
                  <MaterialCommunityIcons name="check" size={18} color="#9333ea" />
                )}
              </Pressable>
            ))}
            <Pressable style={styles.modalCancel} onPress={() => setModalFiltro(false)}>
              <Text style={styles.modalCancelText}>Cancelar</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 16 },

  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  iconWrap: {
    width: 48, height: 48, borderRadius: 12,
    backgroundColor: '#f3e8ff', alignItems: 'center', justifyContent: 'center',
  },
  cardTitle: { fontSize: 15, fontWeight: '600', color: '#111827' },
  cardSubtitle: { fontSize: 13, color: '#6b7280', marginTop: 2 },

  label: { fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 8 },

  selectBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#f9fafb', borderWidth: 1, borderColor: '#e5e7eb',
    borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12,
  },
  selectText: { fontSize: 14, color: '#111827', flex: 1 },
  placeholder: { color: '#9ca3af' },

  dateRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  dateField: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#f9fafb', borderWidth: 1, borderColor: '#e5e7eb',
    borderRadius: 12, paddingHorizontal: 12,
  },
  dateIcon: { marginRight: 8 },
  dateInput: { flex: 1, height: 46, fontSize: 13, color: '#111827' },

  submitBtn: {
    backgroundColor: '#9333ea', borderRadius: 12, paddingVertical: 14,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  submitBtnDisabled: { backgroundColor: '#d1d5db' },
  submitBtnText: { color: '#fff', fontSize: 15, fontWeight: '600' },

  respostaCard: {
    backgroundColor: '#faf5ff', borderWidth: 1, borderColor: '#e9d5ff',
    borderRadius: 16, padding: 16, marginBottom: 16,
  },
  respostaHeader: { flexDirection: 'row', gap: 12 },
  respostaIconWrap: {
    width: 36, height: 36, borderRadius: 8,
    backgroundColor: '#f3e8ff', alignItems: 'center', justifyContent: 'center',
  },
  respostaContent: { flex: 1 },
  respostaTitle: { fontSize: 15, fontWeight: '600', color: '#111827', marginBottom: 6 },
  respostaText: { fontSize: 14, color: '#374151', lineHeight: 21 },

  section: { marginBottom: 16 },
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 12,
  },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#111827' },
  filtroBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#f9fafb', borderWidth: 1, borderColor: '#e5e7eb',
    borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6,
  },
  filtroText: { fontSize: 13, color: '#374151' },

  historicoCard: {
    backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 8, elevation: 3,
  },
  historicoTop: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  tipoTag: {
    backgroundColor: '#f3e8ff', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3,
  },
  tipoTagText: { fontSize: 12, color: '#7c3aed', fontWeight: '500' },
  historicoData: { fontSize: 12, color: '#9ca3af' },
  historicoPeriodo: { fontSize: 13, color: '#6b7280', marginBottom: 8 },
  historicoResposta: { fontSize: 13, color: '#374151', lineHeight: 20 },

  bottomNavWrap: { position: 'absolute', bottom: 0, left: 0, right: 0 },

  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 20, paddingBottom: 36,
  },
  modalTitle: { fontSize: 18, fontWeight: '600', color: '#111827', marginBottom: 16 },
  modalOption: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 14, paddingHorizontal: 12, borderRadius: 12, marginBottom: 4,
  },
  modalOptionActive: { backgroundColor: '#faf5ff' },
  modalOptionText: { fontSize: 15, color: '#374151' },
  modalOptionTextActive: { color: '#9333ea', fontWeight: '500' },
  modalCancel: {
    marginTop: 8, paddingVertical: 14, backgroundColor: '#f3f4f6',
    borderRadius: 12, alignItems: 'center',
  },
  modalCancelText: { fontSize: 15, fontWeight: '600', color: '#374151' },
});
