import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, Pressable, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getApiBaseUrl } from '../config/api';
import { useAuth } from '../context/AuthContext';
import { fetchClienteDashboard } from '../services/resources';
import type { ClienteDashboardApi } from '../types/api';
import { formatCentavosBRL } from '../utils/money';

type Props = {
  onBack?: () => void;
  onNavigate: (screen: string, id?: string) => void;
};

const DASH_CLIENTE_VAZIO: ClienteDashboardApi = {
  id: 0,
  nome: '',
  totalPago: 0,
  totalPendente: 0,
  totalContrato: 0,
  percentualPago: 0,
  parcelasRestantes: 0,
  notificacoesNaoLidas: 0,
};

function iniciais(nome: string): string {
  const p = nome.trim().split(/\s+/).filter(Boolean);
  if (p.length === 0) return '?';
  if (p.length === 1) return p[0].slice(0, 2).toUpperCase();
  return (p[0][0] + p[p.length - 1][0]).toUpperCase();
}

export function ClienteHomeScreen({ onBack, onNavigate }: Props) {
  const { token } = useAuth();
  const apiOn = !!getApiBaseUrl() && !!token;

  const [dash, setDash] = useState<ClienteDashboardApi | null>(null);
  const [loading, setLoading] = useState(false);

  const d = dash ?? DASH_CLIENTE_VAZIO;

  useEffect(() => {
    if (!apiOn) {
      setDash(null);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const row = await fetchClienteDashboard(token);
        if (!cancelled && row) setDash(row);
      } catch {
        if (!cancelled) setDash(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [apiOn, token]);

  const badgeCount = d.notificacoesNaoLidas;
  const ultima = d.ultimaCobranca;

  const avatarLetters = useMemo(() => iniciais(d.nome), [d.nome]);

  return (
    <LinearGradient colors={['#0d9488', '#115e59']} style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          {onBack && (
            <Pressable onPress={onBack} style={styles.backBtn}>
              <MaterialCommunityIcons name="arrow-left" size={22} color="#fff" />
            </Pressable>
          )}
          <View>
            <Text style={styles.ola}>Olá,</Text>
            <Text style={styles.nome}>{d.nome || 'Cliente'}</Text>
          </View>
        </View>
        <View style={styles.headerBtns}>
          <Pressable onPress={() => onNavigate('ClienteNotificacoes')} style={styles.bellBtn}>
            <MaterialCommunityIcons name="bell-outline" size={22} color="#fff" />
            {badgeCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{badgeCount > 9 ? '9+' : badgeCount}</Text>
              </View>
            )}
          </Pressable>
          <Pressable onPress={() => onNavigate('ClientePerfil')} style={styles.avatar}>
            <Text style={styles.avatarText}>{avatarLetters}</Text>
          </Pressable>
        </View>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {apiOn && loading && (
          <View style={styles.loadingRow}>
            <ActivityIndicator color="#2563eb" />
            <Text style={styles.loadingText}>Atualizando…</Text>
          </View>
        )}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.iconWrapGreen}><MaterialCommunityIcons name="cash" size={22} color="#16a34a" /></View>
            <Text style={styles.cardLabel}>Total Pago</Text>
          </View>
          <Text style={styles.cardValor}>{formatCentavosBRL(d.totalPago)}</Text>
          <Text style={styles.cardSub}>{d.percentualPago}% do total</Text>
        </View>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.iconWrapYellow}><MaterialCommunityIcons name="clock-outline" size={22} color="#d97706" /></View>
            <Text style={styles.cardLabel}>Total Pendente</Text>
          </View>
          <Text style={styles.cardValor}>{formatCentavosBRL(d.totalPendente)}</Text>
          <Text style={styles.cardSub}>
            {d.parcelasRestantes} {d.parcelasRestantes === 1 ? 'parcela restante' : 'parcelas restantes'}
          </Text>
        </View>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.iconWrapBlue}><MaterialCommunityIcons name="file-document" size={22} color="#0d9488" /></View>
            <Text style={styles.cardLabel}>Última Cobrança</Text>
          </View>
          <View style={styles.ultimaRow}>
            <View>
              <Text style={styles.ultimaParcela}>{ultima?.parcelaLabel ?? '—'}</Text>
              <Text style={styles.ultimaVenc}>Vencimento: {ultima?.vencimento ?? '—'}</Text>
            </View>
            <Text style={styles.ultimaValor}>
              {ultima ? formatCentavosBRL(ultima.valor) : '—'}
            </Text>
          </View>
        </View>
        <Pressable onPress={() => onNavigate('ClienteCobrancas')} style={styles.btn}>
          <Text style={styles.btnText}>Minhas Cobranças</Text>
        </Pressable>
        <View style={{ height: 24 }} />
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flex: 1, backgroundColor: '#f9fafb', borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  header: { paddingHorizontal: 20, paddingVertical: 24, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  backBtn: { padding: 4 },
  ola: { fontSize: 14, color: '#ccfbf1', marginBottom: 4 },
  nome: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  headerBtns: { flexDirection: 'row', gap: 12 },
  bellBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', position: 'relative' },
  badge: { position: 'absolute', top: -4, right: -4, minWidth: 20, height: 20, borderRadius: 10, backgroundColor: '#ef4444', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
  badgeText: { fontSize: 11, fontWeight: 'bold', color: '#fff' },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 16, fontWeight: '600', color: '#0d9488' },
  content: { flex: 1, backgroundColor: '#f9fafb', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 20, paddingTop: 24 },
  loadingRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  loadingText: { fontSize: 13, color: '#6b7280' },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 24, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 4 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 },
  iconWrapGreen: { width: 40, height: 40, borderRadius: 10, backgroundColor: '#dcfce7', alignItems: 'center', justifyContent: 'center' },
  iconWrapYellow: { width: 40, height: 40, borderRadius: 10, backgroundColor: '#fef3c7', alignItems: 'center', justifyContent: 'center' },
  iconWrapBlue: { width: 40, height: 40, borderRadius: 10, backgroundColor: '#ccfbf1', alignItems: 'center', justifyContent: 'center' },
  cardLabel: { fontSize: 14, color: '#6b7280' },
  cardValor: { fontSize: 28, fontWeight: 'bold', color: '#111827' },
  cardSub: { fontSize: 14, color: '#6b7280', marginTop: 4 },
  ultimaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 },
  ultimaParcela: { fontSize: 16, fontWeight: '600', color: '#111827' },
  ultimaVenc: { fontSize: 14, color: '#6b7280', marginTop: 4 },
  ultimaValor: { fontSize: 20, fontWeight: 'bold', color: '#0d9488' },
  btn: { backgroundColor: '#0d9488', borderRadius: 16, paddingVertical: 16, alignItems: 'center', marginTop: 8 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
