import { useEffect } from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { usePathname, useRootNavigationState, useRouter } from 'expo-router';
import { LoginScreen } from '../src/screens/LoginScreen';
import { useAuth, type UserType } from '../src/context/AuthContext';

function homeHrefFor(t: UserType): '/home' | '/cliente' {
  return t === 'advogado' ? '/home' : '/cliente';
}

export default function LoginPage() {
  const router = useRouter();
  const pathname = usePathname();
  const rootState = useRootNavigationState();
  const { userType, login } = useAuth();

  // Após login: push (não replace/Redirect) — REPLACE para (tabs)/home não é aceito neste stack.
  useEffect(() => {
    if (!rootState?.key || !userType) return;
    const onLoginScreen = pathname === '/' || pathname === '/index' || pathname === '';
    if (!onLoginScreen) return;
    const href = homeHrefFor(userType);
    const t = setTimeout(() => {
      router.push(href);
    }, 0);
    return () => clearTimeout(t);
  }, [rootState?.key, userType, pathname, router]);

  const handleLogin = async (email: string, senha: string) => {
    const r = await login(email, senha);
    return { success: r.success, error: r.error };
  };

  if (userType === 'advogado' || userType === 'cliente') {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#0d9488" />
      </View>
    );
  }

  return (
    <LoginScreen
      onLogin={handleLogin}
      onEsqueciSenha={() => router.push('/esqueci-senha')}
    />
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
});
