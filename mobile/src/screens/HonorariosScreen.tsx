import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Header } from '../components/Header';
import { BarraProgresso } from '../components/BarraProgresso';
import { TagStatus } from '../components/TagStatus';
import { BottomNav } from '../components/BottomNav';
import { AccordionSelect, SelectOption } from '../components/AccordionSelect';

type ContratoStatus = 'em-dia' | 'pendente' | 'atrasado' | 'encerrado';

type Contrato = {
  id: number;
  cliente: string;
  processo: string;
  tipoContrato: string;
  status: ContratoStatus;
  progresso: number;
  vencimento: string;
  total: string;
  pago: string;
  reprovado?: boolean;
  encerrado?: boolean;
};

const CONTRATOS: Contrato[] = [
  { id: 1, cliente: 'João Silva', processo: 'Processo 1234/2025', tipoContrato: 'Êxito', status: 'em-dia', progresso: 60, vencimento: '15/03/2026', total: 'R$ 25.000,00', pago: 'R$ 15.000,00' },
  { id: 2, cliente: 'Maria Santos', processo: 'Processo 5678/2025', tipoContrato: 'Parcelas', status: 'pendente', progresso: 33, vencimento: '20/02/2026', total: 'R$ 18.000,00', pago: 'R$ 6.000,00', reprovado: true },
  { id: 3, cliente: 'Carlos Oliveira', processo: 'Processo 9012/2025', tipoContrato: 'Fixo Mensal', status: 'atrasado', progresso: 75, vencimento: '10/02/2026', total: 'R$ 12.000,00', pago: 'R$ 9.000,00' },
  { id: 4, cliente: 'Ana Costa', processo: 'Processo 3456/2024', tipoContrato: 'Êxito', status: 'encerrado', progresso: 100, vencimento: '01/01/2025', total: 'R$ 8.000,00', pago: 'R$ 8.000,00', encerrado: true },
];

const CLIENTES_OPTIONS: SelectOption[] = [
  { value: 'todos', label: 'Todos os Clientes' },
  ...Array.from(new Set(CONTRATOS.map((c) => c.cliente))).map((nome) => ({
    value: nome,
    label: nome,
  })),
];

type Props = {
  onBack: () => void;
  onNavigate: (screen: string, id?: string) => void;
};

export function HonorariosScreen({ onBack, onNavigate }: Props) {
  const [aba, setAba] = useState<'ativos' | 'encerrados'>('ativos');
  const [filtroCliente, setFiltroCliente] = useState('todos');

  const contratosFiltrados = CONTRATOS.filter((c) => {
    const matchCliente = filtroCliente === 'todos' || c.cliente === filtroCliente;
    const matchAba = aba === 'ativos' ? !c.encerrado : !!c.encerrado;
    return matchCliente && matchAba;
  });

  return (
    <View style={styles.container}>
      <Header title="Honorários" showBack onBack={onBack} />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Resumo */}
        <View style={styles.resumoRow}>
          <View style={styles.resumoVerde}>
            <Text style={styles.resumoLabel}>Total Recebido</Text>
            <Text style={styles.resumoValue}>R$ 30.000</Text>
          </View>
          <LinearGradient
            colors={['#14b8a6', '#0d9488']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.resumoAzul}
          >
            <Text style={styles.resumoLabel}>A Receber</Text>
            <Text style={styles.resumoValue}>R$ 25.000</Text>
          </LinearGradient>
        </View>

        {/* Abas */}
        <View style={styles.tabs}>
          <Pressable onPress={() => setAba('ativos')} style={[styles.tab, aba === 'ativos' && styles.tabActive]}>
            <Text style={[styles.tabText, aba === 'ativos' && styles.tabTextActive]}>Ativos</Text>
          </Pressable>
          <Pressable onPress={() => setAba('encerrados')} style={[styles.tab, aba === 'encerrados' && styles.tabActive]}>
            <Text style={[styles.tabText, aba === 'encerrados' && styles.tabTextActive]}>Encerrados</Text>
          </Pressable>
        </View>

        {/* Filtro de Cliente — Accordion inline */}
        <View style={styles.filtroWrap}>
          <AccordionSelect
            label="Filtrar por cliente"
            placeholder="Todos os Clientes"
            options={CLIENTES_OPTIONS}
            value={filtroCliente}
            onChange={setFiltroCliente}
            icon="account"
          />
        </View>

        {/* Lista de Contratos */}
        <View style={styles.list}>
          {contratosFiltrados.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="briefcase-outline" size={40} color="#9ca3af" />
              <Text style={styles.emptyText}>Nenhum contrato encontrado</Text>
            </View>
          ) : (
            contratosFiltrados.map((c) => (
              <Pressable key={c.id} onPress={() => onNavigate('DetalheContrato', String(c.id))} style={styles.contratoCard}>
                <View style={styles.contratoHeader}>
                  <View style={styles.contratoLeft}>
                    <View style={styles.contratoIcon}>
                      <MaterialCommunityIcons name="briefcase" size={22} color="#0d9488" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={styles.contratoClienteRow}>
                        <Text style={styles.contratoCliente}>{c.cliente}</Text>
                        {c.reprovado && c.status === 'pendente' && (
                          <View style={styles.reprovadoBadge}>
                            <Text style={styles.reprovadoBadgeText}>Reprovado</Text>
                          </View>
                        )}
                      </View>
                      <View style={styles.contratoProcesso}>
                        <MaterialCommunityIcons name="file-document" size={14} color="#6b7280" />
                        <Text style={styles.contratoProcessoText}>{c.processo}</Text>
                      </View>
                      <Text style={styles.contratoTipo}>{c.tipoContrato}</Text>
                    </View>
                  </View>
                  <TagStatus status={c.status as any} />
                </View>
                <BarraProgresso percentage={c.progresso} />
                <View style={styles.contratoFooter}>
                  <View>
                    <Text style={styles.contratoFooterLabel}>Vencimento</Text>
                    <Text style={styles.contratoFooterValue}>{c.vencimento}</Text>
                  </View>
                  <View style={styles.contratoFooterCenter}>
                    <Text style={styles.contratoFooterLabel}>Pago</Text>
                    <Text style={styles.contratoPago}>{c.pago}</Text>
                  </View>
                  <View style={styles.contratoFooterRight}>
                    <Text style={styles.contratoFooterLabel}>Total</Text>
                    <Text style={styles.contratoTotal}>{c.total}</Text>
                  </View>
                </View>
              </Pressable>
            ))
          )}
        </View>
        <View style={{ height: 80 }} />
      </ScrollView>
      <View style={styles.bottomNavWrap}>
        <BottomNav />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 16 },
  resumoRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  resumoVerde: { flex: 1, backgroundColor: '#16a34a', borderRadius: 16, padding: 16, shadowColor: '#16a34a', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
  resumoAzul: { flex: 1, borderRadius: 16, padding: 16, shadowColor: '#0d9488', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
  resumoLabel: { fontSize: 12, color: 'rgba(255,255,255,0.8)', marginBottom: 4 },
  resumoValue: { fontSize: 22, fontWeight: 'bold', color: '#fff' },
  tabs: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 16, padding: 4, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },
  tab: { flex: 1, paddingVertical: 10, borderRadius: 12, alignItems: 'center' },
  tabActive: { backgroundColor: '#0d9488' },
  tabText: { fontSize: 14, fontWeight: '500', color: '#6b7280' },
  tabTextActive: { color: '#fff' },
  filtroWrap: { marginBottom: 16 },
  list: { gap: 12 },
  contratoCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },
  contratoHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  contratoLeft: { flexDirection: 'row', gap: 12, flex: 1 },
  contratoIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#ccfbf1', alignItems: 'center', justifyContent: 'center' },
  contratoClienteRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  contratoCliente: { fontSize: 16, fontWeight: '600', color: '#111827' },
  reprovadoBadge: { backgroundColor: '#fee2e2', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  reprovadoBadgeText: { fontSize: 11, fontWeight: '600', color: '#dc2626' },
  contratoProcesso: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  contratoProcessoText: { fontSize: 12, color: '#6b7280' },
  contratoTipo: { fontSize: 14, color: '#6b7280', marginTop: 2 },
  contratoFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#f3f4f6' },
  contratoFooterCenter: { alignItems: 'center' },
  contratoFooterRight: { alignItems: 'flex-end' },
  contratoFooterLabel: { fontSize: 12, color: '#6b7280', marginBottom: 4 },
  contratoFooterValue: { fontSize: 14, fontWeight: '500', color: '#111827' },
  contratoPago: { fontSize: 14, fontWeight: '600', color: '#16a34a' },
  contratoTotal: { fontSize: 14, fontWeight: '600', color: '#0d9488' },
  bottomNavWrap: { position: 'absolute', bottom: 0, left: 0, right: 0 },
  emptyState: { alignItems: 'center', paddingVertical: 32, gap: 8 },
  emptyText: { fontSize: 14, color: '#9ca3af' },
});
