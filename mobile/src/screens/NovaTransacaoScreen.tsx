import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Header } from '../components/Header';
import { AccordionSelect, SelectOption } from '../components/AccordionSelect';
import { getApiBaseUrl } from '../config/api';
import { useAuth } from '../context/AuthContext';
import {
  createClienteRapido,
  createTransacao,
  fetchClientesAdvogado,
  fetchProcessosAdvogado,
  updateTransacao,
} from '../services/resources';
import type { ClienteAdvogadoApi, ProcessoResumoApi } from '../types/api';
import { parseClienteId, parseProcessoIdNum } from '../utils/apiIds';
import { parseDateBRToIso, parseValorInputToCentavos } from '../utils/money';

type Recorrencia = 'sem' | 'semanal' | 'mensal' | 'anual';

export type TransacaoParaEditar = {
  id?: string;
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

function iconeFromCategoria(c: string): string {
  const map: Record<string, string> = {
    honorarios: 'briefcase',
    custas: 'file-document',
    consultoria: 'credit-card',
    aluguel: 'receipt',
    outros: 'cash',
  };
  return map[c] || 'cash';
}

function nomeCliente(clienteId: string, clientes: ClienteAdvogadoApi[]) {
  if (!clienteId) return '';
  return clientes.find((c) => c.id === clienteId)?.nome ?? '';
}

const RECORRENCIAS: SelectOption[] = [
  { value: 'sem', label: 'Sem recorrência' },
  { value: 'semanal', label: 'Semanal' },
  { value: 'mensal', label: 'Mensal' },
  { value: 'anual', label: 'Anual' },
];

/** Valor do select de processo = lançamento avulso (backend: semProcesso). */
const PROCESSO_SEM_VINCULO = '__sem_processo__';

export function NovaTransacaoScreen({ onBack, onSuccess, transacaoParaEditar }: Props) {
  const { token } = useAuth();
  const apiOn = !!getApiBaseUrl() && !!token;
  const modoEdicao = !!transacaoParaEditar?.id;
  const [salvando, setSalvando] = useState(false);
  const [listasCarregando, setListasCarregando] = useState(false);
  const [clientesLista, setClientesLista] = useState<ClienteAdvogadoApi[]>([]);
  const [processosLista, setProcessosLista] = useState<ProcessoResumoApi[]>([]);
  const [processoIdApi, setProcessoIdApi] = useState(PROCESSO_SEM_VINCULO);
  const [modalCliente, setModalCliente] = useState(false);
  const [novoCliNome, setNovoCliNome] = useState('');
  const [novoCliEmail, setNovoCliEmail] = useState('');
  const [novoCliTel, setNovoCliTel] = useState('');
  const [vincularNovoCliAoProcesso, setVincularNovoCliAoProcesso] = useState(true);
  const [salvandoCliente, setSalvandoCliente] = useState(false);

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

  const opcoesClientes: SelectOption[] = useMemo(() => {
    const base: SelectOption[] = [{ value: '', label: 'Nenhum cliente vinculado' }];
    return base.concat(clientesLista.map((c) => ({ value: c.id, label: c.nome || c.email || c.id })));
  }, [clientesLista]);

  const opcoesProcessos: SelectOption[] = useMemo(() => {
    const base: SelectOption[] = [{ value: PROCESSO_SEM_VINCULO, label: 'Sem processo vinculado' }];
    return base.concat(processosLista.map((p) => ({ value: String(p.id), label: p.titulo })));
  }, [processosLista]);

  const carregarListas = useCallback(async () => {
    if (!apiOn || !token) return;
    setListasCarregando(true);
    try {
      const [clis, procs] = await Promise.all([fetchClientesAdvogado(token), fetchProcessosAdvogado(token)]);
      setClientesLista(clis);
      setProcessosLista(procs);
    } finally {
      setListasCarregando(false);
    }
  }, [apiOn, token]);

  useEffect(() => {
    void carregarListas();
  }, [carregarListas]);

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

  const handleSalvarClienteRapido = async () => {
    if (!token || !novoCliNome.trim()) {
      Alert.alert('Nome', 'Informe o nome do cliente.');
      return;
    }
    const pid = parseProcessoIdNum(processoIdApi);
    try {
      setSalvandoCliente(true);
      const criado = await createClienteRapido(token, {
        nome: novoCliNome.trim(),
        email: novoCliEmail.trim() || undefined,
        telefone: novoCliTel.trim() || undefined,
        processoIds:
          vincularNovoCliAoProcesso && pid != null ? [pid] : undefined,
      });
      setClientesLista((prev) => {
        const rest = prev.filter((c) => c.id !== criado.id);
        return [criado, ...rest];
      });
      setCliente(criado.id);
      setModalCliente(false);
      setNovoCliNome('');
      setNovoCliEmail('');
      setNovoCliTel('');
      Alert.alert('Cliente', criado.mensagem ?? 'Cliente cadastrado.');
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Não foi possível cadastrar.';
      Alert.alert('Erro', msg);
    } finally {
      setSalvandoCliente(false);
    }
  };

  const handleSalvar = async () => {
    if (!valor || !categoria || !descricao || !vencimento) {
      Alert.alert('Campos obrigatórios', 'Preencha todos os campos marcados com *');
      return;
    }
    const centavos = parseValorInputToCentavos(valor);
    if (centavos == null || centavos <= 0) {
      Alert.alert('Valor inválido', 'Informe um valor válido (ex.: 1500,50).');
      return;
    }
    const vencIso = parseDateBRToIso(vencimento);
    if (!vencIso) {
      Alert.alert('Vencimento', 'Use o formato DD/MM/AAAA.');
      return;
    }
    const dataIso = data.trim() ? parseDateBRToIso(data) ?? vencIso : vencIso;
    const semProc = processoIdApi === PROCESSO_SEM_VINCULO;
    const tituloProc = semProc ? '' : processosLista.find((p) => String(p.id) === processoIdApi)?.titulo ?? '';
    const subtitulo =
      [tituloProc, processo.trim()].filter(Boolean).join(' · ') ||
      (cliente ? nomeCliente(cliente, clientesLista) : '') ||
      (tipo === 'despesa' ? 'Despesa' : 'Receita');

    if (apiOn && token) {
      if (!modoEdicao && !semProc) {
        const pid = parseProcessoIdNum(processoIdApi);
        if (pid == null) {
          Alert.alert('Processo', 'Selecione um processo ou a opção “Sem processo vinculado”.');
          return;
        }
      }
      try {
        setSalvando(true);
        if (modoEdicao && transacaoParaEditar?.id) {
          await updateTransacao(token, transacaoParaEditar.id, {
            titulo: descricao,
            subtitulo,
            valor: centavos,
            tipo,
            status: status === 'pago' ? 'pago' : 'pendente',
            categoria,
            clienteId: cliente || undefined,
            data: dataIso,
            vencimento: vencIso,
            icone: iconeFromCategoria(categoria),
          });
        } else {
          const pid = parseProcessoIdNum(processoIdApi);
          const cid = parseClienteId(cliente);
          const dur = parseInt(duracaoMeses, 10);
          await createTransacao(token, {
            tipo,
            valor: centavos,
            categoria,
            descricao: descricao.trim(),
            titulo: descricao.trim(),
            ...(semProc
              ? { semProcesso: true }
              : { processoId: pid ?? undefined }),
            data: dataIso,
            vencimento: vencIso,
            status: status === 'pago' ? 'pago' : 'pendente',
            ...(cid != null ? { clienteId: cid } : { contraparte: subtitulo.trim() || undefined }),
            recorrencia: tipo === 'despesa' ? recorrencia : 'sem',
            duracaoMeses:
              tipo === 'despesa' && recorrencia !== 'sem' && Number.isFinite(dur) && dur > 0 ? dur : null,
          });
        }
        setMostrarSucesso(true);
        setTimeout(() => onSuccess(), 1500);
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : 'Não foi possível salvar.';
        Alert.alert('Erro', msg);
      } finally {
        setSalvando(false);
      }
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

      <Modal visible={modalCliente} transparent animationType="fade" onRequestClose={() => setModalCliente(false)}>
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setModalCliente(false)} />
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Novo cliente</Text>
            <Text style={styles.modalHint}>Cadastro rápido para aparecer no select e na transação.</Text>
            <TextInput
              value={novoCliNome}
              onChangeText={setNovoCliNome}
              placeholder="Nome completo *"
              placeholderTextColor="#9ca3af"
              style={styles.modalInput}
            />
            <TextInput
              value={novoCliEmail}
              onChangeText={setNovoCliEmail}
              placeholder="E-mail (opcional)"
              placeholderTextColor="#9ca3af"
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.modalInput}
            />
            <TextInput
              value={novoCliTel}
              onChangeText={setNovoCliTel}
              placeholder="Telefone (opcional)"
              placeholderTextColor="#9ca3af"
              keyboardType="phone-pad"
              style={styles.modalInput}
            />
            {parseProcessoIdNum(processoIdApi) != null && (
              <Pressable
                onPress={() => setVincularNovoCliAoProcesso(!vincularNovoCliAoProcesso)}
                style={styles.modalCheckRow}
              >
                <MaterialCommunityIcons
                  name={vincularNovoCliAoProcesso ? 'checkbox-marked' : 'checkbox-blank-outline'}
                  size={22}
                  color="#0d9488"
                />
                <Text style={styles.modalCheckLabel}>Vincular ao processo selecionado</Text>
              </Pressable>
            )}
            <View style={styles.modalActions}>
              <Pressable onPress={() => setModalCliente(false)} style={styles.modalBtnSecondary}>
                <Text style={styles.modalBtnSecondaryText}>Cancelar</Text>
              </Pressable>
              <Pressable
                onPress={() => void handleSalvarClienteRapido()}
                disabled={salvandoCliente}
                style={[styles.modalBtnPrimary, salvandoCliente && styles.saveBtnDisabled]}
              >
                {salvandoCliente ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.modalBtnPrimaryText}>Salvar</Text>
                )}
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

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
          <Text style={styles.fieldLabel}>
            Valor <Text style={styles.required}>*</Text>
          </Text>
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
          <Text style={styles.fieldLabel}>
            Descrição <Text style={styles.required}>*</Text>
          </Text>
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

        {apiOn && !modoEdicao && (
          <>
            <View style={styles.selectWrap}>
              <AccordionSelect
                label="Processo"
                required
                placeholder={listasCarregando ? 'Carregando…' : 'Processo ou avulso'}
                options={opcoesProcessos}
                value={processoIdApi}
                onChange={setProcessoIdApi}
              />
            </View>
            <Text style={styles.helpApi}>
              Com processo: cria um honorário vinculado a ele. Sem processo: honorário avulso (só você enxerga na lista).
              Contratos já existentes: use honorarioId na API.
            </Text>
          </>
        )}

        {/* Cliente */}
        <View style={styles.selectWrap}>
          <AccordionSelect
            label="Cliente"
            placeholder={listasCarregando ? 'Carregando…' : 'Selecione um cliente'}
            options={opcoesClientes}
            value={cliente}
            onChange={setCliente}
          />
        </View>
        {apiOn && (
          <Pressable onPress={() => setModalCliente(true)} style={styles.linkNovoCliente}>
            <MaterialCommunityIcons name="account-plus" size={20} color="#0d9488" />
            <Text style={styles.linkNovoClienteText}>Cadastrar novo cliente</Text>
          </Pressable>
        )}

        {/* Processo — texto livre (referência / modo offline) */}
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>{apiOn && !modoEdicao ? 'Referência / observação' : 'Processo'}</Text>
          <TextInput
            value={processo}
            onChangeText={setProcesso}
            placeholder={apiOn && !modoEdicao ? 'Opcional: complemento exibido na lista' : 'Número ou descrição do processo'}
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
            <Text style={styles.fieldLabel}>
              Vencimento <Text style={styles.required}>*</Text>
            </Text>
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
          <Text style={styles.fieldLabel}>
            Status <Text style={styles.required}>*</Text>
          </Text>
          <View style={styles.statusRow}>
            <Pressable onPress={() => setStatus('pago')} style={[styles.statusChip, status === 'pago' && styles.statusPago]}>
              <Text style={[styles.statusChipText, status === 'pago' && styles.statusPagoText]}>Pago</Text>
            </Pressable>
            <Pressable
              onPress={() => setStatus('pendente')}
              style={[styles.statusChip, status === 'pendente' && styles.statusPendente]}
            >
              <Text style={[styles.statusChipText, status === 'pendente' && styles.statusPendenteText]}>Pendente</Text>
            </Pressable>
          </View>
        </View>

        {/* Recorrência — apenas para Despesa */}
        {tipo === 'despesa' && (
          <View style={styles.recorrenciaWrap}>
            <View style={styles.recorrenciaHeader}>
              <MaterialCommunityIcons name="autorenew" size={18} color="#6b7280" />
              <Text style={styles.recorrenciaTitle}>
                Recorrência <Text style={styles.required}>*</Text>
              </Text>
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
                    <MaterialCommunityIcons name="information" size={16} color="#0d9488" />
                    <Text style={styles.previewText}>{getPreviewRecorrencia()}</Text>
                  </View>
                )}
                <View style={styles.infoCard}>
                  <Text style={styles.infoCardText}>
                    💡 A despesa será criada automaticamente na frequência selecionada.
                  </Text>
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
              <MaterialCommunityIcons name="camera" size={22} color="#0d9488" />
              <Text style={styles.comprovanteBtnText}>Câmera</Text>
            </Pressable>
            <Pressable style={styles.comprovanteBtn}>
              <MaterialCommunityIcons name="upload" size={22} color="#0d9488" />
              <Text style={styles.comprovanteBtnText}>Galeria</Text>
            </Pressable>
          </View>
        </View>

        <Pressable onPress={handleSalvar} disabled={salvando} style={[styles.saveBtn, salvando && styles.saveBtnDisabled]}>
          {salvando ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>{modoEdicao ? 'Salvar Alterações' : 'Salvar Transação'}</Text>}
        </Pressable>
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  toast: {
    position: 'absolute',
    top: 80,
    left: 20,
    right: 20,
    backgroundColor: '#16a34a',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    zIndex: 100,
    shadowColor: '#16a34a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  toastText: { color: '#fff', fontSize: 16, fontWeight: '500', flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 16 },
  tipoRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  tipoBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: '#fff',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 2,
  },
  tipoReceita: { backgroundColor: '#16a34a' },
  tipoDespesa: { backgroundColor: '#dc2626' },
  tipoBtnText: { fontSize: 16, fontWeight: '500', color: '#6b7280' },
  tipoBtnTextActive: { color: '#fff' },
  field: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 2,
  },
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
  recorrenciaWrap: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 2,
  },
  recorrenciaHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  recorrenciaTitle: { fontSize: 14, color: '#374151', fontWeight: '500' },
  recorrenciaExtra: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#f3f4f6' },
  duracaoInput: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: '#111827',
    marginBottom: 8,
  },
  previewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#f0fdfa',
    borderWidth: 1,
    borderColor: '#99f6e4',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  previewText: { fontSize: 14, color: '#0f766e', fontWeight: '500' },
  infoCard: { backgroundColor: '#f0fdfa', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#99f6e4' },
  infoCardText: { fontSize: 13, color: '#0f766e', lineHeight: 18 },
  comprovanteRow: { flexDirection: 'row', gap: 12 },
  comprovanteBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    backgroundColor: '#ccfbf1',
    borderRadius: 12,
  },
  comprovanteBtnText: { fontSize: 14, color: '#0d9488', fontWeight: '500' },
  saveBtn: {
    backgroundColor: '#0d9488',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#0d9488',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 5,
  },
  saveBtnDisabled: { opacity: 0.7 },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  helpApi: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 12,
    marginTop: -4,
    lineHeight: 18,
  },
  linkNovoCliente: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
    paddingVertical: 4,
  },
  linkNovoClienteText: { fontSize: 14, color: '#0d9488', fontWeight: '600' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    zIndex: 2,
  },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 6 },
  modalHint: { fontSize: 13, color: '#6b7280', marginBottom: 16 },
  modalInput: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    marginBottom: 10,
    color: '#111827',
  },
  modalCheckRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginVertical: 8 },
  modalCheckLabel: { fontSize: 14, color: '#374151', flex: 1 },
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 16 },
  modalBtnSecondary: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
  },
  modalBtnSecondaryText: { fontSize: 15, color: '#4b5563', fontWeight: '600' },
  modalBtnPrimary: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#0d9488',
    alignItems: 'center',
  },
  modalBtnPrimaryText: { fontSize: 15, color: '#fff', fontWeight: '600' },
});
