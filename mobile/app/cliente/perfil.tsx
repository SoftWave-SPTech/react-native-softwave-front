import { useRouter } from 'expo-router';
import { ClientePerfilScreen } from '../../src/screens/ClientePerfilScreen';
import { useAuth } from '../../src/context/AuthContext';

export default function ClientePerfilPage() {
  const router = useRouter();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.replace('/');
  };

  return (
    <ClientePerfilScreen
      onBack={() => router.back()}
      onLogout={handleLogout}
    />
  );
}
