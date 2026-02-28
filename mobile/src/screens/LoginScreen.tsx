import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';

type Props = {
  onLogin: () => void;
  onEsqueciSenha?: () => void;
  onClienteAcesso?: () => void;
};

export function LoginScreen({ onLogin, onEsqueciSenha, onClienteAcesso }: Props) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  const handleLogin = () => {
    onLogin();
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {/* Logo / título */}
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>SF</Text>
          </View>
          <Text style={styles.title}>SoftWave Finance</Text>
          <Text style={styles.subtitle}>Gestão financeira para advocacia</Text>
        </View>

        {/* Campo email */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="seu@email.com"
            placeholderTextColor="rgba(255,255,255,0.6)"
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
          />
        </View>

        {/* Campo senha */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Senha</Text>
          <TextInput
            value={senha}
            onChangeText={setSenha}
            placeholder="••••••••"
            placeholderTextColor="rgba(255,255,255,0.6)"
            secureTextEntry
            style={styles.input}
          />
        </View>

        {/* Botão entrar */}
        <Pressable onPress={handleLogin} style={styles.button}>
          <Text style={styles.buttonText}>Entrar</Text>
        </Pressable>

        {/* Link esqueci senha */}
        <Pressable onPress={onEsqueciSenha ?? (() => {})} style={styles.linkContainer}>
          <Text style={styles.linkText}>Esqueci minha senha</Text>
        </Pressable>

        {/* Acesso Cliente */}
        {onClienteAcesso && (
          <Pressable onPress={onClienteAcesso} style={[styles.linkContainer, styles.clienteLink]}>
            <Text style={styles.linkText}>Acesso para Cliente →</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0E6F73',
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
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  logoText: {
    fontSize: 32,
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
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
  },
  label: {
    color: '#FFFFFF',
    fontSize: 12,
    marginBottom: 4,
  },
  input: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  button: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#0E6F73',
    fontWeight: '600',
    fontSize: 16,
  },
  linkContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
  linkText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
  },
  clienteLink: {
    marginTop: 24,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
  },
});