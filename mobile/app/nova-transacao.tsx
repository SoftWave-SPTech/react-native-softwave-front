import { useRouter, useLocalSearchParams } from 'expo-router';
import { NovaTransacaoScreen, TransacaoParaEditar } from '../src/screens/NovaTransacaoScreen';

export default function NovaTransacaoPage() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    id?: string;
    tipo?: string;
    valor?: string;
    categoria?: string;
    cliente?: string;
    processoId?: string;
    processo?: string;
    data?: string;
    vencimento?: string;
    status?: string;
    descricao?: string;
  }>();

  const transacaoParaEditar: TransacaoParaEditar | undefined = params.valor
    ? {
        id: params.id ? String(params.id) : undefined,
        tipo: (params.tipo as 'receita' | 'despesa') ?? 'receita',
        valor: params.valor ?? '',
        categoria: params.categoria ?? '',
        cliente: params.cliente ?? '',
        processo: params.processo ?? '',
        processoId: params.processoId ? String(params.processoId) : undefined,
        data: params.data ?? '',
        vencimento: params.vencimento ?? '',
        status: (params.status as 'pago' | 'pendente') ?? 'pendente',
        descricao: params.descricao ?? '',
      }
    : undefined;

  return (
    <NovaTransacaoScreen
      onBack={() => router.back()}
      onSuccess={() => router.replace('/transacoes')}
      transacaoParaEditar={transacaoParaEditar}
    />
  );
}
