import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type Props = {
  onLogin: (email: string, senha: string) => Promise<{ success: boolean; error?: string }>;
  onEsqueciSenha?: () => void;
};

export function LoginScreen({ onLogin, onEsqueciSenha }: Props) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [senhaVisivel, setSenhaVisivel] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');

  const handleLogin = async () => {
    if (!email.trim() || !senha.trim()) {
      setErro('Preencha o e-mail e a senha.');
      return;
    }
    setErro('');
    setCarregando(true);
    const resultado = await onLogin(email, senha);
    setCarregando(false);
    if (!resultado.success) {
      setErro(resultado.error ?? 'Erro ao realizar login.');
    }
  };

  return (
    <LinearGradient colors={['#6EDDD6', '#0E6F73']} style={styles.container}>
      <View style={styles.card}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>SF</Text>
          </View>
          <Text style={styles.title}>SoftWave Finance</Text>
          <Text style={styles.subtitle}>Gestão financeira para advocacia</Text>
        </View>

        {/* Campo e-mail */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>E-mail</Text>
          <TextInput
            value={email}
            onChangeText={(v) => { setEmail(v); setErro(''); }}
            placeholder="seu@email.com"
            placeholderTextColor="rgba(255,255,255,0.5)"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            style={styles.input}
          />
        </View>

        {/* Campo senha */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Senha</Text>
          <View style={styles.senhaRow}>
            <TextInput
              value={senha}
              onChangeText={(v) => { setSenha(v); setErro(''); }}
              placeholder="••••••••"
              placeholderTextColor="rgba(255,255,255,0.5)"
              secureTextEntry={!senhaVisivel}
              style={[styles.input, styles.senhaInput]}
            />
            <Pressable onPress={() => setSenhaVisivel((v) => !v)} style={styles.senhaOlho}>
              <MaterialCommunityIcons
                name={senhaVisivel ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color="rgba(255,255,255,0.7)"
              />
            </Pressable>
          </View>
        </View>

        {/* Mensagem de erro */}
        {erro ? (
          <View style={styles.erroBox}>
            <MaterialCommunityIcons name="alert-circle-outline" size={16} color="#fca5a5" />
            <Text style={styles.erroText}>{erro}</Text>
          </View>
        ) : null}

        {/* Botão Entrar */}
        <Pressable
          onPress={handleLogin}
          style={[styles.button, carregando && styles.buttonLoading]}
          disabled={carregando}
        >
          {carregando ? (
            <ActivityIndicator color="#0E6F73" />
          ) : (
            <Text style={styles.buttonText}>Entrar</Text>
          )}
        </Pressable>

        {/* Esqueci minha senha */}
        <Pressable onPress={onEsqueciSenha} style={styles.linkContainer}>
          <Text style={styles.linkText}>Esqueci minha senha</Text>
        </Pressable>

        {/* Hint de credenciais (remover em produção) */}
        <View style={styles.hintBox}>
          <Text style={styles.hintTitle}>Credenciais de teste</Text>
          <Text style={styles.hintText}>Advogado: advogado@softwave.com</Text>
          <Text style={styles.hintText}>Cliente:    cliente@softwave.com</Text>
          <Text style={styles.hintText}>Senha:      123456</Text>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  card: {
    width: '100%',
    maxWidth: 360,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  logoText: {
    fontSize: 30,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#CCF5F2',
  },
  fieldContainer: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 12,
  },
  label: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 11,
    marginBottom: 4,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  input: {
    color: '#FFFFFF',
    fontSize: 15,
  },
  senhaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  senhaInput: {
    flex: 1,
  },
  senhaOlho: {
    paddingLeft: 8,
  },
  erroBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(239,68,68,0.2)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 10,
  },
  erroText: {
    color: '#fca5a5',
    fontSize: 13,
    flex: 1,
  },
  button: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 4,
  },
  buttonLoading: {
    opacity: 0.85,
  },
  buttonText: {
    color: '#0E6F73',
    fontWeight: '700',
    fontSize: 16,
  },
  linkContainer: {
    alignItems: 'center',
    marginTop: 16,
  },
  linkText: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 14,
  },
  hintBox: {
    marginTop: 32,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.15)',
    paddingTop: 16,
    gap: 3,
  },
  hintTitle: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  hintText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 11,
    fontFamily: 'monospace',
  },
});
