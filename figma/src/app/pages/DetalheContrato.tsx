import { useNavigate, useParams } from 'react-router';
import { Header } from '../components/Header';
import { TagStatus } from '../components/TagStatus';
import { Check, Send } from 'lucide-react';

export function DetalheContrato() {
  const navigate = useNavigate();
  const { id } = useParams();

  const parcelas = [
    { numero: 1, valor: 'R$ 6.000,00', vencimento: '15/01/2026', status: 'pago' as const },
    { numero: 2, valor: 'R$ 6.000,00', vencimento: '15/02/2026', status: 'pago' as const },
    { numero: 3, valor: 'R$ 6.000,00', vencimento: '15/03/2026', status: 'pendente' as const },
    { numero: 4, valor: 'R$ 7.000,00', vencimento: '15/04/2026', status: 'pendente' as const }
  ];

  return (
    <div className="h-full bg-gray-50 overflow-y-auto">
      <Header title="Detalhe do Contrato" showBack />
      
      <div className="px-5 py-4 space-y-4">
        {/* Resumo */}
        <div className="bg-white rounded-2xl p-6">
          <div className="text-center mb-4">
            <p className="text-sm text-gray-500 mb-1">João Silva</p>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">R$ 25.000,00</h2>
            <p className="text-sm text-gray-600">Contrato de Êxito</p>
          </div>

          <div className="bg-blue-50 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Percentual Pago</span>
              <span className="text-lg font-semibold text-blue-600">60%</span>
            </div>
            <div className="mt-2 bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: '60%' }} />
            </div>
          </div>
        </div>

        {/* Lista de Parcelas */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-3">Parcelas</h3>
          <div className="space-y-3">
            {parcelas.map((parcela) => (
              <div key={parcela.numero} className="bg-white rounded-2xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      parcela.status === 'pago' ? 'bg-green-100' : 'bg-gray-100'
                    }`}>
                      <span className={`text-sm font-medium ${
                        parcela.status === 'pago' ? 'text-green-600' : 'text-gray-600'
                      }`}>
                        {parcela.numero}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{parcela.valor}</p>
                      <p className="text-sm text-gray-500">Vencimento: {parcela.vencimento}</p>
                    </div>
                  </div>
                  <TagStatus status={parcela.status} />
                </div>

                {parcela.status === 'pendente' && (
                  <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                    <button className="flex-1 flex items-center justify-center gap-2 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 text-sm">
                      <Send className="w-4 h-4" />
                      Gerar Cobrança
                    </button>
                    <button className="flex-1 flex items-center justify-center gap-2 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 text-sm">
                      <Check className="w-4 h-4" />
                      Marcar Pago
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
