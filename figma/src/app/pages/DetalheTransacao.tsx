import { useParams, useNavigate } from 'react-router';
import { useState } from 'react';
import { Header } from '../components/Header';
import { TagStatus } from '../components/TagStatus';
import { 
  Calendar, 
  User, 
  FileText, 
  Tag, 
  AlignLeft,
  Paperclip,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  FileImage
} from 'lucide-react';

export function DetalheTransacao() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [modalComprovante, setModalComprovante] = useState(false);
  const [modalExcluir, setModalExcluir] = useState(false);

  // Mock data - em produção viria de um banco de dados
  const transacao = {
    id: id,
    tipo: 'receita' as const,
    titulo: 'Honorários - Processo 1234',
    valor: 'R$ 5.000,00',
    status: 'pago' as const,
    categoria: 'Honorários',
    cliente: 'João Silva',
    processo: 'Processo 1234/2025',
    data: '10/02/2026',
    vencimento: '15/02/2026',
    dataPagamento: '12/02/2026',
    descricao: 'Pagamento referente aos honorários advocatícios do processo trabalhista. Cliente efetuou o pagamento via PIX.',
    observacoes: 'Parcela 2 de 4 do contrato de honorários.',
    comprovante: true,
    metodoPagamento: 'PIX'
  };

  const handleEditar = () => {
    navigate('/nova-transacao', { 
      state: { 
        transacao: {
          tipo: transacao.tipo,
          valor: transacao.valor,
          categoria: 'honorarios',
          cliente: 'joao',
          processo: transacao.processo,
          data: '2026-02-10',
          vencimento: '2026-02-15',
          status: transacao.status,
          descricao: transacao.descricao
        }
      } 
    });
  };

  const handleExcluir = () => {
    if (confirm('Deseja realmente excluir esta transação?')) {
      navigate('/transacoes');
    }
  };

  return (
    <div className="h-full bg-gray-50 overflow-y-auto">
      <Header title="Detalhes da Transação" showBack />
      
      <div className="px-5 py-4 space-y-4">
        {/* Card Principal - Valor */}
        <div className={`rounded-2xl p-6 text-white ${
          transacao.tipo === 'receita' 
            ? 'bg-gradient-to-br from-green-500 to-green-600' 
            : 'bg-gradient-to-br from-red-500 to-red-600'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-white/80 text-sm">
              {transacao.tipo === 'receita' ? 'Receita' : 'Despesa'}
            </span>
            <TagStatus status={transacao.status} />
          </div>
          <h2 className="text-3xl font-bold mb-1">{transacao.valor}</h2>
          <p className="text-white/90">{transacao.titulo}</p>
        </div>

        {/* Informações Básicas */}
        <div className="bg-white rounded-2xl p-4 space-y-4">
          <h3 className="font-semibold text-gray-900 mb-3">Informações</h3>
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <Tag className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-500">Categoria</p>
              <p className="font-medium text-gray-900">{transacao.categoria}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <User className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-500">Cliente</p>
              <p className="font-medium text-gray-900">{transacao.cliente}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-500">Processo</p>
              <p className="font-medium text-gray-900">{transacao.processo}</p>
            </div>
          </div>
        </div>

        {/* Datas */}
        <div className="bg-white rounded-2xl p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Datas</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="w-4 h-4 text-gray-400" />
                <p className="text-xs text-gray-500">Data de Emissão</p>
              </div>
              <p className="font-medium text-gray-900">{transacao.data}</p>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="w-4 h-4 text-gray-400" />
                <p className="text-xs text-gray-500">Vencimento</p>
              </div>
              <p className="font-medium text-gray-900">{transacao.vencimento}</p>
            </div>
          </div>

          {transacao.status === 'pago' && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <p className="text-xs text-gray-500">Data de Pagamento</p>
              </div>
              <p className="font-medium text-green-600">{transacao.dataPagamento}</p>
              <p className="text-xs text-gray-500 mt-1">
                Método: {transacao.metodoPagamento}
              </p>
            </div>
          )}
        </div>

        {/* Descrição */}
        <div className="bg-white rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlignLeft className="w-5 h-5 text-gray-600" />
            <h3 className="font-semibold text-gray-900">Descrição</h3>
          </div>
          <p className="text-gray-600 text-sm leading-relaxed">
            {transacao.descricao}
          </p>
        </div>

        {/* Observações */}
        {transacao.observacoes && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
            <h3 className="font-semibold text-gray-900 mb-2 text-sm">Observações</h3>
            <p className="text-gray-600 text-sm">
              {transacao.observacoes}
            </p>
          </div>
        )}

        {/* Comprovante */}
        {transacao.comprovante && (
          <div className="bg-white rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Paperclip className="w-5 h-5 text-gray-600" />
              <h3 className="font-semibold text-gray-900">Comprovante</h3>
            </div>
            <button 
              onClick={() => setModalComprovante(true)}
              className="w-full py-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 flex items-center justify-center gap-2"
            >
              <FileText className="w-5 h-5" />
              Visualizar Comprovante
            </button>
          </div>
        )}

        {/* Ações */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleEditar}
            className="flex items-center justify-center gap-2 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
          >
            <Edit className="w-5 h-5" />
            Editar
          </button>
          <button
            onClick={() => setModalExcluir(true)}
            className="flex items-center justify-center gap-2 py-3 bg-white border-2 border-red-200 text-red-600 rounded-xl hover:bg-red-50"
          >
            <Trash2 className="w-5 h-5" />
            Excluir
          </button>
        </div>

        {/* Ações de Status */}
        {transacao.status === 'pendente' && (
          <div className="space-y-2">
            <button className="w-full flex items-center justify-center gap-2 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700">
              <CheckCircle className="w-5 h-5" />
              Marcar como Pago
            </button>
            <button className="w-full flex items-center justify-center gap-2 py-3 bg-white border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50">
              <XCircle className="w-5 h-5" />
              Cancelar Transação
            </button>
          </div>
        )}

        <div className="h-4"></div>
      </div>

      {/* Modal de Visualização de Comprovante */}
      {modalComprovante && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-5 z-50"
          onClick={() => setModalComprovante(false)}
        >
          <div className="bg-white rounded-2xl p-4 max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-semibold text-gray-900 mb-3">Comprovante de Pagamento</h3>
            <div className="bg-gray-100 rounded-xl h-64 flex items-center justify-center mb-4">
              <FileImage className="w-16 h-16 text-gray-400" />
            </div>
            <button
              onClick={() => setModalComprovante(false)}
              className="w-full py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800"
            >
              Fechar
            </button>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Exclusão */}
      {modalExcluir && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-5 z-50"
          onClick={() => setModalExcluir(false)}
        >
          <div className="bg-white rounded-2xl p-5 max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
            <div className="text-center mb-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Trash2 className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Excluir Transação?</h3>
              <p className="text-sm text-gray-600">
                Esta ação não pode ser desfeita. A transação será permanentemente removida do sistema.
              </p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setModalExcluir(false)}
                className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-semibold"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  setModalExcluir(false);
                  navigate('/transacoes');
                }}
                className="flex-1 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 font-semibold"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}