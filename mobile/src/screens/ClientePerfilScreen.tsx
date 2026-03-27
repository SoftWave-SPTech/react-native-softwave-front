import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Modal,
  StyleSheet,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Header } from '../components/Header';

type Props = {
  onBack: () => void;
  onLogout?: () => void;
};

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

interface DadoPessoal {
  icon: IconName;
  label: string;
  value: string;
}

const dadosPessoais: DadoPessoal[] = [
  { icon: 'account', label: 'Nome Completo', value: 'João Silva' },
  { icon: 'email-outline', label: 'E-mail', value: 'joao.silva@email.com' },
  { icon: 'phone-outline', label: 'Telefone', value: '(11) 98765-4321' },
  { icon: 'map-marker-outline', label: 'Endereço', value: 'São Paulo, SP' },
  { icon: 'card-account-details-outline', label: 'CPF', value: '123.456.789-00' },
];

export function ClientePerfilScreen({ onBack, onLogout }: Props) {
  const [notificacoesAtivas, setNotificacoesAtivas] = useState(true);
  const [modalFoto, setModalFoto] = useState(false);

  return (
    <View style={styles.container}>
      <Header title="Meu Perfil" showBack onBack={onBack} />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Avatar */}
        <View style={styles.card}>
          <View style={styles.avatarSection}>
            <View style={styles.avatarWrap}>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarInitials}>JS</Text>
              </View>
              <Pressable style={styles.cameraBtn} onPress={() => setModalFoto(true)}>
                <MaterialCommunityIcons name="camera" size={16} color="#fff" />
              </Pressable>
            </View>
            <Text style={styles.avatarName}>João Silva</Text>
            <Text style={styles.avatarSince}>Cliente desde Fev/2024</Text>
          </View>
        </View>

        {/* Dados Pessoais */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Dados Pessoais</Text>
          {dadosPessoais.map((dado, index) => (
            <View key={index} style={styles.dadoItem}>
              <View style={styles.dadoIconWrap}>
                <MaterialCommunityIcons name={dado.icon} size={16} color="#0d9488" />
              </View>
              <View style={styles.dadoText}>
                <Text style={styles.dadoLabel}>{dado.label}</Text>
                <Text style={styles.dadoValue} numberOfLines={1}>{dado.value}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Configurações */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Configurações</Text>

          {/* Toggle Notificações */}
          <View style={styles.configItem}>
            <View style={styles.configLeft}>
              <View style={[styles.configIconWrap, { backgroundColor: '#fefce8' }]}>
                <MaterialCommunityIcons name="bell-outline" size={16} color="#ca8a04" />
              </View>
              <View>
                <Text style={styles.configLabel}>Notificações</Text>
                <Text style={styles.configDesc}>Receber alertas de pagamentos</Text>
              </View>
            </View>
            <Pressable
              style={[styles.toggle, notificacoesAtivas ? styles.toggleActive : styles.toggleInactive]}
              onPress={() => setNotificacoesAtivas(!notificacoesAtivas)}
            >
              <View style={[styles.toggleThumb, notificacoesAtivas ? styles.toggleThumbActive : styles.toggleThumbInactive]} />
            </Pressable>
          </View>

          {/* Alterar Senha */}
          <Pressable style={styles.configBtn}>
            <View style={styles.configLeft}>
              <View style={[styles.configIconWrap, { backgroundColor: '#f9fafb' }]}>
                <MaterialCommunityIcons name="shield-outline" size={16} color="#6b7280" />
              </View>
              <Text style={styles.configLabel}>Alterar Senha</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={20} color="#9ca3af" />
          </Pressable>

          {/* Documentos */}
          <Pressable style={styles.configBtn}>
            <View style={styles.configLeft}>
              <View style={[styles.configIconWrap, { backgroundColor: '#f9fafb' }]}>
                <MaterialCommunityIcons name="file-document-outline" size={16} color="#6b7280" />
              </View>
              <Text style={styles.configLabel}>Documentos</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={20} color="#9ca3af" />
          </Pressable>
        </View>

        {/* Processo Ativo */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Processo Ativo</Text>
          <View style={styles.processoWrap}>
            <View style={styles.processoIconWrap}>
              <MaterialCommunityIcons name="file-document-outline" size={20} color="#0d9488" />
            </View>
            <View style={styles.processoInfo}>
              <Text style={styles.processoTitulo}>Processo 1234/2025</Text>
              <Text style={styles.processoSubtitulo}>Advocacia Cível - Honorários</Text>
              <View style={styles.progressoSection}>
                <View style={styles.progressoLabelRow}>
                  <Text style={styles.progressoLabel}>Progresso</Text>
                  <Text style={styles.progressoPercent}>60%</Text>
                </View>
                <View style={styles.progressoBarBg}>
                  <View style={[styles.progressoBarFill, { width: '60%' }]} />
                </View>
                <Text style={styles.progressoValor}>R$ 15.000 pagos de R$ 25.000 total</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Sair */}
        <Pressable style={styles.logoutBtn} onPress={onLogout}>
          <MaterialCommunityIcons name="logout" size={20} color="#dc2626" />
          <Text style={styles.logoutText}>Sair da Conta</Text>
        </Pressable>

        <View style={{ height: 32 }} />
      </ScrollView>

      {/* Modal de Foto */}
      <Modal visible={modalFoto} transparent animationType="slide">
        <Pressable style={styles.modalOverlay} onPress={() => setModalFoto(false)}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Alterar Foto de Perfil</Text>
              <Pressable onPress={() => setModalFoto(false)}>
                <MaterialCommunityIcons name="close" size={22} color="#9ca3af" />
              </Pressable>
            </View>

            <Pressable style={styles.fotoOption} onPress={() => setModalFoto(false)}>
              <View style={[styles.fotoIconWrap, { backgroundColor: '#ccfbf1' }]}>
                <MaterialCommunityIcons name="camera" size={24} color="#0d9488" />
              </View>
              <View style={styles.fotoText}>
                <Text style={styles.fotoOptionTitle}>Tirar Foto</Text>
                <Text style={styles.fotoOptionDesc}>Usar câmera do dispositivo</Text>
              </View>
            </Pressable>

            <Pressable style={styles.fotoOption} onPress={() => setModalFoto(false)}>
              <View style={[styles.fotoIconWrap, { backgroundColor: '#dcfce7' }]}>
                <MaterialCommunityIcons name="image-outline" size={24} color="#16a34a" />
              </View>
              <View style={styles.fotoText}>
                <Text style={styles.fotoOptionTitle}>Escolher da Galeria</Text>
                <Text style={styles.fotoOptionDesc}>Selecionar foto existente</Text>
              </View>
            </Pressable>

            <Pressable style={styles.modalCancel} onPress={() => setModalFoto(false)}>
              <Text style={styles.modalCancelText}>Cancelar</Text>
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

  card: {
    backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 8, elevation: 3,
  },
  cardTitle: { fontSize: 15, fontWeight: '600', color: '#111827', marginBottom: 12, paddingHorizontal: 4 },

  avatarSection: { alignItems: 'center', paddingVertical: 8 },
  avatarWrap: { position: 'relative', marginBottom: 16 },
  avatarCircle: {
    width: 96, height: 96, borderRadius: 48,
    backgroundColor: '#0d9488', alignItems: 'center', justifyContent: 'center',
  },
  avatarInitials: { fontSize: 30, fontWeight: 'bold', color: '#fff' },
  cameraBtn: {
    position: 'absolute', bottom: 0, right: 0,
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: '#0d9488', alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: '#fff',
  },
  avatarName: { fontSize: 20, fontWeight: 'bold', color: '#111827' },
  avatarSince: { fontSize: 13, color: '#9ca3af', marginTop: 4 },

  dadoItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8, paddingHorizontal: 4 },
  dadoIconWrap: {
    width: 32, height: 32, borderRadius: 8,
    backgroundColor: '#f0fdfa', alignItems: 'center', justifyContent: 'center',
  },
  dadoText: { flex: 1 },
  dadoLabel: { fontSize: 11, color: '#9ca3af' },
  dadoValue: { fontSize: 14, fontWeight: '500', color: '#111827' },

  configItem: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', paddingVertical: 10, paddingHorizontal: 4,
  },
  configBtn: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', paddingVertical: 10, paddingHorizontal: 4,
  },
  configLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  configIconWrap: {
    width: 32, height: 32, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center',
  },
  configLabel: { fontSize: 14, fontWeight: '500', color: '#111827' },
  configDesc: { fontSize: 12, color: '#9ca3af', marginTop: 1 },

  toggle: {
    width: 48, height: 26, borderRadius: 13,
    justifyContent: 'center', paddingHorizontal: 2,
  },
  toggleActive: { backgroundColor: '#0d9488' },
  toggleInactive: { backgroundColor: '#d1d5db' },
  toggleThumb: {
    width: 22, height: 22, borderRadius: 11, backgroundColor: '#fff',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2, shadowRadius: 2, elevation: 2,
  },
  toggleThumbActive: { alignSelf: 'flex-end' },
  toggleThumbInactive: { alignSelf: 'flex-start' },

  processoWrap: {
    backgroundColor: '#f0fdfa', borderRadius: 12, padding: 16,
    flexDirection: 'row', gap: 12,
  },
  processoIconWrap: {
    width: 40, height: 40, borderRadius: 8,
    backgroundColor: '#ccfbf1', alignItems: 'center', justifyContent: 'center',
  },
  processoInfo: { flex: 1 },
  processoTitulo: { fontSize: 15, fontWeight: '600', color: '#111827' },
  processoSubtitulo: { fontSize: 13, color: '#6b7280', marginTop: 2, marginBottom: 12 },
  progressoSection: {},
  progressoLabelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  progressoLabel: { fontSize: 13, color: '#6b7280' },
  progressoPercent: { fontSize: 13, fontWeight: '600', color: '#0d9488' },
  progressoBarBg: {
    height: 8, backgroundColor: '#99f6e4', borderRadius: 4, overflow: 'hidden',
  },
  progressoBarFill: {
    height: 8, backgroundColor: '#0d9488', borderRadius: 4,
  },
  progressoValor: { fontSize: 12, color: '#9ca3af', marginTop: 6 },

  logoutBtn: {
    backgroundColor: '#fff', borderRadius: 16, padding: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    marginBottom: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 8, elevation: 3,
  },
  logoutText: { fontSize: 15, fontWeight: '600', color: '#dc2626' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 20, paddingBottom: 36,
  },
  modalHeader: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 20,
  },
  modalTitle: { fontSize: 18, fontWeight: '600', color: '#111827' },

  fotoOption: {
    flexDirection: 'row', alignItems: 'center', gap: 16,
    backgroundColor: '#f9fafb', borderRadius: 16, padding: 16, marginBottom: 12,
  },
  fotoIconWrap: {
    width: 48, height: 48, borderRadius: 24,
    alignItems: 'center', justifyContent: 'center',
  },
  fotoText: { flex: 1 },
  fotoOptionTitle: { fontSize: 15, fontWeight: '600', color: '#111827' },
  fotoOptionDesc: { fontSize: 13, color: '#9ca3af', marginTop: 2 },

  modalCancel: {
    paddingVertical: 14, backgroundColor: '#f3f4f6',
    borderRadius: 12, alignItems: 'center', marginTop: 4,
  },
  modalCancelText: { fontSize: 15, fontWeight: '600', color: '#374151' },
});
