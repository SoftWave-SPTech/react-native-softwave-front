import { useRouter } from 'expo-router';
import { useNavigate } from '../../src/utils/useNavigate';
import { ClienteHomeScreen } from '../../src/screens/ClienteHomeScreen';

export default function ClienteHomePage() {
  const router = useRouter();
  const { navigateTo } = useNavigate();
  return (
    <ClienteHomeScreen
      onBack={() => router.replace('/')}
      onNavigate={navigateTo}
    />
  );
}
