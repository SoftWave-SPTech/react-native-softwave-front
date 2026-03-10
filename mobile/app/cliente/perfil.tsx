import { useRouter } from 'expo-router';
import { ClientePerfilScreen } from '../../src/screens/ClientePerfilScreen';

export default function ClientePerfilPage() {
  const router = useRouter();
  return (
    <ClientePerfilScreen
      onBack={() => router.back()}
      onLogout={() => router.replace('/')}
    />
  );
}
