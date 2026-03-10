import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Header } from '../components/Header';
import { TagStatus } from '../components/TagStatus';
import { FileText } from 'lucide-react';

export function ClienteCobrancas() {
  const navigate = useNavigate();
  const [filtro, setFiltro] = useState<'pendentes' | 'pagas'>('pendentes');

  const cobrancas = [
    {
      id: 3,
      processo: 'Processo 1234/2025',
      valor: 'R$ 6.000,00',
      vencimento: '15/03/2026',
      status: 'pendente' as const,
      parcela: 4,
      totalParcelas: 5,
      percentualPago: 80,
      reprovado: true
    },
    {
      id: 4,
      processo: 'Processo 1234/2025',
      valor: 'R$ 7.000,00',
      vencimento: '15/04/2026',
      status: 'pendente' as const,
      parcela: 2,
      totalParcelas: 5,
      percentualPago: 40,
      reprovado: false
    },
    {
      id: 1,
      processo: 'Processo 1234/2025',
      valor: 'R$ 6.000,00',
      vencimento: '15/01/2026',
      status: 'pago' as const,
      parcela: 5,
      totalParcelas: 5,
      percentualPago: 100,
      reprovado: false
    },
    {
      id: 2,
      processo: 'Processo 1234/2025',
      valor: 'R$ 6.000,00',
      vencimento: '15/02/2026',
      status: 'pago' as const,
      parcela: 5,
      totalParcelas: 5,
      percentualPago: 100,
      reprovado: false
    },
  ];

  const cobrancasFiltradas = cobrancas.filter(c => 
    filtro === 'pendentes' ? c.status === 'pendente' : c.status === 'pago'
  );

  return (
    <div className="h-full bg-gray-50 overflow-y-auto">
      <Header title="Minhas Cobranças" showBack />
      
      <div className="px-5 py-4 space-y-4">
        {/* Filtros */}
        <div className="flex gap-2 bg-white rounded-2xl p-1">
          <button
            onClick={() => setFiltro('pendentes')}
            className={`flex-1 py-2 rounded-xl font-medium text-sm transition-colors ${
              filtro === 'pendentes'
                ? 'bg-yellow-500 text-white'
                : 'text-gray-600'
            }`}
          >
            Pendentes
          </button>
          <button
            onClick={() => setFiltro('pagas')}
            className={`flex-1 py-2 rounded-xl font-medium text-sm transition-colors ${
              filtro === 'pagas'
                ? 'bg-green-500 text-white'
                : 'text-gray-600'
            }`}
          >
            Pagas
          </button>
        </div>

        {/* Lista de Cobranças */}
        <div className="space-y-3">
          {cobrancasFiltradas.map((cobranca) => (
            <div
              key={cobranca.id}
              onClick={() => navigate(`/cliente/pagamento/${cobranca.id}`)}
              className="bg-white rounded-2xl p-4 cursor-pointer hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-3">
                <div className="p-3 bg-blue-100 rounded-full">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{cobranca.processo}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        Vencimento: {cobranca.vencimento}
                      </p>
                    </div>
                    <div className="flex flex-col gap-2 items-end">
                      <TagStatus status={cobranca.status} />
                      {cobranca.reprovado && cobranca.status === 'pendente' && (
                        <span className="inline-flex items-center px-2 py-1 rounded-lg bg-red-100 text-red-700 text-xs font-medium">
                          ❌ Reprovado
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-xl font-semibold text-blue-600 mb-3">
                    {cobranca.valor}
                  </p>
                  
                  {/* Barra de Progresso */}
                  <div className="bg-gray-100 rounded-xl p-3">
                    <div className="flex justify-between text-xs mb-2">
                      <span className="text-gray-600">
                        Parcela {cobranca.parcela} de {cobranca.totalParcelas}
                      </span>
                      <span className="font-semibold text-gray-900">
                        {cobranca.percentualPago}% pago
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all" 
                        style={{ width: `${cobranca.percentualPago}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}