import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, Pressable, StyleSheet, Modal } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Header } from '../components/Header';
import { BottomNav } from '../components/BottomNav';

const PAGAMENTOS = [
  { id: 1, cliente: 'João Silva', processo: 'Processo 1234/2025', valor: 'R$ 6.000,00', data: '15/02/2026' },
  { id: 2, cliente: 'Maria Santos', processo: 'Processo 5678/2025', valor: 'R$ 3.200,00', data: '14/02/2026' },
  { id: 3, cliente: 'Carlos Oliveira', processo: 'Processo 9012/2025', valor: 'R$ 5.500,00', data: '13/02/2026' },
];

type Props = {
  onBack: () => void;
  onNavigate: (screen: string) => void;
};

export function PagamentosConferirScreen({ onBack, onNavigate }: Props) {
  const [selectedPagamento, setSelectedPagamento] = useState<number | null>(null);
  const [modalRejeicao, setModalRejeicao] = useState<number | null>(null);
  const [motivoRejeicao, setMotivoRejeicao] = useState('');

  const handleRejeitar = () => {
    if (motivoRejeicao.trim()) {
      setModalRejeicao(null);
      setMotivoRejeicao('');
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Pagamentos a Conferir" showBack onBack={onBack} />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.alertBox}>
          <Text style={styles.alertText}><Text style={styles.alertBold}>{PAGAMENTOS.length} pagamentos</Text> aguardando confirmação</Text>
        </View>
        {PAGAMENTOS.map((p) => (
          <View key={p.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.cardIcon}><MaterialCommunityIcons name="file-image-outline" size={24} color="#2563eb" /></View>
              <View style={styles.cardContent}>
                <Text style={styles.cardCliente}>{p.cliente}</Text>
                <View style={styles.cardProcesso}><MaterialCommunityIcons name="file-document" size={14} color="#6b7280" /><Text style={styles.cardProcessoText}>{p.processo}</Text></View>
                <Text style={styles.cardData}>{p.data}</Text>
                <Text style={styles.cardValor}>{p.valor}</Text>
              </View>
            </View>
            <Pressable onPress={() => setSelectedPagamento(p.id)} style={styles.verBtn}>
              <Text style={styles.verBtnText}>Visualizar Comprovante</Text>
            </Pressable>
            <View style={styles.actionsRow}>
              <Pressable onPress={() => setModalRejeicao(p.id)} style={styles.reprovarBtn}>
                <MaterialCommunityIcons name="close" size={18} color="#dc2626" />
                <Text style={styles.reprovarBtnText}>Reprovar</Text>
              </Pressable>
              <Pressable style={styles.aprovarBtn}>
                <MaterialCommunityIcons name="check" size={18} color="#15803d" />
                <Text style={styles.aprovarBtnText}>Aprovar</Text>
              </Pressable>
            </View>
          </View>
        ))}
        <View style={{ height: 80 }} />
      </ScrollView>
      <View style={styles.bottomNavWrap}>
        <BottomNav />
      </View>

      <Modal visible={!!selectedPagamento} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setSelectedPagamento(null)}>
          <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
            <Text style={styles.modalTitle}>Comprovante de Pagamento</Text>
            <View style={styles.comprovantePlaceholder}><MaterialCommunityIcons name="file-image-outline" size={64} color="#9ca3af" /></View>
            <Pressable onPress={() => setSelectedPagamento(null)} style={styles.modalFechar}><Text style={styles.modalFecharText}>Fechar</Text></Pressable>
          </View>
        </Pressable>
      </Modal>

      <Modal visible={!!modalRejeicao} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setModalRejeicao(null)}>
          <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
            <Text style={styles.modalTitle}>Reprovar Pagamento</Text>
            <Text style={styles.modalSubtitle}>Por favor, informe o motivo da reprovação:</Text>
            <View style={styles.textAreaWrap}>
              <TextInput value={motivoRejeicao} onChangeText={setMotivoRejeicao} placeholder="Ex: Comprovante ilegível..." placeholderTextColor="#9ca3af" multiline numberOfLines={4} style={styles.textArea} />
            </View>
            <View style={styles.modalActions}>
              <Pressable onPress={() => setModalRejeicao(null)} style={styles.modalCancelar}><Text style={styles.modalCancelarText}>Cancelar</Text></Pressable>
              <Pressable onPress={handleRejeitar} disabled={!motivoRejeicao.trim()} style={[styles.modalReprovar, !motivoRejeicao.trim() && styles.modalDisabled]}><Text style={styles.modalReprovarText}>Reprovar</Text></Pressable>
            </View>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 16 },
  alertBox: { backgroundColor: '#fffbeb', borderWidth: 1, borderColor: '#fde68a', borderRadius: 16, padding: 16, marginBottom: 16 },
  alertText: { fontSize: 14, color: '#92400e' },
  alertBold: { fontWeight: '600' },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12 },
  cardHeader: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  cardIcon: { width: 48, height: 48, borderRadius: 12, backgroundColor: '#dbeafe', alignItems: 'center', justifyContent: 'center' },
  cardContent: { flex: 1 },
  cardCliente: { fontSize: 16, fontWeight: '600', color: '#111827' },
  cardProcesso: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  cardProcessoText: { fontSize: 14, color: '#6b7280' },
  cardData: { fontSize: 12, color: '#6b7280', marginTop: 4 },
  cardValor: { fontSize: 18, fontWeight: '600', color: '#2563eb', marginTop: 8 },
  verBtn: { paddingVertical: 10, backgroundColor: '#f3f4f6', borderRadius: 12, alignItems: 'center', marginBottom: 12 },
  verBtnText: { fontSize: 14, color: '#6b7280' },
  actionsRow: { flexDirection: 'row', gap: 8 },
  reprovarBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 10, backgroundColor: '#fee2e2', borderRadius: 12 },
  reprovarBtnText: { fontSize: 14, color: '#dc2626', fontWeight: '500' },
  aprovarBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 10, backgroundColor: '#dcfce7', borderRadius: 12 },
  aprovarBtnText: { fontSize: 14, color: '#15803d', fontWeight: '500' },
  bottomNavWrap: { position: 'absolute', bottom: 0, left: 0, right: 0 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#fff', borderRadius: 16, padding: 20 },
  modalTitle: { fontSize: 18, fontWeight: '600', color: '#111827', marginBottom: 12 },
  modalSubtitle: { fontSize: 14, color: '#6b7280', marginBottom: 16 },
  textAreaWrap: { marginBottom: 16 },
  textArea: { backgroundColor: '#f9fafb', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, padding: 12, fontSize: 16, color: '#111827', minHeight: 100 },
  modalActions: { flexDirection: 'row', gap: 12 },
  modalCancelar: { flex: 1, paddingVertical: 14, backgroundColor: '#f3f4f6', borderRadius: 12, alignItems: 'center' },
  modalCancelarText: { fontSize: 16, fontWeight: '600', color: '#6b7280' },
  modalReprovar: { flex: 1, paddingVertical: 14, backgroundColor: '#dc2626', borderRadius: 12, alignItems: 'center' },
  modalReprovarText: { fontSize: 16, fontWeight: '600', color: '#fff' },
  modalDisabled: { opacity: 0.5 },
  modalFechar: { backgroundColor: '#111827', borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  modalFecharText: { fontSize: 16, fontWeight: '500', color: '#fff' },
  comprovantePlaceholder: { height: 200, backgroundColor: '#f3f4f6', borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
});
