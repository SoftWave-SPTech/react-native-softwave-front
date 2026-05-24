import type { ComponentProps } from 'react';
import type { MaterialCommunityIcons } from '@expo/vector-icons';
import type { TransacaoApi } from '../types/api';
import { formatCentavosBRL } from '../utils/money';

export type TransacaoCardModel = {
  id: string;
  icon: ComponentProps<typeof MaterialCommunityIcons>['name'];
  title: string;
  subtitle: string;
  value: string;
  type: 'receita' | 'despesa';
  status: 'pago' | 'pendente' | 'atrasado' | 'cancelado';
};

const FALLBACK_ICON: TransacaoCardModel['icon'] = 'cash';

export function mapTransacaoApiToCard(t: TransacaoApi): TransacaoCardModel {
  const icon = (t.icone || FALLBACK_ICON) as TransacaoCardModel['icon'];
  return {
    id: String(t.id),
    icon,
    title: t.titulo,
    subtitle: t.subtitulo,
    value: formatCentavosBRL(t.valor),
    type: t.tipo,
    status: t.status,
  };
}
