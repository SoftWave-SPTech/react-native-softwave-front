import { useRouter } from 'expo-router';
import { useNavigate } from '../../src/utils/useNavigate';
import { PagamentosConferirScreen } from '../../src/screens/PagamentosConferirScreen';

export default function PagamentosPage() {
  const router = useRouter();
  const { navigateTo } = useNavigate();
  return (
    <PagamentosConferirScreen
      onBack={() => router.back()}
      onNavigate={navigateTo}
    />
  );
}
