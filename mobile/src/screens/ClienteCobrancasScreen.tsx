import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Header } from '../components/Header';
import { TagStatus } from '../components/TagStatus';
import { getApiBaseUrl } from '../config/api';
import { useAuth } from '../context/AuthContext';
import { fetchClienteCobrancas } from '../services/resources';
import type { CobrancaClienteApi } from '../types/api';
import { formatCentavosBRL, formatDateIsoToBR } from '../utils/money';

type Props = {
  onBack: () => void;
  onNavigate: (screen: string, id?: string) => void;
};

function vencimentoLabel(iso: string) {
  if (/^\d{4}-\d{2}-\d{2}/.test(iso)) return formatDateIsoToBR(iso);
  return iso;
}

export function ClienteCobrancasScreen({ onBack, onNavigate }: Props) {
  const { token } = useAuth();
  const apiOn = !!getApiBaseUrl() && !!token;

  const [lista, setLista] = useState<CobrancaClienteApi[]>([]);
  const [loading, setLoading] = useState(false);

  const carregar = useCallback(async () => {
    if (!apiOn || !token) {
      setLista([]);
      return;
    }
    setLoading(true);
    try {
      const rows = await fetchClienteCobrancas(token);
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

  const [filtro, setFiltro] = useState<'pendentes' | 'pagas'>('pendentes');
  const cobrancasFiltradas = lista.filter((c) => (filtro === 'pendentes' ? c.status === 'pendente' : c.status === 'pago'));

  return (
    <View style={styles.container}>
      <Header title="Minhas Cobranças" showBack onBack={onBack} />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {apiOn && loading && (
          <View style={styles.loadingRow}>
            <ActivityIndicator size="small" color="#2563eb" />
            <Text style={styles.loadingText}>Carregando…</Text>
          </View>
        )}
        <View style={styles.tabs}>
          <Pressable onPress={() => setFiltro('pendentes')} style={[styles.tab, filtro === 'pendentes' && styles.tabPendentes]}>
            <Text style={[styles.tabText, filtro === 'pendentes' && styles.tabTextActive]}>Pendentes</Text>
          </Pressable>
          <Pressable onPress={() => setFiltro('pagas')} style={[styles.tab, filtro === 'pagas' && styles.tabPagas]}>
            <Text style={[styles.tabText, filtro === 'pagas' && styles.tabTextActive]}>Pagas</Text>
          </Pressable>
        </View>
        {cobrancasFiltradas.map((c) => (
          <Pressable key={c.id} onPress={() => onNavigate('ClientePagamento', String(c.id))} style={styles.card}>
            <View style={styles.cardRow}>
              <View style={styles.cardIcon}><MaterialCommunityIcons name="file-document" size={22} color="#0d9488" /></View>
              <View style={styles.cardContent}>
                <View style={styles.cardHeader}>
                  <View style={styles.cardLeft}>
                    <Text style={styles.cardProcesso}>{c.processo}</Text>
                    <Text style={styles.cardVenc}>Vencimento: {vencimentoLabel(c.vencimento)}</Text>
                  </View>
                  <TagStatus status={c.status} />
                </View>
                <Text style={styles.cardValor}>{formatCentavosBRL(c.valor)}</Text>
                <View style={styles.progressoWrap}>
                  <View style={styles.progressoHeader}>
                    <Text style={styles.progressoLabel}>Parcela {c.parcela} de {c.totalParcelas}</Text>
                    <Text style={styles.progressoPct}>{c.percentualPago}% pago</Text>
                  </View>
                  <View style={styles.progressoTrack}>
                    <View style={[styles.progressoFill, { width: `${c.percentualPago}%` }]} />
                  </View>
                </View>
              </View>
            </View>
          </Pressable>
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
  tabs: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 16, padding: 4, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },
  tab: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  tabPendentes: { backgroundColor: '#111827' },
  tabPagas: { backgroundColor: '#111827' },
  tabText: { fontSize: 14, fontWeight: '500', color: '#6b7280' },
  tabTextActive: { color: '#fff' },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },
  cardRow: { flexDirection: 'row', gap: 12 },
  cardIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#ccfbf1', alignItems: 'center', justifyContent: 'center' },
  cardContent: { flex: 1 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  cardLeft: { flex: 1 },
  cardProcesso: { fontSize: 16, fontWeight: '500', color: '#111827' },
  cardVenc: { fontSize: 14, color: '#6b7280', marginTop: 4 },
  cardValor: { fontSize: 20, fontWeight: '600', color: '#0d9488', marginBottom: 12 },
  progressoWrap: { backgroundColor: '#f3f4f6', borderRadius: 12, padding: 12 },
  progressoHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  progressoLabel: { fontSize: 12, color: '#6b7280' },
  progressoPct: { fontSize: 12, fontWeight: '600', color: '#111827' },
  progressoTrack: { height: 8, backgroundColor: '#e5e7eb', borderRadius: 4, overflow: 'hidden' },
  progressoFill: { height: '100%', backgroundColor: '#0d9488', borderRadius: 4 },
});
