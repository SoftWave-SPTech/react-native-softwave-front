import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
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
import { getApiBaseUrl } from '../config/api';
import { useAuth } from '../context/AuthContext';
import { fetchClientePerfil, postClienteFotoPerfil } from '../services/resources';
import type { ClientePerfilApi } from '../types/api';

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

function iniciais(nome: string) {
  const p = nome.trim().split(/\s+/).filter(Boolean);
  if (p.length === 0) return '?';
  if (p.length === 1) return p[0].slice(0, 2).toUpperCase();
  return (p[0][0] + p[p.length - 1][0]).toUpperCase();
}

function perfilParaDados(p: ClientePerfilApi): DadoPessoal[] {
  return [
    { icon: 'account', label: 'Nome Completo', value: p.nome },
    { icon: 'email-outline', label: 'E-mail', value: p.email },
    { icon: 'phone-outline', label: 'Telefone', value: p.telefone },
    { icon: 'map-marker-outline', label: 'Endereço', value: p.endereco },
    { icon: 'card-account-details-outline', label: 'CPF', value: p.cpf },
  ];
}

function resolverFotoPerfilUri(raw: string | null | undefined): string | null {
  if (!raw) return null;
  if (/^https?:\/\//i.test(raw)) return raw;
  if (raw.startsWith('file://')) return null;
  if (raw.startsWith('/')) {
    const base = getApiBaseUrl();
    if (!base) return null;
    const origin = base.replace(/\/v1\/?$/i, '');
    return `${origin}${raw}`;
  }
  return raw;
}

export function ClientePerfilScreen({ onBack, onLogout }: Props) {
  const { token } = useAuth();
  const apiOn = !!getApiBaseUrl() && !!token;

  const [loading, setLoading] = useState(false);
  const [dadosPessoais, setDadosPessoais] = useState<DadoPessoal[]>([]);
  const [nomeTopo, setNomeTopo] = useState('');
  const [sinceTopo, setSinceTopo] = useState('');
  const [modalFoto, setModalFoto] = useState(false);
  const [fotoPerfilUri, setFotoPerfilUri] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    if (!apiOn || !token) {
      setDadosPessoais([]);
      setNomeTopo('');
      setSinceTopo('');
      return;
    }
    setLoading(true);
    try {
      const p = await fetchClientePerfil(token);
      if (p) {
        setDadosPessoais(perfilParaDados(p));
        setNomeTopo(p.nome);
        setSinceTopo(`Cliente desde ${p.clienteDesde}`);
        setFotoPerfilUri(resolverFotoPerfilUri(p.fotoPerfil));
      } else {
        setDadosPessoais([]);
        setNomeTopo('');
        setSinceTopo('');
        setFotoPerfilUri(null);
      }
    } catch {
      setDadosPessoais([]);
      setNomeTopo('');
      setSinceTopo('');
      setFotoPerfilUri(null);
    } finally {
      setLoading(false);
    }
  }, [apiOn, token]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const selecionarFoto = useCallback(async (tipo: 'camera' | 'galeria') => {
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
          setFotoPerfilUri(resolverFotoPerfilUri(resp.fotoUrl) ?? a.uri);
        }
      }
      setModalFoto(false);
      Alert.alert('Sucesso', 'Foto de perfil atualizada.');
    } catch {
      Alert.alert('Erro', 'Não foi possível atualizar a foto de perfil.');
    }
  }, [apiOn, token]);

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
        {/* Avatar */}
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
                  <Text style={styles.avatarInitials}>{iniciais(nomeTopo)}</Text>
                )}
              </View>
              <Pressable style={styles.cameraBtn} onPress={() => setModalFoto(true)}>
                <MaterialCommunityIcons name="camera" size={16} color="#fff" />
              </Pressable>
            </View>
            <Text style={styles.avatarName}>{nomeTopo}</Text>
            {sinceTopo ? <Text style={styles.avatarSince}>{sinceTopo}</Text> : null}
          </View>
        </View>

        {/* Dados Pessoais */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Dados Pessoais</Text>
          {dadosPessoais.length === 0 ? (
            <Text style={styles.semDados}>Nenhum dado carregado. Verifique a API.</Text>
          ) : (
            dadosPessoais.map((dado, index) => (
              <View key={index} style={styles.dadoItem}>
                <View style={styles.dadoIconWrap}>
                  <MaterialCommunityIcons name={dado.icon} size={16} color="#0d9488" />
                </View>
                <View style={styles.dadoText}>
                  <Text style={styles.dadoLabel}>{dado.label}</Text>
                  <Text style={styles.dadoValue} numberOfLines={1}>{dado.value}</Text>
                </View>
              </View>
            ))
          )}
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
    backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 8, elevation: 3,
  },
  cardTitle: { fontSize: 15, fontWeight: '600', color: '#111827', marginBottom: 12, paddingHorizontal: 4 },
  semDados: { fontSize: 14, color: '#9ca3af', paddingVertical: 8, paddingHorizontal: 4 },

  avatarSection: { alignItems: 'center', paddingVertical: 8 },
  avatarWrap: { position: 'relative', marginBottom: 16 },
  avatarCircle: {
    width: 96, height: 96, borderRadius: 48,
    backgroundColor: '#0d9488', alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: { width: '100%', height: '100%' },
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
