import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Header } from '../components/Header';
import { BottomNav } from '../components/BottomNav';
import { 
  User,
  Mail,
  Phone,
  Building2,
  MapPin,
  FileText,
  Lock,
  LogOut,
  ChevronRight,
  Bell,
  Shield,
  HelpCircle,
  Camera,
  Image,
  X
} from 'lucide-react';

export function Perfil() {
  const navigate = useNavigate();
  const [nome, setNome] = useState('Silva & Associados');
  const [email, setEmail] = useState('contato@silvaassociados.com.br');
  const [telefone, setTelefone] = useState('(11) 3456-7890');
  const [oab, setOab] = useState('OAB/SP 123.456');
  const [endereco, setEndereco] = useState('Av. Paulista, 1000 - São Paulo/SP');
  const [modalFoto, setModalFoto] = useState(false);

  const handleLogout = () => {
    if (confirm('Deseja realmente sair do aplicativo?')) {
      navigate('/');
    }
  };

  const handleEscolherGaleria = () => {
    // Simula seleção de galeria
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        console.log('Arquivo selecionado:', file.name);
        setModalFoto(false);
      }
    };
    input.click();
  };

  const handleAbrirCamera = () => {
    // Simula abertura da câmera
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        console.log('Foto capturada:', file.name);
        setModalFoto(false);
      }
    };
    input.click();
  };

  return (
    <div className="h-full bg-gray-50 overflow-y-auto">
      <Header title="Meu Perfil" showBack />
      
      <div className="px-5 py-4 space-y-4">
        {/* Avatar e Info Principal */}
        <div className="bg-white rounded-2xl p-6 text-center">
          <div className="relative inline-block">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-white text-3xl font-bold">
              SA
            </div>
            <button 
              onClick={() => setModalFoto(true)}
              className="absolute bottom-0 right-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center border-2 border-white hover:bg-blue-700 transition-colors"
            >
              <Camera className="w-4 h-4 text-white" />
            </button>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mt-4 mb-1">{nome}</h2>
          <p className="text-sm text-gray-600">{oab}</p>
        </div>

        {/* Dados Pessoais */}
        <div className="bg-white rounded-2xl p-4">
          <h3 className="font-semibold text-gray-900 mb-4">Dados do Escritório</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome do Escritório
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                E-mail
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Telefone
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="tel"
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                OAB
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={oab}
                  onChange={(e) => setOab(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Endereço
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={endereco}
                  onChange={(e) => setEndereco(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-xl mt-6 transition-colors">
            Salvar Alterações
          </button>
        </div>

        {/* Configurações */}
        <div className="bg-white rounded-2xl p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Configurações</h3>
          
          <div className="space-y-1">
            <button className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="text-gray-900">Notificações</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>

            <button className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors">
              <div className="flex items-center gap-3">
                <Lock className="w-5 h-5 text-gray-600" />
                <span className="text-gray-900">Segurança</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>

            <button className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-gray-600" />
                <span className="text-gray-900">Privacidade</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>

            <button className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors">
              <div className="flex items-center gap-3">
                <HelpCircle className="w-5 h-5 text-gray-600" />
                <span className="text-gray-900">Ajuda e Suporte</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Sair */}
        <button 
          onClick={handleLogout}
          className="w-full bg-red-50 hover:bg-red-100 text-red-600 font-medium py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Sair do Aplicativo
        </button>

        <div className="h-20"></div>
      </div>

      {/* Modal de Escolha de Foto */}
      {modalFoto && (
        <div
          className="fixed inset-0 bg-black/50 flex items-end justify-center z-50"
          onClick={() => setModalFoto(false)}
        >
          <div 
            className="bg-white rounded-t-3xl p-5 w-full max-w-[393px] animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 text-lg">
                Alterar Foto de Perfil
              </h3>
              <button
                onClick={() => setModalFoto(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 mb-4">
              {/* Opção: Câmera */}
              <button
                onClick={handleAbrirCamera}
                className="w-full flex items-center gap-4 p-4 bg-gray-50 hover:bg-gray-100 rounded-2xl transition-colors"
              >
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Camera className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-semibold text-gray-900">Tirar Foto</p>
                  <p className="text-sm text-gray-500">Usar câmera do dispositivo</p>
                </div>
              </button>

              {/* Opção: Galeria */}
              <button
                onClick={handleEscolherGaleria}
                className="w-full flex items-center gap-4 p-4 bg-gray-50 hover:bg-gray-100 rounded-2xl transition-colors"
              >
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Image className="w-6 h-6 text-green-600" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-semibold text-gray-900">Escolher da Galeria</p>
                  <p className="text-sm text-gray-500">Selecionar foto existente</p>
                </div>
              </button>
            </div>

            <button
              onClick={() => setModalFoto(false)}
              className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-semibold transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}