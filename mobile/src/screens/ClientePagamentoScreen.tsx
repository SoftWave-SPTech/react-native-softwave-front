import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Alert } from 'react-native';
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

  const copiarPix = async () => {
    try {
      await Clipboard.setStringAsync(PIX_CODE);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      Alert.alert('Erro', 'Não foi possível copiar o código.');
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Realizar Pagamento" showBack onBack={onBack} />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.heroCard}>
          <Text style={styles.heroLabel}>Valor a pagar</Text>
          <Text style={styles.heroValor}>R$ 6.000,00</Text>
          <Text style={styles.heroVenc}>Vencimento: 15/03/2026</Text>
        </View>
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
              <MaterialCommunityIcons name="check-circle" size={48} color="#16a34a" />
              <Text style={styles.comprovanteOkTitle}>Comprovante anexado!</Text>
              <Text style={styles.comprovanteOkSub}>Aguardando confirmação do escritório</Text>
            </View>
          ) : (
            <Pressable onPress={() => setComprovanteAnexado(true)} style={styles.btnAnexar}>
              <MaterialCommunityIcons name="upload" size={22} color="#fff" />
              <Text style={styles.btnAnexarText}>Anexar Comprovante</Text>
            </Pressable>
          )}
        </View>
        {comprovanteAnexado && (
          <View style={styles.alertBox}>
            <Text style={styles.alertText}>Seu pagamento será confirmado em até 24 horas úteis</Text>
          </View>
        )}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 16 },
  heroCard: { backgroundColor: '#2563eb', borderRadius: 16, padding: 24, alignItems: 'center', marginBottom: 16 },
  heroLabel: { fontSize: 14, color: '#93c5fd', marginBottom: 8 },
  heroValor: { fontSize: 36, fontWeight: 'bold', color: '#fff', marginBottom: 8 },
  heroVenc: { fontSize: 14, color: '#93c5fd' },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 20, marginBottom: 16 },
  cardTitle: { fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 16 },
  qrPlaceholder: { height: 200, backgroundColor: '#f3f4f6', borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  qrHint: { fontSize: 14, color: '#6b7280', textAlign: 'center' },
  pixCodeWrap: { backgroundColor: '#f9fafb', borderRadius: 12, padding: 12, marginBottom: 12 },
  pixCode: { fontSize: 12, color: '#6b7280', fontFamily: 'monospace' },
  btnPix: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, backgroundColor: '#2563eb', borderRadius: 12 },
  btnPixCopiado: { backgroundColor: '#16a34a' },
  btnPixText: { color: '#fff', fontSize: 16, fontWeight: '500' },
  dadosHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  dadosRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  dadosLabel: { fontSize: 14, color: '#6b7280' },
  dadosValue: { fontSize: 14, fontWeight: '500', color: '#111827' },
  comprovanteOk: { alignItems: 'center', paddingVertical: 24 },
  comprovanteOkTitle: { fontSize: 16, fontWeight: '600', color: '#16a34a', marginTop: 12 },
  comprovanteOkSub: { fontSize: 14, color: '#16a34a', marginTop: 4 },
  btnAnexar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 16, backgroundColor: '#2563eb', borderRadius: 12 },
  btnAnexarText: { color: '#fff', fontSize: 16, fontWeight: '500' },
  alertBox: { backgroundColor: '#fffbeb', borderWidth: 1, borderColor: '#fde68a', borderRadius: 16, padding: 16 },
  alertText: { fontSize: 14, color: '#92400e', textAlign: 'center' },
});
