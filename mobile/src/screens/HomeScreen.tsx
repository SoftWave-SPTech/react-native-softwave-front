import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Header } from '../components/Header';
import { CardKPI } from '../components/CardKPI';
import { CardTransacao } from '../components/CardTransacao';
import { BottomNav } from '../components/BottomNav';
import { FAB } from '../components/FAB';
import { getApiBaseUrl } from '../config/api';
import { useAuth } from '../context/AuthContext';
import { mapTransacaoApiToCard, type TransacaoCardModel } from '../mappers/transacao';
import { fetchDashboardResumo, fetchTransacoesRecentes, syncPagamentosDashboardCount } from '../services/resources';
import type { DashboardResumoApi } from '../types/api';
import { formatCentavosBRL } from '../utils/money';

type Props = {
  onBack?: () => void;
  onNavigate: (screen: string, id?: string) => void;
};

/** Placeholder só para layout quando a API ainda não devolveu o resumo (valores zerados). */
const DASHBOARD_VAZIO: DashboardResumoApi = {
  id: 0,
  valorDisponivel: 0,
  lucroLiquidoMes: 0,
  receitaMensal: 0,
  despesaMensal: 0,
  pendentes: 0,
  variacaoReceita: '—',
  variacaoPendentes: '—',
  variacaoDespesa: '—',
  variacaoLucro: '—',
  pagamentosParaConferir: 0,
};

function variationTypeFromString(s: string): 'positive' | 'negative' {
  return s.trim().startsWith('-') ? 'negative' : 'positive';
}

export function HomeScreen({ onBack, onNavigate }: Props) {
  const { token } = useAuth();
  const apiOn = !!getApiBaseUrl() && !!token;

  const [dash, setDash] = useState<DashboardResumoApi | null>(null);
  const [recent, setRecent] = useState<TransacaoCardModel[]>([]);
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const effectiveDash = dash ?? DASHBOARD_VAZIO;

  const carregar = React.useCallback(async () => {
    if (!apiOn) {
      setDash(null);
      setRecent([]);
      setAvatarUri(null);
      return;
    }
    setLoading(true);
    try {
      const [d, tx] = await Promise.all([fetchDashboardResumo(token), fetchTransacoesRecentes(token, 4)]);
      try {
        await syncPagamentosDashboardCount(token);
      } catch {
        /* mantém resumo do GET */
      }
      const dAfter = await fetchDashboardResumo(token);
      if (dAfter) setDash(dAfter);
      else if (d) setDash(d);
      setRecent(tx.map(mapTransacaoApiToCard));
      // busca foto do perfil do escritório/usuário — com logs e fallback para cliente
      try {
        const resources = await import('../services/resources');
        let p = await resources.fetchPerfilEscritorio(token);
        if (!p) {
          // fallback: talvez o app esteja no fluxo de cliente
          try {
            const cp = await resources.fetchClientePerfil(token as string);
            if (cp) p = { id: '0', nome: cp.nome, email: cp.email, telefone: cp.telefone, oab: '', endereco: '', fotoPerfil: cp.fotoPerfil } as any;
          } catch {
            /* ignore */
          }
        }
        // debug log
        // eslint-disable-next-line no-console
        console.log('[Home] perfil fetch', { perfil: p });
        const raw = p?.fotoPerfil ?? null;
        const resolve = (rawUrl: string | null): string | null => {
          if (!rawUrl) return null;
          if (/^https?:\/\//i.test(rawUrl)) return rawUrl;
          if (rawUrl.startsWith('file://')) return rawUrl;
          if (rawUrl.startsWith('/')) {
            const base = getApiBaseUrl();
            if (!base) return null;
            const origin = base.replace(/\/v1\/?$/i, '');
            return `${origin}${rawUrl}`;
          }
          return rawUrl;
        };
        const resolved = resolve(raw);
        // eslint-disable-next-line no-console
        console.log('[Home] avatar resolved', { raw, resolved });
        setAvatarUri(resolved);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.warn('[Home] failed to fetch perfil', err);
        setAvatarUri(null);
      }
    } catch {
      setDash(null);
      setRecent([]);
    } finally {
      setLoading(false);
    }
  }, [apiOn, token]);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  useFocusEffect(
    React.useCallback(() => {
      void carregar();
      return undefined;
    }, [carregar]),
  );

  const heroValor = useMemo(
    () => formatCentavosBRL(effectiveDash.valorDisponivel),
    [effectiveDash.valorDisponivel],
  );
  const heroLucro = useMemo(
    () => formatCentavosBRL(effectiveDash.lucroLiquidoMes),
    [effectiveDash.lucroLiquidoMes],
  );

  const receitaVal = formatCentavosBRL(effectiveDash.receitaMensal);
  const pendentesVal = formatCentavosBRL(effectiveDash.pendentes);
  const despesaVal = formatCentavosBRL(effectiveDash.despesaMensal);
  const lucroVal = formatCentavosBRL(effectiveDash.lucroLiquidoMes);

  return (
    <View style={styles.container}>
      <Header
        showNotification
        showAvatar
        avatarUri={avatarUri}
        onNotification={() => onNavigate('Notificacoes')}
        onAvatar={() => onNavigate('Perfil')}
      />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {apiOn && loading && (
          <View style={styles.loadingRow}>
            <ActivityIndicator size="small" color="#2563eb" />
            <Text style={styles.loadingText}>Atualizando dados…</Text>
          </View>
        )}

        <LinearGradient colors={['#14b8a6', '#0e7490']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.heroCard}>
          <Text style={styles.heroLabel}>Valor disponível</Text>
          <Text style={styles.heroValue}>{heroValor}</Text>
          <View style={styles.heroRow}>
            <MaterialCommunityIcons name="trending-up" size={16} color="#ccfbf1" />
            <Text style={styles.heroSubtext}>Lucro líquido do mês: {heroLucro}</Text>
          </View>
        </LinearGradient>

        <View style={styles.kpiGrid}>
          <View style={styles.kpiItem}>
            <CardKPI
              icon="cash"
              title="Receita Mensal"
              value={receitaVal}
              variation={effectiveDash.variacaoReceita}
              variationType={variationTypeFromString(effectiveDash.variacaoReceita)}
            />
          </View>
          <View style={styles.kpiItem}>
            <CardKPI
              icon="clock-outline"
              title="Pendentes"
              value={pendentesVal}
              variation={effectiveDash.variacaoPendentes}
              variationType={variationTypeFromString(effectiveDash.variacaoPendentes)}
            />
          </View>
          <View style={styles.kpiItem}>
            <CardKPI
              icon="trending-down"
              title="Despesa Mensal"
              value={despesaVal}
              variation={effectiveDash.variacaoDespesa}
              variationType={variationTypeFromString(effectiveDash.variacaoDespesa)}
            />
          </View>
          <View style={styles.kpiItem}>
            <CardKPI
              icon="trending-up"
              title="Lucro Líquido"
              value={lucroVal}
              variation={effectiveDash.variacaoLucro}
              variationType={variationTypeFromString(effectiveDash.variacaoLucro)}
            />
          </View>
        </View>

        <View style={styles.insightsCard}>
          <View style={styles.insightsIconWrap}>
            <MaterialCommunityIcons name="lightbulb-outline" size={20} color="#0d9488" />
          </View>
          <View style={styles.insightsContent}>
            <Text style={styles.insightsTitle}>Insights Inteligentes</Text>
            <Text style={styles.insightsText}>
              Os resumos aparecem conforme os dados retornados pela API.
            </Text>
            <Pressable onPress={() => onNavigate('AssistenteIA')} style={styles.insightsLink}>
              <Text style={styles.insightsLinkText}>Ver Assistente IA</Text>
              <Text style={styles.insightsLinkArrow}>→</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Transações Recentes</Text>
            <Pressable onPress={() => onNavigate('Transacoes')}>
              <Text style={styles.sectionLink}>Ver todas</Text>
            </Pressable>
          </View>
          <View style={styles.transactionsList}>
            {recent.length === 0 ? (
              <Text style={styles.emptyRecent}>Nenhuma transação recente.</Text>
            ) : (
              recent.map((t) => (
                <CardTransacao
                  key={t.id}
                  icon={t.icon}
                  title={t.title}
                  subtitle={t.subtitle}
                  value={t.value}
                  type={t.type}
                  status={t.status}
                  onPress={() => onNavigate('DetalheTransacao', t.id)}
                />
              ))
            )}
          </View>
        </View>

        {/* Ações Rápidas */}
        {/* <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ações Rápidas</Text>
          <View style={styles.actionsGrid}>
            <Pressable style={styles.actionCard} onPress={() => onNavigate('Honorarios')}>
              <View style={[styles.actionIcon, styles.actionIconBlue]}>
                <MaterialCommunityIcons name="briefcase" size={20} color="#0d9488" />
              </View>
              <Text style={styles.actionLabel}>Honorários</Text>
            </Pressable>
            <Pressable style={styles.actionCard} onPress={() => onNavigate('Relatorios')}>
              <View style={[styles.actionIcon, styles.actionIconGreen]}>
                <MaterialCommunityIcons name="trending-up" size={20} color="#16a34a" />
              </View>
              <Text style={styles.actionLabel}>Relatórios</Text>
            </Pressable>
            <Pressable style={[styles.actionCard, styles.actionCardBadge]} onPress={() => onNavigate('PagamentosConferir')}>
              <View style={[styles.actionIcon, styles.actionIconAmber]}>
                <MaterialCommunityIcons name="file-document" size={20} color="#d97706" />
              </View>
              <Text style={styles.actionLabel}>Pagamentos</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>3</Text>
              </View>
            </Pressable>
            <Pressable style={styles.actionCard} onPress={() => onNavigate('NovaTransacao')}>
              <View style={[styles.actionIcon, styles.actionIconPurple]}>
                <MaterialCommunityIcons name="credit-card" size={20} color="#0d9488" />
              </View>
              <Text style={styles.actionLabel}>Nova Transação</Text>
            </Pressable>
          </View>
        </View> */}

        <View style={{ height: 100 }} />
      </ScrollView>

      <FAB onPress={() => onNavigate('NovaTransacao')} />
      <View style={styles.bottomNavWrap}>
        <BottomNav />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  loadingText: { fontSize: 13, color: '#6b7280' },
  heroCard: {
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    shadowColor: '#115e59',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 5,
  },
  heroLabel: {
    fontSize: 14,
    color: '#ccfbf1',
    marginBottom: 8,
  },
  heroValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  heroSubtext: {
    fontSize: 14,
    color: '#ccfbf1',
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  kpiItem: {
    width: '47%',
  },
  insightsCard: {
    flexDirection: 'row',
    backgroundColor: '#f0fdfa',
    borderWidth: 1,
    borderColor: '#99f6e4',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#115e59',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  insightsIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#ccfbf1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  insightsContent: {
    flex: 1,
  },
  insightsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  insightsText: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  insightsLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  insightsLinkText: {
    fontSize: 14,
    color: '#0f766e',
    fontWeight: '500',
  },
  insightsLinkArrow: {
    fontSize: 18,
    color: '#115e59',
  },
  section: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  sectionLink: {
    fontSize: 14,
    color: '#0d9488',
  },
  transactionsList: {
    gap: 12,
  },
  emptyRecent: {
    fontSize: 14,
    color: '#9ca3af',
    paddingVertical: 8,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
    width: '47%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  actionCardBadge: {
    position: 'relative',
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  actionIconBlue: { backgroundColor: '#ccfbf1' },
  actionIconGreen: { backgroundColor: '#dcfce7' },
  actionIconAmber: { backgroundColor: '#fef3c7' },
  actionIconPurple: { backgroundColor: '#ccfbf1' },
  actionLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  badge: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#ef4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  bottomNavWrap: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
});
