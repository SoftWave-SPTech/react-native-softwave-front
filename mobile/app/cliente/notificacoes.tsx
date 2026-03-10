import { useRouter } from 'expo-router';
import { ClienteNotificacoesScreen } from '../../src/screens/ClienteNotificacoesScreen';

export default function ClienteNotificacoesPage() {
  const router = useRouter();
  return <ClienteNotificacoesScreen onBack={() => router.back()} />;
}
