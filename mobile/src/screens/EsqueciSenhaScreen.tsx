import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, Alert, ActivityIndicator, Image, KeyboardAvoidingView, ScrollView, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { getLoginApiBaseUrl } from '../config/api';
import logoImage from '../../assets/softwave-logo.png';
import {
  RESET_SENHA_REGEX,
  resetarSenhaAuth,
  solicitarResetSenhaAuth,
} from '../services/authApi';
import { useSafeAreaPaddingTop } from '../utils/scrollPadding';

/** Token gerado pela API-AUTH-MAIL: 8 caracteres hexadecimais. */
const TOKEN_LEN_API = 8;
/** Fluxo offline / sem URL de auth: mantém 6 dígitos como antes. */
const TOKEN_LEN_MOCK = 6;

type Etapa = 'email' | 'token' | 'novaSenha';

type Props = {
  onBack: () => void;
  onSuccess: () => void;
};

export function EsqueciSenhaScreen({ onBack, onSuccess }: Props) {
  const headerPaddingTop = useSafeAreaPaddingTop(16);
  const headerStyle = [styles.header, { paddingTop: headerPaddingTop, paddingBottom: 24 }];
  const [etapa, setEtapa] = useState<Etapa>('email');
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmaSenha, setConfirmaSenha] = useState('');
  const [enviandoEmail, setEnviandoEmail] = useState(false);
  const [salvandoSenha, setSalvandoSenha] = useState(false);

  const apiAuthOn = !!getLoginApiBaseUrl();

  const handleEnviarEmail = async () => {
    if (apiAuthOn) {
      try {
        setEnviandoEmail(true);
        const result = await solicitarResetSenhaAuth(email.trim());
        if (!result.ok) {
          Alert.alert('Erro', result.error);
          return;
        }
        Alert.alert(
          'E-mail enviado',
          'Confira sua caixa de entrada (e spam). O código tem 8 caracteres e expira em 5 minutos.',
        );
      } finally {
        setEnviandoEmail(false);
      }
    }
    setEtapa('token');
  };

  const handleReenviar = async () => {
    if (!apiAuthOn) {
      Alert.alert('Reenviar', 'No momento nao foi possivel reenviar o codigo.');
      return;
    }
    try {
      setEnviandoEmail(true);
      const result = await solicitarResetSenhaAuth(email.trim());
      if (!result.ok) {
        Alert.alert('Erro', result.error);
        return;
      }
      Alert.alert('Enviado', 'Um novo código foi solicitado. Verifique seu e-mail.');
    } finally {
      setEnviandoEmail(false);
    }
  };

  const handleValidarToken = () => setEtapa('novaSenha');

  const handleRedefinirSenha = async () => {
    if (apiAuthOn) {
      try {
        setSalvandoSenha(true);
        const result = await resetarSenhaAuth(token, novaSenha, confirmaSenha);
        if (!result.ok) {
          Alert.alert('Erro', result.error);
          return;
        }
        Alert.alert('Senha alterada', 'Você já pode fazer login com a nova senha.', [
          { text: 'OK', onPress: onSuccess },
        ]);
      } finally {
        setSalvandoSenha(false);
      }
      return;
    }

    onSuccess();
  };

  const senhasDiferentes = novaSenha && confirmaSenha && novaSenha !== confirmaSenha;
  const senhaValidaApi = RESET_SENHA_REGEX.test(novaSenha);
  const tokenCompleto = apiAuthOn ? token.length === TOKEN_LEN_API : token.length === TOKEN_LEN_MOCK;

  const podeRedefinirApi =
    novaSenha &&
    confirmaSenha &&
    !senhasDiferentes &&
    senhaValidaApi &&
    tokenCompleto;
  const podeRedefinirMock =
    novaSenha && confirmaSenha && !senhasDiferentes && novaSenha.length >= 6 && tokenCompleto;
  const podeRedefinir = apiAuthOn ? podeRedefinirApi : podeRedefinirMock;

  const setTokenFiltrado = (t: string) => {
    if (apiAuthOn) {
      setToken(t.replace(/[^0-9a-fA-F]/g, '').slice(0, TOKEN_LEN_API));
    } else {
      setToken(t.replace(/\D/g, '').slice(0, TOKEN_LEN_MOCK));
    }
  };

  // Etapa 1: Email
  if (etapa === 'email') {
    return (
      <LinearGradient colors={['#6EDDD6', '#0E6F73']} style={styles.container}>
        <Pressable onPress={onBack} style={headerStyle}>
          <MaterialCommunityIcons name="arrow-left" size={22} color="#fff" />
          <Text style={styles.headerText}>Voltar</Text>
        </Pressable>
        <View style={styles.content}>
          <View style={styles.logoWrap}>
            <View style={styles.logoCircle}>
              <Image source={logoImage} style={styles.logoImage} />
            </View>
            <Text style={styles.title}>Recuperar Senha</Text>
            <Text style={styles.subtitle}>Digite seu e-mail para receber o código de recuperação</Text>
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>E-mail cadastrado</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="seu@email.com"
              placeholderTextColor="rgba(255,255,255,0.5)"
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
            />
          </View>
          <Pressable onPress={handleEnviarEmail} disabled={!email || enviandoEmail} style={[styles.button, (!email || enviandoEmail) && styles.buttonDisabled]}>
            {enviandoEmail ? (
              <ActivityIndicator color="#0E6F73" />
            ) : (
              <Text style={styles.buttonText}>Enviar Código</Text>
            )}
          </Pressable>
          <Pressable onPress={onBack} style={styles.linkWrap}>
            <Text>
              <Text style={styles.linkText}>Lembrou sua senha? </Text>
              <Text style={styles.linkBold}>Fazer login</Text>
            </Text>
          </Pressable>
        </View>
      </LinearGradient>
    );
  }

  // Etapa 2: Token
  if (etapa === 'token') {
    return (
      <LinearGradient colors={['#6EDDD6', '#0E6F73']} style={styles.container}>
        <Pressable onPress={() => setEtapa('email')} style={headerStyle}>
          <MaterialCommunityIcons name="arrow-left" size={22} color="#fff" />
          <Text style={styles.headerText}>Voltar</Text>
        </Pressable>
        <View style={styles.content}>
          <View style={styles.iconCircle}>
            <MaterialCommunityIcons name="email-outline" size={40} color="#0E6F73" />
          </View>
          <Text style={styles.title}>Código enviado</Text>
          <Text style={styles.subtitle}>Digite o código enviado para</Text>
          <Text style={styles.emailDestino}>{email}</Text>
          <View style={styles.field}>
            <Text style={styles.label}>Código de verificação</Text>
            <TextInput
              value={token}
              onChangeText={setTokenFiltrado}
              placeholder={apiAuthOn ? Array(TOKEN_LEN_API).fill('0').join('') : '000000'}
              placeholderTextColor="rgba(255,255,255,0.5)"
              autoCapitalize={apiAuthOn ? 'characters' : 'none'}
              autoCorrect={false}
              keyboardType={apiAuthOn ? 'default' : 'number-pad'}
              maxLength={apiAuthOn ? TOKEN_LEN_API : TOKEN_LEN_MOCK}
              style={[styles.input, styles.tokenInput]}
            />
          </View>
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>⏱️ O código expira em 5 minutos</Text>
          </View>
          <Pressable
            onPress={handleValidarToken}
            disabled={!tokenCompleto}
            style={[styles.button, !tokenCompleto && styles.buttonDisabled]}
          >
            <Text style={styles.buttonText}>Continuar</Text>
          </Pressable>
          <Pressable onPress={handleReenviar} disabled={enviandoEmail} style={styles.linkWrap}>
            <Text style={styles.linkText}>Não recebeu o código? </Text>
            <Text style={styles.linkBold}>{enviandoEmail ? 'Enviando…' : 'Reenviar'}</Text>
          </Pressable>
        </View>
      </LinearGradient>
    );
  }

  // Etapa 3: Nova Senha
  return (
    <LinearGradient colors={['#6EDDD6', '#0E6F73']} style={styles.container}>
      <Pressable onPress={() => setEtapa('token')} style={headerStyle}>
        <MaterialCommunityIcons name="arrow-left" size={22} color="#fff" />
        <Text style={styles.headerText}>Voltar</Text>
      </Pressable>
      <KeyboardAvoidingView
        style={styles.flex1}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 24 : 0}
      >
        <ScrollView
          style={styles.flex1}
          contentContainerStyle={styles.contentScroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.iconCircle}>
            <MaterialCommunityIcons name="lock-outline" size={40} color="#0E6F73" />
          </View>
          <Text style={styles.title}>Nova Senha</Text>
          <Text style={styles.subtitle}>Crie uma senha forte para sua conta</Text>
          <View style={styles.field}>
            <Text style={styles.label}>Nova senha</Text>
            <TextInput
              value={novaSenha}
              onChangeText={setNovaSenha}
              placeholder="••••••••"
              placeholderTextColor="rgba(255,255,255,0.5)"
              secureTextEntry
              textContentType="password"
              autoComplete="password-new"
              style={styles.inputSenha}
            />
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>Confirmar senha</Text>
            <TextInput
              value={confirmaSenha}
              onChangeText={setConfirmaSenha}
              placeholder="••••••••"
              placeholderTextColor="rgba(255,255,255,0.5)"
              secureTextEntry
              textContentType="newPassword"
              autoComplete="password-new"
              style={styles.inputSenha}
            />
          </View>
          {senhasDiferentes && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>⚠️ As senhas não coincidem</Text>
            </View>
          )}
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              {apiAuthOn
                ? '✓ Mínimo 8 caracteres: maiúscula, minúscula, número e símbolo (@ # $ % ^ & + =)'
                : '✓ Minimo de 6 caracteres'}
            </Text>
          </View>
          <Pressable
            onPress={handleRedefinirSenha}
            disabled={!podeRedefinir || salvandoSenha}
            style={[styles.button, (!podeRedefinir || salvandoSenha) && styles.buttonDisabled]}
          >
            {salvandoSenha ? (
              <ActivityIndicator color="#0E6F73" />
            ) : (
              <Text style={styles.buttonText}>Redefinir Senha</Text>
            )}
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex1: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 20 },
  headerText: { color: '#fff', fontSize: 16 },
  content: { flex: 1, paddingHorizontal: 20, paddingTop: 24 },
  contentScroll: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 40 },
  logoWrap: { alignItems: 'center', marginBottom: 32 },
  logoCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  logoImage: { width: 120, height: 120, resizeMode: 'contain' },
  logoText: { fontSize: 28, color: '#fff', fontWeight: 'bold' },
  iconCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginBottom: 16 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#fff', textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#CCF5F2', textAlign: 'center', marginBottom: 4 },
  emailDestino: { fontSize: 16, fontWeight: '600', color: '#fff', textAlign: 'center', marginBottom: 24 },
  field: { backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 16, padding: 16, marginBottom: 12 },
  label: { color: '#fff', fontSize: 12, marginBottom: 8 },
  input: { color: '#fff', fontSize: 16 },
  inputSenha: { color: '#fff', fontSize: 16, minHeight: 48, paddingVertical: 12 },
  tokenInput: { fontSize: 22, fontWeight: 'bold', letterSpacing: 4 },
  infoBox: { backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 16, padding: 16, marginBottom: 12 },
  infoText: { color: 'rgba(255,255,255,0.9)', fontSize: 14 },
  errorBox: { backgroundColor: 'rgba(220,38,38,0.3)', borderRadius: 16, padding: 16, marginBottom: 12 },
  errorText: { color: '#fff', fontSize: 14, textAlign: 'center' },
  button: { backgroundColor: '#fff', borderRadius: 16, paddingVertical: 16, alignItems: 'center', marginTop: 8 },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: '#0E6F73', fontWeight: '600', fontSize: 16 },
  linkWrap: { alignItems: 'center', marginTop: 24 },
  linkText: { color: 'rgba(255,255,255,0.7)', fontSize: 14 },
  linkBold: { color: '#fff', fontWeight: '600', fontSize: 14 },
});
