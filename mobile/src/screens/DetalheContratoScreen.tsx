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
import { LocaisSegurosBanner } from '../components/LocaisSegurosBanner';
import { LocaisSegurosRestrictedNote } from '../components/LocaisSegurosRestrictedNote';
import { useShouldRestrictSensitiveData } from '../context/LocaisSegurosContext';
import { MASKED_MONEY_VALUE, maskIfRestricted } from '../utils/geo';

type ParcelaStatus = 'pago' | 'pendente';

type ParcelaUi = {
  apiId: string;
  numero: number;
  valor: string;
  valorCentavos: number;
  vencimento: string;
  vencimentoIso: string;
  status: ParcelaStatus;
};

function mapParcelasToUi(rows: ParcelaApi[]): ParcelaUi[] {
  return [...rows]
    .sort((a, b) => a.numero - b.numero)
    .map((p) => ({
      apiId: p.id,
      numero: p.numero,
      valor: formatCentavosBRL(p.valor),
      valorCentavos: p.valor,
      vencimento: formatDateIsoToBR(p.vencimento),
      vencimentoIso: p.vencimento,
      status: p.status,
    }));
}

/** Percentual pago pelo valor das parcelas (alinha barra ao marcar parcela). */
function progressoPorValorParcelas(rows: ParcelaUi[]): number {
  const total = rows.reduce((s, p) => s + p.valorCentavos, 0);
  if (total <= 0) return 0;
  const pago = rows.filter((p) => p.status === 'pago').reduce((s, p) => s + p.valorCentavos, 0);
  if (pago >= total) return 100;
  return Math.min(100, Math.round((pago / total) * 100));
}

function inicioDia(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

/** Situação do contrato para tag (espelha regra do mock / backend). */
function inferirStatusContrato(
  rows: ParcelaUi[],
  progresso: number,
): 'em-dia' | 'pendente' | 'atrasado' | 'encerrado' {
  const totalC = rows.reduce((s, p) => s + p.valorCentavos, 0);
  const pagoC = rows.filter((p) => p.status === 'pago').reduce((s, p) => s + p.valorCentavos, 0);
  if (totalC > 0 && pagoC >= totalC) return 'encerrado';
  if (progresso >= 100) return 'encerrado';
  const hoje = inicioDia(new Date());
  const pendentes = rows.filter((p) => p.status === 'pendente');
  const temAtrasada = pendentes.some((p) => {
    const d = new Date(p.vencimentoIso);
    return !Number.isNaN(d.getTime()) && inicioDia(d) < hoje;
  });
  if (temAtrasada) return 'atrasado';
  if (pendentes.length > 0) return 'pendente';
  return 'em-dia';
}

type Props = {
  contratoId: string;
  onBack: () => void;
};

export function DetalheContratoScreen({ contratoId, onBack }: Props) {
  const { token } = useAuth();
  const apiOn = !!getApiBaseUrl() && !!token;
  const restrict = useShouldRestrictSensitiveData();

  const [loading, setLoading] = useState(false);
  const [contrato, setContrato] = useState<ContratoApi | null>(null);
  const [parcelas, setParcelas] = useState<ParcelaUi[]>([]);

  const carregar = useCallback(async () => {
    if (!apiOn || !token) {
      setContrato(null);
      setParcelas([]);
      return;
    }
    setLoading(true);
    try {
      const [c, par] = await Promise.all([
        fetchContratoById(token, contratoId),
        fetchParcelasContrato(token, contratoId),
      ]);
      setContrato(c);
      if (par.length > 0) {
        setParcelas(mapParcelasToUi(par));
      } else if (c) {
        /* API sem parcelas: não usar fallback genérico (evita valores divergentes da lista). */
        setParcelas([]);
      } else {
        setParcelas([]);
      }
    } catch {
      setContrato(null);
      setParcelas([]);
    } finally {
      setLoading(false);
    }
  }, [apiOn, token, contratoId]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const progressoContrato =
    parcelas.length > 0 ? progressoPorValorParcelas(parcelas) : (contrato?.progresso ?? 0);

  const clienteNome = maskIfRestricted(contrato?.cliente ?? 'Cliente', restrict);
  const valorTitulo = restrict
    ? MASKED_MONEY_VALUE
    : contrato
      ? formatCentavosBRL(contrato.total)
      : '—';
  const tipoTxt = maskIfRestricted(contrato?.tipoContrato ?? 'Contrato', restrict);
  const statusContratoTag =
    parcelas.length > 0
      ? inferirStatusContrato(parcelas, progressoContrato)
      : (contrato?.status ?? 'em-dia');

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
        <LocaisSegurosBanner />

        {apiOn && loading && (
          <View style={styles.loadingRow}>
            <ActivityIndicator size="small" color="#2563eb" />
            <Text style={styles.loadingText}>Carregando contrato…</Text>
          </View>
        )}
        <View style={styles.resumoCard}>
          <Text style={styles.resumoCliente}>{clienteNome}</Text>
          <Text style={styles.resumoValor}>{valorTitulo}</Text>
          <View style={styles.tipoRow}>
            <Text style={styles.resumoTipo}>{tipoTxt}</Text>
            <TagStatus status={statusContratoTag} />
          </View>
          <View style={styles.progressoWrap}>
            <View style={styles.progressoHeader}>
              <Text style={styles.progressoLabel}>Percentual Pago</Text>
              <Text style={styles.progressoPct}>
                {maskIfRestricted(`${progressoContrato}%`, restrict)}
              </Text>
            </View>
            <BarraProgresso percentage={progressoContrato} />
          </View>
        </View>
        {contrato?.descricao ? (
          <View style={styles.descCard}>
            <Text style={styles.descTitle}>Descrição</Text>
            <Text style={styles.descText}>{maskIfRestricted(contrato.descricao, restrict)}</Text>
          </View>
        ) : null}
        <Text style={styles.sectionTitle}>Parcelas</Text>
        {parcelas.length === 0 && contrato ? (
          <View style={styles.emptyParcelas}>
            <MaterialCommunityIcons name="clipboard-text-off-outline" size={36} color="#9ca3af" />
            <Text style={styles.emptyParcelasText}>Nenhuma parcela cadastrada para este contrato.</Text>
          </View>
        ) : null}
        {parcelas.map((p) => (
          <View key={p.apiId || `n-${p.numero}`} style={styles.parcelaCard}>
            <View style={styles.parcelaHeader}>
              <View style={styles.parcelaLeft}>
                <View style={[styles.parcelaNum, p.status === 'pago' ? styles.parcelaNumPago : styles.parcelaNumPendente]}>
                  <Text style={[styles.parcelaNumText, p.status === 'pago' ? styles.parcelaNumTextPago : styles.parcelaNumTextPendente]}>{p.numero}</Text>
                </View>
                <View>
                  <Text style={styles.parcelaValor}>{restrict ? MASKED_MONEY_VALUE : p.valor}</Text>
                  <Text style={styles.parcelaVenc}>
                    Vencimento: {maskIfRestricted(p.vencimento, restrict)}
                  </Text>
                </View>
              </View>
              <TagStatus status={p.status} />
            </View>
            {p.status === 'pendente' &&
              (restrict ? (
                <LocaisSegurosRestrictedNote />
              ) : (
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
              ))}
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
  tipoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  resumoTipo: { fontSize: 14, color: '#6b7280', textAlign: 'center' },
  progressoWrap: { backgroundColor: '#ccfbf1', borderRadius: 12, padding: 16 },
  progressoHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  progressoLabel: { fontSize: 14, color: '#6b7280' },
  progressoPct: { fontSize: 18, fontWeight: '600', color: '#0d9488' },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 12 },
  emptyParcelas: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
    marginBottom: 12,
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    gap: 8,
  },
  emptyParcelasText: { fontSize: 14, color: '#6b7280', textAlign: 'center' },
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
