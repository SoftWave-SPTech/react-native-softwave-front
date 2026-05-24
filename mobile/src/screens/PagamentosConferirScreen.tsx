import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, TextInput, ScrollView, Pressable, StyleSheet, Modal, ActivityIndicator, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Header } from '../components/Header';
import { BottomNav } from '../components/BottomNav';
import { ComprovantePreviewModal } from '../components/ComprovantePreviewModal';
import { getApiBaseUrl } from '../config/api';
import { useAuth } from '../context/AuthContext';
import {
  fetchPagamentosPendentes,
  syncPagamentosDashboardCount,
  updatePagamentoConferir,
} from '../services/resources';
import { ApiError } from '../services/http';
import type { PagamentoConferirApi } from '../types/api';
import { formatCentavosBRL } from '../utils/money';
import { LocaisSegurosBanner } from '../components/LocaisSegurosBanner';
import { useShouldRestrictSensitiveData } from '../context/LocaisSegurosContext';
import { MASKED_MONEY_VALUE, maskIfRestricted } from '../utils/geo';

type Props = {
  onBack: () => void;
  onNavigate: (screen: string) => void;
};

export function PagamentosConferirScreen({ onBack, onNavigate }: Props) {
  void onNavigate;
  const { token } = useAuth();
  const restrict = useShouldRestrictSensitiveData();
  const apiOn = !!getApiBaseUrl() && !!token;

  const [lista, setLista] = useState<PagamentoConferirApi[]>([]);
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState<string | number | null>(null);

  const carregar = useCallback(async () => {
    if (!apiOn) {
      setLista([]);
      return;
    }
    setLoading(true);
    try {
      const rows = await fetchPagamentosPendentes(token);
      setLista(rows);
    } catch {
      setLista([]);
    } finally {
      setLoading(false);
    }
  }, [apiOn, token]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const [selectedPagamento, setSelectedPagamento] = useState<string | number | null>(null);
  const [modalRejeicao, setModalRejeicao] = useState<string | number | null>(null);
  const [motivoRejeicao, setMotivoRejeicao] = useState('');
  const [modalAprovacao, setModalAprovacao] = useState<string | number | null>(null);

  const pendentes = lista.filter((p) => p.status === 'pendente');

  const urlComprovante = (() => {
    if (selectedPagamento == null) return '';
    const pag = lista.find((p) => p.id === selectedPagamento);
    return pag?.comprovanteUrl ?? '';
  })();

  const handleRejeitar = async () => {
    if (!motivoRejeicao.trim() || modalRejeicao == null) return;
    const id = modalRejeicao;
    if (apiOn && token) {
      try {
        setBusyId(id);
        await updatePagamentoConferir(token, id, { status: 'reprovado', motivoRejeicao: motivoRejeicao.trim() });
        await syncPagamentosDashboardCount(token);
        await carregar();
      } catch (e) {
        if (e instanceof ApiError && e.status === 401) {
          Alert.alert('Sessão expirada', 'Faça login novamente para concluir a reprovação.');
        } else {
          Alert.alert('Erro ao reprovar', 'Não foi possível reprovar o pagamento agora.');
        }
      } finally {
        setBusyId(null);
      }
    } else {
      setLista((prev) => prev.filter((p) => p.id !== id));
    }
    setModalRejeicao(null);
    setMotivoRejeicao('');
  };

  const handleConfirmar = (id: string | number) => {
    setSelectedPagamento(null);
    setModalAprovacao(id);
  };

  const handleConcluirAprovacao = async () => {
    const id = modalAprovacao;
    setModalAprovacao(null);
    if (id == null) return;
    if (apiOn && token) {
      try {
        setBusyId(id);
        await updatePagamentoConferir(token, id, { status: 'aprovado' });
        await syncPagamentosDashboardCount(token);
        await carregar();
      } catch (e) {
        if (e instanceof ApiError && e.status === 401) {
          Alert.alert('Sessão expirada', 'Faça login novamente para concluir a aprovação.');
        } else {
          Alert.alert('Erro ao aprovar', 'Não foi possível aprovar o pagamento agora.');
        }
      } finally {
        setBusyId(null);
      }
    } else {
      setLista((prev) => prev.filter((p) => p.id !== id));
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Pagamentos a Conferir" showBack onBack={onBack} />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {apiOn && loading && (
          <View style={styles.loadingRow}>
            <ActivityIndicator size="small" color="#2563eb" />
            <Text style={styles.loadingText}>Carregando…</Text>
          </View>
        )}
        <LocaisSegurosBanner />
        <View style={styles.alertBox}>
          <Text style={styles.alertText}>
            <Text style={styles.alertBold}>{pendentes.length} pagamentos</Text> aguardando confirmação
          </Text>
        </View>
        {pendentes.map((p) => (
          <View key={p.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.cardIcon}><MaterialCommunityIcons name="file-image-outline" size={24} color="#0d9488" /></View>
              <View style={styles.cardContent}>
                <Text style={styles.cardCliente}>{maskIfRestricted(p.cliente, restrict)}</Text>
                <View style={styles.cardProcesso}>
                  <MaterialCommunityIcons name="file-document" size={14} color="#6b7280" />
                  <Text style={styles.cardProcessoText}>{maskIfRestricted(p.processo, restrict)}</Text>
                </View>
                <Text style={styles.cardData}>{maskIfRestricted(p.data, restrict)}</Text>
                <Text style={styles.cardValor}>
                  {restrict ? MASKED_MONEY_VALUE : formatCentavosBRL(p.valor)}
                </Text>
              </View>
            </View>
            <Pressable onPress={() => setSelectedPagamento(p.id)} style={styles.verBtn}>
              <Text style={styles.verBtnText}>Visualizar Comprovante</Text>
            </Pressable>
            {restrict ? (
              <View style={styles.restrictedActions}>
                <MaterialCommunityIcons name="shield-lock-outline" size={18} color="#0f766e" />
                <Text style={styles.restrictedActionsText}>
                  Aprovar e reprovar disponíveis apenas em um local seguro.
                </Text>
              </View>
            ) : (
              <View style={styles.actionsRow}>
                <Pressable onPress={() => setModalRejeicao(p.id)} disabled={busyId === p.id} style={styles.reprovarBtn}>
                  <MaterialCommunityIcons name="close" size={18} color="#dc2626" />
                  <Text style={styles.reprovarBtnText}>Reprovar</Text>
                </Pressable>
                <Pressable onPress={() => handleConfirmar(p.id)} disabled={busyId === p.id} style={styles.aprovarBtn}>
                  <MaterialCommunityIcons name="check" size={18} color="#15803d" />
                  <Text style={styles.aprovarBtnText}>Aprovar</Text>
                </Pressable>
              </View>
            )}
          </View>
        ))}
        <View style={{ height: 80 }} />
      </ScrollView>
      <View style={styles.bottomNavWrap}>
        <BottomNav />
      </View>

      <ComprovantePreviewModal
        visible={!!selectedPagamento}
        onClose={() => setSelectedPagamento(null)}
        token={token}
        comprovanteUrl={urlComprovante}
        downloadName={`comprovante-${String(selectedPagamento ?? 'pagamento')}`}
      />

      <Modal visible={!!modalAprovacao} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.sucessoIcon}>
              <MaterialCommunityIcons name="check-circle" size={56} color="#16a34a" />
            </View>
            <Text style={styles.sucessoTitle}>Pagamento Aprovado!</Text>
            <Text style={styles.sucessoSubtitle}>O cliente será notificado sobre a aprovação do pagamento.</Text>
            <Pressable onPress={handleConcluirAprovacao} style={styles.btnConcluir}>
              <Text style={styles.btnConcluirText}>Concluir</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal visible={!!modalRejeicao} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setModalRejeicao(null)}>
          <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
            <Text style={styles.modalTitle}>Reprovar Pagamento</Text>
            <Text style={styles.modalSubtitle}>Por favor, informe o motivo da reprovação:</Text>
            <View style={styles.textAreaWrap}>
              <TextInput value={motivoRejeicao} onChangeText={setMotivoRejeicao} placeholder="Ex: Comprovante ilegível..." placeholderTextColor="#9ca3af" multiline numberOfLines={4} style={styles.textArea} />
            </View>
            <View style={styles.modalActions}>
              <Pressable onPress={() => setModalRejeicao(null)} style={styles.modalCancelar}><Text style={styles.modalCancelarText}>Cancelar</Text></Pressable>
              <Pressable onPress={handleRejeitar} disabled={!motivoRejeicao.trim()} style={[styles.modalReprovar, !motivoRejeicao.trim() && styles.modalDisabled]}><Text style={styles.modalReprovarText}>Reprovar</Text></Pressable>
            </View>
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
  loadingRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  loadingText: { fontSize: 13, color: '#6b7280' },
  alertBox: { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 16, padding: 16, marginBottom: 16, shadowColor: '#64748b', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  alertText: { fontSize: 14, color: '#334155' },
  alertBold: { fontWeight: '600' },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },
  cardHeader: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  cardIcon: { width: 48, height: 48, borderRadius: 12, backgroundColor: '#ccfbf1', alignItems: 'center', justifyContent: 'center' },
  cardContent: { flex: 1 },
  cardCliente: { fontSize: 16, fontWeight: '600', color: '#111827' },
  cardProcesso: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  cardProcessoText: { fontSize: 14, color: '#6b7280' },
  cardData: { fontSize: 12, color: '#6b7280', marginTop: 4 },
  cardValor: { fontSize: 18, fontWeight: '600', color: '#0d9488', marginTop: 8 },
  verBtn: { paddingVertical: 10, backgroundColor: '#f3f4f6', borderRadius: 12, alignItems: 'center', marginBottom: 12 },
  verBtnText: { fontSize: 14, color: '#6b7280' },
  restrictedActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    backgroundColor: '#f0fdfa',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#99f6e4',
  },
  restrictedActionsText: { flex: 1, fontSize: 13, color: '#0f766e', lineHeight: 18 },
  actionsRow: { flexDirection: 'row', gap: 8 },
  reprovarBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 10, backgroundColor: '#fee2e2', borderRadius: 12 },
  reprovarBtnText: { fontSize: 14, color: '#dc2626', fontWeight: '500' },
  aprovarBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 10, backgroundColor: '#dcfce7', borderRadius: 12 },
  aprovarBtnText: { fontSize: 14, color: '#15803d', fontWeight: '500' },
  bottomNavWrap: { position: 'absolute', bottom: 0, left: 0, right: 0 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#fff', borderRadius: 16, padding: 20 },
  modalTitle: { fontSize: 18, fontWeight: '600', color: '#111827', marginBottom: 12 },
  modalSubtitle: { fontSize: 14, color: '#6b7280', marginBottom: 16 },
  textAreaWrap: { marginBottom: 16 },
  textArea: { backgroundColor: '#f9fafb', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, padding: 12, fontSize: 16, color: '#111827', minHeight: 100 },
  modalActions: { flexDirection: 'row', gap: 12 },
  modalCancelar: { flex: 1, paddingVertical: 14, backgroundColor: '#f3f4f6', borderRadius: 12, alignItems: 'center' },
  modalCancelarText: { fontSize: 16, fontWeight: '600', color: '#6b7280' },
  modalReprovar: { flex: 1, paddingVertical: 14, backgroundColor: '#dc2626', borderRadius: 12, alignItems: 'center' },
  modalReprovarText: { fontSize: 16, fontWeight: '600', color: '#fff' },
  modalDisabled: { opacity: 0.5 },
  modalFechar: { backgroundColor: '#111827', borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  modalFecharText: { fontSize: 16, fontWeight: '500', color: '#fff' },
  sucessoIcon: { alignItems: 'center', marginBottom: 16 },
  sucessoTitle: { fontSize: 20, fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: 8 },
  sucessoSubtitle: { fontSize: 14, color: '#6b7280', textAlign: 'center', marginBottom: 24 },
  btnConcluir: { backgroundColor: '#0d9488', borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  btnConcluirText: { fontSize: 16, fontWeight: '600', color: '#fff' },
});
