import { useRouter } from 'expo-router';
import { useNavigate } from '../src/utils/useNavigate';
import { PerfilScreen } from '../src/screens/PerfilScreen';
import { useAuth } from '../src/context/AuthContext';

export default function PerfilPage() {
  const router = useRouter();
  const { navigateTo } = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.replace('/');
  };

  return (
    <PerfilScreen
      onBack={() => router.back()}
      onNavigate={navigateTo}
      onLogout={handleLogout}
    />
  );
}
