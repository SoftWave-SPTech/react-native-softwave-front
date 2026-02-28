import { RouterProvider, createBrowserRouter } from 'react-router';
import { MobileFrame } from './components/MobileFrame';
import { Login } from './pages/Login';
import { EsqueciSenha } from './pages/EsqueciSenha';
import { Home } from './pages/Home';
import { Transacoes } from './pages/Transacoes';
import { NovaTransacao } from './pages/NovaTransacao';
import { DetalheTransacao } from './pages/DetalheTransacao';
import { Honorarios } from './pages/Honorarios';
import { DetalheContrato } from './pages/DetalheContrato';
import { PagamentosConferir } from './pages/PagamentosConferir';
import { Relatorios } from './pages/Relatorios';
import { ImportacaoExportacao } from './pages/ImportacaoExportacao';
import { AssistenteIA } from './pages/AssistenteIA';
import { Perfil } from './pages/Perfil';
import { Notificacoes } from './pages/Notificacoes';
import { ClienteHome } from './pages/ClienteHome';
import { ClienteCobrancas } from './pages/ClienteCobrancas';
import { ClientePagamento } from './pages/ClientePagamento';
import { ClienteNotificacoes } from './pages/ClienteNotificacoes';
import { ClientePerfil } from './pages/ClientePerfil';

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <MobileFrame>
        <Login />
      </MobileFrame>
    ),
  },
  {
    path: "/esqueci-senha",
    element: (
      <MobileFrame>
        <EsqueciSenha />
      </MobileFrame>
    ),
  },
  {
    path: "/home",
    element: (
      <MobileFrame>
        <Home />
      </MobileFrame>
    ),
  },
  {
    path: "/transacoes",
    element: (
      <MobileFrame>
        <Transacoes />
      </MobileFrame>
    ),
  },
  {
    path: "/nova-transacao",
    element: (
      <MobileFrame>
        <NovaTransacao />
      </MobileFrame>
    ),
  },
  {
    path: "/transacao/:id",
    element: (
      <MobileFrame>
        <DetalheTransacao />
      </MobileFrame>
    ),
  },
  {
    path: "/honorarios",
    element: (
      <MobileFrame>
        <Honorarios />
      </MobileFrame>
    ),
  },
  {
    path: "/honorarios/:id",
    element: (
      <MobileFrame>
        <DetalheContrato />
      </MobileFrame>
    ),
  },
  {
    path: "/pagamentos-conferir",
    element: (
      <MobileFrame>
        <PagamentosConferir />
      </MobileFrame>
    ),
  },
  {
    path: "/relatorios",
    element: (
      <MobileFrame>
        <Relatorios />
      </MobileFrame>
    ),
  },
  {
    path: "/importacao-exportacao",
    element: (
      <MobileFrame>
        <ImportacaoExportacao />
      </MobileFrame>
    ),
  },
  {
    path: "/assistente-ia",
    element: (
      <MobileFrame>
        <AssistenteIA />
      </MobileFrame>
    ),
  },
  {
    path: "/perfil",
    element: (
      <MobileFrame>
        <Perfil />
      </MobileFrame>
    ),
  },
  {
    path: "/notificacoes",
    element: (
      <MobileFrame>
        <Notificacoes />
      </MobileFrame>
    ),
  },
  {
    path: "/cliente",
    element: (
      <MobileFrame>
        <ClienteHome />
      </MobileFrame>
    ),
  },
  {
    path: "/cliente/cobrancas",
    element: (
      <MobileFrame>
        <ClienteCobrancas />
      </MobileFrame>
    ),
  },
  {
    path: "/cliente/pagamento/:id",
    element: (
      <MobileFrame>
        <ClientePagamento />
      </MobileFrame>
    ),
  },
  {
    path: "/cliente/notificacoes",
    element: (
      <MobileFrame>
        <ClienteNotificacoes />
      </MobileFrame>
    ),
  },
  {
    path: "/cliente/perfil",
    element: (
      <MobileFrame>
        <ClientePerfil />
      </MobileFrame>
    ),
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}