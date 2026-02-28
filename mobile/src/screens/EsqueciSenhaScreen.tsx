import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type Etapa = 'email' | 'token' | 'novaSenha';

type Props = {
  onBack: () => void;
  onSuccess: () => void;
};

export function EsqueciSenhaScreen({ onBack, onSuccess }: Props) {
  const [etapa, setEtapa] = useState<Etapa>('email');
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmaSenha, setConfirmaSenha] = useState('');

  const handleEnviarEmail = () => setEtapa('token');
  const handleValidarToken = () => setEtapa('novaSenha');
  const handleRedefinirSenha = () => onSuccess();

  const senhasDiferentes = novaSenha && confirmaSenha && novaSenha !== confirmaSenha;
  const podeRedefinir = novaSenha && confirmaSenha && !senhasDiferentes && novaSenha.length >= 6;

  // Etapa 1: Email
  if (etapa === 'email') {
    return (
      <View style={styles.container}>
        <Pressable onPress={onBack} style={styles.header}>
          <MaterialCommunityIcons name="arrow-left" size={22} color="#fff" />
          <Text style={styles.headerText}>Voltar</Text>
        </Pressable>
        <View style={styles.content}>
          <View style={styles.logoWrap}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoText}>SF</Text>
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
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>💡 Enviaremos um código de 6 dígitos para você redefinir sua senha.</Text>
          </View>
          <Pressable onPress={handleEnviarEmail} disabled={!email} style={[styles.button, !email && styles.buttonDisabled]}>
            <Text style={styles.buttonText}>Enviar Código</Text>
          </Pressable>
          <Pressable onPress={onBack} style={styles.linkWrap}>
            <Text><Text style={styles.linkText}>Lembrou sua senha? </Text><Text style={styles.linkBold}>Fazer login</Text></Text>
          </Pressable>
        </View>
      </View>
    );
  }

  // Etapa 2: Token
  if (etapa === 'token') {
    return (
      <View style={styles.container}>
        <Pressable onPress={() => setEtapa('email')} style={styles.header}>
          <MaterialCommunityIcons name="arrow-left" size={22} color="#fff" />
          <Text style={styles.headerText}>Voltar</Text>
        </Pressable>
        <View style={styles.content}>
          <View style={styles.iconCircle}>
            <MaterialCommunityIcons name="email-outline" size={40} color="#0E6F73" />
          </View>
          <Text style={styles.title}>Código Enviado</Text>
          <Text style={styles.subtitle}>Digite o código de 6 dígitos enviado para</Text>
          <Text style={styles.emailDestino}>{email}</Text>
          <View style={styles.field}>
            <Text style={styles.label}>Código de verificação</Text>
            <TextInput
              value={token}
              onChangeText={(t) => setToken(t.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              placeholderTextColor="rgba(255,255,255,0.5)"
              keyboardType="number-pad"
              maxLength={6}
              style={[styles.input, styles.tokenInput]}
            />
          </View>
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>⏱️ O código expira em 10 minutos</Text>
          </View>
          <Pressable onPress={handleValidarToken} disabled={token.length !== 6} style={[styles.button, token.length !== 6 && styles.buttonDisabled]}>
            <Text style={styles.buttonText}>Validar Código</Text>
          </Pressable>
          <Pressable onPress={() => setEtapa('email')} style={styles.linkWrap}>
            <Text style={styles.linkText}>Não recebeu o código? </Text>
            <Text style={styles.linkBold}>Reenviar</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  // Etapa 3: Nova Senha
  return (
    <View style={styles.container}>
      <Pressable onPress={() => setEtapa('token')} style={styles.header}>
        <MaterialCommunityIcons name="arrow-left" size={22} color="#fff" />
        <Text style={styles.headerText}>Voltar</Text>
      </Pressable>
      <View style={styles.content}>
        <View style={styles.iconCircle}>
          <MaterialCommunityIcons name="lock-outline" size={40} color="#0E6F73" />
        </View>
        <Text style={styles.title}>Nova Senha</Text>
        <Text style={styles.subtitle}>Crie uma senha forte para sua conta</Text>
        <View style={styles.field}>
          <Text style={styles.label}>Nova senha</Text>
          <TextInput value={novaSenha} onChangeText={setNovaSenha} placeholder="••••••••" placeholderTextColor="rgba(255,255,255,0.5)" secureTextEntry style={styles.input} />
        </View>
        <View style={styles.field}>
          <Text style={styles.label}>Confirmar senha</Text>
          <TextInput value={confirmaSenha} onChangeText={setConfirmaSenha} placeholder="••••••••" placeholderTextColor="rgba(255,255,255,0.5)" secureTextEntry style={styles.input} />
        </View>
        {senhasDiferentes && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>⚠️ As senhas não coincidem</Text>
          </View>
        )}
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>✓ Mínimo de 6 caracteres</Text>
        </View>
        <Pressable onPress={handleRedefinirSenha} disabled={!podeRedefinir} style={[styles.button, !podeRedefinir && styles.buttonDisabled]}>
          <Text style={styles.buttonText}>Redefinir Senha</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0E6F73' },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 20, paddingVertical: 24 },
  headerText: { color: '#fff', fontSize: 16 },
  content: { flex: 1, paddingHorizontal: 20, paddingTop: 24 },
  logoWrap: { alignItems: 'center', marginBottom: 32 },
  logoCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  logoText: { fontSize: 28, color: '#fff', fontWeight: 'bold' },
  iconCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginBottom: 16 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#fff', textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#CCF5F2', textAlign: 'center', marginBottom: 4 },
  emailDestino: { fontSize: 16, fontWeight: '600', color: '#fff', textAlign: 'center', marginBottom: 24 },
  field: { backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 16, padding: 16, marginBottom: 12 },
  label: { color: '#fff', fontSize: 12, marginBottom: 8 },
  input: { color: '#fff', fontSize: 16 },
  tokenInput: { fontSize: 24, fontWeight: 'bold', letterSpacing: 8 },
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
