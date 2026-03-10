import { useRouter } from 'expo-router';
import { useNavigate } from '../../src/utils/useNavigate';
import { ClienteCobrancasScreen } from '../../src/screens/ClienteCobrancasScreen';

export default function ClienteCobrancasPage() {
  const router = useRouter();
  const { navigateTo } = useNavigate();
  return (
    <ClienteCobrancasScreen
      onBack={() => router.back()}
      onNavigate={navigateTo}
    />
  );
}
