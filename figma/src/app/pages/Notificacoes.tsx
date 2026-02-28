import { useState } from 'react';
import { Header } from '../components/Header';
import { BottomNav } from '../components/BottomNav';
import { 
  DollarSign,
  AlertCircle,
  CheckCircle,
  Clock,
  TrendingUp,
  FileText
} from 'lucide-react';

interface Notificacao {
  id: number;
  tipo: 'pagamento' | 'alerta' | 'sucesso' | 'lembrete' | 'insight';
  titulo: string;
  mensagem: string;
  data: string;
  lida: boolean;
}

export function Notificacoes() {
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([
    {
      id: 1,
      tipo: 'pagamento',
      titulo: 'Novo pagamento recebido',
      mensagem: 'João Silva realizou o pagamento de R$ 5.000,00',
      data: 'Há 2 horas',
      lida: false
    },
    {
      id: 2,
      tipo: 'alerta',
      titulo: 'Pagamento pendente',
      mensagem: 'Honorários de Maria Santos vence amanhã',
      data: 'Há 4 horas',
      lida: false
    },
    {
      id: 3,
      tipo: 'insight',
      titulo: 'Insight de IA',
      mensagem: 'Sua receita cresceu 15% este mês em comparação ao anterior',
      data: 'Há 6 horas',
      lida: false
    },
    {
      id: 4,
      tipo: 'sucesso',
      titulo: 'Pagamento confirmado',
      mensagem: 'Comprovante aprovado para o processo #1234',
      data: 'Ontem',
      lida: true
    },
    {
      id: 5,
      tipo: 'lembrete',
      titulo: 'Relatório mensal disponível',
      mensagem: 'O relatório financeiro de fevereiro está pronto',
      data: 'Ontem',
      lida: true
    },
    {
      id: 6,
      tipo: 'alerta',
      titulo: 'Pagamento atrasado',
      mensagem: 'Carlos Oliveira possui R$ 3.200,00 em atraso',
      data: '2 dias atrás',
      lida: true
    },
    {
      id: 7,
      tipo: 'pagamento',
      titulo: 'Pagamento recebido',
      mensagem: 'Ana Costa pagou R$ 2.500,00 de honorários',
      data: '3 dias atrás',
      lida: true
    }
  ]);

  const marcarComoLida = (id: number) => {
    setNotificacoes(notificacoes.map(n => 
      n.id === id ? { ...n, lida: true } : n
    ));
  };

  const marcarTodasComoLidas = () => {
    setNotificacoes(notificacoes.map(n => ({ ...n, lida: true })));
  };

  const getIconeETipo = (tipo: string) => {
    switch (tipo) {
      case 'pagamento':
        return { Icone: DollarSign, cor: 'bg-green-100 text-green-600' };
      case 'alerta':
        return { Icone: AlertCircle, cor: 'bg-red-100 text-red-600' };
      case 'sucesso':
        return { Icone: CheckCircle, cor: 'bg-blue-100 text-blue-600' };
      case 'lembrete':
        return { Icone: Clock, cor: 'bg-amber-100 text-amber-600' };
      case 'insight':
        return { Icone: TrendingUp, cor: 'bg-purple-100 text-purple-600' };
      default:
        return { Icone: FileText, cor: 'bg-gray-100 text-gray-600' };
    }
  };

  const naoLidas = notificacoes.filter(n => !n.lida).length;

  return (
    <div className="h-full bg-gray-50 overflow-y-auto">
      <Header title="Notificações" showBack />
      
      <div className="px-5 py-4 space-y-4">
        {/* Header com contagem */}
        {naoLidas > 0 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              {naoLidas} {naoLidas === 1 ? 'notificação não lida' : 'notificações não lidas'}
            </p>
            <button
              onClick={marcarTodasComoLidas}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Marcar todas como lidas
            </button>
          </div>
        )}

        {/* Lista de Notificações */}
        <div className="space-y-3">
          {notificacoes.map((notificacao) => {
            const { Icone, cor } = getIconeETipo(notificacao.tipo);
            
            return (
              <div
                key={notificacao.id}
                onClick={() => marcarComoLida(notificacao.id)}
                className={`bg-white rounded-2xl p-4 shadow-sm cursor-pointer transition-all hover:shadow-md ${
                  !notificacao.lida ? 'border-l-4 border-blue-500' : ''
                }`}
              >
                <div className="flex gap-3">
                  <div className={`p-2 rounded-lg ${cor} flex-shrink-0`}>
                    <Icone className="w-5 h-5" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className={`font-semibold text-gray-900 ${!notificacao.lida ? 'font-bold' : ''}`}>
                        {notificacao.titulo}
                      </h3>
                      {!notificacao.lida && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1.5" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{notificacao.mensagem}</p>
                    <p className="text-xs text-gray-500">{notificacao.data}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {notificacoes.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Nenhuma notificação</h3>
            <p className="text-sm text-gray-600">Você está em dia com tudo!</p>
          </div>
        )}

        <div className="h-20"></div>
      </div>

      <BottomNav />
    </div>
  );
}
