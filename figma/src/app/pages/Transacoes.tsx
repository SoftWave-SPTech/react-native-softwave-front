import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Header } from '../components/Header';
import { CardTransacao } from '../components/CardTransacao';
import { FAB } from '../components/FAB';
import { BottomNav } from '../components/BottomNav';
import { Search, Briefcase, FileText, CreditCard, Receipt } from 'lucide-react';

export function Transacoes() {
  const navigate = useNavigate();
  const [busca, setBusca] = useState('');
  const [tipoFiltro, setTipoFiltro] = useState<'todas' | 'receita' | 'despesa'>('todas');
  const [statusFiltro, setStatusFiltro] = useState<'todos' | 'pago' | 'pendente' | 'atrasado'>('todos');

  return (
    <div className="h-full bg-gray-50 overflow-y-auto">
      <Header title="Transações" showBack />
      
      <div className="px-5 py-4 space-y-4">
        {/* Busca */}
        <div className="bg-white rounded-2xl p-4 flex items-center gap-3">
          <Search className="w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar transação ou cliente"
            className="flex-1 outline-none text-gray-900"
          />
        </div>

        {/* Cards Resumo */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-2xl p-4">
            <p className="text-xs text-gray-500 mb-1">Total</p>
            <p className="text-lg font-semibold text-gray-900">R$ 42,5k</p>
          </div>
          <div className="bg-white rounded-2xl p-4">
            <p className="text-xs text-gray-500 mb-1">Receitas</p>
            <p className="text-lg font-semibold text-green-600">R$ 85,4k</p>
          </div>
          <div className="bg-white rounded-2xl p-4">
            <p className="text-xs text-gray-500 mb-1">Despesas</p>
            <p className="text-lg font-semibold text-red-600">R$ 42,9k</p>
          </div>
        </div>

        {/* Filtros */}
        <div className="space-y-3">
          <div>
            <p className="text-sm text-gray-600 mb-2">Tipo</p>
            <div className="flex gap-2">
              <button
                onClick={() => setTipoFiltro('todas')}
                className={`px-4 py-2 rounded-full text-sm ${
                  tipoFiltro === 'todas'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-600'
                }`}
              >
                Todas
              </button>
              <button
                onClick={() => setTipoFiltro('receita')}
                className={`px-4 py-2 rounded-full text-sm ${
                  tipoFiltro === 'receita'
                    ? 'bg-green-600 text-white'
                    : 'bg-green-100 text-gray-600'
                }`}
              >
                Receita
              </button>
              <button
                onClick={() => setTipoFiltro('despesa')}
                className={`px-4 py-2 rounded-full text-sm ${
                  tipoFiltro === 'despesa'
                    ? 'bg-red-600 text-white'
                    : 'bg-red-100 text-gray-600'
                }`}
              >
                Despesa
              </button>
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-600 mb-2">Status</p>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setStatusFiltro('todos')}
                className={`px-4 py-2 rounded-full text-sm ${
                  statusFiltro === 'todos'
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                Todos
              </button>
              <button
                onClick={() => setStatusFiltro('pago')}
                className={`px-4 py-2 rounded-full text-sm ${
                  statusFiltro === 'pago'
                    ? 'bg-green-600 text-white'
                    : 'bg-green-100 text-gray-600'
                }`}
              >
                Pago
              </button>
              <button
                onClick={() => setStatusFiltro('pendente')}
                className={`px-4 py-2 rounded-full text-sm ${
                  statusFiltro === 'pendente'
                    ? 'bg-yellow-600 text-white'
                    : 'bg-yellow-100 text-gray-600'
                }`}
              >
                Pendente
              </button>
              <button
                onClick={() => setStatusFiltro('atrasado')}
                className={`px-4 py-2 rounded-full text-sm ${
                  statusFiltro === 'atrasado'
                    ? 'bg-blue-600 text-white'
                    : 'bg-blue-100 text-gray-600'
                }`}
              >
                Em dia
              </button>
              <button
                onClick={() => setStatusFiltro('atrasado')}
                className={`px-4 py-2 rounded-full text-sm ${
                  statusFiltro === 'atrasado'
                    ? 'bg-red-600 text-white'
                    : 'bg-red-100 text-gray-600'
                }`}
              >
                Atrasado
              </button>
            </div>
          </div>
        </div>

        {/* Lista de Transações */}
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
          <CardTransacao
            icon={Receipt}
            title="Aluguel do Escritório"
            subtitle="Despesa Fixa"
            value="R$ 4.500,00"
            type="despesa"
            status="pago"
            onClick={() => navigate('/transacao/4')}
          />
          <CardTransacao
            icon={Briefcase}
            title="Honorários - Processo 9012"
            subtitle="Carlos Oliveira"
            value="R$ 8.000,00"
            type="receita"
            status="em-dia"
            onClick={() => navigate('/transacao/5')}
          />
        </div>

        <div className="h-20"></div>
      </div>

      <FAB onClick={() => navigate('/nova-transacao')} />
      <BottomNav />
    </div>
  );
}