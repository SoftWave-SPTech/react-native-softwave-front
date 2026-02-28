import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { Header } from '../components/Header';
import { Camera, Upload, CheckCircle } from 'lucide-react';

export function NovaTransacao() {
  const navigate = useNavigate();
  const location = useLocation();
  const transacaoParaEditar = location.state?.transacao;
  
  const [tipo, setTipo] = useState<'receita' | 'despesa'>('receita');
  const [valor, setValor] = useState('');
  const [categoria, setCategoria] = useState('');
  const [cliente, setCliente] = useState('');
  const [processo, setProcesso] = useState('');
  const [data, setData] = useState('');
  const [vencimento, setVencimento] = useState('');
  const [status, setStatus] = useState<'pago' | 'pendente'>('pendente');
  const [descricao, setDescricao] = useState('');
  const [mostrarSucesso, setMostrarSucesso] = useState(false);

  // Preencher formulário se estiver editando
  useEffect(() => {
    if (transacaoParaEditar) {
      setTipo(transacaoParaEditar.tipo);
      setValor(transacaoParaEditar.valor);
      setCategoria(transacaoParaEditar.categoria || '');
      setCliente(transacaoParaEditar.cliente || '');
      setProcesso(transacaoParaEditar.processo || '');
      setData(transacaoParaEditar.data || '');
      setVencimento(transacaoParaEditar.vencimento || '');
      setStatus(transacaoParaEditar.status);
      setDescricao(transacaoParaEditar.descricao || '');
    }
  }, [transacaoParaEditar]);

  const handleSalvar = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mostrar mensagem de sucesso
    setMostrarSucesso(true);
    
    // Após 2 segundos, voltar para transações
    setTimeout(() => {
      navigate('/transacoes');
    }, 2000);
  };

  return (
    <div className="h-full bg-gray-50 overflow-y-auto">
      <Header title={transacaoParaEditar ? 'Editar Transação' : 'Nova Transação'} showBack />
      
      {/* Mensagem de Sucesso */}
      {mostrarSucesso && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-[slideDown_0.3s_ease-out]">
          <div className="bg-green-500 text-white px-6 py-3 rounded-2xl shadow-lg flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">
              {transacaoParaEditar ? 'Alterações salvas com sucesso!' : 'Transação criada com sucesso!'}
            </span>
          </div>
        </div>
      )}
      
      <div className="px-5 py-4">
        <form onSubmit={handleSalvar} className="space-y-4">
          {/* Tipo */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setTipo('receita')}
              className={`flex-1 py-3 rounded-2xl font-medium ${
                tipo === 'receita'
                  ? 'bg-green-600 text-white'
                  : 'bg-white text-gray-600'
              }`}
            >
              Receita
            </button>
            <button
              type="button"
              onClick={() => setTipo('despesa')}
              className={`flex-1 py-3 rounded-2xl font-medium ${
                tipo === 'despesa'
                  ? 'bg-red-600 text-white'
                  : 'bg-white text-gray-600'
              }`}
            >
              Despesa
            </button>
          </div>

          {/* Valor */}
          <div className="bg-white rounded-2xl p-4">
            <label className="text-sm text-gray-600 mb-2 block">Valor</label>
            <input
              type="text"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              placeholder="R$ 0,00"
              className="w-full text-2xl font-semibold outline-none"
              required
            />
          </div>

          {/* Categoria */}
          <div className="bg-white rounded-2xl p-4">
            <label className="text-sm text-gray-600 mb-2 block">Categoria</label>
            <select
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              className="w-full outline-none text-gray-900"
              required
            >
              <option value="">Selecione uma categoria</option>
              <option value="honorarios">Honorários</option>
              <option value="custas">Custas Judiciais</option>
              <option value="consultoria">Consultoria</option>
              <option value="aluguel">Aluguel</option>
              <option value="outros">Outros</option>
            </select>
          </div>

          {/* Descrição */}
          <div className="bg-white rounded-2xl p-4">
            <label className="text-sm text-gray-600 mb-2 block">Descrição</label>
            <textarea
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Descreva os detalhes da transação"
              className="w-full outline-none text-gray-900 resize-none"
              rows={3}
            />
          </div>

          {/* Cliente */}
          <div className="bg-white rounded-2xl p-4">
            <label className="text-sm text-gray-600 mb-2 block">Cliente</label>
            <select
              value={cliente}
              onChange={(e) => setCliente(e.target.value)}
              className="w-full outline-none text-gray-900"
            >
              <option value="">Selecione um cliente</option>
              <option value="joao">João Silva</option>
              <option value="maria">Maria Santos</option>
              <option value="carlos">Carlos Oliveira</option>
            </select>
          </div>

          {/* Processo */}
          <div className="bg-white rounded-2xl p-4">
            <label className="text-sm text-gray-600 mb-2 block">Processo</label>
            <input
              type="text"
              value={processo}
              onChange={(e) => setProcesso(e.target.value)}
              placeholder="Número do processo"
              className="w-full outline-none text-gray-900"
            />
          </div>

          {/* Data e Vencimento */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-2xl p-4">
              <label className="text-sm text-gray-600 mb-2 block">Data</label>
              <input
                type="date"
                value={data}
                onChange={(e) => setData(e.target.value)}
                className="w-full outline-none text-gray-900"
              />
            </div>
            <div className="bg-white rounded-2xl p-4">
              <label className="text-sm text-gray-600 mb-2 block">Vencimento</label>
              <input
                type="date"
                value={vencimento}
                onChange={(e) => setVencimento(e.target.value)}
                className="w-full outline-none text-gray-900"
              />
            </div>
          </div>

          {/* Status */}
          <div className="bg-white rounded-2xl p-4">
            <label className="text-sm text-gray-600 mb-2 block">Status</label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStatus('pago')}
                className={`flex-1 py-2 rounded-lg text-sm ${
                  status === 'pago'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                Pago
              </button>
              <button
                type="button"
                onClick={() => setStatus('pendente')}
                className={`flex-1 py-2 rounded-lg text-sm ${
                  status === 'pendente'
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                Pendente
              </button>
            </div>
          </div>

          {/* Upload Comprovante */}
          <div className="bg-white rounded-2xl p-4">
            <label className="text-sm text-gray-600 mb-3 block">Comprovante</label>
            <div className="flex gap-3">
              <button
                type="button"
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100"
              >
                <Camera className="w-5 h-5" />
                <span className="text-sm">Câmera</span>
              </button>
              <button
                type="button"
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100"
              >
                <Upload className="w-5 h-5" />
                <span className="text-sm">Galeria</span>
              </button>
            </div>
          </div>

          {/* Botão Salvar */}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white rounded-2xl py-4 font-semibold hover:bg-blue-700"
          >
            {transacaoParaEditar ? 'Salvar Alterações' : 'Salvar Transação'}
          </button>
        </form>
      </div>
    </div>
  );
}
