import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Header } from '../components/Header';
import { TagStatus } from '../components/TagStatus';
import { BarraProgresso } from '../components/BarraProgresso';
import { getApiBaseUrl } from '../config/api';
import { useAuth } from '../context/AuthContext';
import {
  fetchContratoById,
  fetchParcelasContrato,
  patchParcelaStatus,
  postGerarCobrancaParcela,
} from '../services/resources';
import type { ContratoApi, ParcelaApi } from '../types/api';
import { formatCentavosBRL, formatDateIsoToBR } from '../utils/money';

type ParcelaStatus = 'pago' | 'pendente';

type ParcelaUi = {
  apiId: string;
  numero: number;
  valor: string;
  vencimento: string;
  status: ParcelaStatus;
};

function mapParcelasToUi(rows: ParcelaApi[]): ParcelaUi[] {
  return [...rows]
    .sort((a, b) => a.numero - b.numero)
    .map((p) => ({
      apiId: p.id,
      numero: p.numero,
      valor: formatCentavosBRL(p.valor),
      vencimento: formatDateIsoToBR(p.vencimento),
      status: p.status,
    }));
}

const PARCELAS_FALLBACK: ParcelaUi[] = [
  { apiId: '', numero: 1, valor: 'R$ 6.000,00', vencimento: '15/01/2026', status: 'pago' },
  { apiId: '', numero: 2, valor: 'R$ 6.000,00', vencimento: '15/02/2026', status: 'pago' },
  { apiId: '', numero: 3, valor: 'R$ 6.000,00', vencimento: '15/03/2026', status: 'pendente' },
  { apiId: '', numero: 4, valor: 'R$ 6.000,00', vencimento: '15/04/2026', status: 'pendente' },
];

type Props = {
  contratoId: string;
  onBack: () => void;
};

export function DetalheContratoScreen({ contratoId, onBack }: Props) {
  const { token } = useAuth();
  const apiOn = !!getApiBaseUrl() && !!token;

  const [loading, setLoading] = useState(false);
  const [contrato, setContrato] = useState<ContratoApi | null>(null);
  const [parcelas, setParcelas] = useState<ParcelaUi[]>(PARCELAS_FALLBACK);

  const carregar = useCallback(async () => {
    if (!apiOn || !token) {
      setContrato(null);
      setParcelas(PARCELAS_FALLBACK);
      return;
    }
    setLoading(true);
    try {
      const [c, par] = await Promise.all([
        fetchContratoById(token, contratoId),
        fetchParcelasContrato(token, contratoId),
      ]);
      setContrato(c);
      if (par.length > 0) setParcelas(mapParcelasToUi(par));
      else setParcelas(PARCELAS_FALLBACK);
    } catch {
      setContrato(null);
      setParcelas(PARCELAS_FALLBACK);
    } finally {
      setLoading(false);
    }
  }, [apiOn, token, contratoId]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const totalParcelas = parcelas.length || 1;
  const parcelasPagas = parcelas.filter((p) => p.status === 'pago').length;
  const percentualPago = Math.round((parcelasPagas / totalParcelas) * 100);

  const clienteNome = contrato?.cliente ?? 'Cliente';
  const valorTitulo = contrato ? formatCentavosBRL(contrato.total) : 'R$ 25.000,00';
  const tipoTxt = contrato?.tipoContrato ?? 'Contrato';
  const progressoContrato = contrato?.progresso ?? percentualPago;

  const marcarPago = async (p: ParcelaUi) => {
    if (!p.apiId) {
      setParcelas((prev) => prev.map((x) => (x.numero === p.numero ? { ...x, status: 'pago' } : x)));
      return;
    }
    if (!apiOn || !token) {
      setParcelas((prev) => prev.map((x) => (x.numero === p.numero ? { ...x, status: 'pago' } : x)));
      return;
    }
    try {
      await patchParcelaStatus(token, p.apiId, 'pago');
      await carregar();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Falha ao atualizar parcela.';
      Alert.alert('Erro', msg);
    }
  };

  const gerarCobranca = async (p: ParcelaUi) => {
    if (!p.apiId || !apiOn || !token) {
      Alert.alert('Cobrança Gerada', `Cobrança da parcela ${p.numero} gerada e enviada ao cliente!`);
      return;
    }
    try {
      const r = await postGerarCobrancaParcela(token, p.apiId);
      Alert.alert('Cobrança', r.mensagem);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Falha ao gerar cobrança.';
      Alert.alert('Erro', msg);
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Detalhe do Contrato" showBack onBack={onBack} />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {apiOn && loading && (
          <View style={styles.loadingRow}>
            <ActivityIndicator size="small" color="#2563eb" />
            <Text style={styles.loadingText}>Carregando contrato…</Text>
          </View>
        )}
        <View style={styles.resumoCard}>
          <Text style={styles.resumoCliente}>{clienteNome}</Text>
          <Text style={styles.resumoValor}>{valorTitulo}</Text>
          <Text style={styles.resumoTipo}>{tipoTxt}</Text>
          <View style={styles.progressoWrap}>
            <View style={styles.progressoHeader}>
              <Text style={styles.progressoLabel}>Percentual Pago</Text>
              <Text style={styles.progressoPct}>{progressoContrato}%</Text>
            </View>
            <BarraProgresso percentage={progressoContrato} />
          </View>
        </View>
        {contrato?.descricao ? (
          <View style={styles.descCard}>
            <Text style={styles.descTitle}>Descrição</Text>
            <Text style={styles.descText}>{contrato.descricao}</Text>
          </View>
        ) : null}
        <Text style={styles.sectionTitle}>Parcelas</Text>
        {parcelas.map((p) => (
          <View key={p.numero} style={styles.parcelaCard}>
            <View style={styles.parcelaHeader}>
              <View style={styles.parcelaLeft}>
                <View style={[styles.parcelaNum, p.status === 'pago' ? styles.parcelaNumPago : styles.parcelaNumPendente]}>
                  <Text style={[styles.parcelaNumText, p.status === 'pago' ? styles.parcelaNumTextPago : styles.parcelaNumTextPendente]}>{p.numero}</Text>
                </View>
                <View>
                  <Text style={styles.parcelaValor}>{p.valor}</Text>
                  <Text style={styles.parcelaVenc}>Vencimento: {p.vencimento}</Text>
                </View>
              </View>
              <TagStatus status={p.status} />
            </View>
            {p.status === 'pendente' && (
              <View style={styles.parcelaActions}>
                <Pressable onPress={() => gerarCobranca(p)} style={styles.btnGerar}>
                  <MaterialCommunityIcons name="send" size={18} color="#0d9488" />
                  <Text style={styles.btnGerarText}>Gerar Cobrança</Text>
                </Pressable>
                <Pressable onPress={() => marcarPago(p)} style={styles.btnPago}>
                  <MaterialCommunityIcons name="check" size={18} color="#16a34a" />
                  <Text style={styles.btnPagoText}>Marcar Pago</Text>
                </Pressable>
              </View>
            )}
          </View>
        ))}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 16 },
  loadingRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  loadingText: { fontSize: 13, color: '#6b7280' },
  descCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },
  descTitle: { fontSize: 14, fontWeight: '600', color: '#111827', marginBottom: 8 },
  descText: { fontSize: 14, color: '#6b7280', lineHeight: 20 },
  resumoCard: { backgroundColor: '#fff', borderRadius: 16, padding: 24, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },
  resumoCliente: { fontSize: 14, color: '#6b7280', textAlign: 'center', marginBottom: 4 },
  resumoValor: { fontSize: 24, fontWeight: 'bold', color: '#111827', textAlign: 'center', marginBottom: 8 },
  resumoTipo: { fontSize: 14, color: '#6b7280', textAlign: 'center', marginBottom: 16 },
  progressoWrap: { backgroundColor: '#ccfbf1', borderRadius: 12, padding: 16 },
  progressoHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  progressoLabel: { fontSize: 14, color: '#6b7280' },
  progressoPct: { fontSize: 18, fontWeight: '600', color: '#0d9488' },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 12 },
  parcelaCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },
  parcelaHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  parcelaLeft: { flexDirection: 'row', gap: 12 },
  parcelaNum: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  parcelaNumPago: { backgroundColor: '#dcfce7' },
  parcelaNumPendente: { backgroundColor: '#f3f4f6' },
  parcelaNumText: { fontSize: 14, fontWeight: '500' },
  parcelaNumTextPago: { color: '#16a34a' },
  parcelaNumTextPendente: { color: '#6b7280' },
  parcelaValor: { fontSize: 16, fontWeight: '500', color: '#111827' },
  parcelaVenc: { fontSize: 14, color: '#6b7280', marginTop: 4 },
  parcelaActions: { flexDirection: 'row', gap: 8, marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#f3f4f6' },
  btnGerar: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 10, backgroundColor: '#ccfbf1', borderRadius: 12 },
  btnGerarText: { fontSize: 14, color: '#0d9488', fontWeight: '500' },
  btnPago: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 10, backgroundColor: '#dcfce7', borderRadius: 12 },
  btnPagoText: { fontSize: 14, color: '#16a34a', fontWeight: '500' },
});
