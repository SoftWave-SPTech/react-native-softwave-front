import { Bell, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router';

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  showNotification?: boolean;
  showAvatar?: boolean;
}

export function Header({ title, showBack = false, showNotification = false, showAvatar = false }: HeaderProps) {
  const navigate = useNavigate();

  return (
    <div className="bg-white px-5 py-4 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-3">
        {showBack && (
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
        <div>
          {title ? (
            <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
          ) : (
            <>
              <p className="text-xs text-gray-500">Bem-vindo ao</p>
              <h1 className="text-lg font-semibold text-gray-900">Silva & Associados</h1>
            </>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        {showNotification && (
          <button 
            onClick={() => navigate('/notificacoes')}
            className="p-2 hover:bg-gray-100 rounded-lg relative"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
        )}
        {showAvatar && (
          <button 
            onClick={() => navigate('/perfil')}
            className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold hover:bg-blue-700 transition-colors"
          >
            SA
          </button>
        )}
      </div>
    </div>
  );
}