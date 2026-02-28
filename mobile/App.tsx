import React, { useState } from 'react';
import { LoginScreen } from './src/screens/LoginScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { EsqueciSenhaScreen } from './src/screens/EsqueciSenhaScreen';
import { TransacoesScreen } from './src/screens/TransacoesScreen';
import { NovaTransacaoScreen } from './src/screens/NovaTransacaoScreen';
import { DetalheTransacaoScreen } from './src/screens/DetalheTransacaoScreen';
import { HonorariosScreen } from './src/screens/HonorariosScreen';
import { DetalheContratoScreen } from './src/screens/DetalheContratoScreen';
import { RelatoriosScreen } from './src/screens/RelatoriosScreen';
import { PagamentosConferirScreen } from './src/screens/PagamentosConferirScreen';
import { NotificacoesScreen } from './src/screens/NotificacoesScreen';
import { PerfilScreen } from './src/screens/PerfilScreen';
import { ClienteHomeScreen } from './src/screens/ClienteHomeScreen';
import { ClienteCobrancasScreen } from './src/screens/ClienteCobrancasScreen';
import { ClientePagamentoScreen } from './src/screens/ClientePagamentoScreen';
import { PlaceholderScreen } from './src/screens/PlaceholderScreen';

export type Screen =
  | 'Login'
  | 'Home'
  | 'EsqueciSenha'
  | 'Transacoes'
  | 'NovaTransacao'
  | 'DetalheTransacao'
  | 'Honorarios'
  | 'DetalheContrato'
  | 'Relatorios'
  | 'PagamentosConferir'
  | 'AssistenteIA'
  | 'ImportacaoExportacao'
  | 'Notificacoes'
  | 'Perfil'
  | 'ClienteHome'
  | 'ClienteCobrancas'
  | 'ClientePagamento'
  | 'ClienteNotificacoes'
  | 'ClientePerfil';

const CLIENTE_BACK: Record<string, Screen> = {
  ClienteHome: 'Login',
  ClienteCobrancas: 'ClienteHome',
  ClientePagamento: 'ClienteCobrancas',
  ClienteNotificacoes: 'ClienteHome',
  ClientePerfil: 'ClienteHome',
};

const PLACEHOLDER_TITLES: Record<string, string> = {
  AssistenteIA: 'Assistente IA',
  ImportacaoExportacao: 'Importação & Exportação',
  ClienteNotificacoes: 'Notificações',
  ClientePerfil: 'Meu Perfil',
};

export default function App() {
  const [screen, setScreen] = useState<Screen>('Login');
  const [paramId, setParamId] = useState<string>('');

  const navigate = (next: Screen, id?: string) => {
    setScreen(next);
    setParamId(id ?? '');
  };

  const goBack = () => {
    if (screen === 'EsqueciSenha') setScreen('Login');
    else if (screen === 'DetalheTransacao') setScreen('Transacoes');
    else if (screen === 'DetalheContrato') setScreen('Honorarios');
    else if (CLIENTE_BACK[screen]) setScreen(CLIENTE_BACK[screen]);
    else setScreen('Home');
  };

  const navigateAny = (s: string, id?: string) => navigate(s as Screen, id);

  if (screen === 'Login') {
    return (
      <LoginScreen
        onLogin={() => navigate('Home')}
        onEsqueciSenha={() => navigate('EsqueciSenha')}
        onClienteAcesso={() => navigate('ClienteHome')}
      />
    );
  }

  if (screen === 'EsqueciSenha') {
    return (
      <EsqueciSenhaScreen
        onBack={() => navigate('Login')}
        onSuccess={() => navigate('Home')}
      />
    );
  }

  if (screen === 'Home') {
    return <HomeScreen onNavigate={navigateAny} />;
  }

  if (screen === 'ClienteHome') {
    return <ClienteHomeScreen onBack={() => navigate('Login')} onNavigate={navigateAny} />;
  }

  if (screen === 'ClienteCobrancas') {
    return (
      <ClienteCobrancasScreen
        onBack={goBack}
        onNavigate={navigateAny}
      />
    );
  }

  if (screen === 'ClientePagamento') {
    return (
      <ClientePagamentoScreen
        cobrancaId={paramId || '1'}
        onBack={goBack}
      />
    );
  }

  if (screen === 'ClienteNotificacoes' || screen === 'ClientePerfil') {
    const title = PLACEHOLDER_TITLES[screen] ?? screen;
    return <PlaceholderScreen title={title} onBack={goBack} />;
  }

  if (screen === 'Transacoes') {
    return (
      <TransacoesScreen
        onBack={goBack}
        onNavigate={navigateAny}
      />
    );
  }

  if (screen === 'NovaTransacao') {
    return (
      <NovaTransacaoScreen
        onBack={goBack}
        onSuccess={() => navigate('Transacoes')}
      />
    );
  }

  if (screen === 'DetalheTransacao') {
    return (
      <DetalheTransacaoScreen
        transacaoId={paramId || '1'}
        onBack={goBack}
        onEditar={() => navigate('NovaTransacao')}
      />
    );
  }

  if (screen === 'Honorarios') {
    return (
      <HonorariosScreen
        onBack={goBack}
        onNavigate={navigateAny}
      />
    );
  }

  if (screen === 'DetalheContrato') {
    return (
      <DetalheContratoScreen
        contratoId={paramId || '1'}
        onBack={goBack}
      />
    );
  }

  if (screen === 'Relatorios') {
    return (
      <RelatoriosScreen
        onBack={goBack}
        onNavigate={navigateAny}
      />
    );
  }

  if (screen === 'PagamentosConferir') {
    return (
      <PagamentosConferirScreen
        onBack={goBack}
        onNavigate={navigateAny}
      />
    );
  }

  if (screen === 'Notificacoes') {
    return (
      <NotificacoesScreen
        onBack={goBack}
        onNavigate={navigateAny}
      />
    );
  }

  if (screen === 'Perfil') {
    return (
      <PerfilScreen
        onBack={goBack}
        onNavigate={navigateAny}
        onLogout={() => navigate('Login')}
      />
    );
  }

  const title = PLACEHOLDER_TITLES[screen] ?? screen;
  return <PlaceholderScreen title={title} onBack={goBack} />;
}
