import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  StyleSheet,
  Alert,
  Modal,
  ActivityIndicator,
  Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Header } from '../components/Header';
import { BottomNav } from '../components/BottomNav';
import { FeedbackModal } from '../components/FeedbackModal';
import { getApiBaseUrl } from '../config/api';
import { useAuth } from '../context/AuthContext';
import { fetchPerfilEscritorio, postPerfilFoto, putPerfilEscritorio } from '../services/resources';
import { ApiError } from '../services/http';

type Props = {
  onBack: () => void;
  onNavigate: (screen: string) => void;
  onLogout: () => void;
};

type Baseline = { nome: string; email: string; telefone: string; endereco: string };

type ConfigItem = {
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  label: string;
  screen: 'LocaisSeguros' | 'AjudaSuporte';
};

const CONFIG_ITENS: ConfigItem[] = [
  { icon: 'map-marker-radius', label: 'Locais Seguros', screen: 'LocaisSeguros' },
  { icon: 'help-circle-outline', label: 'Ajuda e Suporte', screen: 'AjudaSuporte' },
];

function resolverFotoPerfilUri(raw: string | null | undefined): string | null {
  if (!raw) return null;
  if (/^https?:\/\//i.test(raw)) return raw;
  if (raw.startsWith('file://')) return raw;
  if (raw.startsWith('/')) {
    const base = getApiBaseUrl();
    if (!base) return null;
    const origin = base.replace(/\/v1\/?$/i, '');
    return `${origin}${raw}`;
  }
  return raw;
}

export function PerfilScreen({ onBack, onNavigate, onLogout }: Props) {
  const { token } = useAuth();
  const apiOn = !!getApiBaseUrl() && !!token;

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [oab, setOab] = useState('');
  const [endereco, setEndereco] = useState('');
  const [baseline, setBaseline] = useState<Baseline | null>(null);
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

  const carregar = useCallback(async () => {
    if (!apiOn || !token) return;
    setLoading(true);
    try {
      const p = await fetchPerfilEscritorio(token);
      if (p) {
        setNome(p.nome);
        setEmail(p.email);
        setTelefone(p.telefone);
        setOab(p.oab);
        setEndereco(p.endereco);
        setBaseline({
          nome: p.nome,
          email: p.email,
          telefone: p.telefone,
          endereco: p.endereco,
        });
        setFotoPerfilUri(resolverFotoPerfilUri(p.fotoPerfil));
      }
    } finally {
      setLoading(false);
    }
  }, [apiOn, token]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const dirty = useMemo(() => {
    if (!baseline) return false;
    return (
      nome.trim() !== baseline.nome.trim() ||
      email.trim() !== baseline.email.trim() ||
      telefone.trim() !== baseline.telefone.trim() ||
      endereco.trim() !== baseline.endereco.trim()
    );
  }, [baseline, nome, email, telefone, endereco]);

  const handleSalvar = async () => {
    if (!token || !dirty) return;
    setSaving(true);
    try {
      await putPerfilEscritorio(token, {
        nome: nome.trim(),
        email: email.trim(),
        telefone: telefone.trim(),
        endereco: endereco.trim(),
      });
      setBaseline({
        nome: nome.trim(),
        email: email.trim(),
        telefone: telefone.trim(),
        endereco: endereco.trim(),
      });
      showFeedback('Sucesso', 'Perfil atualizado.', 'success');
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
          const resp = await postPerfilFoto(token, {
            uri: a.uri,
            name: a.fileName ?? `perfil_${Date.now()}.${ext}`,
            type: a.mimeType ?? 'image/jpeg',
            file: (a as { file?: File | Blob }).file,
          });
          if (resp?.fotoUrl) {
            setFotoPerfilUri(resolverFotoPerfilUri(resp.fotoUrl) ?? a.uri);
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

  const handleLogout = () => {
    Alert.alert('Sair', 'Deseja realmente sair do aplicativo?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: onLogout },
    ]);
  };

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
        <View style={styles.avatarCard}>
          <View style={styles.avatarWrap}>
            <View style={styles.avatar}>
              {fotoPerfilUri ? (
                <Image
                  source={{ uri: fotoPerfilUri, headers: token ? { Authorization: `Bearer ${token}` } : undefined }}
                  style={styles.avatarImage}
                  onError={() => setFotoPerfilUri(null)}
                />
              ) : (
                <Text style={styles.avatarText}>
                  {(nome || '?')
                    .trim()
                    .split(/\s+/)
                    .filter(Boolean)
                    .slice(0, 2)
                    .map((w) => w[0]?.toUpperCase() ?? '')
                    .join('') || '?'}
                </Text>
              )}
            </View>
            <Pressable onPress={() => setModalFoto(true)} style={styles.cameraBtn}>
              <MaterialCommunityIcons name="camera" size={16} color="#fff" />
            </Pressable>
          </View>
          <Text style={styles.nome}>{nome}</Text>
          <Text style={styles.oab}>{oab || '—'}</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Dados do Escritório</Text>
          <InputField icon="domain" label="Nome do Escritório" value={nome} onChangeText={setNome} />
          <InputField icon="email" label="E-mail" value={email} onChangeText={setEmail} keyboardType="email-address" />
          <InputField icon="phone" label="Telefone" value={telefone} onChangeText={setTelefone} keyboardType="phone-pad" />
          <InputField icon="file-document" label="OAB" value={oab} onChangeText={setOab} editable={false} />
          <Text style={styles.oabHint}>
            O registro OAB ainda não é persistido pela API; alterações de nome, e-mail, telefone e endereço são salvas.
          </Text>
          <InputField icon="map-marker" label="Endereço" value={endereco} onChangeText={setEndereco} />
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
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Configurações</Text>
          {CONFIG_ITENS.map((item, index) => (
            <Pressable
              key={item.screen}
              style={[styles.configRow, index < CONFIG_ITENS.length - 1 && styles.configRowBorder]}
              onPress={() => onNavigate(item.screen)}
            >
              <View style={styles.configIconWrap}>
                <MaterialCommunityIcons name={item.icon} size={22} color="#0d9488" />
              </View>
              <Text style={styles.configLabel}>{item.label}</Text>
              <MaterialCommunityIcons name="chevron-right" size={22} color="#9ca3af" />
            </Pressable>
          ))}
        </View>

        <Pressable onPress={handleLogout} style={styles.logoutBtn}>
          <MaterialCommunityIcons name="logout" size={22} color="#dc2626" />
          <Text style={styles.logoutBtnText}>Sair do Aplicativo</Text>
        </Pressable>
        <View style={{ height: 140 }} />
      </ScrollView>
      <View style={styles.bottomNavWrap}>
        <BottomNav />
      </View>

      <Modal visible={modalFoto} transparent animationType="slide">
        <Pressable style={styles.modalOverlay} onPress={() => setModalFoto(false)}>
          <View style={styles.bottomSheet} onStartShouldSetResponder={() => true}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Alterar Foto de Perfil</Text>
            <Pressable
              style={styles.sheetOption}
              onPress={() => {
                setModalFoto(false);
                void selecionarFoto('camera');
              }}
            >
              <View style={styles.sheetOptionIcon}>
                <MaterialCommunityIcons name="camera" size={24} color="#0d9488" />
              </View>
              <Text style={styles.sheetOptionText}>Tirar Foto</Text>
              <MaterialCommunityIcons name="chevron-right" size={22} color="#9ca3af" />
            </Pressable>
            <Pressable
              style={styles.sheetOption}
              onPress={() => {
                setModalFoto(false);
                void selecionarFoto('galeria');
              }}
            >
              <View style={styles.sheetOptionIcon}>
                <MaterialCommunityIcons name="image" size={24} color="#0d9488" />
              </View>
              <Text style={styles.sheetOptionText}>Escolher da Galeria</Text>
              <MaterialCommunityIcons name="chevron-right" size={22} color="#9ca3af" />
            </Pressable>
            <Pressable style={styles.sheetCancel} onPress={() => setModalFoto(false)}>
              <Text style={styles.sheetCancelText}>Cancelar</Text>
            </Pressable>
          </View>
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

function InputField({
  icon,
  label,
  value,
  onChangeText,
  keyboardType,
  editable = true,
}: {
  icon: string;
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  keyboardType?: string;
  editable?: boolean;
}) {
  return (
    <View style={styles.inputWrap}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={[styles.inputRow, !editable && styles.inputRowReadonly]}>
        <MaterialCommunityIcons name={icon as never} size={22} color="#9ca3af" style={styles.inputIcon} />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType as 'default'}
          editable={editable}
          style={[styles.input, !editable && styles.inputReadonly]}
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
  avatarCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  avatarWrap: { position: 'relative', marginBottom: 16 },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#0d9488',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: { width: '100%', height: '100%' },
  avatarText: { fontSize: 32, fontWeight: 'bold', color: '#fff' },
  cameraBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#374151',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  nome: { fontSize: 20, fontWeight: '600', color: '#111827', marginBottom: 4 },
  oab: { fontSize: 14, color: '#6b7280' },
  oabHint: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: -8,
    marginBottom: 12,
    lineHeight: 16,
  },
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
  cardTitle: { fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 16 },
  inputWrap: { marginBottom: 16 },
  inputLabel: { fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 8 },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  inputRowReadonly: { backgroundColor: '#f3f4f6' },
  inputIcon: { marginRight: 8 },
  input: { flex: 1, paddingVertical: 12, fontSize: 16, color: '#111827' },
  inputReadonly: { color: '#6b7280' },
  saveBtn: {
    backgroundColor: '#0d9488',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  saveBtnDisabled: { opacity: 0.7 },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '500' },
  configRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    gap: 12,
  },
  configRowBorder: { borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  configIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#f0fdfa',
    alignItems: 'center',
    justifyContent: 'center',
  },
  configLabel: { flex: 1, fontSize: 15, fontWeight: '500', color: '#111827' },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#fee2e2',
    borderRadius: 12,
    paddingVertical: 14,
  },
  logoutBtnText: { fontSize: 16, fontWeight: '500', color: '#dc2626' },
  bottomNavWrap: { position: 'absolute', bottom: 0, left: 0, right: 0 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  bottomSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#e5e7eb',
    alignSelf: 'center',
    marginBottom: 20,
  },
  sheetTitle: { fontSize: 18, fontWeight: '600', color: '#111827', marginBottom: 20, textAlign: 'center' },
  sheetOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  sheetOptionIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#ccfbf1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  sheetOptionText: { flex: 1, fontSize: 16, color: '#111827' },
  sheetCancel: {
    marginTop: 16,
    paddingVertical: 14,
    backgroundColor: '#f3f4f6',
    borderRadius: 14,
    alignItems: 'center',
  },
  sheetCancelText: { fontSize: 16, fontWeight: '500', color: '#6b7280' },
});
