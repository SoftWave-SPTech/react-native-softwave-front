import { useRouter } from 'expo-router';
import { LoginScreen } from '../src/screens/LoginScreen';

export default function LoginPage() {
  const router = useRouter();
  return (
    <LoginScreen
      onLogin={() => router.replace('/home')}
      onEsqueciSenha={() => router.push('/esqueci-senha')}
      onClienteAcesso={() => router.push('/cliente')}
    />
  );
}
