import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, ActivityIndicator, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import logoImage from '../../assets/softwave-logo.png';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n/idiomas/i18n';

type Props = {
  onLogin: (email: string, senha: string) => Promise<{ success: boolean; error?: string }>;
  onEsqueciSenha?: () => void;
};

export function LoginScreen({ onLogin, onEsqueciSenha }: Props) {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [senhaVisivel, setSenhaVisivel] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');

  const handleLogin = async () => {
    if (!email.trim() || !senha.trim()) {
      setErro(t('login.requiredFields'));
      return;
    }
    setErro('');
    setCarregando(true);
    const resultado = await onLogin(email, senha);
    setCarregando(false);
    if (!resultado.success) {
      setErro(resultado.error ?? t('login.loginError'));
    }
  };

  return (
    <LinearGradient colors={['#6EDDD6', '#0E6F73']} style={styles.container}>
      <View style={styles.languageSwitcher}>
        <Pressable
          onPress={() => i18n.changeLanguage('pt')}
          style={[
            styles.languageButton,
            i18n.language === 'pt' && styles.languageButtonActive,
          ]}
        >
          <Text
            style={[
              styles.languageText,
              i18n.language === 'pt' && styles.languageTextActive,
            ]}
          >
            PT
          </Text>
        </Pressable>

        <Pressable
          onPress={() => i18n.changeLanguage('en')}
          style={[
            styles.languageButton,
            i18n.language === 'en' && styles.languageButtonActive,
          ]}
        >
          <Text
            style={[
              styles.languageText,
              i18n.language === 'en' && styles.languageTextActive,
            ]}
          >
            EN
          </Text>
        </Pressable>
      </View>
      <View style={styles.card}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <Image source={logoImage} style={styles.logoImage} />
            {/* <Text style={styles.logoText}></Text> */}
          </View>
          <Text style={styles.title}>{t('login.title')}</Text>
          <Text style={styles.subtitle}>{t('login.subtitle')}</Text>
        </View>

        {/* Campo e-mail */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>{t('login.email')}</Text>
          <TextInput
            value={email}
            onChangeText={(v) => { setEmail(v); setErro(''); }}
            placeholder={t('login.emailPlaceholder')}
            placeholderTextColor="rgba(255,255,255,0.5)"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            style={styles.input}
          />
        </View>

        {/* Campo senha */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>{t('login.password')}</Text>
          <View style={styles.senhaRow}>
            <TextInput
              value={senha}
              onChangeText={(v) => { setSenha(v); setErro(''); }}
              placeholder={t('login.passwordPlaceholder')}
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
          style={({ pressed }) => [
            styles.button,
            carregando && styles.buttonLoading,
            !carregando && pressed && styles.buttonPressed,
          ]}
          disabled={carregando}
        >
          {carregando ? (
            <ActivityIndicator color="#0E6F73" />
          ) : (
            <Text style={styles.buttonText}>{t('login.loginButton')}</Text>
          )}
        </Pressable>

        {/* Esqueci minha senha */}
        <Pressable onPress={onEsqueciSenha} style={styles.linkContainer}>
          <Text style={styles.linkText}>{t('login.forgotPassword')}</Text>
        </Pressable>

      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  languageSwitcher: {
    flexDirection: 'row',
    alignSelf: 'flex-end',
    marginBottom: 24,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 999,
    padding: 4,
  },

  languageButton: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
  },

  languageButtonActive: {
    backgroundColor: '#FFFFFF',
  },

  languageText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 12,
  },

  languageTextActive: {
    color: '#0E6F73',
  },
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
  logoImage: {
    width: 136,
    height: 136,
    resizeMode: 'contain',
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
    color: '#ccfbf1',
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
  buttonPressed: {
    backgroundColor: '#f0fdfa',
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
});
