import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  Modal,
  Image,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Header } from '../components/Header';
import { FeedbackModal } from '../components/FeedbackModal';
import { getApiBaseUrl, resolveFileUrl } from '../config/api';
import { useAuth } from '../context/AuthContext';
import { fetchClientePerfil, postClienteFotoPerfil, putClientePerfil } from '../services/resources';
import { ApiError } from '../services/http';
import type { ClientePerfilApi } from '../types/api';

type Props = {
  onBack: () => void;
  onLogout?: () => void;
};

type Baseline = { email: string; telefone: string; endereco: string };

function iniciais(nome: string) {
  const p = nome.trim().split(/\s+/).filter(Boolean);
  if (p.length === 0) return '?';
  if (p.length === 1) return p[0].slice(0, 2).toUpperCase();
  return (p[0][0] + p[p.length - 1][0]).toUpperCase();
}


export function ClientePerfilScreen({ onBack, onLogout }: Props) {
  const { token } = useAuth();
  const apiOn = !!getApiBaseUrl() && !!token;

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [endereco, setEndereco] = useState('');
  const [baseline, setBaseline] = useState<Baseline | null>(null);
  const [sinceTopo, setSinceTopo] = useState('');
  const [modalFoto, setModalFoto] = useState(false);
  const [fotoPerfilUri, setFotoPerfilUri] = useState<string | null>(null);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackTitle, setFeedbackTitle] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackVariant, setFeedbackVariant] = useState<'success' | 'error'>('success');

  const showFeedback = (title: string, message: string, variant: 'success' | 'error' = 'success') => {
    setFeedbackTitle(title);
    setFeedbackMessage(message);
    setFeedbackVariant(variant);
    setFeedbackOpen(true);
  };

  const dirty = useMemo(() => {
    if (!baseline) return false;
    return (
      email.trim() !== baseline.email.trim() ||
      telefone.trim() !== baseline.telefone.trim() ||
      endereco.trim() !== baseline.endereco.trim()
    );
  }, [baseline, email, telefone, endereco]);

  const aplicarPerfil = useCallback((p: ClientePerfilApi) => {
    setNome(p.nome);
    setCpf(p.cpf);
    setEmail(p.email);
    setTelefone(p.telefone);
    setEndereco(p.endereco);
    setBaseline({
      email: p.email,
      telefone: p.telefone,
      endereco: p.endereco,
    });
    setSinceTopo(`Cliente desde ${p.clienteDesde}`);
    setFotoPerfilUri(resolveFileUrl(p.fotoPerfil));
  }, []);

  const carregar = useCallback(async () => {
    if (!apiOn || !token) {
      setNome('');
      setCpf('');
      setEmail('');
      setTelefone('');
      setEndereco('');
      setBaseline(null);
      setSinceTopo('');
      setFotoPerfilUri(null);
      return;
    }
    setLoading(true);
    try {
      const p = await fetchClientePerfil(token);
      if (p) {
        aplicarPerfil(p);
      } else {
        setNome('');
        setCpf('');
        setEmail('');
        setTelefone('');
        setEndereco('');
        setBaseline(null);
        setSinceTopo('');
        setFotoPerfilUri(null);
      }
    } catch {
      setNome('');
      setCpf('');
      setEmail('');
      setTelefone('');
      setEndereco('');
      setBaseline(null);
      setSinceTopo('');
      setFotoPerfilUri(null);
    } finally {
      setLoading(false);
    }
  }, [apiOn, token, aplicarPerfil]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const handleSalvar = async () => {
    if (!token || !dirty) return;
    setSaving(true);
    try {
      await putClientePerfil(token, {
        email: email.trim(),
        telefone: telefone.trim(),
        endereco: endereco.trim(),
      });
      setBaseline({
        email: email.trim(),
        telefone: telefone.trim(),
        endereco: endereco.trim(),
      });
      showFeedback(
        'Sucesso',
        'Perfil atualizado. O escritório foi notificado sobre a alteração.',
        'success',
      );
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : 'Não foi possível salvar o perfil.';
      showFeedback('Erro', msg, 'error');
    } finally {
      setSaving(false);
    }
  };

  const selecionarFoto = useCallback(
    async (tipo: 'camera' | 'galeria') => {
      try {
        const permissao =
          tipo === 'camera'
            ? await ImagePicker.requestCameraPermissionsAsync()
            : await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (!permissao.granted) {
          Alert.alert('Permissão necessária', 'Autorize o acesso para alterar a foto de perfil.');
          return;
        }

        const result =
          tipo === 'camera'
            ? await ImagePicker.launchCameraAsync({
                quality: 0.85,
                allowsEditing: true,
                aspect: [1, 1],
                mediaTypes: ['images'],
              })
            : await ImagePicker.launchImageLibraryAsync({
                quality: 0.85,
                allowsEditing: true,
                aspect: [1, 1],
                mediaTypes: ['images'],
              });

        if (result.canceled || !result.assets[0]?.uri) return;
        const a = result.assets[0];
        setFotoPerfilUri(a.uri);
        if (apiOn && token) {
          const ext = a.fileName?.split('.').pop() || 'jpg';
          const resp = await postClienteFotoPerfil(token, {
            uri: a.uri,
            name: a.fileName ?? `perfil_${Date.now()}.${ext}`,
            type: a.mimeType ?? 'image/jpeg',
            file: (a as { file?: File | Blob }).file,
          });
          if (resp?.fotoUrl) {
            setFotoPerfilUri(resolveFileUrl(resp.fotoUrl) ?? a.uri);
          }
        }
        setModalFoto(false);
        showFeedback('Sucesso', 'Foto de perfil atualizada.', 'success');
      } catch {
        showFeedback('Erro', 'Não foi possível atualizar a foto de perfil.', 'error');
      }
    },
    [apiOn, token],
  );

  return (
    <View style={styles.container}>
      <Header title="Meu Perfil" showBack onBack={onBack} />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {apiOn && loading && (
          <View style={styles.loadingRow}>
            <ActivityIndicator size="small" color="#2563eb" />
            <Text style={styles.loadingText}>Carregando perfil…</Text>
          </View>
        )}
        <View style={styles.card}>
          <View style={styles.avatarSection}>
            <View style={styles.avatarWrap}>
              <View style={styles.avatarCircle}>
                {fotoPerfilUri ? (
                  <Image
                    source={{ uri: fotoPerfilUri, headers: token ? { Authorization: `Bearer ${token}` } : undefined }}
                    style={styles.avatarImage}
                    onError={() => setFotoPerfilUri(null)}
                  />
                ) : (
                  <Text style={styles.avatarInitials}>{iniciais(nome)}</Text>
                )}
              </View>
              <Pressable style={styles.cameraBtn} onPress={() => setModalFoto(true)}>
                <MaterialCommunityIcons name="camera" size={16} color="#fff" />
              </Pressable>
            </View>
            <Text style={styles.avatarName}>{nome}</Text>
            {sinceTopo ? <Text style={styles.avatarSince}>{sinceTopo}</Text> : null}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Dados Pessoais</Text>
          {!apiOn ? (
            <Text style={styles.semDados}>Faça login e configure a API para ver o perfil.</Text>
          ) : !loading && !baseline ? (
            <Text style={styles.semDados}>Nenhum dado carregado. Verifique a API.</Text>
          ) : baseline ? (
            <>
              <CampoPerfil label="Nome completo" value={nome} onChangeText={() => {}} editable={false} icon="account" />
              <CampoPerfil label="CPF" value={cpf} onChangeText={() => {}} editable={false} icon="card-account-details-outline" />
              <CampoPerfil
                label="E-mail"
                value={email}
                onChangeText={setEmail}
                editable
                icon="email-outline"
                keyboardType="email-address"
              />
              <CampoPerfil
                label="Telefone"
                value={telefone}
                onChangeText={setTelefone}
                editable
                icon="phone-outline"
                keyboardType="phone-pad"
              />
              <CampoPerfil
                label="Endereço"
                value={endereco}
                onChangeText={setEndereco}
                editable
                icon="map-marker-outline"
              />
              {dirty ? (
                <Pressable
                  style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
                  onPress={handleSalvar}
                  disabled={saving}
                >
                  {saving ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.saveBtnText}>Salvar alterações</Text>
                  )}
                </Pressable>
              ) : null}
            </>
          ) : null}
        </View>

        <Pressable style={styles.logoutBtn} onPress={onLogout}>
          <MaterialCommunityIcons name="logout" size={20} color="#dc2626" />
          <Text style={styles.logoutText}>Sair da Conta</Text>
        </Pressable>

        <View style={{ height: 32 }} />
      </ScrollView>

      <Modal visible={modalFoto} transparent animationType="slide">
        <Pressable style={styles.modalOverlay} onPress={() => setModalFoto(false)}>
          <Pressable style={styles.modalSheet} onPress={() => {}}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Alterar Foto de Perfil</Text>
              <Pressable onPress={() => setModalFoto(false)}>
                <MaterialCommunityIcons name="close" size={22} color="#9ca3af" />
              </Pressable>
            </View>

            <Pressable style={styles.fotoOption} onPress={() => selecionarFoto('camera')}>
              <View style={[styles.fotoIconWrap, { backgroundColor: '#ccfbf1' }]}>
                <MaterialCommunityIcons name="camera" size={24} color="#0d9488" />
              </View>
              <View style={styles.fotoText}>
                <Text style={styles.fotoOptionTitle}>Tirar Foto</Text>
                <Text style={styles.fotoOptionDesc}>Usar câmera do dispositivo</Text>
              </View>
            </Pressable>

            <Pressable style={styles.fotoOption} onPress={() => selecionarFoto('galeria')}>
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
          </Pressable>
        </Pressable>
      </Modal>

      <FeedbackModal
        visible={feedbackOpen}
        title={feedbackTitle}
        message={feedbackMessage}
        variant={feedbackVariant}
        onClose={() => setFeedbackOpen(false)}
      />
    </View>
  );
}

function CampoPerfil({
  label,
  value,
  onChangeText,
  editable,
  icon,
  keyboardType,
}: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  editable: boolean;
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  keyboardType?: 'default' | 'email-address' | 'phone-pad';
}) {
  return (
    <View style={styles.fieldBlock}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={[styles.fieldRow, !editable && styles.fieldRowReadonly]}>
        <MaterialCommunityIcons name={icon} size={18} color="#0d9488" style={styles.fieldIcon} />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          editable={editable}
          keyboardType={keyboardType ?? 'default'}
          style={[styles.fieldInput, !editable && styles.fieldInputReadonly]}
          placeholderTextColor="#9ca3af"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 16 },
  loadingRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  loadingText: { fontSize: 13, color: '#6b7280' },

  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTitle: { fontSize: 15, fontWeight: '600', color: '#111827', marginBottom: 12, paddingHorizontal: 4 },
  semDados: { fontSize: 14, color: '#9ca3af', paddingVertical: 8, paddingHorizontal: 4 },

  avatarSection: { alignItems: 'center', paddingVertical: 8 },
  avatarWrap: { position: 'relative', marginBottom: 16 },
  avatarCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#0d9488',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: { width: '100%', height: '100%' },
  avatarInitials: { fontSize: 30, fontWeight: 'bold', color: '#fff' },
  cameraBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#0d9488',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  avatarName: { fontSize: 20, fontWeight: 'bold', color: '#111827' },
  avatarSince: { fontSize: 13, color: '#9ca3af', marginTop: 4 },

  fieldBlock: { marginBottom: 14, paddingHorizontal: 4 },
  fieldLabel: { fontSize: 11, color: '#9ca3af', marginBottom: 6 },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 12,
    minHeight: 48,
  },
  fieldRowReadonly: { backgroundColor: '#f3f4f6' },
  fieldIcon: { marginRight: 10 },
  fieldInput: { flex: 1, fontSize: 15, fontWeight: '500', color: '#111827', paddingVertical: 10 },
  fieldInputReadonly: { color: '#6b7280' },

  saveBtn: {
    backgroundColor: '#0d9488',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  saveBtnDisabled: { opacity: 0.75 },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },

  logoutBtn: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  logoutText: { fontSize: 15, fontWeight: '600', color: '#dc2626' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 36,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  modalTitle: { fontSize: 18, fontWeight: '600', color: '#111827' },

  fotoOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  fotoIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fotoText: { flex: 1 },
  fotoOptionTitle: { fontSize: 15, fontWeight: '600', color: '#111827' },
  fotoOptionDesc: { fontSize: 13, color: '#9ca3af', marginTop: 2 },

  modalCancel: {
    paddingVertical: 14,
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  modalCancelText: { fontSize: 15, fontWeight: '600', color: '#374151' },
});
