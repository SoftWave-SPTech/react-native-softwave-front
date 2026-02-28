import { useState } from 'react';
import { Header } from '../components/Header';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  FileText, 
  Shield,
  Bell,
  LogOut,
  ChevronRight,
  Camera
} from 'lucide-react';

export function ClientePerfil() {
  const [notificacoesAtivas, setNotificacoesAtivas] = useState(true);

  const dadosPessoais = [
    { icon: User, label: 'Nome Completo', value: 'João Silva' },
    { icon: Mail, label: 'E-mail', value: 'joao.silva@email.com' },
    { icon: Phone, label: 'Telefone', value: '(11) 98765-4321' },
    { icon: MapPin, label: 'Endereço', value: 'São Paulo, SP' },
    { icon: FileText, label: 'CPF', value: '123.456.789-00' },
  ];

  const opcoes = [
    { icon: Shield, label: 'Alterar Senha', action: () => {} },
    { icon: FileText, label: 'Documentos', action: () => {} },
  ];

  return (
    <div className="h-full bg-gray-50 overflow-y-auto pb-6">
      <Header title="Meu Perfil" showBack />
      
      <div className="px-5 py-4 space-y-4">
        {/* Avatar */}
        <div className="bg-white rounded-2xl p-6">
          <div className="flex flex-col items-center">
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                <span className="text-3xl font-bold text-white">JS</span>
              </div>
              <button className="absolute bottom-0 right-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center border-2 border-white">
                <Camera className="w-4 h-4 text-white" />
              </button>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mt-4">João Silva</h2>
            <p className="text-sm text-gray-500">Cliente desde Fev/2024</p>
          </div>
        </div>

        {/* Dados Pessoais */}
        <div className="bg-white rounded-2xl p-4">
          <h3 className="font-semibold text-gray-900 mb-3 px-2">Dados Pessoais</h3>
          <div className="space-y-1">
            {dadosPessoais.map((dado, index) => {
              const Icon = dado.icon;
              return (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <Icon className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500">{dado.label}</p>
                    <p className="text-sm font-medium text-gray-900 truncate">{dado.value}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Configurações */}
        <div className="bg-white rounded-2xl p-4">
          <h3 className="font-semibold text-gray-900 mb-3 px-2">Configurações</h3>
          <div className="space-y-1">
            {/* Notificações Toggle */}
            <div className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-50 rounded-lg">
                  <Bell className="w-4 h-4 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Notificações</p>
                  <p className="text-xs text-gray-500">Receber alertas de pagamentos</p>
                </div>
              </div>
              <button
                onClick={() => setNotificacoesAtivas(!notificacoesAtivas)}
                className={`w-12 h-6 rounded-full transition-colors ${
                  notificacoesAtivas ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full shadow-md transition-transform ${
                    notificacoesAtivas ? 'translate-x-6' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>

            {/* Outras Opções */}
            {opcoes.map((opcao, index) => {
              const Icon = opcao.icon;
              return (
                <button
                  key={index}
                  onClick={opcao.action}
                  className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-50 rounded-lg">
                      <Icon className="w-4 h-4 text-gray-600" />
                    </div>
                    <p className="text-sm font-medium text-gray-900">{opcao.label}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </button>
              );
            })}
          </div>
        </div>

        {/* Processo Ativo */}
        <div className="bg-white rounded-2xl p-4">
          <h3 className="font-semibold text-gray-900 mb-3 px-2">Processo Ativo</h3>
          <div className="bg-blue-50 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">Processo 1234/2025</p>
                <p className="text-sm text-gray-600 mt-1">Advocacia Cível - Honorários</p>
                <div className="mt-3 pt-3 border-t border-blue-200">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Progresso</span>
                    <span className="font-semibold text-blue-600">60%</span>
                  </div>
                  <div className="w-full bg-blue-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '60%' }} />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    R$ 15.000 pagos de R$ 25.000 total
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sair */}
        <button className="w-full bg-white rounded-2xl p-4 flex items-center justify-center gap-2 text-red-600 hover:bg-red-50 transition-colors">
          <LogOut className="w-5 h-5" />
          <span className="font-semibold">Sair da Conta</span>
        </button>
      </div>
    </div>
  );
}
