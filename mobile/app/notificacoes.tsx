import { useRouter } from 'expo-router';
import { useNavigate } from '../src/utils/useNavigate';
import { NotificacoesScreen } from '../src/screens/NotificacoesScreen';

export default function NotificacoesPage() {
  const router = useRouter();
  const { navigateTo } = useNavigate();
  return (
    <NotificacoesScreen
      onBack={() => router.back()}
      onNavigate={navigateTo}
    />
  );
}
