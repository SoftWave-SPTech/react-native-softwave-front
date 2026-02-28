import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Modal, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Header } from '../components/Header';
import { TagStatus } from '../components/TagStatus';

type Props = {
  transacaoId: string;
  onBack: () => void;
  onEditar: () => void;
};

const MOCK = {
  tipo: 'receita' as const,
  titulo: 'Honorários - Processo 1234',
  valor: 'R$ 5.000,00',
  status: 'pago' as const,
  categoria: 'Honorários',
  cliente: 'João Silva',
  processo: 'Processo 1234/2025',
  data: '10/02/2026',
  vencimento: '15/02/2026',
  dataPagamento: '12/02/2026',
  descricao: 'Pagamento referente aos honorários advocatícios do processo trabalhista. Cliente efetuou o pagamento via PIX.',
  observacoes: 'Parcela 2 de 4 do contrato de honorários.',
  comprovante: true,
  metodoPagamento: 'PIX',
};

export function DetalheTransacaoScreen({ transacaoId, onBack, onEditar }: Props) {
  const [modalComprovante, setModalComprovante] = useState(false);
  const [modalExcluir, setModalExcluir] = useState(false);
  const t = MOCK;

  const handleExcluir = () => {
    Alert.alert('Excluir Transação?', 'Esta ação não pode ser desfeita.', [
      { text: 'Cancelar', style: 'cancel', onPress: () => setModalExcluir(false) },
      { text: 'Excluir', style: 'destructive', onPress: () => { setModalExcluir(false); onBack(); } },
    ]);
  };

  return (
    <View style={styles.container}>
      <Header title="Detalhes da Transação" showBack onBack={onBack} />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={[styles.heroCard, t.tipo === 'receita' ? styles.heroReceita : styles.heroDespesa]}>
          <View style={styles.heroHeader}>
            <Text style={styles.heroLabel}>{t.tipo === 'receita' ? 'Receita' : 'Despesa'}</Text>
            <TagStatus status={t.status} />
          </View>
          <Text style={styles.heroValue}>{t.valor}</Text>
          <Text style={styles.heroTitle}>{t.titulo}</Text>
        </View>
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
              <Text style={styles.metodo}>Método: {t.metodoPagamento}</Text>
            </View>
          )}
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Descrição</Text>
          <Text style={styles.descricao}>{t.descricao}</Text>
        </View>
        {t.observacoes && (
          <View style={styles.obsCard}>
            <Text style={styles.obsTitle}>Observações</Text>
            <Text style={styles.obsText}>{t.observacoes}</Text>
          </View>
        )}
        {t.comprovante && (
          <Pressable onPress={() => setModalComprovante(true)} style={styles.comprovanteBtn}>
            <MaterialCommunityIcons name="file-document" size={22} color="#2563eb" />
            <Text style={styles.comprovanteBtnText}>Visualizar Comprovante</Text>
          </Pressable>
        )}
        <View style={styles.actionsRow}>
          <Pressable onPress={onEditar} style={styles.btnEditar}>
            <MaterialCommunityIcons name="pencil" size={22} color="#fff" />
            <Text style={styles.btnEditarText}>Editar</Text>
          </Pressable>
          <Pressable onPress={() => setModalExcluir(true)} style={styles.btnExcluir}>
            <MaterialCommunityIcons name="trash-can-outline" size={22} color="#dc2626" />
            <Text style={styles.btnExcluirText}>Excluir</Text>
          </Pressable>
        </View>
        {t.status === 'pendente' && (
          <View style={styles.statusActions}>
            <Pressable style={styles.btnPago}><MaterialCommunityIcons name="check-circle" size={22} color="#fff" /><Text style={styles.btnPagoText}>Marcar como Pago</Text></Pressable>
            <Pressable style={styles.btnCancelar}><MaterialCommunityIcons name="close-circle-outline" size={22} color="#6b7280" /><Text style={styles.btnCancelarText}>Cancelar Transação</Text></Pressable>
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
      <View style={styles.infoIcon}><MaterialCommunityIcons name={icon as any} size={20} color="#2563eb" /></View>
      <View style={styles.infoContent}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 16 },
  heroCard: { borderRadius: 16, padding: 24, marginBottom: 16 },
  heroReceita: { backgroundColor: '#16a34a' },
  heroDespesa: { backgroundColor: '#dc2626' },
  heroHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  heroLabel: { fontSize: 14, color: 'rgba(255,255,255,0.8)' },
  heroValue: { fontSize: 28, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
  heroTitle: { fontSize: 16, color: 'rgba(255,255,255,0.9)' },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 16 },
  cardTitle: { fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 16 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  infoIcon: { width: 40, height: 40, borderRadius: 10, backgroundColor: '#dbeafe', alignItems: 'center', justifyContent: 'center' },
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
  obsCard: { backgroundColor: '#fffbeb', borderWidth: 1, borderColor: '#fde68a', borderRadius: 16, padding: 16, marginBottom: 16 },
  obsTitle: { fontSize: 14, fontWeight: '600', color: '#111827', marginBottom: 8 },
  obsText: { fontSize: 14, color: '#6b7280' },
  comprovanteBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, backgroundColor: '#dbeafe', borderRadius: 12, marginBottom: 16 },
  comprovanteBtnText: { fontSize: 16, color: '#2563eb', fontWeight: '500' },
  actionsRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  btnEditar: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, backgroundColor: '#2563eb', borderRadius: 12 },
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
