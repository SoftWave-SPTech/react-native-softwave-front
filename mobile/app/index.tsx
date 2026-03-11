import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { LoginScreen } from '../src/screens/LoginScreen';
import { useAuth } from '../src/context/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { userType, login } = useAuth();

  useEffect(() => {
    if (userType === 'advogado') {
      router.replace('/(tabs)/home');
    } else if (userType === 'cliente') {
      router.replace('/cliente');
    }
  }, [userType]);

  return (
    <LoginScreen
      onLogin={login}
      onEsqueciSenha={() => router.push('/esqueci-senha')}
    />
  );
}
