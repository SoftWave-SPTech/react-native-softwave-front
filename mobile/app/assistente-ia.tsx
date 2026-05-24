import { useRouter } from 'expo-router';
import { useNavigate } from '../src/utils/useNavigate';
import { AssistenteIAScreen } from '../src/screens/AssistenteIAScreen';

export default function AssistenteIAPage() {
  const router = useRouter();
  const { navigateTo } = useNavigate();
  return (
    <AssistenteIAScreen
      onBack={() => router.back()}
      onNavigate={navigateTo}
    />
  );
}
