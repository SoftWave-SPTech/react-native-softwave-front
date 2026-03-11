import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, ScrollView, Pressable, StyleSheet, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Header } from '../components/Header';
import { AccordionSelect, SelectOption } from '../components/AccordionSelect';

type Recorrencia = 'sem' | 'semanal' | 'mensal' | 'anual';

export type TransacaoParaEditar = {
  tipo: 'receita' | 'despesa';
  valor: string;
  categoria: string;
  cliente: string;
  processo: string;
  data: string;
  vencimento: string;
  status: 'pago' | 'pendente';
  descricao: string;
};

type Props = {
  onBack: () => void;
  onSuccess: () => void;
  transacaoParaEditar?: TransacaoParaEditar;
};

const CATEGORIAS: SelectOption[] = [
  { value: 'honorarios', label: 'Honorários' },
  { value: 'custas', label: 'Custas Judiciais' },
  { value: 'consultoria', label: 'Consultoria' },
  { value: 'aluguel', label: 'Aluguel' },
  { value: 'outros', label: 'Outros' },
];

const CLIENTES: SelectOption[] = [
  { value: '', label: 'Nenhum cliente vinculado' },
  { value: 'joao', label: 'João Silva' },
  { value: 'maria', label: 'Maria Santos' },
  { value: 'carlos', label: 'Carlos Oliveira' },
];

const RECORRENCIAS: SelectOption[] = [
  { value: 'sem', label: 'Sem recorrência' },
  { value: 'semanal', label: 'Semanal' },
  { value: 'mensal', label: 'Mensal' },
  { value: 'anual', label: 'Anual' },
];

export function NovaTransacaoScreen({ onBack, onSuccess, transacaoParaEditar }: Props) {
  const modoEdicao = !!transacaoParaEditar;
  const [tipo, setTipo] = useState<'receita' | 'despesa'>(transacaoParaEditar?.tipo ?? 'receita');
  const [valor, setValor] = useState(transacaoParaEditar?.valor ?? '');
  const [categoria, setCategoria] = useState(transacaoParaEditar?.categoria ?? '');
  const [cliente, setCliente] = useState(transacaoParaEditar?.cliente ?? '');
  const [processo, setProcesso] = useState(transacaoParaEditar?.processo ?? '');
  const [data, setData] = useState(transacaoParaEditar?.data ?? '');
  const [vencimento, setVencimento] = useState(transacaoParaEditar?.vencimento ?? '');
  const [status, setStatus] = useState<'pago' | 'pendente'>(transacaoParaEditar?.status ?? 'pendente');
  const [descricao, setDescricao] = useState(transacaoParaEditar?.descricao ?? '');
  const [mostrarSucesso, setMostrarSucesso] = useState(false);
  const [recorrencia, setRecorrencia] = useState<Recorrencia>('sem');
  const [duracaoMeses, setDuracaoMeses] = useState('');

  useEffect(() => {
    if (transacaoParaEditar) {
      setTipo(transacaoParaEditar.tipo);
      setValor(transacaoParaEditar.valor);
      setCategoria(transacaoParaEditar.categoria);
      setCliente(transacaoParaEditar.cliente);
      setProcesso(transacaoParaEditar.processo);
      setData(transacaoParaEditar.data);
      setVencimento(transacaoParaEditar.vencimento);
      setStatus(transacaoParaEditar.status);
      setDescricao(transacaoParaEditar.descricao);
    }
  }, [transacaoParaEditar]);

  const getPreviewRecorrencia = () => {
    const dur = parseInt(duracaoMeses, 10) || 0;
    if (!dur) return '';
    if (recorrencia === 'semanal') return `${dur} semanas (~${Math.round(dur / 4)} meses)`;
    if (recorrencia === 'mensal') return `${dur} meses (~${Math.round(dur / 12)} anos)`;
    if (recorrencia === 'anual') return `${dur} anos`;
    return '';
  };

  const handleSalvar = () => {
    if (!valor || !categoria || !descricao || !vencimento) {
      Alert.alert('Campos obrigatórios', 'Preencha todos os campos marcados com *');
      return;
    }
    setMostrarSucesso(true);
    setTimeout(() => onSuccess(), 2000);
  };

  return (
    <View style={styles.container}>
      <Header title={modoEdicao ? 'Editar Transação' : 'Nova Transação'} showBack onBack={onBack} />
      {mostrarSucesso && (
        <View style={styles.toast}>
          <MaterialCommunityIcons name="check-circle" size={22} color="#fff" />
          <Text style={styles.toastText}>
            {modoEdicao ? 'Alterações salvas com sucesso!' : 'Transação criada com sucesso!'}
          </Text>
        </View>
      )}
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Tipo */}
        <View style={styles.tipoRow}>
          <Pressable onPress={() => setTipo('receita')} style={[styles.tipoBtn, tipo === 'receita' && styles.tipoReceita]}>
            <Text style={[styles.tipoBtnText, tipo === 'receita' && styles.tipoBtnTextActive]}>Receita</Text>
          </Pressable>
          <Pressable onPress={() => setTipo('despesa')} style={[styles.tipoBtn, tipo === 'despesa' && styles.tipoDespesa]}>
            <Text style={[styles.tipoBtnText, tipo === 'despesa' && styles.tipoBtnTextActive]}>Despesa</Text>
          </Pressable>
        </View>

        {/* Valor */}
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Valor <Text style={styles.required}>*</Text></Text>
          <TextInput
            value={valor}
            onChangeText={setValor}
            placeholder="R$ 0,00"
            placeholderTextColor="#9ca3af"
            keyboardType="numeric"
            style={styles.fieldValueInput}
          />
        </View>

        {/* Categoria */}
        <View style={styles.selectWrap}>
          <AccordionSelect
            label="Categoria"
            required
            placeholder="Selecione uma categoria"
            options={CATEGORIAS}
            value={categoria}
            onChange={setCategoria}
          />
        </View>

        {/* Descrição */}
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Descrição <Text style={styles.required}>*</Text></Text>
          <TextInput
            value={descricao}
            onChangeText={setDescricao}
            placeholder="Descreva os detalhes da transação"
            placeholderTextColor="#9ca3af"
            multiline
            numberOfLines={3}
            style={[styles.fieldInput, styles.textArea]}
          />
        </View>

        {/* Cliente */}
        <View style={styles.selectWrap}>
          <AccordionSelect
            label="Cliente"
            placeholder="Selecione um cliente"
            options={CLIENTES}
            value={cliente}
            onChange={setCliente}
          />
        </View>

        {/* Processo */}
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Processo</Text>
          <TextInput
            value={processo}
            onChangeText={setProcesso}
            placeholder="Número do processo"
            placeholderTextColor="#9ca3af"
            style={styles.fieldInput}
          />
        </View>

        {/* Data e Vencimento */}
        <View style={styles.row}>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.fieldLabel}>Data pagamento</Text>
            <TextInput
              value={data}
              onChangeText={setData}
              placeholder="DD/MM/AAAA"
              placeholderTextColor="#9ca3af"
              keyboardType="numeric"
              style={styles.fieldInput}
            />
          </View>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.fieldLabel}>Vencimento <Text style={styles.required}>*</Text></Text>
            <TextInput
              value={vencimento}
              onChangeText={setVencimento}
              placeholder="DD/MM/AAAA"
              placeholderTextColor="#9ca3af"
              keyboardType="numeric"
              style={styles.fieldInput}
            />
          </View>
        </View>

        {/* Status */}
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Status <Text style={styles.required}>*</Text></Text>
          <View style={styles.statusRow}>
            <Pressable onPress={() => setStatus('pago')} style={[styles.statusChip, status === 'pago' && styles.statusPago]}>
              <Text style={[styles.statusChipText, status === 'pago' && styles.statusPagoText]}>Pago</Text>
            </Pressable>
            <Pressable onPress={() => setStatus('pendente')} style={[styles.statusChip, status === 'pendente' && styles.statusPendente]}>
              <Text style={[styles.statusChipText, status === 'pendente' && styles.statusPendenteText]}>Pendente</Text>
            </Pressable>
          </View>
        </View>

        {/* Recorrência — apenas para Despesa */}
        {tipo === 'despesa' && (
          <View style={styles.recorrenciaWrap}>
            <View style={styles.recorrenciaHeader}>
              <MaterialCommunityIcons name="autorenew" size={18} color="#6b7280" />
              <Text style={styles.recorrenciaTitle}>Recorrência <Text style={styles.required}>*</Text></Text>
            </View>
            <AccordionSelect
              label=""
              placeholder="Sem recorrência"
              options={RECORRENCIAS}
              value={recorrencia}
              onChange={(v) => setRecorrencia(v as Recorrencia)}
            />
            {recorrencia !== 'sem' && (
              <View style={styles.recorrenciaExtra}>
                <Text style={styles.fieldLabel}>Duração (número de repetições)</Text>
                <TextInput
                  value={duracaoMeses}
                  onChangeText={setDuracaoMeses}
                  placeholder="Ex: 12"
                  placeholderTextColor="#9ca3af"
                  keyboardType="numeric"
                  style={styles.duracaoInput}
                />
                {getPreviewRecorrencia() !== '' && (
                  <View style={styles.previewCard}>
                    <MaterialCommunityIcons name="information" size={16} color="#2563eb" />
                    <Text style={styles.previewText}>{getPreviewRecorrencia()}</Text>
                  </View>
                )}
                <View style={styles.infoCard}>
                  <Text style={styles.infoCardText}>💡 A despesa será criada automaticamente na frequência selecionada.</Text>
                </View>
              </View>
            )}
          </View>
        )}

        {/* Comprovante */}
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
          <Text style={styles.saveBtnText}>{modoEdicao ? 'Salvar Alterações' : 'Salvar Transação'}</Text>
        </Pressable>
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  toast: {
    position: 'absolute', top: 80, left: 20, right: 20,
    backgroundColor: '#16a34a', borderRadius: 16, padding: 16,
    flexDirection: 'row', alignItems: 'center', gap: 12, zIndex: 100,
    shadowColor: '#16a34a', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 8,
  },
  toastText: { color: '#fff', fontSize: 16, fontWeight: '500', flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 16 },
  tipoRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  tipoBtn: { flex: 1, paddingVertical: 14, borderRadius: 16, backgroundColor: '#fff', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 6, elevation: 2 },
  tipoReceita: { backgroundColor: '#16a34a' },
  tipoDespesa: { backgroundColor: '#dc2626' },
  tipoBtnText: { fontSize: 16, fontWeight: '500', color: '#6b7280' },
  tipoBtnTextActive: { color: '#fff' },
  field: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 6, elevation: 2 },
  fieldLabel: { fontSize: 13, color: '#6b7280', marginBottom: 8 },
  required: { color: '#ef4444' },
  fieldValueInput: { fontSize: 24, fontWeight: '600', color: '#111827' },
  fieldInput: { fontSize: 16, color: '#111827' },
  textArea: { minHeight: 72, textAlignVertical: 'top' },
  selectWrap: { marginBottom: 12 },
  row: { flexDirection: 'row', gap: 12 },
  statusRow: { flexDirection: 'row', gap: 12 },
  statusChip: { flex: 1, paddingVertical: 10, borderRadius: 12, backgroundColor: '#f3f4f6', alignItems: 'center' },
  statusPago: { backgroundColor: '#dcfce7' },
  statusPendente: { backgroundColor: '#fef9c3' },
  statusChipText: { fontSize: 14, color: '#6b7280' },
  statusPagoText: { color: '#15803d', fontWeight: '500' },
  statusPendenteText: { color: '#a16207', fontWeight: '500' },
  recorrenciaWrap: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 6, elevation: 2 },
  recorrenciaHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  recorrenciaTitle: { fontSize: 14, color: '#374151', fontWeight: '500' },
  recorrenciaExtra: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#f3f4f6' },
  duracaoInput: { backgroundColor: '#f9fafb', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, padding: 12, fontSize: 16, color: '#111827', marginBottom: 8 },
  previewCard: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#dbeafe', borderRadius: 12, padding: 12, marginBottom: 8 },
  previewText: { fontSize: 14, color: '#1e40af', fontWeight: '500' },
  infoCard: { backgroundColor: '#eff6ff', borderRadius: 12, padding: 12 },
  infoCardText: { fontSize: 13, color: '#1e40af', lineHeight: 18 },
  comprovanteRow: { flexDirection: 'row', gap: 12 },
  comprovanteBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, backgroundColor: '#dbeafe', borderRadius: 12 },
  comprovanteBtnText: { fontSize: 14, color: '#2563eb', fontWeight: '500' },
  saveBtn: { backgroundColor: '#2563eb', borderRadius: 16, paddingVertical: 16, alignItems: 'center', marginTop: 8, shadowColor: '#2563eb', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 5 },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
