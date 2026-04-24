import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  Modal,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Header } from '../components/Header';
import { BottomNav } from '../components/BottomNav';
import { getApiBaseUrl } from '../config/api';
import { useAuth } from '../context/AuthContext';
import { fetchIaHistorico, postIaAnalise } from '../services/resources';

type Props = {
  onBack: () => void;
  onNavigate: (screen: string, id?: string) => void;
};

interface HistoricoItem {
  id: string;
  tipoAnalise: string;
  tipoLabel: string;
  periodo: string;
  resposta: string;
  data: string;
}

function brDatasParaIso(inicio: string, fim: string): { dataInicio: string; dataFim: string } {
  const p = (s: string) => s.split('/').map((x) => x.trim());
  const [d1, m1, y1] = p(inicio);
  const [d2, m2, y2] = p(fim);
  if (y1 && m1 && d1 && y2 && m2 && d2) {
    return {
      dataInicio: `${y1}-${m1.padStart(2, '0')}-${d1.padStart(2, '0')}`,
      dataFim: `${y2}-${m2.padStart(2, '0')}-${d2.padStart(2, '0')}`,
    };
  }
  return { dataInicio: inicio, dataFim: fim };
}

function formatGeradoEm(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const tiposAnalise = [
  { value: 'receita-despesa', label: 'Receita vs Despesa' },
  { value: 'receita-categoria', label: 'Receita por Categoria' },
  { value: 'despesa-categoria', label: 'Despesa por Categoria' },
  { value: 'maiores-clientes', label: 'Maiores Clientes' },
  { value: 'margem-lucro', label: 'Margem de Lucro' },
  { value: 'inadimplencia', label: 'Inadimplência' },
];

const filtrosHistorico = [
  { value: 'todos', label: 'Todos' },
  ...tiposAnalise,
];

export function AssistenteIAScreen({ onBack, onNavigate }: Props) {
  const { token } = useAuth();
  const apiOn = !!getApiBaseUrl() && !!token;

  const [tipoAnalise, setTipoAnalise] = useState('');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [respostaIA, setRespostaIA] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [filtroHistorico, setFiltroHistorico] = useState('todos');
  const [modalTipo, setModalTipo] = useState(false);
  const [modalFiltro, setModalFiltro] = useState(false);

  const [historico, setHistorico] = useState<HistoricoItem[]>([]);

  useEffect(() => {
    if (!apiOn || !token) {
      setHistorico([]);
      return;
    }
    let cancelled = false;
    (async () => {
      const env = await fetchIaHistorico(token);
      if (cancelled) return;
      if (env?.historico?.length) {
        setHistorico(
          env.historico.map((h) => ({
            id: h.id,
            tipoAnalise: h.tipoAnalise,
            tipoLabel: tiposAnalise.find((t) => t.value === h.tipoAnalise)?.label ?? h.tipoAnalise,
            periodo: h.periodo,
            resposta: h.resposta,
            data: formatGeradoEm(h.geradoEm),
          })),
        );
      } else {
        setHistorico([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [apiOn, token]);

  const tipoLabel = tiposAnalise.find(t => t.value === tipoAnalise)?.label ?? '';

  const handleGerarInsight = () => {
    if (!tipoAnalise || !dataInicio || !dataFim) return;
    setIsLoading(true);

    if (!apiOn || !token) {
      Alert.alert('API', 'Configure EXPO_PUBLIC_API_URL e faça login para gerar análises.');
      setIsLoading(false);
      return;
    }

    const { dataInicio: di, dataFim: df } = brDatasParaIso(dataInicio, dataFim);
    void (async () => {
      const resp = await postIaAnalise(token, { tipoAnalise, dataInicio: di, dataFim: df });
      if (resp) {
        setRespostaIA(resp.resposta);
        const novoItem: HistoricoItem = {
          id: resp.id,
          tipoAnalise: resp.tipoAnalise,
          tipoLabel: tiposAnalise.find((t) => t.value === resp.tipoAnalise)?.label ?? tipoLabel,
          periodo: resp.periodo,
          resposta: resp.resposta,
          data: formatGeradoEm(resp.geradoEm),
        };
        setHistorico((prev) => [novoItem, ...prev]);
      } else {
        Alert.alert('Erro', 'Não foi possível obter resposta da API.');
      }
      setIsLoading(false);
    })();
  };

  const historicoFiltrado = historico.filter(
    item => filtroHistorico === 'todos' || item.tipoAnalise === filtroHistorico,
  );

  const filtroLabel = filtrosHistorico.find(f => f.value === filtroHistorico)?.label ?? 'Todos';
  const filtroAtivo = filtroHistorico !== 'todos';
  const corFiltro = filtroAtivo ? '#fff' : '#111827';

  const canSubmit = !!tipoAnalise && !!dataInicio && !!dataFim && !isLoading;

  return (
    <View style={styles.container}>
      <Header title="Assistente IA" showBack onBack={onBack} />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Card Principal */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.iconWrap}>
              <MaterialCommunityIcons name="shimmer" size={24} color="#0d9488" />
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
                <MaterialCommunityIcons name="shimmer" size={20} color="#0d9488" />
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
            <Pressable
              style={[styles.filtroBtn, filtroAtivo && styles.filtroBtnActive]}
              onPress={() => setModalFiltro(true)}
            >
              <MaterialCommunityIcons name="filter-variant" size={16} color={corFiltro} />
              <Text style={[styles.filtroText, filtroAtivo && styles.filtroTextActive]}>{filtroLabel}</Text>
              <MaterialCommunityIcons name="chevron-down" size={16} color={corFiltro} />
            </Pressable>
          </View>

          {historicoFiltrado.map(item => (
            <View key={item.id} style={styles.historicoCard}>
              <View style={styles.historicoTop}>
                <View style={styles.tipoTag}>
                  <Text style={styles.tipoTagText}>{item.tipoLabel}</Text>
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
                  <MaterialCommunityIcons name="check" size={18} color="#0d9488" />
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
                  <MaterialCommunityIcons name="check" size={18} color="#0d9488" />
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
    backgroundColor: '#ccfbf1', alignItems: 'center', justifyContent: 'center',
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
    backgroundColor: '#0d9488', borderRadius: 12, paddingVertical: 14,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  submitBtnDisabled: { backgroundColor: '#d1d5db' },
  submitBtnText: { color: '#fff', fontSize: 15, fontWeight: '600' },

  respostaCard: {
    backgroundColor: '#ecfeff', borderWidth: 1, borderColor: '#99f6e4',
    borderRadius: 16, padding: 16, marginBottom: 16,
  },
  respostaHeader: { flexDirection: 'row', gap: 12 },
  respostaIconWrap: {
    width: 36, height: 36, borderRadius: 8,
    backgroundColor: '#ccfbf1', alignItems: 'center', justifyContent: 'center',
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
    backgroundColor: '#fff',
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  filtroBtnActive: {
    backgroundColor: '#111827',
  },
  filtroText: { fontSize: 13, color: '#111827', fontWeight: '500' },
  filtroTextActive: { color: '#fff' },

  historicoCard: {
    backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 8, elevation: 3,
  },
  historicoTop: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  tipoTag: {
    backgroundColor: '#ccfbf1', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3,
  },
  tipoTagText: { fontSize: 12, color: '#0f766e', fontWeight: '500' },
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
  modalOptionActive: { backgroundColor: '#111827' },
  modalOptionText: { fontSize: 15, color: '#374151' },
  modalOptionTextActive: { color: '#fff', fontWeight: '600' },
  modalCancel: {
    marginTop: 8, paddingVertical: 14, backgroundColor: '#f3f4f6',
    borderRadius: 12, alignItems: 'center',
  },
  modalCancelText: { fontSize: 15, fontWeight: '600', color: '#374151' },
});
