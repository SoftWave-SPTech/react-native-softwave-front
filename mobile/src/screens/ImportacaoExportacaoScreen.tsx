import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Platform,
  Modal,
  ActivityIndicator,
  StyleSheet,
  Alert,
  Image,
  type ImageSourcePropType,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { Header } from '../components/Header';
import { BottomNav } from '../components/BottomNav';
import { getEtlApiBaseUrl } from '../config/api';
import { useAuth } from '../context/AuthContext';
import {
  fetchExportacaoTransacoesCsv,
  fetchImportacaoHistorico,
  postImportacaoUpload,
} from '../services/resources';

type Props = {
  onBack: () => void;
  onNavigate: (screen: string, id?: string) => void;
};

type StatusImportacao = 'pendente' | 'processando' | 'concluido' | 'erro';

/** Apenas extratos destes bancos na importação (layout do arquivo). */
type BancoExtratoId = 'c6' | 'bradesco' | 'itau';

const BANCOS_EXTRATO: { id: BancoExtratoId; nome: string; descricao: string; logo: ImageSourcePropType }[] = [
  {
    id: 'c6',
    nome: 'C6 Bank',
    descricao: 'Aceita somente CSV',
    logo: require('../../assets/c6Logo.png'),
  },
  {
    id: 'bradesco',
    nome: 'Bradesco',
    descricao: 'Aceita somente CSV',
    logo: require('../../assets/bradescoLogo.png'),
  },
  {
    id: 'itau',
    nome: 'Itaú',
    descricao: 'Aceita somente PDF',
    logo: require('../../assets/itauLogo.png'),
  },
];

function tipoUploadParaApi(banco: BancoExtratoId): string {
  return banco;
}

type ArquivoSelecionado = {
  uri: string;
  name: string;
  mimeType?: string;
  size?: number | null;
  webFile?: File | null;
};

function extensaoPermitida(banco: BancoExtratoId): string {
  return banco === 'itau' ? '.pdf' : '.csv';
}

function validarArquivoSelecionado(banco: BancoExtratoId, nomeArquivo: string): boolean {
  const nome = nomeArquivo.toLowerCase();
  if (banco === 'itau') return nome.endsWith('.pdf');
  return nome.endsWith('.csv');
}

/** Rótulo para histórico (API pode devolver extrato_c6, extrato, etc.). */
function labelTipoImportacao(t: string): string {
  const mapa: Record<string, string> = {
    extrato_c6: 'Extrato · C6 Bank',
    extrato_bradesco: 'Extrato · Bradesco',
    extrato_itau: 'Extrato · Itaú',
    extrato: 'Extrato Bancário',
    transacoes: 'Transações',
    clientes: 'Clientes',
  };
  return mapa[t] ?? t;
}

interface Importacao {
  id: string;
  tipo: string;
  arquivo: string;
  data: string;
  status: StatusImportacao;
  registros: number;
  novos: number;
  atualizados: number;
  erros: number;
}

function formatDataImp(isoOrBr: string): string {
  if (!isoOrBr || isoOrBr.includes('/')) return isoOrBr;
  const d = new Date(isoOrBr);
  if (Number.isNaN(d.getTime())) return isoOrBr;
  return d.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function ImportacaoExportacaoScreen({ onBack, onNavigate }: Props) {
  void onNavigate;
  const { token, userId } = useAuth();
  const apiOn = !!getEtlApiBaseUrl() && !!token && !!userId;

  const [modalUpload, setModalUpload] = useState(false);
  const [bancoExtrato, setBancoExtrato] = useState<BancoExtratoId>('c6');
  const [processando, setProcessando] = useState(false);
  const [modalExportar, setModalExportar] = useState(false);
  const [historicoImportacoes, setHistoricoImportacoes] = useState<Importacao[]>([]);
  const [arquivoSelecionado, setArquivoSelecionado] = useState<ArquivoSelecionado | null>(null);
  const [showAllHistorico, setShowAllHistorico] = useState(false);
  const [feedbackModalVisible, setFeedbackModalVisible] = useState(false);
  const [feedbackModalTitle, setFeedbackModalTitle] = useState('Aviso');
  const [feedbackModalMessage, setFeedbackModalMessage] = useState('');

  const historicoVisivel = showAllHistorico ? historicoImportacoes : historicoImportacoes.slice(0, 3);

  const openFeedbackModal = (title: string, message: string) => {
    setFeedbackModalTitle(title);
    setFeedbackModalMessage(message);
    setFeedbackModalVisible(true);
  };

  const carregarHistorico = useCallback(async () => {
    if (!apiOn || !token || !userId) {
      setHistoricoImportacoes([]);
      return;
    }
    const rows = await fetchImportacaoHistorico(token, userId);
    if (!rows.length) {
      setHistoricoImportacoes([]);
      return;
    }
    setHistoricoImportacoes(
      rows.map((r) => ({
        id: String(r.id),
        tipo: String(r.tipo),
        arquivo: r.arquivo,
        data: formatDataImp(r.data),
        status: r.status,
        registros: r.registros,
        novos: r.novos,
        atualizados: r.atualizados,
        erros: r.erros,
      })),
    );
  }, [apiOn, token, userId]);

  useEffect(() => {
    carregarHistorico();
  }, [carregarHistorico]);

  const escolherArquivo = async () => {
    const resultado = await DocumentPicker.getDocumentAsync({
      type: bancoExtrato === 'itau' ? ['application/pdf', '.pdf'] : ['text/csv', '.csv'],
      copyToCacheDirectory: true,
      multiple: false,
    });

    if (resultado.canceled) return;
    const asset = resultado.assets[0];
    if (!asset) return;

    if (!validarArquivoSelecionado(bancoExtrato, asset.name)) {
      Alert.alert(
        'Formato inválido',
        `Para ${bancoExtrato === 'itau' ? 'Itaú' : 'C6/Bradesco'} selecione arquivo ${extensaoPermitida(bancoExtrato)}.`,
      );
      return;
    }

    setArquivoSelecionado({
      uri: asset.uri,
      name: asset.name,
      mimeType: asset.mimeType,
      size: asset.size,
      webFile: (asset as DocumentPicker.DocumentPickerAsset & { file?: File }).file ?? null,
    });
  };

  const handleImportar = () => {
    if (!token || !userId) {
      openFeedbackModal('Sessão expirada', 'Faça login novamente para importar com autenticação JWT.');
      return;
    }
    if (!arquivoSelecionado) {
      openFeedbackModal('Selecione um arquivo', 'Toque em "Selecionar arquivo" antes de importar.');
      return;
    }
    setProcessando(true);
    void (async () => {
      if (apiOn) {
        const tipoApi = tipoUploadParaApi(bancoExtrato);
        const res = await postImportacaoUpload(token, {
          usuarioId: userId,
          banco: tipoApi as BancoExtratoId,
          file: arquivoSelecionado,
          persistir: true,
        });
        if (res.ok) {
          setHistoricoImportacoes((prev) => [
            {
              id: `${Date.now()}`,
              tipo: `extrato_${tipoApi}`,
              arquivo: res.data.arquivo_origem,
              data: formatDataImp(new Date().toISOString()),
              status: 'concluido',
              registros: res.data.total_extraido,
              novos: res.data.inseridas,
              atualizados: res.data.duplicatas_ignoradas,
              erros: 0,
            },
            ...prev,
          ]);
        } else {
          await carregarHistorico();
        }
        setProcessando(false);
        setModalUpload(false);
        setArquivoSelecionado(null);
        openFeedbackModal(
          res.ok ? 'Importação' : 'Falha na importação',
          res.ok ? 'Importação de transações realizada com sucesso!' : res.error,
        );
        return;
      }
      setTimeout(() => {
        setProcessando(false);
        setModalUpload(false);
      }, 3000);
    })();
  };

  const handleExportar = (tipo: string) => {
    setModalExportar(false);
    void (async () => {
      if (!token || !userId) {
        openFeedbackModal('Sessão expirada', 'Faça login novamente para exportar com autenticação JWT.');
        return;
      }
      if (tipo === 'transacoes' && apiOn) {
        const csv = await fetchExportacaoTransacoesCsv(token, userId);
        if (csv) {
          if (Platform.OS === 'web') {
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `extrato_${new Date().getTime()}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            URL.revokeObjectURL(url);
          }
          openFeedbackModal('Exportação', 'Exportação de transações realizada com sucesso!');
          return;
        }
      }
      openFeedbackModal('Exportação', 'Apenas exportação de transações em CSV está disponível neste fluxo.');
    })();
  };

  const getStatusIcon = (status: StatusImportacao) => {
    switch (status) {
      case 'concluido':
        return <MaterialCommunityIcons name="check-circle-outline" size={20} color="#16a34a" />;
      case 'processando':
        return <ActivityIndicator size="small" color="#0d9488" />;
      case 'erro':
        return <MaterialCommunityIcons name="alert-circle-outline" size={20} color="#dc2626" />;
      default:
        return <MaterialCommunityIcons name="clock-outline" size={20} color="#9ca3af" />;
    }
  };

  const getStatusStyle = (status: StatusImportacao) => {
    switch (status) {
      case 'concluido': return [styles.statusTag, styles.statusConcluido];
      case 'processando': return [styles.statusTag, styles.statusProcessando];
      case 'erro': return [styles.statusTag, styles.statusErro];
      default: return [styles.statusTag, styles.statusPendente];
    }
  };

  const getStatusTextStyle = (status: StatusImportacao) => {
    switch (status) {
      case 'concluido': return styles.statusTextConcluido;
      case 'processando': return styles.statusTextProcessando;
      case 'erro': return styles.statusTextErro;
      default: return styles.statusTextPendente;
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Importação & Exportação" showBack onBack={onBack} />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Info Banner */}
        <View style={styles.infoBanner}>
          <MaterialCommunityIcons name="folder-open" size={24} color="#fff" />
          <View style={styles.infoBannerText}>
            <Text style={styles.infoBannerTitle}>Processamento de dados</Text>
            <Text style={styles.infoBannerDesc}>
              Importe extratos (C6, Bradesco ou Itaú) para extrair apenas transações e exporte suas transações em CSV.
            </Text>
          </View>
        </View>

        {/* Ações Principais */}
        <View style={styles.actionsRow}>
          <Pressable style={styles.actionCard} onPress={() => setModalUpload(true)}>
            <View style={[styles.actionIcon, styles.actionIconBlue]}>
              <MaterialCommunityIcons name="upload" size={24} color="#0d9488" />
            </View>
            <Text style={styles.actionTitle}>Importar</Text>
            <Text style={styles.actionDesc}>Upload de arquivos</Text>
          </Pressable>

          <Pressable style={styles.actionCard} onPress={() => setModalExportar(true)}>
            <View style={[styles.actionIcon, styles.actionIconGreen]}>
              <MaterialCommunityIcons name="download" size={24} color="#16a34a" />
            </View>
            <Text style={styles.actionTitle}>Exportar</Text>
            <Text style={styles.actionDesc}>Baixar transações</Text>
          </Pressable>
        </View>

        {/* Formatos Aceitos */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Formatos Aceitos para Importação</Text>
          <View style={styles.formatItem}>
            <View style={[styles.formatIcon, { backgroundColor: '#f0fdf4' }]}>
              <MaterialCommunityIcons name="file-excel" size={18} color="#16a34a" />
            </View>
            <View>
              <Text style={styles.formatName}>C6 e Bradesco</Text>
              <Text style={styles.formatDesc}>Apenas arquivos CSV</Text>
            </View>
          </View>
          <View style={styles.formatItem}>
            <View style={[styles.formatIcon, { backgroundColor: '#eff6ff' }]}>
              <MaterialCommunityIcons name="file-pdf-box" size={18} color="#2563eb" />
            </View>
            <View>
              <Text style={styles.formatName}>Itaú</Text>
              <Text style={styles.formatDesc}>Apenas arquivos PDF</Text>
            </View>
          </View>
        </View>

        {/* Histórico de Importações */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Histórico de Importações</Text>
          {historicoImportacoes.length === 0 ? (
            <Text style={styles.historicoVazio}>Nenhuma importação registrada ainda.</Text>
          ) : null}
          {historicoVisivel.map(imp => (
            <View key={imp.id} style={styles.historicoItem}>
              <View style={styles.historicoTop}>
                {getStatusIcon(imp.status)}
                <View style={styles.historicoInfo}>
                  <Text style={styles.historicoArquivo} numberOfLines={1}>{imp.arquivo}</Text>
                  <View style={styles.historicoMeta}>
                    <View style={getStatusStyle(imp.status)}>
                      <Text style={getStatusTextStyle(imp.status)}>
                        {labelTipoImportacao(String(imp.tipo))}
                      </Text>
                    </View>
                    <Text style={styles.historicoData}>{imp.data}</Text>
                  </View>
                </View>
              </View>

              {imp.status === 'concluido' && (
                <View style={styles.statsRow}>
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Total</Text>
                    <Text style={styles.statValue}>{imp.registros}</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Novos</Text>
                    <Text style={[styles.statValue, { color: '#16a34a' }]}>+{imp.novos}</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Atualizados</Text>
                    <Text style={[styles.statValue, { color: '#0d9488' }]}>{imp.atualizados}</Text>
                  </View>
                </View>
              )}

              {imp.status === 'erro' && (
                <Text style={styles.erroText}>{imp.erros} erros encontrados no arquivo</Text>
              )}
            </View>
          ))}
          {historicoImportacoes.length > 3 && (
            <Pressable style={styles.mostrarMaisBtn} onPress={() => setShowAllHistorico((v) => !v)}>
              <MaterialCommunityIcons
                name={showAllHistorico ? 'chevron-up-circle-outline' : 'chevron-down-circle-outline'}
                size={18}
                color="#0d9488"
              />
              <Text style={styles.mostrarMaisText}>
                {showAllHistorico ? 'Mostrar menos' : 'Mostrar mais'}
              </Text>
            </Pressable>
          )}
        </View>

        {/* Como Funciona */}
        <View style={styles.infoCard}>
          <Text style={styles.infoCardTitle}>Como funciona a reconciliação?</Text>
          {[
            'Escolha o banco e envie o extrato no formato correto (C6/Bradesco = CSV, Itaú = PDF)',
            'O sistema extrai as transações do extrato enviado',
            'Cada linha é normalizada para data, descrição, tipo e valor',
            'Você pode exportar as transações em CSV',
          ].map((step, i) => (
            <View key={i} style={styles.stepRow}>
              <Text style={styles.stepNumber}>{i + 1}.</Text>
              <Text style={styles.stepText}>{step}</Text>
            </View>
          ))}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <View style={styles.bottomNavWrap}>
        <BottomNav />
      </View>

      {/* Modal Upload */}
      <Modal visible={modalUpload} transparent animationType="slide">
        <Pressable style={styles.modalOverlay} onPress={() => !processando && setModalUpload(false)}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Importar Dados</Text>
              {!processando && (
                <Pressable onPress={() => setModalUpload(false)}>
                  <MaterialCommunityIcons name="close" size={22} color="#9ca3af" />
                </Pressable>
              )}
            </View>

            {processando ? (
              <View style={styles.processandoContainer}>
                <ActivityIndicator size="large" color="#0d9488" />
                <Text style={styles.processandoTitle}>Processando arquivo...</Text>
                <Text style={styles.processandoDesc}>Analisando e reconciliando dados</Text>
              </View>
            ) : (
              <>
                <Text style={styles.uploadLabel}>Extrato bancário (layout do arquivo)</Text>
                {BANCOS_EXTRATO.map((b) => (
                  <Pressable
                    key={b.id}
                    style={[styles.radioOption, bancoExtrato === b.id && styles.radioOptionActive]}
                    onPress={() => {
                      setBancoExtrato(b.id);
                      setArquivoSelecionado(null);
                    }}
                  >
                    <View style={[styles.radioCircle, bancoExtrato === b.id && styles.radioCircleActive]}>
                      {bancoExtrato === b.id && <View style={styles.radioInner} />}
                    </View>
                    <View style={styles.bankLogoWrap}>
                      <Image source={b.logo} style={styles.bankLogo} resizeMode="contain" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.radioTitle}>{b.nome}</Text>
                      <Text style={styles.radioDesc}>{b.descricao}</Text>
                    </View>
                  </Pressable>
                ))}

                <Pressable style={styles.dropZone} onPress={() => void escolherArquivo()}>
                  <MaterialCommunityIcons name="upload" size={40} color="#9ca3af" />
                  <Text style={styles.dropZoneTitle}>Toque para selecionar</Text>
                  <Text style={styles.dropZoneDesc}>
                    {bancoExtrato === 'itau' ? 'Somente PDF para Itaú' : 'Somente CSV para C6 e Bradesco'}
                  </Text>
                  {arquivoSelecionado ? (
                    <View style={styles.fileInfoBox}>
                      <Text style={styles.fileInfoName} numberOfLines={1}>
                        {arquivoSelecionado.name}
                      </Text>
                      <Text style={styles.fileInfoSize}>
                        {arquivoSelecionado.size ? `${Math.round(arquivoSelecionado.size / 1024)} KB` : 'Tamanho não informado'}
                      </Text>
                    </View>
                  ) : null}
                </Pressable>

                <View style={styles.modalButtons}>
                  <Pressable style={styles.cancelBtn} onPress={() => setModalUpload(false)}>
                    <Text style={styles.cancelBtnText}>Cancelar</Text>
                  </Pressable>
                  <Pressable style={styles.confirmBtn} onPress={handleImportar}>
                    <Text style={styles.confirmBtnText}>Importar</Text>
                    <MaterialCommunityIcons name="arrow-right" size={16} color="#fff" />
                  </Pressable>
                </View>
              </>
            )}
          </View>
        </Pressable>
      </Modal>

      {/* Modal Exportar */}
      <Modal visible={modalExportar} transparent animationType="slide">
        <Pressable style={styles.modalOverlay} onPress={() => setModalExportar(false)}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Exportar Dados</Text>
              <Pressable onPress={() => setModalExportar(false)}>
                <MaterialCommunityIcons name="close" size={22} color="#9ca3af" />
              </Pressable>
            </View>
            <Text style={styles.exportDesc}>Escolha qual tipo de dado deseja exportar:</Text>

            {[
              { key: 'transacoes', icon: 'file-excel', label: 'Transações', desc: 'Todas as receitas e despesas' },
              // { key: 'honorarios', icon: 'file-document-outline', label: 'Honorários', desc: 'Contratos e pagamentos' },
              // { key: 'clientes', icon: 'database', label: 'Clientes', desc: 'Cadastro completo' },
            ].map(item => (
              <Pressable key={item.key} style={styles.exportOption} onPress={() => handleExportar(item.key)}>
                <View style={[styles.exportIcon, { backgroundColor: '#f0fdf4' }]}>
                  <MaterialCommunityIcons name={item.icon as any} size={20} color="#16a34a" />
                </View>
                <View style={styles.exportOptionText}>
                  <Text style={styles.exportOptionTitle}>{item.label}</Text>
                  <Text style={styles.exportOptionDesc}>{item.desc}</Text>
                </View>
                <MaterialCommunityIcons name="arrow-right" size={18} color="#9ca3af" />
              </Pressable>
            ))}

            {/* Extrato focado em transações: opções adicionais de exportação ficam desabilitadas por enquanto. */}
            {/* <Pressable style={styles.exportOptionBlue} onPress={() => handleExportar('completo')}>
              <View style={[styles.exportIcon, { backgroundColor: '#ccfbf1' }]}>
                <MaterialCommunityIcons name="download" size={20} color="#0d9488" />
              </View>
              <View style={styles.exportOptionText}>
                <Text style={[styles.exportOptionTitle, { color: '#115e59' }]}>Backup Completo</Text>
                <Text style={[styles.exportOptionDesc, { color: '#0f766e' }]}>Todos os dados do sistema</Text>
              </View>
              <MaterialCommunityIcons name="arrow-right" size={18} color="#0d9488" />
            </Pressable> */}

            <Pressable style={styles.cancelBtn} onPress={() => setModalExportar(false)}>
              <Text style={styles.cancelBtnText}>Cancelar</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>

      {/* Modal de Feedback */}
      <Modal visible={feedbackModalVisible} transparent animationType="fade">
        <Pressable style={styles.modalOverlayCenter} onPress={() => setFeedbackModalVisible(false)}>
          <View style={styles.feedbackModalCard}>
            <View style={styles.feedbackIconWrap}>
              <MaterialCommunityIcons name="check-decagram-outline" size={30} color="#0d9488" />
            </View>
            <Text style={styles.feedbackTitle}>{feedbackModalTitle}</Text>
            <Text style={styles.feedbackMessage}>{feedbackModalMessage}</Text>
            <Pressable style={styles.feedbackBtn} onPress={() => setFeedbackModalVisible(false)}>
              <Text style={styles.feedbackBtnText}>OK</Text>
            </Pressable>
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

  infoBanner: {
    backgroundColor: '#0d9488',
    borderRadius: 16, padding: 20,
    flexDirection: 'row', gap: 12,
    marginBottom: 16,
  },
  infoBannerText: { flex: 1 },
  infoBannerTitle: { fontSize: 16, fontWeight: '600', color: '#fff', marginBottom: 6 },
  infoBannerDesc: { fontSize: 13, color: '#ccfbf1', lineHeight: 19 },

  actionsRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  actionCard: {
    flex: 1, backgroundColor: '#fff', borderRadius: 16, padding: 16,
    alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 8, elevation: 3,
  },
  actionIcon: {
    width: 48, height: 48, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center', marginBottom: 12,
  },
  actionIconBlue: { backgroundColor: '#ccfbf1' },
  actionIconGreen: { backgroundColor: '#dcfce7' },
  actionTitle: { fontSize: 15, fontWeight: '600', color: '#111827', marginBottom: 4 },
  actionDesc: { fontSize: 12, color: '#9ca3af' },

  card: {
    backgroundColor: '#fff', borderRadius: 16, padding: 16,
    marginBottom: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 8, elevation: 3,
  },
  cardTitle: { fontSize: 14, fontWeight: '600', color: '#111827', marginBottom: 12 },
  historicoVazio: { fontSize: 14, color: '#9ca3af', marginBottom: 8 },

  formatItem: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  formatIcon: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  formatName: { fontSize: 14, fontWeight: '500', color: '#111827' },
  formatDesc: { fontSize: 12, color: '#9ca3af' },

  historicoItem: {
    borderWidth: 1, borderColor: '#f3f4f6', borderRadius: 12, padding: 12, marginBottom: 10,
  },
  historicoTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  historicoInfo: { flex: 1 },
  historicoArquivo: { fontSize: 14, fontWeight: '500', color: '#111827', marginBottom: 4 },
  historicoMeta: { flexDirection: 'row', alignItems: 'center', gap: 8 },

  statusTag: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 },
  statusConcluido: { backgroundColor: '#f0fdf4' },
  statusProcessando: { backgroundColor: '#f0fdfa' },
  statusErro: { backgroundColor: '#fef2f2' },
  statusPendente: { backgroundColor: '#f9fafb' },
  statusTextConcluido: { fontSize: 11, color: '#16a34a', fontWeight: '500' },
  statusTextProcessando: { fontSize: 11, color: '#0d9488', fontWeight: '500' },
  statusTextErro: { fontSize: 11, color: '#dc2626', fontWeight: '500' },
  statusTextPendente: { fontSize: 11, color: '#9ca3af', fontWeight: '500' },

  historicoData: { fontSize: 12, color: '#9ca3af' },
  mostrarMaisBtn: {
    marginTop: 6,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#f0fdfa',
    borderWidth: 1,
    borderColor: '#ccfbf1',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  mostrarMaisText: { fontSize: 13, fontWeight: '600', color: '#0f766e' },

  statsRow: {
    flexDirection: 'row', gap: 16,
    marginTop: 10, paddingTop: 10,
    borderTopWidth: 1, borderTopColor: '#f3f4f6',
  },
  statItem: {},
  statLabel: { fontSize: 11, color: '#9ca3af' },
  statValue: { fontSize: 14, fontWeight: '600', color: '#111827' },

  erroText: {
    marginTop: 8, paddingTop: 8,
    borderTopWidth: 1, borderTopColor: '#f3f4f6',
    fontSize: 12, color: '#dc2626',
  },

  infoCard: {
    backgroundColor: '#f0fdfa', borderWidth: 1, borderColor: '#99f6e4',
    borderRadius: 16, padding: 16, marginBottom: 16,
  },
  infoCardTitle: { fontSize: 14, fontWeight: '600', color: '#111827', marginBottom: 12 },
  stepRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  stepNumber: { fontSize: 14, fontWeight: '600', color: '#0d9488' },
  stepText: { flex: 1, fontSize: 14, color: '#374151', lineHeight: 20 },

  bottomNavWrap: { position: 'absolute', bottom: 0, left: 0, right: 0 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalOverlayCenter: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 24 },
  modalSheet: {
    backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 20, paddingBottom: 36,
  },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: '600', color: '#111827' },
  feedbackModalCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  feedbackIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#ccfbf1',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  feedbackTitle: { fontSize: 17, fontWeight: '700', color: '#111827', marginBottom: 8, textAlign: 'center' },
  feedbackMessage: { fontSize: 14, color: '#374151', textAlign: 'center', lineHeight: 20, marginBottom: 16 },
  feedbackBtn: {
    width: '100%',
    borderRadius: 10,
    backgroundColor: '#0d9488',
    paddingVertical: 12,
    alignItems: 'center',
  },
  feedbackBtnText: { fontSize: 15, fontWeight: '700', color: '#fff' },

  processandoContainer: { alignItems: 'center', paddingVertical: 32 },
  processandoTitle: { fontSize: 16, fontWeight: '600', color: '#111827', marginTop: 16, marginBottom: 4 },
  processandoDesc: { fontSize: 14, color: '#6b7280' },

  uploadLabel: { fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 8 },
  radioOption: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    borderWidth: 2, borderColor: '#e5e7eb', borderRadius: 12,
    padding: 12, marginBottom: 10,
  },
  radioOptionActive: { borderColor: '#0d9488' },
  radioCircle: {
    width: 18, height: 18, borderRadius: 9,
    borderWidth: 2, borderColor: '#d1d5db',
    alignItems: 'center', justifyContent: 'center',
  },
  radioCircleActive: { borderColor: '#0d9488' },
  radioInner: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#0d9488' },
  bankLogoWrap: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bankLogo: { width: 22, height: 22 },
  radioTitle: { fontSize: 14, fontWeight: '500', color: '#111827' },
  radioDesc: { fontSize: 12, color: '#9ca3af' },

  dropZone: {
    borderWidth: 2, borderColor: '#d1d5db', borderStyle: 'dashed',
    borderRadius: 12, padding: 24, alignItems: 'center', marginBottom: 16,
  },
  dropZoneTitle: { fontSize: 14, fontWeight: '500', color: '#111827', marginTop: 8, marginBottom: 4 },
  dropZoneDesc: { fontSize: 12, color: '#9ca3af' },
  fileInfoBox: {
    width: '100%',
    marginTop: 12,
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  fileInfoName: { fontSize: 13, fontWeight: '600', color: '#111827' },
  fileInfoSize: { fontSize: 12, color: '#6b7280', marginTop: 2 },

  modalButtons: { flexDirection: 'row', gap: 12 },
  cancelBtn: {
    flex: 1, paddingVertical: 14, backgroundColor: '#f3f4f6',
    borderRadius: 12, alignItems: 'center',
  },
  cancelBtnText: { fontSize: 15, fontWeight: '600', color: '#374151' },
  confirmBtn: {
    flex: 1, paddingVertical: 14, backgroundColor: '#0d9488',
    borderRadius: 12, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 8,
  },
  confirmBtnText: { fontSize: 15, fontWeight: '600', color: '#fff' },

  exportDesc: { fontSize: 14, color: '#6b7280', marginBottom: 12 },
  exportOption: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    borderWidth: 2, borderColor: '#e5e7eb', borderRadius: 12,
    padding: 12, marginBottom: 8,
  },
  exportOptionBlue: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    borderWidth: 2, borderColor: '#0d9488', backgroundColor: '#f0fdfa',
    borderRadius: 12, padding: 12, marginBottom: 12,
  },
  exportIcon: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  exportOptionText: { flex: 1 },
  exportOptionTitle: { fontSize: 14, fontWeight: '500', color: '#111827' },
  exportOptionDesc: { fontSize: 12, color: '#9ca3af' },
});
