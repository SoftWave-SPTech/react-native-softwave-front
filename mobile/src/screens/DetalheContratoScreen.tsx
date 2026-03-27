import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Header } from '../components/Header';
import { TagStatus } from '../components/TagStatus';
import { BarraProgresso } from '../components/BarraProgresso';

type ParcelaStatus = 'pago' | 'pendente';

type Parcela = {
  numero: number;
  valor: string;
  vencimento: string;
  status: ParcelaStatus;
};

const PARCELAS_INICIAL: Parcela[] = [
  { numero: 1, valor: 'R$ 6.000,00', vencimento: '15/01/2026', status: 'pago' },
  { numero: 2, valor: 'R$ 6.000,00', vencimento: '15/02/2026', status: 'pago' },
  { numero: 3, valor: 'R$ 6.000,00', vencimento: '15/03/2026', status: 'pendente' },
  { numero: 4, valor: 'R$ 7.000,00', vencimento: '15/04/2026', status: 'pendente' },
];

type Props = {
  contratoId: string;
  onBack: () => void;
};

export function DetalheContratoScreen({ contratoId, onBack }: Props) {
  const [parcelas, setParcelas] = useState<Parcela[]>(PARCELAS_INICIAL);

  const totalParcelas = parcelas.length;
  const parcelasPagas = parcelas.filter((p) => p.status === 'pago').length;
  const percentualPago = Math.round((parcelasPagas / totalParcelas) * 100);

  const marcarPago = (numero: number) => {
    setParcelas((prev) =>
      prev.map((p) => (p.numero === numero ? { ...p, status: 'pago' } : p))
    );
  };

  const gerarCobranca = (numero: number) => {
    Alert.alert('Cobrança Gerada', `Cobrança da parcela ${numero} gerada e enviada ao cliente!`);
  };

  return (
    <View style={styles.container}>
      <Header title="Detalhe do Contrato" showBack onBack={onBack} />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.resumoCard}>
          <Text style={styles.resumoCliente}>João Silva</Text>
          <Text style={styles.resumoValor}>R$ 25.000,00</Text>
          <Text style={styles.resumoTipo}>Contrato de Êxito</Text>
          <View style={styles.progressoWrap}>
            <View style={styles.progressoHeader}>
              <Text style={styles.progressoLabel}>Percentual Pago</Text>
              <Text style={styles.progressoPct}>{percentualPago}%</Text>
            </View>
            <BarraProgresso percentage={percentualPago} />
          </View>
        </View>
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
                <Pressable onPress={() => gerarCobranca(p.numero)} style={styles.btnGerar}>
                  <MaterialCommunityIcons name="send" size={18} color="#0d9488" />
                  <Text style={styles.btnGerarText}>Gerar Cobrança</Text>
                </Pressable>
                <Pressable onPress={() => marcarPago(p.numero)} style={styles.btnPago}>
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
