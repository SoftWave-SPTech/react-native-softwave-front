import { Header } from '../components/Header';
import { Bell, DollarSign, CheckCircle, AlertCircle, FileText } from 'lucide-react';

export function ClienteNotificacoes() {
  const notificacoes = [
    {
      id: 1,
      tipo: 'pagamento',
      titulo: 'Pagamento confirmado',
      mensagem: 'Seu pagamento de R$ 6.000,00 foi confirmado',
      data: 'Hoje, 14:30',
      lida: false,
      icon: CheckCircle,
      color: 'green'
    },
    {
      id: 2,
      tipo: 'cobranca',
      titulo: 'Nova cobrança disponível',
      mensagem: 'Parcela de R$ 7.000,00 vence em 15/04/2026',
      data: 'Hoje, 09:15',
      lida: false,
      icon: DollarSign,
      color: 'blue'
    },
    {
      id: 3,
      tipo: 'vencimento',
      titulo: 'Cobrança próxima ao vencimento',
      mensagem: 'Sua parcela vence em 3 dias',
      data: 'Ontem, 10:00',
      lida: true,
      icon: AlertCircle,
      color: 'yellow'
    },
    {
      id: 4,
      tipo: 'processo',
      titulo: 'Atualização no processo',
      mensagem: 'Processo 1234/2025 teve movimentação',
      data: '23/02/2026',
      lida: true,
      icon: FileText,
      color: 'purple'
    },
  ];

  const naoLidas = notificacoes.filter(n => !n.lida).length;

  const getIconBgColor = (color: string) => {
    const colors: Record<string, string> = {
      green: 'bg-green-100',
      blue: 'bg-blue-100',
      yellow: 'bg-yellow-100',
      purple: 'bg-purple-100'
    };
    return colors[color] || 'bg-gray-100';
  };

  const getIconColor = (color: string) => {
    const colors: Record<string, string> = {
      green: 'text-green-600',
      blue: 'text-blue-600',
      yellow: 'text-yellow-600',
      purple: 'text-purple-600'
    };
    return colors[color] || 'text-gray-600';
  };

  return (
    <div className="h-full bg-gray-50 overflow-y-auto">
      <Header title="Notificações" showBack />
      
      <div className="px-5 py-4 space-y-4">
        {/* Resumo */}
        {naoLidas > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Bell className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-semibold text-blue-900">
                  {naoLidas} {naoLidas === 1 ? 'nova notificação' : 'novas notificações'}
                </p>
                <p className="text-sm text-blue-700">Toque para marcar como lida</p>
              </div>
            </div>
          </div>
        )}

        {/* Lista de Notificações */}
        <div className="space-y-3">
          {notificacoes.map((notif) => {
            const Icon = notif.icon;
            return (
              <div
                key={notif.id}
                className={`bg-white rounded-2xl p-4 transition-all ${
                  !notif.lida ? 'border-2 border-blue-200' : 'border border-gray-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-3 ${getIconBgColor(notif.color)} rounded-full flex-shrink-0`}>
                    <Icon className={`w-5 h-5 ${getIconColor(notif.color)}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className={`font-semibold text-gray-900 ${!notif.lida ? 'font-bold' : ''}`}>
                        {notif.titulo}
                      </h3>
                      {!notif.lida && (
                        <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-1.5" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{notif.mensagem}</p>
                    <p className="text-xs text-gray-500">{notif.data}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Estado Vazio */}
        {notificacoes.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500">Nenhuma notificação</p>
          </div>
        )}
      </div>
    </div>
  );
}
