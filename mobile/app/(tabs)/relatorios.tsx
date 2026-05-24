import { useRouter } from 'expo-router';
import { useNavigate } from '../../src/utils/useNavigate';
import { RelatoriosScreen } from '../../src/screens/RelatoriosScreen';

export default function RelatoriosPage() {
  const router = useRouter();
  const { navigateTo } = useNavigate();
  return (
    <RelatoriosScreen
      onBack={() => router.back()}
      onNavigate={navigateTo}
    />
  );
}
