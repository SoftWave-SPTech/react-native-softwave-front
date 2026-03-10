import { useRouter } from 'expo-router';
import { useNavigate } from '../../src/utils/useNavigate';
import { HonorariosScreen } from '../../src/screens/HonorariosScreen';

export default function HonorariosPage() {
  const router = useRouter();
  const { navigateTo } = useNavigate();
  return (
    <HonorariosScreen
      onBack={() => router.back()}
      onNavigate={navigateTo}
    />
  );
}
