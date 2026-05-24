import { useRouter } from 'expo-router';
import { LocaisSegurosScreen } from '../src/screens/LocaisSegurosScreen';

export default function LocaisSegurosPage() {
  const router = useRouter();
  return <LocaisSegurosScreen onBack={() => router.back()} />;
}
