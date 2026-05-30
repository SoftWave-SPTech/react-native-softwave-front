import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Header } from '../components/Header';
import { TagStatus } from '../components/TagStatus';
import { ComprovantePreviewModal } from '../components/ComprovantePreviewModal';
import { getApiBaseUrl } from '../config/api';
import { useAuth } from '../context/AuthContext';
import { deleteTransacao, fetchTransacaoById, updateTransacao } from '../services/resources';
import type { TransacaoApi } from '../types/api';
import { formatCentavosBRL, formatDateIsoToBR } from '../utils/money';
import { LocaisSegurosBanner } from '../components/LocaisSegurosBanner';
import { LocaisSegurosRestrictedNote } from '../components/LocaisSegurosRestrictedNote';
import { useShouldRestrictSensitiveData } from '../context/LocaisSegurosContext';
import { MASKED_MONEY_VALUE, MASKED_TEXT_VALUE, maskIfRestricted } from '../utils/geo';

type Props = {
  transacaoId: string;
  onBack: () => void;
  onEditar: () => void;
  onEditarComDados?: (params: Record<string, string>) => void;
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
    processo: t.processo ?? '',
    processoId: t.processoId ?? '',
    data: t.data ? formatDateIsoToBR(t.data) : '',
    vencimento: t.vencimento ? formatDateIsoToBR(t.vencimento) : '',
    status: formStatus,
    descricao: t.titulo,
  };
}

export function DetalheTransacaoScreen({ transacaoId, onBack, onEditar, onEditarComDados }: Props) {
  const { token } = useAuth();
  const apiOn = !!getApiBaseUrl() && !!token;
  const restrict = useShouldRestrictSensitiveData();

  const [loading, setLoading] = useState(false);
  const [transacao, setTransacao] = useState<TransacaoApi | null>(null);

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
            Alert.alert('Indisponível', 'É necessário estar logado com API configurada.');
            return;
          }
          if (!token) return;
          try {
            setMutando(true);
            const updated = await updateTransacao(token, transacao.id, { status: 'pago' });
            // Alguns backends retornam payload parcial no PATCH; preserva os campos locais.
            setTransacao((prev) => {
              if (!prev) return updated;
              return {
                ...prev,
                ...updated,
                status: 'pago',
                valor: Number.isFinite(updated?.valor) ? updated.valor : prev.valor,
              };
            });
            await carregar();
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
            Alert.alert('Indisponível', 'É necessário estar logado com API configurada.');
            return;
          }
          if (!token) return;
          try {
            setMutando(true);
            const updated = await updateTransacao(token, transacao.id, { status: 'cancelado' });
            // Evita tela quebrada se o backend devolver resposta parcial.
            setTransacao((prev) => {
              if (!prev) return updated;
              return {
                ...prev,
                ...updated,
                status: 'cancelado',
                valor: Number.isFinite(updated?.valor) ? updated.valor : prev.valor,
              };
            });
            await carregar();
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

  const comprovanteAbsUrl = (() => {
    const comprovanteUrl = transacao?.comprovanteUrl ?? '';
    if (!comprovanteUrl) return '';
    return comprovanteUrl;
  })();

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

  if (!apiOn) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Header title="Detalhes da Transação" showBack onBack={onBack} />
        <Text style={styles.erroText}>Configure a API e faça login para ver os detalhes.</Text>
      </View>
    );
  }

  /* ——— API ——— */
  const tx = transacao!;
  const statusLocal = tx.status;
  const tipo = tx.tipo;
  const valorFmt = restrict ? MASKED_MONEY_VALUE : formatCentavosBRL(tx.valor);
  const titulo = maskIfRestricted(tx.titulo, restrict);
  const categoriaFmt = restrict
    ? MASKED_TEXT_VALUE
    : tx.categoria != null && tx.categoria !== ''
      ? CATEGORIA_LABEL[tx.categoria] ?? tx.categoria
      : '—';
  const clienteFmt = maskIfRestricted(tx.subtitulo, restrict);
  const processoFmt = tx.tipo === 'despesa' ? maskIfRestricted(tx.subtitulo, restrict) : '—';
  const dataEmissao = restrict ? MASKED_TEXT_VALUE : tx.data ? formatDateIsoToBR(tx.data) : '—';
  const vencFmt = restrict ? MASKED_TEXT_VALUE : tx.vencimento ? formatDateIsoToBR(tx.vencimento) : '—';
  const descricao = maskIfRestricted(tx.titulo, restrict);

  return (
    <View style={styles.container}>
      <Header title="Detalhes da Transação" showBack onBack={onBack} />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <LocaisSegurosBanner />

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
        {restrict ? (
          <LocaisSegurosRestrictedNote />
        ) : (
          <>
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
            {(statusLocal === 'pendente' || statusLocal === 'atrasado') && (
              <View style={styles.statusActions}>
                <Pressable onPress={handleMarcarComoPago} style={styles.btnPago}>
                  <MaterialCommunityIcons name="check-circle" size={22} color="#fff" />
                  <Text style={styles.btnPagoText}>Marcar como Pago</Text>
                </Pressable>
                <Pressable onPress={handleCancelarTransacao} style={styles.btnCancelar}>
                  <MaterialCommunityIcons name="close-circle-outline" size={22} color="#6b7280" />
                  <Text style={styles.btnCancelarText}>Cancelar Transação</Text>
                </Pressable>
              </View>
            )}
          </>
        )}
        <View style={{ height: 40 }} />
      </ScrollView>

      <ComprovantePreviewModal
        visible={modalComprovante}
        onClose={() => setModalComprovante(false)}
        token={token}
        comprovanteUrl={comprovanteAbsUrl}
        downloadName={`comprovante-${tx.id}`}
      />
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
});
