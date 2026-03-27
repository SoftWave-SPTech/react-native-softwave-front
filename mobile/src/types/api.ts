export type TransacaoApi = {
  id: string;
  titulo: string;
  subtitulo: string;
  valor: number;
  tipo: 'receita' | 'despesa';
  status: 'pago' | 'pendente' | 'atrasado' | 'em-dia' | 'cancelado';
  icone?: string;
  ordem?: number;
  categoria?: string;
  clienteId?: string;
  data?: string;
  vencimento?: string;
};

export type ContratoApi = {
  id: number;
  clienteId?: string;
  cliente: string;
  processo: string;
  tipoContrato: string;
  status: 'em-dia' | 'pendente' | 'atrasado' | 'encerrado';
  progresso: number;
  vencimento: string;
  total: number;
  pago: number;
  encerrado: boolean;
  reprovado?: boolean;
};

export type PagamentoConferirApi = {
  id: number;
  cliente: string;
  processo: string;
  valor: number;
  data: string;
  status: 'pendente' | 'aprovado' | 'reprovado';
  motivoRejeicao?: string;
};

export type DashboardResumoApi = {
  id: number;
  valorDisponivel: number;
  lucroLiquidoMes: number;
  receitaMensal: number;
  despesaMensal: number;
  pendentes: number;
  variacaoReceita: string;
  variacaoPendentes: string;
  variacaoDespesa: string;
  variacaoLucro: string;
  pagamentosParaConferir: number;
};

export type NotificacaoAdvApi = {
  id: number;
  tipo: 'pagamento' | 'alerta' | 'sucesso' | 'lembrete' | 'insight';
  titulo: string;
  mensagem: string;
  data: string;
  lida: boolean;
};

export type ClienteDashboardApi = {
  id: number;
  nome: string;
  totalPago: number;
  totalPendente: number;
  totalContrato: number;
  percentualPago: number;
  parcelasRestantes: number;
  notificacoesNaoLidas: number;
  ultimaCobranca?: {
    parcelaLabel: string;
    vencimento: string;
    valor: number;
  };
};
