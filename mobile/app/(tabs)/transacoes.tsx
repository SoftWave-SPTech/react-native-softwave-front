import { useRouter } from 'expo-router';
import { useNavigate } from '../../src/utils/useNavigate';
import { TransacoesScreen } from '../../src/screens/TransacoesScreen';

export default function TransacoesPage() {
  const router = useRouter();
  const { navigateTo } = useNavigate();
  return (
    <TransacoesScreen
      onBack={() => router.back()}
      onNavigate={navigateTo}
    />
  );
}
