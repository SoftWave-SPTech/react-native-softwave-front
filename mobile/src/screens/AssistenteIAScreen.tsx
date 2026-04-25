import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Header } from '../components/Header';
import { BottomNav } from '../components/BottomNav';
import { API_BASE_URL } from '../config/api';
import {
  gerarInsight,
  listarInsights,
  type InsightFinanceiroResponse,
  type TipoInsight,
} from '../services/insightsApi';

type Props = {
  onBack: () => void;
  onNavigate?: (screen: string, id?: string) => void;
};

interface HistoricoItem {
  id: string;
  tipoAnalise: string;
  tipoLabel: string;
  periodo: string;
  resumo: string;
  bullets: string[];
  riscos: string[];
  oportunidades: string[];
  data: string;
}

const tiposAnalise: Array<{ value: string; label: string; api: TipoInsight }> = [
  { value: 'receita-despesa', label: 'Receita vs Despesa', api: 'RECEITA_DESPESA' },
  { value: 'receita-categoria', label: 'Receita por Categoria', api: 'RECEITA_POR_CATEGORIA' },
  { value: 'despesa-categoria', label: 'Despesa por Categoria', api: 'DESPESA_POR_CATEGORIA' },
  { value: 'maiores-clientes', label: 'Maiores Clientes', api: 'MAIORES_CLIENTES' },
  { value: 'margem-lucro', label: 'Margem de Lucro', api: 'MARGEM_LUCRO' },
  { value: 'inadimplencia', label: 'Inadimplência', api: 'INADIMPLENCIA' },
];

const API_TIPO_PARA_UI: Record<TipoInsight, string> = {
  RECEITA_DESPESA: 'receita-despesa',
  RECEITA_POR_CATEGORIA: 'receita-categoria',
  DESPESA_POR_CATEGORIA: 'despesa-categoria',
  MAIORES_CLIENTES: 'maiores-clientes',
  MARGEM_LUCRO: 'margem-lucro',
  INADIMPLENCIA: 'inadimplencia',
};

const filtrosHistorico = [{ value: 'todos', label: 'Todos' }, ...tiposAnalise.map((t) => ({ value: t.value, label: t.label }))];

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

function mascaraDataNumerica(value: string): string {
  const numbers = value.replace(/\D/g, '').slice(0, 8);
  if (numbers.length <= 2) return numbers;
  if (numbers.length <= 4) return `${numbers.slice(0, 2)}/${numbers.slice(2)}`;
  return `${numbers.slice(0, 2)}/${numbers.slice(2, 4)}/${numbers.slice(4)}`;
}

function isoDateParaBr(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso.trim());
  if (!m) return iso;
  return `${m[3]}/${m[2]}/${m[1]}`;
}

function periodoBrDeInsight(dataInicio: string, dataFim: string): string {
  return `${isoDateParaBr(dataInicio)} — ${isoDateParaBr(dataFim)}`;
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

function mapearInsightParaHistorico(insight: InsightFinanceiroResponse): HistoricoItem {
  const tipoAnalise = API_TIPO_PARA_UI[insight.tipoInsight] ?? insight.tipoInsight;
  const bullets = Array.isArray(insight.bullets) ? insight.bullets.filter((b) => b?.trim()) : [];
  const riscos = Array.isArray(insight.riscos) ? insight.riscos.filter((b) => b?.trim()) : [];
  const oportunidades = Array.isArray(insight.oportunidades)
    ? insight.oportunidades.filter((b) => b?.trim())
    : [];
  return {
    id: String(insight.id),
    tipoAnalise,
    tipoLabel: tiposAnalise.find((t) => t.value === tipoAnalise)?.label ?? insight.tipoInsight,
    periodo: periodoBrDeInsight(insight.dataInicio, insight.dataFim),
    resumo: insight.resumoIA?.trim() ?? '',
    bullets,
    riscos,
    oportunidades,
    data: formatGeradoEm(insight.criadoEm),
  };
}

export function AssistenteIAScreen({ onBack, onNavigate }: Props) {
  const apiOn = !!API_BASE_URL?.trim();

  const [tenantId, setTenantId] = useState('1');
  const [tipoAnalise, setTipoAnalise] = useState('');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [insightGerado, setInsightGerado] = useState<HistoricoItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [filtroHistorico, setFiltroHistorico] = useState('todos');
  const [modalTipo, setModalTipo] = useState(false);
  const [modalFiltro, setModalFiltro] = useState(false);
  const [modalDetalhe, setModalDetalhe] = useState(false);
  const [insightSelecionado, setInsightSelecionado] = useState<HistoricoItem | null>(null);
  const [incluirComparativo, setIncluirComparativo] = useState(true);
  const [carregandoHistorico, setCarregandoHistorico] = useState(false);

  const [historico, setHistorico] = useState<HistoricoItem[]>([]);

  useEffect(() => {
    let cancelled = false;
    const tid = Number(tenantId);
    if (!apiOn || !tid || Number.isNaN(tid)) {
      setHistorico([]);
      return () => {
        cancelled = true;
      };
    }
    setCarregandoHistorico(true);
    void (async () => {
      try {
        const lista = await listarInsights(tid, 0, 50);
        if (cancelled) return;
        setHistorico(lista.map(mapearInsightParaHistorico));
      } catch {
        if (cancelled) return;
        setHistorico([]);
      } finally {
        if (!cancelled) setCarregandoHistorico(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [apiOn, tenantId]);

  const tipoLabel = tiposAnalise.find((t) => t.value === tipoAnalise)?.label ?? '';
  const tipoApiSelecionado = tiposAnalise.find((t) => t.value === tipoAnalise)?.api;

  const handleGerarInsight = () => {
    if (!tipoAnalise || !dataInicio || !dataFim || !tipoApiSelecionado) return;

    const tid = Number(tenantId);
    if (!tid || Number.isNaN(tid)) {
      Alert.alert('Tenant', 'Informe um ID de escritório (tenant) numérico válido.');
      return;
    }

    if (!apiOn) {
      Alert.alert('API', 'URL da API não configurada.');
      return;
    }

    setIsLoading(true);
    const { dataInicio: di, dataFim: df } = brDatasParaIso(dataInicio, dataFim);

    void (async () => {
      try {
        const insight = await gerarInsight({
          tenantId: tid,
          tipoInsight: tipoApiSelecionado,
          dataInicio: di,
          dataFim: df,
          incluirComparativoPeriodoAnterior: incluirComparativo,
        });
        const novoItem = mapearInsightParaHistorico(insight);
        setInsightGerado(novoItem);
        setHistorico((prev) => {
          const rest = prev.filter((h) => h.id !== novoItem.id);
          return [novoItem, ...rest];
        });
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Não foi possível gerar o insight.';
        Alert.alert('Erro', msg);
      } finally {
        setIsLoading(false);
      }
    })();
  };

  const historicoFiltrado = historico.filter(
    (item) => filtroHistorico === 'todos' || item.tipoAnalise === filtroHistorico,
  );

  const filtroLabel = filtrosHistorico.find((f) => f.value === filtroHistorico)?.label ?? 'Todos';
  const filtroAtivo = filtroHistorico !== 'todos';
  const corFiltro = filtroAtivo ? '#fff' : '#111827';

  const canSubmit = !!tipoAnalise && dataInicio.length === 10 && dataFim.length === 10 && !isLoading;

  const bottomNavigate = onNavigate ?? (() => {});

  return (
    <View style={styles.container}>
      <Header title="Assistente IA" showBack onBack={onBack} />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.iconWrap}>
              <MaterialCommunityIcons name="shimmer" size={24} color="#0d9488" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>Consultoria Inteligente</Text>
              <Text style={styles.cardSubtitle}>Insights a partir da API financeira ({API_BASE_URL})</Text>
            </View>
          </View>

          <Text style={styles.label}>Escritório (tenant)</Text>
          <TextInput
            style={styles.tenantInput}
            value={tenantId}
            onChangeText={setTenantId}
            keyboardType="numeric"
            placeholder="Ex.: 1"
            placeholderTextColor="#9ca3af"
          />

          <Text style={styles.label}>Tipo de Análise</Text>
          <Pressable style={styles.selectBtn} onPress={() => setModalTipo(true)}>
            <Text style={[styles.selectText, !tipoAnalise && styles.placeholder]}>
              {tipoLabel || 'Selecione o tipo de análise'}
            </Text>
            <MaterialCommunityIcons name="chevron-down" size={20} color="#9ca3af" />
          </Pressable>

          <Text style={[styles.label, { marginTop: 16 }]}>Período de Análise</Text>
          <View style={styles.dateRow}>
            <View style={styles.dateField}>
              <MaterialCommunityIcons name="calendar" size={18} color="#9ca3af" style={styles.dateIcon} />
              <TextInput
                style={styles.dateInput}
                placeholder="DD/MM/AAAA"
                placeholderTextColor="#9ca3af"
                value={dataInicio}
                onChangeText={(text) => setDataInicio(mascaraDataNumerica(text))}
                keyboardType="numeric"
                maxLength={10}
              />
            </View>
            <View style={styles.dateField}>
              <MaterialCommunityIcons name="calendar" size={18} color="#9ca3af" style={styles.dateIcon} />
              <TextInput
                style={styles.dateInput}
                placeholder="DD/MM/AAAA"
                placeholderTextColor="#9ca3af"
                value={dataFim}
                onChangeText={(text) => setDataFim(mascaraDataNumerica(text))}
                keyboardType="numeric"
                maxLength={10}
              />
            </View>
          </View>

          <Pressable
            onPress={() => setIncluirComparativo((v) => !v)}
            style={styles.toggleRow}
          >
            <View style={[styles.checkbox, incluirComparativo && styles.checkboxActive]}>
              {incluirComparativo ? (
                <MaterialCommunityIcons name="check" size={14} color="#fff" />
              ) : null}
            </View>
            <Text style={styles.toggleText}>Comparar com período anterior</Text>
          </Pressable>

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

        {!!insightGerado && (
          <View style={styles.respostaCard}>
            <View style={styles.respostaHeader}>
              <View style={styles.respostaIconWrap}>
                <MaterialCommunityIcons name="shimmer" size={20} color="#0d9488" />
              </View>
              <View style={styles.respostaContent}>
                <Text style={styles.respostaTitle}>Análise Gerada</Text>
                <Text style={styles.respostaText} numberOfLines={3}>{insightGerado.resumo}</Text>
                <Pressable
                  style={styles.verMaisBtn}
                  onPress={() => {
                    setInsightSelecionado(insightGerado);
                    setModalDetalhe(true);
                  }}
                >
                  <Text style={styles.verMaisText}>Ver análise completa</Text>
                </Pressable>
              </View>
            </View>
          </View>
        )}

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

          {carregandoHistorico ? (
            <ActivityIndicator style={{ marginVertical: 16 }} color="#0d9488" />
          ) : historicoFiltrado.length === 0 ? (
            <Text style={styles.emptyHistorico}>Nenhum insight salvo ainda para este tenant.</Text>
          ) : (
            historicoFiltrado.map((item) => (
              <View key={item.id} style={styles.historicoCard}>
                <View style={styles.historicoTop}>
                  <View style={styles.tipoTag}>
                    <Text style={styles.tipoTagText}>{item.tipoLabel}</Text>
                  </View>
                  <Text style={styles.historicoData}>{item.data}</Text>
                </View>
                <Text style={styles.historicoPeriodo}>{item.periodo}</Text>
                <Text style={styles.historicoResumo} numberOfLines={2}>{item.resumo}</Text>
                <Pressable
                  style={styles.linkDetalhe}
                  onPress={() => {
                    setInsightSelecionado(item);
                    setModalDetalhe(true);
                  }}
                >
                  <Text style={styles.linkDetalheText}>Ver detalhes</Text>
                </Pressable>
              </View>
            ))
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <View style={styles.bottomNavWrap}>
        <BottomNav activeScreen="AssistenteIA" onNavigate={bottomNavigate} />
      </View>

      <Modal visible={modalTipo} transparent animationType="slide">
        <Pressable style={styles.modalOverlay} onPress={() => setModalTipo(false)}>
          <View style={styles.modalSheet} onStartShouldSetResponder={() => true}>
            <Text style={styles.modalTitle}>Tipo de Análise</Text>
            {tiposAnalise.map((tipo) => (
              <Pressable
                key={tipo.value}
                style={[styles.modalOption, tipoAnalise === tipo.value && styles.modalOptionActive]}
                onPress={() => {
                  setTipoAnalise(tipo.value);
                  setModalTipo(false);
                }}
              >
                <Text style={[styles.modalOptionText, tipoAnalise === tipo.value && styles.modalOptionTextActive]}>
                  {tipo.label}
                </Text>
                {tipoAnalise === tipo.value ? (
                  <MaterialCommunityIcons name="check" size={18} color="#0d9488" />
                ) : null}
              </Pressable>
            ))}
            <Pressable style={styles.modalCancel} onPress={() => setModalTipo(false)}>
              <Text style={styles.modalCancelText}>Cancelar</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>

      <Modal visible={modalFiltro} transparent animationType="slide">
        <Pressable style={styles.modalOverlay} onPress={() => setModalFiltro(false)}>
          <View style={styles.modalSheet} onStartShouldSetResponder={() => true}>
            <Text style={styles.modalTitle}>Filtrar Histórico</Text>
            {filtrosHistorico.map((f) => (
              <Pressable
                key={f.value}
                style={[styles.modalOption, filtroHistorico === f.value && styles.modalOptionActive]}
                onPress={() => {
                  setFiltroHistorico(f.value);
                  setModalFiltro(false);
                }}
              >
                <Text style={[styles.modalOptionText, filtroHistorico === f.value && styles.modalOptionTextActive]}>
                  {f.label}
                </Text>
                {filtroHistorico === f.value ? (
                  <MaterialCommunityIcons name="check" size={18} color="#0d9488" />
                ) : null}
              </Pressable>
            ))}
            <Pressable style={styles.modalCancel} onPress={() => setModalFiltro(false)}>
              <Text style={styles.modalCancelText}>Cancelar</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>

      <Modal visible={modalDetalhe} transparent animationType="slide">
        <Pressable style={styles.modalOverlay} onPress={() => setModalDetalhe(false)}>
          <View style={styles.modalSheet} onStartShouldSetResponder={() => true}>
            <Text style={styles.modalTitle}>Detalhes do Insight</Text>
            {insightSelecionado ? (
              <ScrollView style={styles.modalContent}>
                <Text style={styles.modalMeta}>{insightSelecionado.tipoLabel} • {insightSelecionado.data}</Text>
                <Text style={styles.modalMeta}>{insightSelecionado.periodo}</Text>

                <Text style={styles.modalSectionTitle}>Resumo</Text>
                <Text style={styles.modalSectionText}>{insightSelecionado.resumo || 'Sem resumo.'}</Text>

                <Text style={styles.modalSectionTitle}>Ações sugeridas</Text>
                {insightSelecionado.bullets.length ? insightSelecionado.bullets.map((item, index) => (
                  <Text key={`${item}-${index}`} style={styles.modalBullet}>• {item}</Text>
                )) : <Text style={styles.modalSectionText}>Sem ações sugeridas.</Text>}

                <Text style={styles.modalSectionTitle}>Riscos</Text>
                {insightSelecionado.riscos.length ? insightSelecionado.riscos.map((item, index) => (
                  <Text key={`${item}-${index}`} style={styles.modalBullet}>• {item}</Text>
                )) : <Text style={styles.modalSectionText}>Sem riscos informados.</Text>}

                <Text style={styles.modalSectionTitle}>Oportunidades</Text>
                {insightSelecionado.oportunidades.length ? insightSelecionado.oportunidades.map((item, index) => (
                  <Text key={`${item}-${index}`} style={styles.modalBullet}>• {item}</Text>
                )) : <Text style={styles.modalSectionText}>Sem oportunidades informadas.</Text>}
              </ScrollView>
            ) : null}
            <Pressable style={styles.modalCancel} onPress={() => setModalDetalhe(false)}>
              <Text style={styles.modalCancelText}>Fechar</Text>
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
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#ccfbf1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: { fontSize: 15, fontWeight: '600', color: '#111827' },
  cardSubtitle: { fontSize: 12, color: '#6b7280', marginTop: 2 },

  label: { fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 8 },
  tenantInput: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#111827',
    marginBottom: 4,
  },

  selectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  selectText: { fontSize: 14, color: '#111827', flex: 1 },
  placeholder: { color: '#9ca3af' },

  dateRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  dateField: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  dateIcon: { marginRight: 8 },
  dateInput: { flex: 1, height: 46, fontSize: 13, color: '#111827' },

  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: {
    backgroundColor: '#0d9488',
    borderColor: '#0d9488',
  },
  toggleText: { fontSize: 13, color: '#4b5563', flex: 1 },

  submitBtn: {
    backgroundColor: '#0d9488',
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  submitBtnDisabled: { backgroundColor: '#d1d5db' },
  submitBtnText: { color: '#fff', fontSize: 15, fontWeight: '600' },

  respostaCard: {
    backgroundColor: '#ecfeff',
    borderWidth: 1,
    borderColor: '#99f6e4',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  respostaHeader: { flexDirection: 'row', gap: 12 },
  respostaIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#ccfbf1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  respostaContent: { flex: 1 },
  respostaTitle: { fontSize: 15, fontWeight: '600', color: '#111827', marginBottom: 6 },
  respostaText: { fontSize: 14, color: '#374151', lineHeight: 21 },
  verMaisBtn: { marginTop: 8 },
  verMaisText: { color: '#0f766e', fontSize: 13, fontWeight: '600' },

  section: { marginBottom: 16 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#111827' },
  filtroBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
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

  emptyHistorico: { fontSize: 14, color: '#6b7280', marginVertical: 8 },

  historicoCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  historicoTop: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  tipoTag: {
    backgroundColor: '#ccfbf1',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  tipoTagText: { fontSize: 12, color: '#0f766e', fontWeight: '500' },
  historicoData: { fontSize: 12, color: '#9ca3af' },
  historicoPeriodo: { fontSize: 13, color: '#6b7280', marginBottom: 8 },
  historicoResumo: { fontSize: 13, color: '#374151', lineHeight: 20 },
  linkDetalhe: { marginTop: 6, alignSelf: 'flex-start' },
  linkDetalheText: { fontSize: 13, color: '#0f766e', fontWeight: '600' },

  bottomNavWrap: { position: 'absolute', bottom: 0, left: 0, right: 0 },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 36,
  },
  modalTitle: { fontSize: 18, fontWeight: '600', color: '#111827', marginBottom: 16 },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 4,
  },
  modalOptionActive: { backgroundColor: '#111827' },
  modalOptionText: { fontSize: 15, color: '#374151' },
  modalOptionTextActive: { color: '#fff', fontWeight: '600' },
  modalCancel: {
    marginTop: 8,
    paddingVertical: 14,
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    alignItems: 'center',
  },
  modalCancelText: { fontSize: 15, fontWeight: '600', color: '#374151' },
  modalContent: { maxHeight: 380 },
  modalMeta: { fontSize: 12, color: '#6b7280', marginBottom: 6 },
  modalSectionTitle: { fontSize: 14, color: '#111827', fontWeight: '700', marginTop: 10, marginBottom: 4 },
  modalSectionText: { fontSize: 13, color: '#374151', lineHeight: 20 },
  modalBullet: { fontSize: 13, color: '#374151', lineHeight: 20, marginBottom: 2 },
});
