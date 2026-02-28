import { useState } from 'react';
import { Header } from '../components/Header';
import { FileImage, Check, X, User, FileText } from 'lucide-react';
import { BottomNav } from '../components/BottomNav';

export function PagamentosConferir() {
  const [selectedPagamento, setSelectedPagamento] = useState<number | null>(null);
  const [modalRejeicao, setModalRejeicao] = useState<number | null>(null);
  const [motivoRejeicao, setMotivoRejeicao] = useState('');

  const pagamentos = [
    {
      id: 1,
      cliente: 'João Silva',
      processo: 'Processo 1234/2025',
      valor: 'R$ 6.000,00',
      data: '15/02/2026',
      comprovante: 'comprovante1.jpg'
    },
    {
      id: 2,
      cliente: 'Maria Santos',
      processo: 'Processo 5678/2025',
      valor: 'R$ 3.200,00',
      data: '14/02/2026',
      comprovante: 'comprovante2.jpg'
    },
    {
      id: 3,
      cliente: 'Carlos Oliveira',
      processo: 'Processo 9012/2025',
      valor: 'R$ 5.500,00',
      data: '13/02/2026',
      comprovante: 'comprovante3.jpg'
    }
  ];

  const handleConfirmar = (id: number) => {
    console.log('Confirmar pagamento', id);
    setSelectedPagamento(null);
  };

  const handleAbrirModalRejeicao = (id: number) => {
    setModalRejeicao(id);
    setMotivoRejeicao('');
  };

  const handleRejeitar = () => {
    if (motivoRejeicao.trim()) {
      console.log('Rejeitar pagamento', modalRejeicao, motivoRejeicao);
      setModalRejeicao(null);
      setMotivoRejeicao('');
    }
  };

  return (
    <div className="h-full bg-gray-50 overflow-y-auto">
      <Header title="Pagamentos a Conferir" showBack />
      
      <div className="px-5 py-4 space-y-4">
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
          <p className="text-sm text-amber-800">
            <span className="font-semibold">{pagamentos.length} pagamentos</span> aguardando confirmação
          </p>
        </div>

        {/* Lista de Pagamentos */}
        <div className="space-y-3">
          {pagamentos.map((pagamento) => (
            <div key={pagamento.id} className="bg-white rounded-2xl p-4">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileImage className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{pagamento.cliente}</p>
                  <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                    <FileText className="w-3.5 h-3.5" />
                    <span>{pagamento.processo}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{pagamento.data}</p>
                  <p className="text-lg font-semibold text-blue-600 mt-2">{pagamento.valor}</p>
                </div>
              </div>

              <button
                onClick={() => setSelectedPagamento(pagamento.id)}
                className="w-full py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm mb-3"
              >
                Visualizar Comprovante
              </button>

              <div className="flex gap-2">
                <button
                  onClick={() => handleAbrirModalRejeicao(pagamento.id)}
                  className="flex-1 flex items-center justify-center gap-2 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                >
                  <X className="w-4 h-4" />
                  Reprovar
                </button>
                <button
                  onClick={() => handleConfirmar(pagamento.id)}
                  className="flex-1 flex items-center justify-center gap-2 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
                >
                  <Check className="w-4 h-4" />
                  Aprovar
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="h-20"></div>
      </div>

      {/* Modal de Visualização de Comprovante */}
      {selectedPagamento && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-5 z-50"
          onClick={() => setSelectedPagamento(null)}
        >
          <div className="bg-white rounded-2xl p-4 max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-semibold text-gray-900 mb-3">Comprovante de Pagamento</h3>
            <div className="bg-gray-100 rounded-xl h-64 flex items-center justify-center mb-4">
              <FileImage className="w-16 h-16 text-gray-400" />
            </div>
            <button
              onClick={() => setSelectedPagamento(null)}
              className="w-full py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800"
            >
              Fechar
            </button>
          </div>
        </div>
      )}

      {/* Modal de Rejeição com Motivo */}
      {modalRejeicao && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-5 z-50"
          onClick={() => setModalRejeicao(null)}
        >
          <div className="bg-white rounded-2xl p-5 max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-semibold text-gray-900 mb-2">Reprovar Pagamento</h3>
            <p className="text-sm text-gray-600 mb-4">
              Por favor, informe o motivo da reprovação:
            </p>
            
            <textarea
              value={motivoRejeicao}
              onChange={(e) => setMotivoRejeicao(e.target.value)}
              placeholder="Ex: Comprovante ilegível, dados incorretos, valor divergente..."
              className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-gray-900 resize-none focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent mb-4"
              rows={4}
            />

            <div className="flex gap-3">
              <button
                onClick={() => setModalRejeicao(null)}
                className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200"
              >
                Cancelar
              </button>
              <button
                onClick={handleRejeitar}
                disabled={!motivoRejeicao.trim()}
                className="flex-1 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Reprovar
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
