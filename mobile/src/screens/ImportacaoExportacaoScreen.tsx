import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Modal,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Header } from '../components/Header';
import { BottomNav } from '../components/BottomNav';

type Props = {
  onBack: () => void;
  onNavigate: (screen: string, id?: string) => void;
};

type TipoImportacao = 'extrato' | 'transacoes' | 'clientes';
type StatusImportacao = 'pendente' | 'processando' | 'concluido' | 'erro';

interface Importacao {
  id: number;
  tipo: TipoImportacao;
  arquivo: string;
  data: string;
  status: StatusImportacao;
  registros: number;
  novos: number;
  atualizados: number;
  erros: number;
}

const historicoImportacoes: Importacao[] = [
  {
    id: 1,
    tipo: 'extrato',
    arquivo: 'extrato_janeiro_2026.csv',
    data: '15/02/2026',
    status: 'concluido',
    registros: 45,
    novos: 32,
    atualizados: 13,
    erros: 0,
  },
  {
    id: 2,
    tipo: 'transacoes',
    arquivo: 'transacoes_backup.xlsx',
    data: '10/02/2026',
    status: 'concluido',
    registros: 120,
    novos: 0,
    atualizados: 120,
    erros: 0,
  },
  {
    id: 3,
    tipo: 'extrato',
    arquivo: 'extrato_dezembro_2025.csv',
    data: '05/02/2026',
    status: 'erro',
    registros: 0,
    novos: 0,
    atualizados: 0,
    erros: 15,
  },
];

const tipoLabels: Record<TipoImportacao, string> = {
  extrato: 'Extrato Bancário',
  transacoes: 'Transações',
  clientes: 'Clientes',
};

export function ImportacaoExportacaoScreen({ onBack, onNavigate }: Props) {
  const [modalUpload, setModalUpload] = useState(false);
  const [tipoUpload, setTipoUpload] = useState<TipoImportacao>('extrato');
  const [processando, setProcessando] = useState(false);
  const [modalExportar, setModalExportar] = useState(false);

  const handleImportar = () => {
    setProcessando(true);
    setTimeout(() => {
      setProcessando(false);
      setModalUpload(false);
    }, 3000);
  };

  const handleExportar = (tipo: string) => {
    setModalExportar(false);
  };

  const getStatusIcon = (status: StatusImportacao) => {
    switch (status) {
      case 'concluido':
        return <MaterialCommunityIcons name="check-circle-outline" size={20} color="#16a34a" />;
      case 'processando':
        return <ActivityIndicator size="small" color="#2563eb" />;
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
              Importe extratos bancários para reconciliação automática ou exporte seus dados para backup e análise.
            </Text>
          </View>
        </View>

        {/* Ações Principais */}
        <View style={styles.actionsRow}>
          <Pressable style={styles.actionCard} onPress={() => setModalUpload(true)}>
            <View style={[styles.actionIcon, styles.actionIconBlue]}>
              <MaterialCommunityIcons name="upload" size={24} color="#2563eb" />
            </View>
            <Text style={styles.actionTitle}>Importar</Text>
            <Text style={styles.actionDesc}>Upload de arquivos</Text>
          </Pressable>

          <Pressable style={styles.actionCard} onPress={() => setModalExportar(true)}>
            <View style={[styles.actionIcon, styles.actionIconGreen]}>
              <MaterialCommunityIcons name="download" size={24} color="#16a34a" />
            </View>
            <Text style={styles.actionTitle}>Exportar</Text>
            <Text style={styles.actionDesc}>Baixar dados</Text>
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
              <Text style={styles.formatName}>CSV / Excel</Text>
              <Text style={styles.formatDesc}>Extratos e planilhas</Text>
            </View>
          </View>
          <View style={styles.formatItem}>
            <View style={[styles.formatIcon, { backgroundColor: '#eff6ff' }]}>
              <MaterialCommunityIcons name="file-document-outline" size={18} color="#2563eb" />
            </View>
            <View>
              <Text style={styles.formatName}>OFX / OFC</Text>
              <Text style={styles.formatDesc}>Arquivos bancários</Text>
            </View>
          </View>
        </View>

        {/* Histórico de Importações */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Histórico de Importações</Text>
          {historicoImportacoes.map(imp => (
            <View key={imp.id} style={styles.historicoItem}>
              <View style={styles.historicoTop}>
                {getStatusIcon(imp.status)}
                <View style={styles.historicoInfo}>
                  <Text style={styles.historicoArquivo} numberOfLines={1}>{imp.arquivo}</Text>
                  <View style={styles.historicoMeta}>
                    <View style={getStatusStyle(imp.status)}>
                      <Text style={getStatusTextStyle(imp.status)}>{tipoLabels[imp.tipo]}</Text>
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
                    <Text style={[styles.statValue, { color: '#2563eb' }]}>{imp.atualizados}</Text>
                  </View>
                </View>
              )}

              {imp.status === 'erro' && (
                <Text style={styles.erroText}>{imp.erros} erros encontrados no arquivo</Text>
              )}
            </View>
          ))}
        </View>

        {/* Como Funciona */}
        <View style={styles.infoCard}>
          <Text style={styles.infoCardTitle}>Como funciona a reconciliação?</Text>
          {[
            'Upload do extrato bancário (CSV, Excel ou OFX)',
            'O sistema compara com transações cadastradas',
            'Reconciliação automática por valor, data e descrição',
            'Sugestões de lançamentos para movimentos não cadastrados',
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
                <ActivityIndicator size="large" color="#2563eb" />
                <Text style={styles.processandoTitle}>Processando arquivo...</Text>
                <Text style={styles.processandoDesc}>Analisando e reconciliando dados</Text>
              </View>
            ) : (
              <>
                <Text style={styles.uploadLabel}>Tipo de Arquivo</Text>
                {(['extrato', 'transacoes'] as TipoImportacao[]).map(tipo => (
                  <Pressable
                    key={tipo}
                    style={[styles.radioOption, tipoUpload === tipo && styles.radioOptionActive]}
                    onPress={() => setTipoUpload(tipo)}
                  >
                    <View style={[styles.radioCircle, tipoUpload === tipo && styles.radioCircleActive]}>
                      {tipoUpload === tipo && <View style={styles.radioInner} />}
                    </View>
                    <View>
                      <Text style={styles.radioTitle}>{tipoLabels[tipo]}</Text>
                      <Text style={styles.radioDesc}>
                        {tipo === 'extrato' ? 'Para reconciliação automática' : 'Importar transações em lote'}
                      </Text>
                    </View>
                  </Pressable>
                ))}

                <View style={styles.dropZone}>
                  <MaterialCommunityIcons name="upload" size={40} color="#9ca3af" />
                  <Text style={styles.dropZoneTitle}>Toque para selecionar</Text>
                  <Text style={styles.dropZoneDesc}>CSV, Excel, OFX ou OFC</Text>
                </View>

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
              { key: 'honorarios', icon: 'file-document-outline', label: 'Honorários', desc: 'Contratos e pagamentos' },
              { key: 'clientes', icon: 'database', label: 'Clientes', desc: 'Cadastro completo' },
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

            <Pressable style={styles.exportOptionBlue} onPress={() => handleExportar('completo')}>
              <View style={[styles.exportIcon, { backgroundColor: '#dbeafe' }]}>
                <MaterialCommunityIcons name="download" size={20} color="#2563eb" />
              </View>
              <View style={styles.exportOptionText}>
                <Text style={[styles.exportOptionTitle, { color: '#1e3a8a' }]}>Backup Completo</Text>
                <Text style={[styles.exportOptionDesc, { color: '#1d4ed8' }]}>Todos os dados do sistema</Text>
              </View>
              <MaterialCommunityIcons name="arrow-right" size={18} color="#2563eb" />
            </Pressable>

            <Pressable style={styles.cancelBtn} onPress={() => setModalExportar(false)}>
              <Text style={styles.cancelBtnText}>Cancelar</Text>
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
    backgroundColor: '#2563eb',
    borderRadius: 16, padding: 20,
    flexDirection: 'row', gap: 12,
    marginBottom: 16,
  },
  infoBannerText: { flex: 1 },
  infoBannerTitle: { fontSize: 16, fontWeight: '600', color: '#fff', marginBottom: 6 },
  infoBannerDesc: { fontSize: 13, color: '#bfdbfe', lineHeight: 19 },

  actionsRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  actionCard: {
    flex: 1, backgroundColor: '#fff', borderRadius: 16, padding: 16,
    alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 2, elevation: 2,
  },
  actionIcon: {
    width: 48, height: 48, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center', marginBottom: 12,
  },
  actionIconBlue: { backgroundColor: '#dbeafe' },
  actionIconGreen: { backgroundColor: '#dcfce7' },
  actionTitle: { fontSize: 15, fontWeight: '600', color: '#111827', marginBottom: 4 },
  actionDesc: { fontSize: 12, color: '#9ca3af' },

  card: {
    backgroundColor: '#fff', borderRadius: 16, padding: 16,
    marginBottom: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 2, elevation: 2,
  },
  cardTitle: { fontSize: 14, fontWeight: '600', color: '#111827', marginBottom: 12 },

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
  statusProcessando: { backgroundColor: '#eff6ff' },
  statusErro: { backgroundColor: '#fef2f2' },
  statusPendente: { backgroundColor: '#f9fafb' },
  statusTextConcluido: { fontSize: 11, color: '#16a34a', fontWeight: '500' },
  statusTextProcessando: { fontSize: 11, color: '#2563eb', fontWeight: '500' },
  statusTextErro: { fontSize: 11, color: '#dc2626', fontWeight: '500' },
  statusTextPendente: { fontSize: 11, color: '#9ca3af', fontWeight: '500' },

  historicoData: { fontSize: 12, color: '#9ca3af' },

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
    backgroundColor: '#eff6ff', borderWidth: 1, borderColor: '#bfdbfe',
    borderRadius: 16, padding: 16, marginBottom: 16,
  },
  infoCardTitle: { fontSize: 14, fontWeight: '600', color: '#111827', marginBottom: 12 },
  stepRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  stepNumber: { fontSize: 14, fontWeight: '600', color: '#2563eb' },
  stepText: { flex: 1, fontSize: 14, color: '#374151', lineHeight: 20 },

  bottomNavWrap: { position: 'absolute', bottom: 0, left: 0, right: 0 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 20, paddingBottom: 36,
  },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: '600', color: '#111827' },

  processandoContainer: { alignItems: 'center', paddingVertical: 32 },
  processandoTitle: { fontSize: 16, fontWeight: '600', color: '#111827', marginTop: 16, marginBottom: 4 },
  processandoDesc: { fontSize: 14, color: '#6b7280' },

  uploadLabel: { fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 8 },
  radioOption: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    borderWidth: 2, borderColor: '#e5e7eb', borderRadius: 12,
    padding: 12, marginBottom: 10,
  },
  radioOptionActive: { borderColor: '#2563eb' },
  radioCircle: {
    width: 18, height: 18, borderRadius: 9,
    borderWidth: 2, borderColor: '#d1d5db',
    alignItems: 'center', justifyContent: 'center',
  },
  radioCircleActive: { borderColor: '#2563eb' },
  radioInner: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#2563eb' },
  radioTitle: { fontSize: 14, fontWeight: '500', color: '#111827' },
  radioDesc: { fontSize: 12, color: '#9ca3af' },

  dropZone: {
    borderWidth: 2, borderColor: '#d1d5db', borderStyle: 'dashed',
    borderRadius: 12, padding: 24, alignItems: 'center', marginBottom: 16,
  },
  dropZoneTitle: { fontSize: 14, fontWeight: '500', color: '#111827', marginTop: 8, marginBottom: 4 },
  dropZoneDesc: { fontSize: 12, color: '#9ca3af' },

  modalButtons: { flexDirection: 'row', gap: 12 },
  cancelBtn: {
    flex: 1, paddingVertical: 14, backgroundColor: '#f3f4f6',
    borderRadius: 12, alignItems: 'center',
  },
  cancelBtnText: { fontSize: 15, fontWeight: '600', color: '#374151' },
  confirmBtn: {
    flex: 1, paddingVertical: 14, backgroundColor: '#2563eb',
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
    borderWidth: 2, borderColor: '#2563eb', backgroundColor: '#eff6ff',
    borderRadius: 12, padding: 12, marginBottom: 12,
  },
  exportIcon: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  exportOptionText: { flex: 1 },
  exportOptionTitle: { fontSize: 14, fontWeight: '500', color: '#111827' },
  exportOptionDesc: { fontSize: 12, color: '#9ca3af' },
});
