import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Header } from '../components/Header';
import { BarraProgresso } from '../components/BarraProgresso';
import { TagStatus } from '../components/TagStatus';
import { BottomNav } from '../components/BottomNav';
import { Briefcase, FileText, ChevronDown, User, Check } from 'lucide-react';

export function Honorarios() {
  const navigate = useNavigate();
  const [aba, setAba] = useState<'ativos' | 'encerrados'>('ativos');
  const [filtroCliente, setFiltroCliente] = useState('todos');
  const [dropdownAberto, setDropdownAberto] = useState(false);

  const contratos = [
    {
      id: 1,
      cliente: 'João Silva',
      processo: 'Processo 1234/2025',
      tipoContrato: 'Êxito',
      status: 'em-dia' as const,
      progresso: 60,
      vencimento: '15/03/2026',
      total: 'R$ 25.000,00',
      pago: 'R$ 15.000,00',
      reprovado: false
    },
    {
      id: 2,
      cliente: 'Maria Santos',
      processo: 'Processo 5678/2025',
      tipoContrato: 'Parcelas',
      status: 'pendente' as const,
      progresso: 33,
      vencimento: '20/02/2026',
      total: 'R$ 18.000,00',
      pago: 'R$ 6.000,00',
      reprovado: true
    },
    {
      id: 3,
      cliente: 'Carlos Oliveira',
      processo: 'Processo 9012/2025',
      tipoContrato: 'Fixo Mensal',
      status: 'atrasado' as const,
      progresso: 75,
      vencimento: '10/02/2026',
      total: 'R$ 12.000,00',
      pago: 'R$ 9.000,00',
      reprovado: false
    }
  ];

  // Extrair lista única de clientes
  const listaClientes = ['todos', ...Array.from(new Set(contratos.map(c => c.cliente)))];

  const contratosFiltrados = filtroCliente === 'todos' 
    ? contratos 
    : contratos.filter(c => c.cliente === filtroCliente);

  const handleSelecionarCliente = (cliente: string) => {
    setFiltroCliente(cliente);
    setDropdownAberto(false);
  };

  return (
    <div className="h-full bg-gray-50 overflow-y-auto">
      <Header title="Honorários" showBack />
      
      <div className="px-5 py-4 space-y-4">
        {/* Resumo */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-4 text-white">
            <p className="text-green-100 text-xs mb-1">Total Recebido</p>
            <p className="text-2xl font-bold">R$ 30.000</p>
          </div>
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-4 text-white">
            <p className="text-blue-100 text-xs mb-1">A Receber</p>
            <p className="text-2xl font-bold">R$ 25.000</p>
          </div>
        </div>

        {/* Abas */}
        <div className="flex gap-2 bg-white rounded-2xl p-1">
          <button
            onClick={() => setAba('ativos')}
            className={`flex-1 py-2 rounded-xl font-medium text-sm transition-colors ${
              aba === 'ativos'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600'
            }`}
          >
            Ativos
          </button>
          <button
            onClick={() => setAba('encerrados')}
            className={`flex-1 py-2 rounded-xl font-medium text-sm transition-colors ${
              aba === 'encerrados'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600'
            }`}
          >
            Encerrados
          </button>
        </div>

        {/* Filtro de Cliente */}
        <div className="relative">
          <button
            className="w-full flex items-center justify-between px-4 py-2 bg-white rounded-2xl shadow-sm text-gray-600 hover:bg-gray-50 transition-colors"
            onClick={() => setDropdownAberto(!dropdownAberto)}
          >
            <div className="flex items-center">
              <User className="w-5 h-5 mr-2" />
              <span className="font-medium">
                {filtroCliente === 'todos' ? 'Todos os Clientes' : filtroCliente}
              </span>
            </div>
            <ChevronDown className={`w-5 h-5 transition-transform ${dropdownAberto ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown Menu */}
          {dropdownAberto && (
            <>
              {/* Overlay para fechar ao clicar fora */}
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setDropdownAberto(false)}
              />
              
              {/* Menu */}
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden z-20">
                {listaClientes.map((cliente) => (
                  <button
                    key={cliente}
                    onClick={() => handleSelecionarCliente(cliente)}
                    className={`w-full flex items-center justify-between px-4 py-3 text-left transition-colors ${
                      filtroCliente === cliente
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center">
                      <User className="w-4 h-4 mr-3 text-gray-400" />
                      <span className="font-medium">
                        {cliente === 'todos' ? 'Todos os Clientes' : cliente}
                      </span>
                    </div>
                    {filtroCliente === cliente && (
                      <Check className="w-5 h-5 text-blue-600" />
                    )}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Lista de Contratos */}
        <div className="space-y-3">
          {contratosFiltrados.map((contrato) => (
            <div
              key={contrato.id}
              onClick={() => navigate(`/honorarios/${contrato.id}`)}
              className="bg-white rounded-2xl p-4 cursor-pointer hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Briefcase className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{contrato.cliente}</p>
                    <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                      <FileText className="w-3.5 h-3.5" />
                      <span>{contrato.processo}</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5">{contrato.tipoContrato}</p>
                  </div>
                </div>
                <div className="flex flex-col gap-2 items-end">
                  <TagStatus status={contrato.status} />
                  {contrato.reprovado && contrato.status === 'pendente' && (
                    <span className="inline-flex items-center px-2 py-1 rounded-lg bg-red-100 text-red-700 text-xs font-medium">
                      Reprovado
                    </span>
                  )}
                </div>
              </div>

              <BarraProgresso percentage={contrato.progresso} />

              <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                <div>
                  <p className="text-xs text-gray-500">Vencimento</p>
                  <p className="text-sm font-medium text-gray-900">{contrato.vencimento}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">Total</p>
                  <p className="text-sm font-semibold text-blue-600">{contrato.total}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <BottomNav />
    </div>
  );
}