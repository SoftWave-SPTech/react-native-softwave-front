import { useRouter } from 'expo-router';

/**
 * Maps legacy screen names (from the useState navigation system)
 * to Expo Router paths, enabling a smooth migration of existing screen components.
 */
export function useNavigate() {
  const router = useRouter();

  const navigateTo = (screen: string, id?: string) => {
    switch (screen) {
      // Main tabs
      case 'Home':                router.navigate('/home'); break;
      case 'Transacoes':         router.navigate('/transacoes'); break;
      case 'PagamentosConferir': router.navigate('/pagamentos'); break;
      case 'Honorarios':         router.navigate('/honorarios'); break;
      case 'Relatorios':         router.navigate('/relatorios'); break;

      // Stack screens (advogado)
      case 'NovaTransacao':          router.push('/nova-transacao'); break;
      case 'DetalheTransacao':       router.push(`/transacao/${id ?? '1'}`); break;
      case 'DetalheContrato':        router.push(`/contrato/${id ?? '1'}`); break;
      case 'AssistenteIA':           router.push('/assistente-ia'); break;
      case 'ImportacaoExportacao':   router.push('/importacao-exportacao'); break;
      case 'Notificacoes':           router.push('/notificacoes'); break;
      case 'Perfil':                 router.push('/perfil'); break;
      case 'LocaisSeguros':          router.push('/locais-seguros'); break;
      case 'AjudaSuporte':           router.push('/ajuda-suporte'); break;

      // Cliente area
      case 'ClienteHome':         router.push('/cliente'); break;
      case 'ClienteCobrancas':    router.push('/cliente/cobrancas'); break;
      case 'ClientePagamento':    router.push(`/cliente/pagamento/${id ?? '1'}`); break;
      case 'ClienteNotificacoes': router.push('/cliente/notificacoes'); break;
      case 'ClientePerfil':       router.push('/cliente/perfil'); break;

      default: break;
    }
  };

  return { router, navigateTo };
}
