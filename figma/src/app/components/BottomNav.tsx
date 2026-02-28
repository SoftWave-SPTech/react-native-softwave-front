import { useNavigate, useLocation } from 'react-router';
import { Home, Receipt, Briefcase, BarChart3, FileText } from 'lucide-react';

export function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-[393px] bg-white border-t border-gray-200 px-5 py-3">
      <div className="flex items-center justify-around">
        <button
          onClick={() => navigate('/home')}
          className={`flex flex-col items-center gap-1 ${
            isActive('/home') ? 'text-blue-600' : 'text-gray-400'
          }`}
        >
          <Home className="w-6 h-6" />
          <span className="text-xs">Home</span>
        </button>
        <button
          onClick={() => navigate('/transacoes')}
          className={`flex flex-col items-center gap-1 ${
            isActive('/transacoes') ? 'text-blue-600' : 'text-gray-400'
          }`}
        >
          <Receipt className="w-6 h-6" />
          <span className="text-xs">Transações</span>
        </button>
        <button
          onClick={() => navigate('/pagamentos-conferir')}
          className={`flex flex-col items-center gap-1 ${
            isActive('/pagamentos-conferir') ? 'text-blue-600' : 'text-gray-400'
          }`}
        >
          <FileText className="w-6 h-6" />
          <span className="text-xs">Pagamentos</span>
        </button>
        <button
          onClick={() => navigate('/honorarios')}
          className={`flex flex-col items-center gap-1 ${
            isActive('/honorarios') ? 'text-blue-600' : 'text-gray-400'
          }`}
        >
          <Briefcase className="w-6 h-6" />
          <span className="text-xs">Honorários</span>
        </button>
        <button
          onClick={() => navigate('/relatorios')}
          className={`flex flex-col items-center gap-1 ${
            isActive('/relatorios') ? 'text-blue-600' : 'text-gray-400'
          }`}
        >
          <BarChart3 className="w-6 h-6" />
          <span className="text-xs">Relatórios</span>
        </button>
      </div>
    </div>
  );
}
