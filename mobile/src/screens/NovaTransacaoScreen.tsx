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
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { Header } from '../components/Header';
import { AccordionSelect, SelectOption } from '../components/AccordionSelect';
import { getApiBaseUrl } from '../config/api';
import { useAuth } from '../context/AuthContext';
import {
  createTransacao,
  fetchClientesAdvogado,
  fetchProcessosAdvogado,
  postTransacaoComprovante,
  type UploadableFile,
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

function maskCurrencyInput(value: string): string {
  const digits = value.replace(/\D/g, '');
  if (!digits) return '';
  const cents = digits.padStart(3, '0');
  const inteiro = cents.slice(0, -2).replace(/^0+(?=\d)/, '');
  const decimal = cents.slice(-2);
  const inteiroFmt = (inteiro || '0').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${inteiroFmt},${decimal}`;
}

function maskDateInput(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

export function NovaTransacaoScreen({ onBack, onSuccess, transacaoParaEditar }: Props) {
  const { token } = useAuth();
  const apiOn = !!getApiBaseUrl() && !!token;
  const modoEdicao = !!transacaoParaEditar?.id;
  const [salvando, setSalvando] = useState(false);
  const [listasCarregando, setListasCarregando] = useState(false);
  const [clientesLista, setClientesLista] = useState<ClienteAdvogadoApi[]>([]);
  const [processosLista, setProcessosLista] = useState<ProcessoResumoApi[]>([]);
  const [processoIdApi, setProcessoIdApi] = useState(PROCESSO_SEM_VINCULO);

  const [tipo, setTipo] = useState<'receita' | 'despesa'>(transacaoParaEditar?.tipo ?? 'receita');
  const [valor, setValor] = useState(transacaoParaEditar?.valor ? maskCurrencyInput(transacaoParaEditar.valor) : '');
  const [categoria, setCategoria] = useState(transacaoParaEditar?.categoria ?? '');
  const [cliente, setCliente] = useState(transacaoParaEditar?.cliente ?? '');
  const [processo, setProcesso] = useState(transacaoParaEditar?.processo ?? '');
  const [data, setData] = useState(transacaoParaEditar?.data ? maskDateInput(transacaoParaEditar.data) : '');
  const [vencimento, setVencimento] = useState(
    transacaoParaEditar?.vencimento ? maskDateInput(transacaoParaEditar.vencimento) : '',
  );
  const [status, setStatus] = useState<'pago' | 'pendente'>(transacaoParaEditar?.status ?? 'pendente');
  const [descricao, setDescricao] = useState(transacaoParaEditar?.descricao ?? '');
  const [mostrarSucesso, setMostrarSucesso] = useState(false);
  const [recorrencia, setRecorrencia] = useState<Recorrencia>('sem');
  const [duracaoMeses, setDuracaoMeses] = useState('');
  const [comprovanteNome, setComprovanteNome] = useState('');
  const [comprovanteArquivo, setComprovanteArquivo] = useState<UploadableFile | null>(null);

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
      setValor(maskCurrencyInput(transacaoParaEditar.valor));
      setCategoria(transacaoParaEditar.categoria);
      setCliente(transacaoParaEditar.cliente);
      setProcesso(transacaoParaEditar.processo);
      setData(maskDateInput(transacaoParaEditar.data));
      setVencimento(maskDateInput(transacaoParaEditar.vencimento));
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
          if (comprovanteArquivo) {
            await postTransacaoComprovante(token, transacaoParaEditar.id, comprovanteArquivo);
          }
        } else {
          const pid = parseProcessoIdNum(processoIdApi);
          const cid = parseClienteId(cliente);
          const dur = parseInt(duracaoMeses, 10);
          const criada = await createTransacao(token, {
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
            recorrencia,
            duracaoMeses: recorrencia !== 'sem' && Number.isFinite(dur) && dur > 0 ? dur : null,
          });
          if (comprovanteArquivo) {
            const createdId = String(criada.id ?? '').trim();
            if (createdId) {
              await postTransacaoComprovante(token, createdId, comprovanteArquivo);
            } else {
              Alert.alert(
                'Transação criada',
                'A transação foi salva, mas não foi possível enviar comprovante automaticamente.',
              );
            }
          }
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

  const handleCamera = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permissão', 'Permita acesso à câmera para anexar comprovante.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (result.canceled || !result.assets.length) return;
    const asset = result.assets[0];
    const arquivo: UploadableFile = {
      uri: asset.uri,
      name: asset.fileName ?? `comprovante_${Date.now()}.jpg`,
      type: asset.mimeType ?? 'image/jpeg',
      file: (asset as { file?: File | Blob }).file,
    };
    setComprovanteArquivo(arquivo);
    setComprovanteNome(arquivo.name);
  };

  const handleArquivo = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      multiple: false,
      type: ['image/*', 'application/pdf'],
      copyToCacheDirectory: true,
    });
    if (result.canceled || !result.assets.length) return;
    const asset = result.assets[0];
    const arquivo: UploadableFile = {
      uri: asset.uri,
      name: asset.name,
      type: asset.mimeType ?? 'application/octet-stream',
      file: (asset as { file?: File | Blob }).file,
    };
    setComprovanteArquivo(arquivo);
    setComprovanteNome(arquivo.name);
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
          <Text style={styles.fieldLabel}>
            Valor <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            value={valor}
            onChangeText={(v) => setValor(maskCurrencyInput(v))}
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
              onChangeText={(v) => setData(maskDateInput(v))}
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
              onChangeText={(v) => setVencimento(maskDateInput(v))}
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

        {/* Recorrência / Parcelamento */}
        <View style={styles.recorrenciaWrap}>
          <View style={styles.recorrenciaHeader}>
            <MaterialCommunityIcons name="autorenew" size={18} color="#6b7280" />
            <Text style={styles.recorrenciaTitle}>
              Recorrência / Parcelamento <Text style={styles.required}>*</Text>
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
                  💡 A {tipo === 'receita' ? 'receita' : 'despesa'} será criada automaticamente na frequência selecionada.
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Comprovante */}
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Comprovante</Text>
          <View style={styles.comprovanteRow}>
            <Pressable style={styles.comprovanteBtn} onPress={() => void handleCamera()}>
              <MaterialCommunityIcons name="camera" size={22} color="#0d9488" />
              <Text style={styles.comprovanteBtnText}>Câmera</Text>
            </Pressable>
            <Pressable style={styles.comprovanteBtn} onPress={() => void handleArquivo()}>
              <MaterialCommunityIcons name="upload" size={22} color="#0d9488" />
              <Text style={styles.comprovanteBtnText}>Arquivo</Text>
            </Pressable>
          </View>
          {!!comprovanteNome && (
            <Text style={styles.comprovanteNome} numberOfLines={1}>
              Anexado: {comprovanteNome}
            </Text>
          )}
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
  comprovanteNome: { marginTop: 10, fontSize: 12, color: '#0f766e' },
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
});
