import { useRouter, useLocalSearchParams } from 'expo-router';
import { DetalheTransacaoScreen } from '../../src/screens/DetalheTransacaoScreen';

export default function DetalheTransacaoPage() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <DetalheTransacaoScreen
      transacaoId={id ?? '1'}
      onBack={() => router.back()}
      onEditar={() => router.push('/nova-transacao')}
      onEditarComDados={(p) => router.push({ pathname: '/nova-transacao', params: p })}
    />
  );
}
