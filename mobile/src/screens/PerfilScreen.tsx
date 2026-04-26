import React, { useCallback, useEffect, useState } from 'react';
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
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Header } from '../components/Header';
import { BottomNav } from '../components/BottomNav';
import { getApiBaseUrl } from '../config/api';
import { useAuth } from '../context/AuthContext';
import { fetchPerfilEscritorio, updatePerfil, uploadFotoPerfil } from '../services/resources';
import * as ImagePicker from 'expo-image-picker';

type Props = {
  onBack: () => void;
  onNavigate: (screen: string) => void;
  onLogout: () => void;
};

export function PerfilScreen({ onBack, onNavigate, onLogout }: Props) {
  const { token, userId } = useAuth();
  const apiOn = !!getApiBaseUrl() && !!token;

  const [loading, setLoading] = useState(false);

  const [nomeFantasia, setNomeFantasia] = useState('');
  const [razaoSocial, setRazaoSocial] = useState('');
  const [foto, setFoto] = useState<string | null>(null);

  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [oab, setOab] = useState('');

  const [logradouro, setLogradouro] = useState('');
  const [numero, setNumero] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('');
  const [cep, setCep] = useState('');

  const [modalFoto, setModalFoto] = useState(false);

  const carregar = useCallback(async () => {
    if (!apiOn || !token || !userId) return;

    setLoading(true);
    try {
      const p = await fetchPerfilEscritorio(token, userId);

      if (p) {
        setNomeFantasia(p.nomeFantasia ?? '');
        setRazaoSocial(p.razaoSocial ?? '');
        setEmail(p.email ?? '');
        setTelefone(p.telefone ?? '');
        setOab(p.oab ? `OAB/SP ${p.oab}` : '');

        setLogradouro(p.logradouro ?? '');
        setNumero(p.numero ?? '');
        setBairro(p.bairro ?? '');
        setCidade(p.cidade ?? '');
        setCep(p.cep ?? '');

        setFoto(p.foto ?? null);
      }
    } catch {
      Alert.alert('Erro', 'Falha ao carregar perfil');
    } finally {
      setLoading(false);
    }
  }, [apiOn, token, userId]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const handleLogout = () => {
    Alert.alert('Sair', 'Deseja sair do app?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: onLogout },
    ]);
  };

  const enviarFoto = async (uri: string) => {
    try {
      setLoading(true);
      await uploadFotoPerfil(token!, userId!, uri);
      setFoto(uri);
      Alert.alert('Sucesso', 'Foto atualizada!');
    } catch {
      Alert.alert('Erro', 'Erro ao enviar foto');
    } finally {
      setLoading(false);
    }
  };

  const escolherDaGaleria = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return Alert.alert('Permissão necessária');

    const result = await ImagePicker.launchImageLibraryAsync({ quality: 0.7 });

    if (!result.canceled) {
      enviarFoto(result.assets[0].uri);
    }
  };

  const tirarFoto = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) return Alert.alert('Permissão necessária');

    const result = await ImagePicker.launchCameraAsync({ quality: 0.7 });

    if (!result.canceled) {
      enviarFoto(result.assets[0].uri);
    }
  };

  const iniciais = (nome: string) =>
    nome
      ?.trim()
      .split(' ')
      .slice(0, 2)
      .map((n) => n[0])
      .join('')
      .toUpperCase() || '?';

  return (
    <View style={styles.container}>
      <Header title="Meu Perfil" showBack onBack={onBack} />

      <ScrollView contentContainerStyle={styles.content}>
        {loading && (
          <View style={styles.loading}>
            <ActivityIndicator />
            <Text>Carregando...</Text>
          </View>
        )}

        {/* Avatar */}
        <View style={styles.cardCenter}>
          <View style={styles.avatarWrap}>
            <View style={styles.avatar}>
              {foto ? (
                <Image source={{ uri: foto }} style={styles.avatarImg} />
              ) : (
                <Text style={styles.avatarText}>{iniciais(nomeFantasia)}</Text>
              )}
            </View>

            <Pressable style={styles.camera} onPress={() => setModalFoto(true)}>
              <MaterialCommunityIcons name="camera" size={16} color="#fff" />
            </Pressable>
          </View>

          <Text style={styles.nome}>{nomeFantasia}</Text>
        </View>

        {/* Form */}
        <View style={styles.card}>
          <Input label="Nome Fantasia" value={nomeFantasia} onChangeText={setNomeFantasia} />
          <Input label="Razão Social" value={razaoSocial} onChangeText={setRazaoSocial} />
          <Input label="Email" value={email} onChangeText={setEmail} />
          <Input label="Telefone" value={telefone} onChangeText={setTelefone} />
          <Input label="OAB" value={oab} onChangeText={setOab} />

          <Input label="Logradouro" value={logradouro} onChangeText={setLogradouro} />
          <Input label="Número" value={numero} onChangeText={setNumero} />
          <Input label="Bairro" value={bairro} onChangeText={setBairro} />
          <Input label="Cidade" value={cidade} onChangeText={setCidade} />
          <Input label="CEP" value={cep} onChangeText={setCep} />

          <Pressable style={styles.btn} onPress={async () => {
            try {
              setLoading(true);

              await updatePerfil(token!, userId!, {
                nomeFantasia,
                razaoSocial,
                email,
                telefone,
                oab: oab.replace('OAB/SP ', ''),
                logradouro,
                numero,
                bairro,
                cidade,
                cep,
              });

              Alert.alert('Sucesso', 'Atualizado!');
            } catch {
              Alert.alert('Erro');
            } finally {
              setLoading(false);
            }
          }}>
            <Text style={styles.btnText}>Salvar</Text>
          </Pressable>
        </View>

        <Pressable style={styles.logout} onPress={handleLogout}>
          <Text style={{ color: 'red' }}>Sair</Text>
        </Pressable>
      </ScrollView>

      {/* Modal */}
      <Modal visible={modalFoto} transparent animationType="slide">
        <View style={styles.modal}>
          <View style={styles.sheet}>
            <Pressable onPress={tirarFoto}><Text>Tirar Foto</Text></Pressable>
            <Pressable onPress={escolherDaGaleria}><Text>Galeria</Text></Pressable>
            <Pressable onPress={() => setModalFoto(false)}><Text>Cancelar</Text></Pressable>
          </View>
        </View>
      </Modal>

      <BottomNav />
    </View>
  );
}

function Input({ label, value, onChangeText }: any) {
  return (
    <View style={{ marginBottom: 12 }}>
      <Text>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        style={styles.input}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  content: { padding: 20 },

  loading: { flexDirection: 'row', gap: 8 },

  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },

  cardCenter: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },

  avatarWrap: { position: 'relative' },

  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#0d9488',
    justifyContent: 'center',
    alignItems: 'center',
  },

  avatarImg: {
    width: '100%',
    height: '100%',
    borderRadius: 45,
  },

  avatarText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
  },

  camera: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#111',
    borderRadius: 15,
    padding: 6,
  },

  nome: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: '600',
  },

  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    borderRadius: 8,
  },

  btn: {
    backgroundColor: '#0d9488',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },

  btnText: {
    color: '#fff',
    fontWeight: '600',
  },

  logout: {
    alignItems: 'center',
    marginTop: 10,
  },

  modal: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: '#00000066',
  },

  sheet: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
});
