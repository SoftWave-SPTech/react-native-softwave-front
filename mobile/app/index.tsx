import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { LoginScreen } from '../src/screens/LoginScreen';
import { useAuth, type UserType } from '../src/context/AuthContext';

function routeForUserType(t: UserType): '/(tabs)/home' | '/cliente' {
  return t === 'advogado' ? '/(tabs)/home' : '/cliente';
}

export default function LoginPage() {
  const router = useRouter();
  const { userType, login } = useAuth();

  useEffect(() => {
    if (userType === 'advogado' || userType === 'cliente') {
      router.replace(routeForUserType(userType));
    }
  }, [userType, router]);

  const handleLogin = async (email: string, senha: string) => {
    const r = await login(email, senha);
    if (r.success && (r.userType === 'advogado' || r.userType === 'cliente')) {
      router.replace(routeForUserType(r.userType));
    }
    return { success: r.success, error: r.error };
  };

  return (
    <LoginScreen
      onLogin={handleLogin}
      onEsqueciSenha={() => router.push('/esqueci-senha')}
    />
  );
}
