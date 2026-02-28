import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, Pressable, StyleSheet, Modal } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Header } from '../components/Header';

type Props = {
  onBack: () => void;
  onSuccess: () => void;
};

const CATEGORIAS = [
  { value: '', label: 'Selecione uma categoria' },
  { value: 'honorarios', label: 'Honorários' },
  { value: 'custas', label: 'Custas Judiciais' },
  { value: 'consultoria', label: 'Consultoria' },
  { value: 'aluguel', label: 'Aluguel' },
  { value: 'outros', label: 'Outros' },
];

const CLIENTES = [
  { value: '', label: 'Selecione um cliente' },
  { value: 'joao', label: 'João Silva' },
  { value: 'maria', label: 'Maria Santos' },
  { value: 'carlos', label: 'Carlos Oliveira' },
];

export function NovaTransacaoScreen({ onBack, onSuccess }: Props) {
  const [tipo, setTipo] = useState<'receita' | 'despesa'>('receita');
  const [valor, setValor] = useState('');
  const [categoria, setCategoria] = useState('');
  const [cliente, setCliente] = useState('');
  const [processo, setProcesso] = useState('');
  const [data, setData] = useState('');
  const [vencimento, setVencimento] = useState('');
  const [status, setStatus] = useState<'pago' | 'pendente'>('pendente');
  const [descricao, setDescricao] = useState('');
  const [mostrarSucesso, setMostrarSucesso] = useState(false);

  const handleSalvar = () => {
    setMostrarSucesso(true);
    setTimeout(() => onSuccess(), 2000);
  };

  return (
    <View style={styles.container}>
      <Header title="Nova Transação" showBack onBack={onBack} />
      {mostrarSucesso && (
        <View style={styles.toast}>
          <MaterialCommunityIcons name="check-circle" size={22} color="#fff" />
          <Text style={styles.toastText}>Transação criada com sucesso!</Text>
        </View>
      )}
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.tipoRow}>
          <Pressable onPress={() => setTipo('receita')} style={[styles.tipoBtn, tipo === 'receita' && styles.tipoReceita]}>
            <Text style={[styles.tipoBtnText, tipo === 'receita' && styles.tipoBtnTextActive]}>Receita</Text>
          </Pressable>
          <Pressable onPress={() => setTipo('despesa')} style={[styles.tipoBtn, tipo === 'despesa' && styles.tipoDespesa]}>
            <Text style={[styles.tipoBtnText, tipo === 'despesa' && styles.tipoBtnTextActive]}>Despesa</Text>
          </Pressable>
        </View>
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Valor</Text>
          <TextInput value={valor} onChangeText={setValor} placeholder="R$ 0,00" style={styles.fieldInput} />
        </View>
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Categoria</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pickerRow}>
            {CATEGORIAS.filter((c) => c.value).map((c) => (
              <Pressable key={c.value} onPress={() => setCategoria(c.value)} style={[styles.pickerChip, categoria === c.value && styles.pickerChipActive]}>
                <Text style={[styles.pickerChipText, categoria === c.value && styles.pickerChipTextActive]}>{c.label}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Descrição</Text>
          <TextInput value={descricao} onChangeText={setDescricao} placeholder="Descreva os detalhes" multiline numberOfLines={3} style={[styles.fieldInput, styles.textArea]} />
        </View>
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Cliente</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pickerRow}>
            {CLIENTES.filter((c) => c.value).map((c) => (
              <Pressable key={c.value} onPress={() => setCliente(c.value)} style={[styles.pickerChip, cliente === c.value && styles.pickerChipActive]}>
                <Text style={[styles.pickerChipText, cliente === c.value && styles.pickerChipTextActive]}>{c.label}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Processo</Text>
          <TextInput value={processo} onChangeText={setProcesso} placeholder="Número do processo" style={styles.fieldInput} />
        </View>
        <View style={styles.row}>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.fieldLabel}>Data</Text>
            <TextInput value={data} onChangeText={setData} placeholder="DD/MM/AAAA" style={styles.fieldInput} />
          </View>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.fieldLabel}>Vencimento</Text>
            <TextInput value={vencimento} onChangeText={setVencimento} placeholder="DD/MM/AAAA" style={styles.fieldInput} />
          </View>
        </View>
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Status</Text>
          <View style={styles.statusRow}>
            <Pressable onPress={() => setStatus('pago')} style={[styles.statusChip, status === 'pago' && styles.statusPago]}>
              <Text style={[styles.statusChipText, status === 'pago' && styles.statusPagoText]}>Pago</Text>
            </Pressable>
            <Pressable onPress={() => setStatus('pendente')} style={[styles.statusChip, status === 'pendente' && styles.statusPendente]}>
              <Text style={[styles.statusChipText, status === 'pendente' && styles.statusPendenteText]}>Pendente</Text>
            </Pressable>
          </View>
        </View>
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Comprovante</Text>
          <View style={styles.comprovanteRow}>
            <Pressable style={styles.comprovanteBtn}>
              <MaterialCommunityIcons name="camera" size={22} color="#2563eb" />
              <Text style={styles.comprovanteBtnText}>Câmera</Text>
            </Pressable>
            <Pressable style={styles.comprovanteBtn}>
              <MaterialCommunityIcons name="upload" size={22} color="#2563eb" />
              <Text style={styles.comprovanteBtnText}>Galeria</Text>
            </Pressable>
          </View>
        </View>
        <Pressable onPress={handleSalvar} style={styles.saveBtn}>
          <Text style={styles.saveBtnText}>Salvar Transação</Text>
        </Pressable>
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  toast: { position: 'absolute', top: 80, left: 20, right: 20, backgroundColor: '#16a34a', borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12, zIndex: 100 },
  toastText: { color: '#fff', fontSize: 16, fontWeight: '500' },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 16 },
  tipoRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  tipoBtn: { flex: 1, paddingVertical: 14, borderRadius: 16, backgroundColor: '#fff', alignItems: 'center' },
  tipoReceita: { backgroundColor: '#16a34a' },
  tipoDespesa: { backgroundColor: '#dc2626' },
  tipoBtnText: { fontSize: 16, fontWeight: '500', color: '#6b7280' },
  tipoBtnTextActive: { color: '#fff' },
  field: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12 },
  fieldLabel: { fontSize: 14, color: '#6b7280', marginBottom: 8 },
  fieldInput: { fontSize: 16, color: '#111827' },
  textArea: { minHeight: 80 },
  pickerRow: { flexDirection: 'row', gap: 8 },
  pickerChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12, backgroundColor: '#f3f4f6' },
  pickerChipActive: { backgroundColor: '#2563eb' },
  pickerChipText: { fontSize: 14, color: '#6b7280' },
  pickerChipTextActive: { color: '#fff' },
  row: { flexDirection: 'row', gap: 12 },
  statusRow: { flexDirection: 'row', gap: 12 },
  statusChip: { flex: 1, paddingVertical: 10, borderRadius: 12, backgroundColor: '#f3f4f6', alignItems: 'center' },
  statusPago: { backgroundColor: '#dcfce7' },
  statusPendente: { backgroundColor: '#fef9c3' },
  statusChipText: { fontSize: 14, color: '#6b7280' },
  statusPagoText: { color: '#15803d' },
  statusPendenteText: { color: '#a16207' },
  comprovanteRow: { flexDirection: 'row', gap: 12 },
  comprovanteBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, backgroundColor: '#dbeafe', borderRadius: 12 },
  comprovanteBtnText: { fontSize: 14, color: '#2563eb' },
  saveBtn: { backgroundColor: '#2563eb', borderRadius: 16, paddingVertical: 16, alignItems: 'center', marginTop: 8 },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
