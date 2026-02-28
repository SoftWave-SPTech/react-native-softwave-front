import { useNavigate } from 'react-router';
import { Header } from '../components/Header';
import { CardKPI } from '../components/CardKPI';
import { CardTransacao } from '../components/CardTransacao';
import { FAB } from '../components/FAB';
import { BottomNav } from '../components/BottomNav';
import { 
  TrendingUp, 
  DollarSign, 
  Clock, 
  TrendingDown,
  Briefcase,
  FileText,
  CreditCard,
  Lightbulb
} from 'lucide-react';

export function Home() {
  const navigate = useNavigate();

  return (
    <div className="h-full bg-gray-50 overflow-y-auto">
      <Header showNotification showAvatar />
      
      <div className="px-5 py-4 space-y-4"> 
        {/* Hero Card */}
        <div className="bg-gradient-to-br from-blue-500 to-gray-700 rounded-2xl p-6 text-white">
          <p className="text-blue-100 text-sm mb-2">Valor disponível</p>
          <h2 className="text-3xl font-bold mb-4">R$ 145.280,00</h2>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm">Lucro líquido do mês: R$ 42.500,00</span>
          </div>
        </div>

        {/* KPIs Grid */}
        <div className="grid grid-cols-2 gap-4">
          <CardKPI
            icon={DollarSign}
            title="Receita Mensal"
            value="R$ 85.400"
            variation="+12%"
            variationType="positive"
          />
          <CardKPI
            icon={Clock}
            title="Pendentes"
            value="R$ 28.300"
            variation="-5%"
            variationType="positive"
          />
          <CardKPI
            icon={TrendingDown}
            title="Despesa Mensal"
            value="R$ 42.900"
            variation="+8%"
            variationType="negative"
          />
          <CardKPI
            icon={TrendingUp}
            title="Lucro Líquido"
            value="R$ 42.500"
            variation="+15%"
            variationType="positive"
          />
        </div>

        {/* Insights IA */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Lightbulb className="w-5 h-5 text-amber-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-1">Insights Inteligentes</h3>
              <p className="text-sm text-gray-600 mb-2">60% da receita vem de 2 clientes principais</p>
              <p className="text-sm text-gray-600 mb-3">Você possui R$ 40.000 a receber nos próximos 30 dias</p>
              <button
                onClick={() => navigate('/assistente-ia')}
                className="text-sm text-amber-700 font-medium hover:text-amber-800 flex items-center gap-1"
              >
                Ver Assistente IA
                <span className="text-lg">→</span>
              </button>
            </div>
          </div>
        </div>

        {/* Transações Recentes */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900">Transações Recentes</h3>
            <button 
              onClick={() => navigate('/transacoes')}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              Ver todas
            </button>
          </div>
          <div className="space-y-3">
            <CardTransacao
              icon={Briefcase}
              title="Honorários - Processo 1234"
              subtitle="João Silva"
              value="R$ 5.000,00"
              type="receita"
              status="pago"
              onClick={() => navigate('/transacao/1')}
            />
            <CardTransacao
              icon={FileText}
              title="Custas Judiciais"
              subtitle="Processo 5678"
              value="R$ 850,00"
              type="despesa"
              status="pendente"
              onClick={() => navigate('/transacao/2')}
            />
            <CardTransacao
              icon={CreditCard}
              title="Honorários - Consultoria"
              subtitle="Maria Santos"
              value="R$ 3.200,00"
              type="receita"
              status="atrasado"
              onClick={() => navigate('/transacao/3')}
            />
          </div>
        </div>

        {/* Ações Rápidas */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-3">Ações Rápidas</h3>
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={() => navigate('/honorarios')}
              className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow text-left"
            >
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-2">
                <Briefcase className="w-5 h-5 text-blue-600" />
              </div>
              <p className="font-medium text-gray-900 text-sm">Honorários</p>
            </button>
            <button 
              onClick={() => navigate('/relatorios')}
              className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow text-left"
            >
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <p className="font-medium text-gray-900 text-sm">Relatórios</p>
            </button>
            <button 
              onClick={() => navigate('/pagamentos-conferir')}
              className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow text-left relative"
            >
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center mb-2">
                <FileText className="w-5 h-5 text-amber-600" />
              </div>
              <p className="font-medium text-gray-900 text-sm">Pagamentos</p>
              <div className="absolute top-3 right-3 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                3
              </div>
            </button>
            <button 
              onClick={() => navigate('/nova-transacao')}
              className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow text-left"
            >
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-2">
                <CreditCard className="w-5 h-5 text-purple-600" />
              </div>
              <p className="font-medium text-gray-900 text-sm">Nova Transação</p>
            </button>
          </div>
        </div>

        <div className="h-20"></div>
      </div>

      <FAB onClick={() => navigate('/nova-transacao')} />
      <BottomNav />
    </div>
  );
}