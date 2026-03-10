import { useRouter, useLocalSearchParams } from 'expo-router';
import { ClientePagamentoScreen } from '../../../src/screens/ClientePagamentoScreen';

export default function ClientePagamentoPage() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <ClientePagamentoScreen
      cobrancaId={id ?? '1'}
      onBack={() => router.back()}
    />
  );
}
