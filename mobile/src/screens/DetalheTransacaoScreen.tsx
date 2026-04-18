import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Modal, Alert, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Header } from '../components/Header';
import { TagStatus } from '../components/TagStatus';
import { getApiBaseUrl } from '../config/api';
import { useAuth } from '../context/AuthContext';
import { deleteTransacao, fetchTransacaoById, updateTransacao } from '../services/resources';
import type { TransacaoApi } from '../types/api';
import { formatCentavosBRL, formatDateIsoToBR } from '../utils/money';

type Props = {
  transacaoId: string;
  onBack: () => void;
  onEditar: () => void;
  onEditarComDados?: (params: Record<string, string>) => void;
};

type OfflineDetalhe = {
  tipo: 'receita' | 'despesa';
  titulo: string;
  valor: string;
  status: 'pago' | 'pendente' | 'atrasado' | 'em-dia' | 'cancelado';
  categoria: string;
  cliente: string;
  processo: string;
  data: string;
  vencimento: string;
  dataPagamento: string;
  descricao: string;
  observacoes?: string;
};

const OFFLINE_MOCK: OfflineDetalhe = {
  tipo: 'receita',
  titulo: 'Honorários - Processo 1234',
  valor: 'R$ 5.000,00',
  status: 'pendente',
  categoria: 'Honorários',
  cliente: 'João Silva',
  processo: 'Processo 1234/2025',
  data: '10/02/2026',
  vencimento: '15/02/2026',
  dataPagamento: '12/02/2026',
  descricao: 'Pagamento referente aos honorários advocatícios do processo trabalhista. Cliente efetuou o pagamento via PIX.',
  observacoes: 'Parcela 2 de 4 do contrato de honorários.',
};

const CATEGORIA_LABEL: Record<string, string> = {
  honorarios: 'Honorários',
  custas: 'Custas Judiciais',
  consultoria: 'Consultoria',
  aluguel: 'Aluguel',
  outros: 'Outros',
};

function transacaoToEditParams(t: TransacaoApi): Record<string, string> {
  const formStatus: 'pago' | 'pendente' = t.status === 'pago' ? 'pago' : 'pendente';
  return {
    id: t.id,
    tipo: t.tipo,
    valor: formatCentavosBRL(t.valor),
    categoria: t.categoria ?? '',
    cliente: t.clienteId ?? '',
    processo: '',
    data: t.data ? formatDateIsoToBR(t.data) : '',
    vencimento: t.vencimento ? formatDateIsoToBR(t.vencimento) : '',
    status: formStatus,
    descricao: t.titulo,
  };
}

export function DetalheTransacaoScreen({ transacaoId, onBack, onEditar, onEditarComDados }: Props) {
  const { token } = useAuth();
  const apiOn = !!getApiBaseUrl() && !!token;

  const [loading, setLoading] = useState(false);
  const [transacao, setTransacao] = useState<TransacaoApi | null>(null);
  const [offlineStatus, setOfflineStatus] = useState(OFFLINE_MOCK.status);

  const carregar = useCallback(async () => {
    if (!apiOn || !token) {
      setTransacao(null);
      return;
    }
    setLoading(true);
    try {
      const t = await fetchTransacaoById(token, transacaoId);
      setTransacao(t);
    } finally {
      setLoading(false);
    }
  }, [apiOn, token, transacaoId]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const [modalComprovante, setModalComprovante] = useState(false);
  const [mutando, setMutando] = useState(false);

  const handleExcluir = () => {
    Alert.alert('Excluir Transação?', 'Esta ação não pode ser desfeita.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          if (apiOn && token && transacao) {
            try {
              setMutando(true);
              await deleteTransacao(token, transacao.id);
            } catch {
              /* ignore */
            } finally {
              setMutando(false);
            }
          }
          onBack();
        },
      },
    ]);
  };

  const handleMarcarComoPago = () => {
    Alert.alert('Confirmar Pagamento', 'Deseja marcar esta transação como paga?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Confirmar',
        onPress: async () => {
          if (!apiOn || !transacao) {
            setOfflineStatus('pago');
            return;
          }
          if (!token) return;
          try {
            setMutando(true);
            const updated = await updateTransacao(token, transacao.id, { status: 'pago' });
            setTransacao(updated);
          } finally {
            setMutando(false);
          }
        },
      },
    ]);
  };

  const handleCancelarTransacao = () => {
    Alert.alert('Cancelar Transação', 'Deseja realmente cancelar esta transação?', [
      { text: 'Não', style: 'cancel' },
      {
        text: 'Cancelar',
        style: 'destructive',
        onPress: async () => {
          if (!apiOn || !transacao) {
            setOfflineStatus('cancelado');
            return;
          }
          if (!token) return;
          try {
            setMutando(true);
            const updated = await updateTransacao(token, transacao.id, { status: 'cancelado' });
            setTransacao(updated);
          } finally {
            setMutando(false);
          }
        },
      },
    ]);
  };

  const abrirEdicao = () => {
    if (transacao && onEditarComDados) {
      onEditarComDados(transacaoToEditParams(transacao));
    } else {
      onEditar();
    }
  };

  if (apiOn && loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Header title="Detalhes da Transação" showBack onBack={onBack} />
        <ActivityIndicator size="large" color="#2563eb" style={{ marginTop: 24 }} />
      </View>
    );
  }

  if (apiOn && !transacao && !loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Header title="Detalhes da Transação" showBack onBack={onBack} />
        <Text style={styles.erroText}>Transação não encontrada.</Text>
      </View>
    );
  }

  /* ——— Visualização offline (sem API) ——— */
  if (!apiOn) {
    const t = { ...OFFLINE_MOCK, status: offlineStatus };
    return (
      <View style={styles.container}>
        <Header title="Detalhes da Transação" showBack onBack={onBack} />
        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <LinearGradient
            colors={t.tipo === 'receita' ? ['#22c55e', '#16a34a'] : ['#ef4444', '#dc2626']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={styles.heroCard}
          >
            <View style={styles.heroHeader}>
              <Text style={styles.heroLabel}>{t.tipo === 'receita' ? 'Receita' : 'Despesa'}</Text>
              <TagStatus status={t.status} />
            </View>
            <Text style={styles.heroValue}>{t.valor}</Text>
            <Text style={styles.heroTitle}>{t.titulo}</Text>
          </LinearGradient>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Informações</Text>
            <InfoRow icon="tag" label="Categoria" value={t.categoria} />
            <InfoRow icon="account" label="Cliente" value={t.cliente} />
            <InfoRow icon="file-document" label="Processo" value={t.processo} />
          </View>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Datas</Text>
            <View style={styles.datesRow}>
              <View><Text style={styles.dateLabel}>Data de Emissão</Text><Text style={styles.dateValue}>{t.data}</Text></View>
              <View><Text style={styles.dateLabel}>Vencimento</Text><Text style={styles.dateValue}>{t.vencimento}</Text></View>
            </View>
            {t.status === 'pago' && (
              <View style={styles.pagamentoInfo}>
                <Text style={styles.dateLabel}>Data de Pagamento</Text>
                <Text style={styles.pagamentoValue}>{t.dataPagamento}</Text>
                <Text style={styles.metodo}>Método: PIX</Text>
              </View>
            )}
          </View>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Descrição</Text>
            <Text style={styles.descricao}>{t.descricao}</Text>
          </View>
          {t.observacoes ? (
            <View style={styles.obsCard}>
              <Text style={styles.obsTitle}>Observações</Text>
              <Text style={styles.obsText}>{t.observacoes}</Text>
            </View>
          ) : null}
          <Pressable onPress={() => setModalComprovante(true)} style={styles.comprovanteBtn}>
            <MaterialCommunityIcons name="file-document" size={22} color="#0d9488" />
            <Text style={styles.comprovanteBtnText}>Visualizar Comprovante</Text>
          </Pressable>
          <View style={styles.actionsRow}>
            <Pressable onPress={onEditar} style={styles.btnEditar}>
              <MaterialCommunityIcons name="pencil" size={22} color="#fff" />
              <Text style={styles.btnEditarText}>Editar</Text>
            </Pressable>
            <Pressable onPress={handleExcluir} style={styles.btnExcluir}>
              <MaterialCommunityIcons name="trash-can-outline" size={22} color="#dc2626" />
              <Text style={styles.btnExcluirText}>Excluir</Text>
            </Pressable>
          </View>
          {(t.status === 'pendente' || t.status === 'atrasado') && (
            <View style={styles.statusActions}>
              <Pressable onPress={handleMarcarComoPago} style={styles.btnPago}><MaterialCommunityIcons name="check-circle" size={22} color="#fff" /><Text style={styles.btnPagoText}>Marcar como Pago</Text></Pressable>
              <Pressable onPress={handleCancelarTransacao} style={styles.btnCancelar}><MaterialCommunityIcons name="close-circle-outline" size={22} color="#6b7280" /><Text style={styles.btnCancelarText}>Cancelar Transação</Text></Pressable>
            </View>
          )}
          <View style={{ height: 40 }} />
        </ScrollView>
        <Modal visible={modalComprovante} transparent animationType="fade">
          <Pressable style={styles.modalOverlay} onPress={() => setModalComprovante(false)}>
            <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
              <Text style={styles.modalTitle}>Comprovante de Pagamento</Text>
              <View style={styles.comprovantePlaceholder}><MaterialCommunityIcons name="file-image-outline" size={64} color="#9ca3af" /></View>
              <Pressable onPress={() => setModalComprovante(false)} style={styles.modalFechar}><Text style={styles.modalFecharText}>Fechar</Text></Pressable>
            </View>
          </Pressable>
        </Modal>
      </View>
    );
  }

  /* ——— API ——— */
  const tx = transacao!;
  const statusLocal = tx.status;
  const tipo = tx.tipo;
  const valorFmt = formatCentavosBRL(tx.valor);
  const titulo = tx.titulo;
  const categoriaFmt =
    tx.categoria != null && tx.categoria !== '' ? CATEGORIA_LABEL[tx.categoria] ?? tx.categoria : '—';
  const clienteFmt = tx.tipo === 'receita' ? tx.subtitulo : tx.subtitulo;
  const processoFmt = tx.tipo === 'despesa' ? tx.subtitulo : '—';
  const dataEmissao = tx.data ? formatDateIsoToBR(tx.data) : '—';
  const vencFmt = tx.vencimento ? formatDateIsoToBR(tx.vencimento) : '—';
  const descricao = tx.titulo;

  return (
    <View style={styles.container}>
      <Header title="Detalhes da Transação" showBack onBack={onBack} />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {mutando && (
          <View style={styles.mutatingBanner}>
            <ActivityIndicator size="small" color="#2563eb" />
            <Text style={styles.mutatingText}>Salvando…</Text>
          </View>
        )}
        <LinearGradient
          colors={tipo === 'receita' ? ['#22c55e', '#16a34a'] : ['#ef4444', '#dc2626']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={styles.heroCard}
        >
          <View style={styles.heroHeader}>
            <Text style={styles.heroLabel}>{tipo === 'receita' ? 'Receita' : 'Despesa'}</Text>
            <TagStatus status={statusLocal} />
          </View>
          <Text style={styles.heroValue}>{valorFmt}</Text>
          <Text style={styles.heroTitle}>{titulo}</Text>
        </LinearGradient>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Informações</Text>
          <InfoRow icon="tag" label="Categoria" value={categoriaFmt} />
          <InfoRow icon="account" label="Cliente / referência" value={clienteFmt} />
          {tx.tipo === 'despesa' && <InfoRow icon="file-document" label="Processo / detalhe" value={processoFmt} />}
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Datas</Text>
          <View style={styles.datesRow}>
            <View><Text style={styles.dateLabel}>Data</Text><Text style={styles.dateValue}>{dataEmissao}</Text></View>
            <View><Text style={styles.dateLabel}>Vencimento</Text><Text style={styles.dateValue}>{vencFmt}</Text></View>
          </View>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Descrição</Text>
          <Text style={styles.descricao}>{descricao}</Text>
        </View>
        <Pressable onPress={() => setModalComprovante(true)} style={styles.comprovanteBtn}>
          <MaterialCommunityIcons name="file-document" size={22} color="#2563eb" />
          <Text style={styles.comprovanteBtnText}>Visualizar Comprovante</Text>
        </Pressable>
        <View style={styles.actionsRow}>
          <Pressable onPress={abrirEdicao} style={styles.btnEditar}>
            <MaterialCommunityIcons name="pencil" size={22} color="#fff" />
            <Text style={styles.btnEditarText}>Editar</Text>
          </Pressable>
          <Pressable onPress={handleExcluir} style={styles.btnExcluir}>
            <MaterialCommunityIcons name="trash-can-outline" size={22} color="#dc2626" />
            <Text style={styles.btnExcluirText}>Excluir</Text>
          </Pressable>
        </View>
        {(statusLocal === 'pendente' || statusLocal === 'atrasado' || statusLocal === 'em-dia') && (
          <View style={styles.statusActions}>
            <Pressable onPress={handleMarcarComoPago} style={styles.btnPago}><MaterialCommunityIcons name="check-circle" size={22} color="#fff" /><Text style={styles.btnPagoText}>Marcar como Pago</Text></Pressable>
            <Pressable onPress={handleCancelarTransacao} style={styles.btnCancelar}><MaterialCommunityIcons name="close-circle-outline" size={22} color="#6b7280" /><Text style={styles.btnCancelarText}>Cancelar Transação</Text></Pressable>
          </View>
        )}
        <View style={{ height: 40 }} />
      </ScrollView>

      <Modal visible={modalComprovante} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setModalComprovante(false)}>
          <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
            <Text style={styles.modalTitle}>Comprovante de Pagamento</Text>
            <View style={styles.comprovantePlaceholder}>
              <MaterialCommunityIcons name="file-image-outline" size={64} color="#9ca3af" />
            </View>
            <Pressable onPress={() => setModalComprovante(false)} style={styles.modalFechar}>
              <Text style={styles.modalFecharText}>Fechar</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

function InfoRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoIcon}><MaterialCommunityIcons name={icon as any} size={20} color="#0d9488" /></View>
      <View style={styles.infoContent}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  centered: { justifyContent: 'center', alignItems: 'center', padding: 24 },
  erroText: { fontSize: 16, color: '#6b7280', marginTop: 24 },
  mutatingBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8 },
  mutatingText: { fontSize: 13, color: '#6b7280' },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 16 },
  heroCard: { borderRadius: 16, padding: 24, marginBottom: 16 },
  heroHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  heroLabel: { fontSize: 14, color: 'rgba(255,255,255,0.8)' },
  heroValue: { fontSize: 28, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
  heroTitle: { fontSize: 16, color: 'rgba(255,255,255,0.9)' },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },
  cardTitle: { fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 16 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  infoIcon: { width: 40, height: 40, borderRadius: 10, backgroundColor: '#ccfbf1', alignItems: 'center', justifyContent: 'center' },
  infoContent: { flex: 1 },
  infoLabel: { fontSize: 12, color: '#6b7280' },
  infoValue: { fontSize: 16, fontWeight: '500', color: '#111827' },
  datesRow: { flexDirection: 'row', gap: 24, marginBottom: 16 },
  dateLabel: { fontSize: 12, color: '#6b7280', marginBottom: 4 },
  dateValue: { fontSize: 16, fontWeight: '500', color: '#111827' },
  pagamentoInfo: { paddingTop: 16, borderTopWidth: 1, borderTopColor: '#f3f4f6' },
  pagamentoValue: { fontSize: 16, fontWeight: '600', color: '#16a34a' },
  metodo: { fontSize: 12, color: '#6b7280', marginTop: 4 },
  descricao: { fontSize: 14, color: '#6b7280', lineHeight: 22 },
  obsCard: { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 16, padding: 16, marginBottom: 16 },
  obsTitle: { fontSize: 14, fontWeight: '600', color: '#111827', marginBottom: 8 },
  obsText: { fontSize: 14, color: '#6b7280' },
  comprovanteBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, backgroundColor: '#ccfbf1', borderRadius: 12, marginBottom: 16 },
  comprovanteBtnText: { fontSize: 16, color: '#0d9488', fontWeight: '500' },
  actionsRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  btnEditar: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, backgroundColor: '#0d9488', borderRadius: 12 },
  btnEditarText: { color: '#fff', fontSize: 16, fontWeight: '500' },
  btnExcluir: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, backgroundColor: '#fff', borderWidth: 2, borderColor: '#fecaca', borderRadius: 12 },
  btnExcluirText: { color: '#dc2626', fontSize: 16, fontWeight: '500' },
  statusActions: { gap: 8 },
  btnPago: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, backgroundColor: '#16a34a', borderRadius: 12 },
  btnPagoText: { color: '#fff', fontSize: 16, fontWeight: '500' },
  btnCancelar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, backgroundColor: '#fff', borderWidth: 2, borderColor: '#e5e7eb', borderRadius: 12 },
  btnCancelarText: { color: '#6b7280', fontSize: 16 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#fff', borderRadius: 16, padding: 20 },
  modalTitle: { fontSize: 18, fontWeight: '600', color: '#111827', marginBottom: 16 },
  comprovantePlaceholder: { height: 200, backgroundColor: '#f3f4f6', borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  modalFechar: { backgroundColor: '#111827', borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  modalFecharText: { color: '#fff', fontSize: 16, fontWeight: '500' },
});
