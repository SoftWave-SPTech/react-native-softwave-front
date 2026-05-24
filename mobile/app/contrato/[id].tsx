import { useRouter, useLocalSearchParams } from 'expo-router';
import { DetalheContratoScreen } from '../../src/screens/DetalheContratoScreen';

export default function DetalheContratoPage() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <DetalheContratoScreen
      contratoId={id ?? '1'}
      onBack={() => router.back()}
    />
  );
}
