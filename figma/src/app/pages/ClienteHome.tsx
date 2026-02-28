import { useNavigate } from 'react-router';
import { DollarSign, Clock, FileText, Bell, User } from 'lucide-react';

export function ClienteHome() {
  const navigate = useNavigate();

  return (
    <div className="h-full bg-gradient-to-br from-blue-600 to-blue-800">
      {/* Header */}
      <div className="px-5 py-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-blue-100 text-sm">Olá,</p>
            <h1 className="text-2xl font-bold text-white">João Silva</h1>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate('/cliente/notificacoes')}
              className="relative w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
            >
              <Bell className="w-5 h-5 text-white" />
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">2</span>
              </div>
            </button>
            <button 
              onClick={() => navigate('/cliente/perfil')}
              className="w-12 h-12 bg-white rounded-full flex items-center justify-center hover:shadow-lg transition-shadow"
            >
              <span className="text-blue-600 font-semibold">JS</span>
            </button>
          </div>
        </div>
      </div>

      {/* Cards */}
      <div className="bg-gray-50 rounded-t-3xl px-5 py-6 flex-1">
        <div className="space-y-4">
          {/* Total Pago */}
          <div className="bg-white rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
              <span className="text-sm text-gray-600">Total Pago</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">R$ 15.000,00</p>
            <p className="text-sm text-gray-500 mt-1">60% do total</p>
          </div>

          {/* Total Pendente */}
          <div className="bg-white rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <span className="text-sm text-gray-600">Total Pendente</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">R$ 10.000,00</p>
            <p className="text-sm text-gray-500 mt-1">3 parcelas restantes</p>
          </div>

          {/* Última Cobrança */}
          <div className="bg-white rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-sm text-gray-600">Última Cobrança</span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-900">Parcela 3/4</p>
                <p className="text-sm text-gray-500">Vencimento: 15/03/2026</p>
              </div>
              <p className="text-xl font-bold text-blue-600">R$ 6.000,00</p>
            </div>
          </div>

          {/* Botão */}
          <button
            onClick={() => navigate('/cliente/cobrancas')}
            className="w-full bg-blue-600 text-white rounded-2xl py-4 font-semibold hover:bg-blue-700"
          >
            Minhas Cobranças
          </button>
        </div>
      </div>
    </div>
  );
}