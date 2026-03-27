import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Alert, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Clipboard from 'expo-clipboard';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Header } from '../components/Header';

const PIX_CODE = '00020126580014BR.GOV.BCB.PIX0136a1b2c3d4-e5f6-7890-abcd-ef1234567890520400005303986540525.005802BR5925SILVA E ASSOCIADOS LTDA6014SAO PAULO62070503***6304ABCD';

type Props = {
  cobrancaId: string;
  onBack: () => void;
};

export function ClientePagamentoScreen({ cobrancaId, onBack }: Props) {
  const [copiado, setCopiado] = useState(false);
  const [comprovanteAnexado, setComprovanteAnexado] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [arquivoSelecionado, setArquivoSelecionado] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const copiarPix = async () => {
    try {
      await Clipboard.setStringAsync(PIX_CODE);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      Alert.alert('Erro', 'Não foi possível copiar o código.');
    }
  };

  const selecionarArquivo = (tipo: 'camera' | 'galeria') => {
    const nomes = ['comprovante_pix.jpg', 'pagamento_03_2026.png', 'recibo_transferencia.pdf'];
    const nome = nomes[Math.floor(Math.random() * nomes.length)];
    setArquivoSelecionado(nome);
  };

  const enviarComprovante = () => {
    setEnviando(true);
    setTimeout(() => {
      setEnviando(false);
      setModalVisible(false);
      setArquivoSelecionado(null);
      setComprovanteAnexado(true);
    }, 1500);
  };

  const fecharModal = () => {
    setModalVisible(false);
    setArquivoSelecionado(null);
  };

  return (
    <View style={styles.container}>
      <Header title="Realizar Pagamento" showBack onBack={onBack} />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={['#0d9488', '#115e59']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroCard}
        >
          <Text style={styles.heroLabel}>Valor a pagar</Text>
          <Text style={styles.heroValor}>R$ 6.000,00</Text>
          <Text style={styles.heroVenc}>Vencimento: 15/03/2026</Text>
        </LinearGradient>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>QR Code Pix</Text>
          <View style={styles.qrPlaceholder}>
            <MaterialCommunityIcons name="qrcode" size={120} color="#9ca3af" />
          </View>
          <Text style={styles.qrHint}>Escaneie o QR Code com o app do seu banco</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Pix Copia e Cola</Text>
          <View style={styles.pixCodeWrap}>
            <Text style={styles.pixCode} numberOfLines={3}>{PIX_CODE}</Text>
          </View>
          <Pressable onPress={copiarPix} style={[styles.btnPix, copiado && styles.btnPixCopiado]}>
            <MaterialCommunityIcons name={copiado ? 'check-circle' : 'content-copy'} size={22} color="#fff" />
            <Text style={styles.btnPixText}>{copiado ? 'Copiado!' : 'Copiar Código Pix'}</Text>
          </Pressable>
        </View>
        <View style={styles.card}>
          <View style={styles.dadosHeader}>
            <MaterialCommunityIcons name="bank" size={22} color="#6b7280" />
            <Text style={styles.cardTitle}>Dados Bancários</Text>
          </View>
          <View style={styles.dadosRow}><Text style={styles.dadosLabel}>Banco:</Text><Text style={styles.dadosValue}>Banco do Brasil</Text></View>
          <View style={styles.dadosRow}><Text style={styles.dadosLabel}>Agência:</Text><Text style={styles.dadosValue}>1234-5</Text></View>
          <View style={styles.dadosRow}><Text style={styles.dadosLabel}>Conta:</Text><Text style={styles.dadosValue}>67890-1</Text></View>
          <View style={styles.dadosRow}><Text style={styles.dadosLabel}>Favorecido:</Text><Text style={styles.dadosValue}>Silva & Associados</Text></View>
          <View style={styles.dadosRow}><Text style={styles.dadosLabel}>CNPJ:</Text><Text style={styles.dadosValue}>12.345.678/0001-90</Text></View>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Comprovante</Text>
          {comprovanteAnexado ? (
            <View style={styles.comprovanteOk}>
              <View style={styles.comprovanteOkIcon}>
                <MaterialCommunityIcons name="check-circle" size={56} color="#16a34a" />
              </View>
              <Text style={styles.comprovanteOkTitle}>Comprovante enviado!</Text>
              <Text style={styles.comprovanteOkSub}>Aguardando confirmação do escritório</Text>
            </View>
          ) : (
            <Pressable onPress={() => setModalVisible(true)} style={styles.btnAnexar}>
              <MaterialCommunityIcons name="upload" size={22} color="#fff" />
              <Text style={styles.btnAnexarText}>Anexar Comprovante</Text>
            </Pressable>
          )}
        </View>
        {comprovanteAnexado && (
          <View style={styles.alertBox}>
            <MaterialCommunityIcons name="clock-outline" size={18} color="#0f766e" />
            <Text style={styles.alertText}>Seu pagamento será confirmado em até 24 horas úteis</Text>
          </View>
        )}
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Modal de Comprovante */}
      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={fecharModal}>
        <Pressable style={styles.modalOverlay} onPress={fecharModal}>
          <Pressable style={styles.modalSheet} onPress={() => {}}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Anexar Comprovante</Text>
              <Pressable onPress={fecharModal} style={styles.modalClose}>
                <MaterialCommunityIcons name="close" size={22} color="#6b7280" />
              </Pressable>
            </View>
            <Text style={styles.modalSubtitle}>Selecione como deseja adicionar o comprovante de pagamento</Text>

            {!arquivoSelecionado ? (
              <View style={styles.modalOpcoes}>
                <Pressable onPress={() => selecionarArquivo('camera')} style={styles.opcaoBtn}>
                  <View style={styles.opcaoIcon}>
                    <MaterialCommunityIcons name="camera" size={32} color="#0d9488" />
                  </View>
                  <Text style={styles.opcaoLabel}>Tirar Foto</Text>
                  <Text style={styles.opcaoSub}>Use a câmera do celular</Text>
                </Pressable>
                <Pressable onPress={() => selecionarArquivo('galeria')} style={styles.opcaoBtn}>
                  <View style={styles.opcaoIcon}>
                    <MaterialCommunityIcons name="image-multiple" size={32} color="#0d9488" />
                  </View>
                  <Text style={styles.opcaoLabel}>Escolher da Galeria</Text>
                  <Text style={styles.opcaoSub}>Fotos ou arquivos PDF</Text>
                </Pressable>
              </View>
            ) : (
              <View style={styles.arquivoWrap}>
                <View style={styles.arquivoCard}>
                  <View style={styles.arquivoIcon}>
                    <MaterialCommunityIcons
                      name={arquivoSelecionado.endsWith('.pdf') ? 'file-pdf-box' : 'file-image'}
                      size={36}
                      color="#0d9488"
                    />
                  </View>
                  <View style={styles.arquivoInfo}>
                    <Text style={styles.arquivoNome} numberOfLines={1}>{arquivoSelecionado}</Text>
                    <Text style={styles.arquivoTamanho}>Pronto para envio</Text>
                  </View>
                  <Pressable onPress={() => setArquivoSelecionado(null)} style={styles.arquivoRemover}>
                    <MaterialCommunityIcons name="close-circle" size={22} color="#ef4444" />
                  </Pressable>
                </View>
                <Pressable
                  onPress={enviarComprovante}
                  style={[styles.btnEnviar, enviando && styles.btnEnviando]}
                  disabled={enviando}
                >
                  <MaterialCommunityIcons
                    name={enviando ? 'loading' : 'send'}
                    size={22}
                    color="#fff"
                  />
                  <Text style={styles.btnEnviarText}>
                    {enviando ? 'Enviando...' : 'Enviar Comprovante'}
                  </Text>
                </Pressable>
              </View>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 16 },
  heroCard: { borderRadius: 16, padding: 24, alignItems: 'center', marginBottom: 16, shadowColor: '#115e59', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 12, elevation: 5 },
  heroLabel: { fontSize: 14, color: '#ccfbf1', marginBottom: 8 },
  heroValor: { fontSize: 36, fontWeight: 'bold', color: '#fff', marginBottom: 8 },
  heroVenc: { fontSize: 14, color: '#ccfbf1' },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 20, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },
  cardTitle: { fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 16 },
  qrPlaceholder: { height: 200, backgroundColor: '#f3f4f6', borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  qrHint: { fontSize: 14, color: '#6b7280', textAlign: 'center' },
  pixCodeWrap: { backgroundColor: '#f9fafb', borderRadius: 12, padding: 12, marginBottom: 12 },
  pixCode: { fontSize: 12, color: '#6b7280', fontFamily: 'monospace' },
  btnPix: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, backgroundColor: '#0d9488', borderRadius: 12 },
  btnPixCopiado: { backgroundColor: '#16a34a' },
  btnPixText: { color: '#fff', fontSize: 16, fontWeight: '500' },
  dadosHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  dadosRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  dadosLabel: { fontSize: 14, color: '#6b7280' },
  dadosValue: { fontSize: 14, fontWeight: '500', color: '#111827' },
  comprovanteOk: { alignItems: 'center', paddingVertical: 24 },
  comprovanteOkIcon: { width: 88, height: 88, borderRadius: 44, backgroundColor: '#dcfce7', alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  comprovanteOkTitle: { fontSize: 18, fontWeight: '700', color: '#15803d', marginTop: 12 },
  comprovanteOkSub: { fontSize: 14, color: '#16a34a', marginTop: 6, textAlign: 'center' },
  btnAnexar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 16, backgroundColor: '#0d9488', borderRadius: 12 },
  btnAnexarText: { color: '#fff', fontSize: 16, fontWeight: '500' },
  alertBox: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#f0fdfa', borderWidth: 1, borderColor: '#99f6e4', borderRadius: 16, padding: 16, marginBottom: 16 },
  alertText: { flex: 1, fontSize: 14, color: '#0f766e' },
  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 24, paddingBottom: 40 },
  modalHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: '#e5e7eb', alignSelf: 'center', marginTop: 12, marginBottom: 8 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
  modalClose: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center' },
  modalSubtitle: { fontSize: 14, color: '#6b7280', marginBottom: 24 },
  modalOpcoes: { flexDirection: 'row', gap: 12, marginBottom: 8 },
  opcaoBtn: { flex: 1, backgroundColor: '#f0fdfa', borderWidth: 1.5, borderColor: '#99f6e4', borderRadius: 16, alignItems: 'center', padding: 20, gap: 8 },
  opcaoIcon: { width: 64, height: 64, borderRadius: 16, backgroundColor: '#ccfbf1', alignItems: 'center', justifyContent: 'center' },
  opcaoLabel: { fontSize: 15, fontWeight: '600', color: '#0f766e', textAlign: 'center' },
  opcaoSub: { fontSize: 12, color: '#6b7280', textAlign: 'center' },
  arquivoWrap: { gap: 16, marginBottom: 8 },
  arquivoCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f0fdf4', borderWidth: 1.5, borderColor: '#bbf7d0', borderRadius: 14, padding: 14, gap: 12 },
  arquivoIcon: { width: 52, height: 52, borderRadius: 12, backgroundColor: '#dcfce7', alignItems: 'center', justifyContent: 'center' },
  arquivoInfo: { flex: 1 },
  arquivoNome: { fontSize: 14, fontWeight: '600', color: '#111827' },
  arquivoTamanho: { fontSize: 12, color: '#16a34a', marginTop: 2 },
  arquivoRemover: { padding: 4 },
  btnEnviar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 16, backgroundColor: '#0d9488', borderRadius: 14 },
  btnEnviando: { backgroundColor: '#6b7280' },
  btnEnviarText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
