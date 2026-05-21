import { useRouter } from 'expo-router';
import { AjudaSuporteScreen } from '../src/screens/AjudaSuporteScreen';

export default function AjudaSuportePage() {
  const router = useRouter();
  return <AjudaSuporteScreen onBack={() => router.back()} />;
}
