import { useRouter } from 'expo-router';
import { useNavigate } from '../src/utils/useNavigate';
import { PerfilScreen } from '../src/screens/PerfilScreen';

export default function PerfilPage() {
  const router = useRouter();
  const { navigateTo } = useNavigate();
  return (
    <PerfilScreen
      onBack={() => router.back()}
      onNavigate={navigateTo}
      onLogout={() => router.replace('/')}
    />
  );
}
