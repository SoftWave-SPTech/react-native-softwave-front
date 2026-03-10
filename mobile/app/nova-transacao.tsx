import { useRouter } from 'expo-router';
import { NovaTransacaoScreen } from '../src/screens/NovaTransacaoScreen';

export default function NovaTransacaoPage() {
  const router = useRouter();
  return (
    <NovaTransacaoScreen
      onBack={() => router.back()}
      onSuccess={() => router.replace('/transacoes')}
    />
  );
}
