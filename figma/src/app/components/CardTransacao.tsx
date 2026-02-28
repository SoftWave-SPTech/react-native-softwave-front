import { LucideIcon } from 'lucide-react';
import { TagStatus } from './TagStatus';

interface CardTransacaoProps {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  value: string;
  type: 'receita' | 'despesa';
  status: 'pago' | 'pendente' | 'atrasado' | 'em-dia';
  onClick?: () => void;
  transacaoId?: string;
}

export function CardTransacao({ icon: Icon, title, subtitle, value, type, status, onClick, transacaoId }: CardTransacaoProps) {
  return (
    <div 
      className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-3 cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
    >
      <div className={`p-3 rounded-full ${type === 'receita' ? 'bg-green-100' : 'bg-red-100'}`}>
        <Icon className={`w-5 h-5 ${type === 'receita' ? 'text-green-600' : 'text-red-600'}`} />
      </div>
      <div className="flex-1">
        <p className="font-medium text-gray-900">{title}</p>
        <p className="text-sm text-gray-500">{subtitle}</p>
      </div>
      <div className="text-right">
        <p className={`font-semibold ${type === 'receita' ? 'text-green-600' : 'text-red-600'}`}>
          {type === 'receita' ? '+' : '-'} {value}
        </p>
        <div className="mt-1">
          <TagStatus status={status} />
        </div>
      </div>
    </div>
  );
}