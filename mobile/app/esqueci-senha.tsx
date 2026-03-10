import { useRouter } from 'expo-router';
import { EsqueciSenhaScreen } from '../src/screens/EsqueciSenhaScreen';

export default function EsqueciSenhaPage() {
  const router = useRouter();
  return (
    <EsqueciSenhaScreen
      onBack={() => router.back()}
      onSuccess={() => router.replace('/home')}
    />
  );
}
