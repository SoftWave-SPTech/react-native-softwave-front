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

/** Corpo de `POST /transacoes` alinhado ao backend (honorário novo via `processoId`). */
export type TransacaoCreatePayload = {
  tipo: 'receita' | 'despesa';
  valor: number;
  categoria?: string;
  descricao: string;
  titulo?: string;
  clienteId?: number;
  contraparte?: string;
  processoId?: number;
  honorarioId?: number;
  data?: string;
  vencimento?: string;
  status?: string;
  recorrencia?: string;
  duracaoMeses?: number | null;
  /** Cria honorário/transação sem processo (somente com API real). */
  semProcesso?: boolean;
};

export type ClienteAdvogadoApi = {
  id: string;
  nome: string;
  email?: string;
  telefone?: string;
};

export type ClientesListEnvelopeApi = {
  total: number;
  clientes: ClienteAdvogadoApi[];
};

export type ProcessoResumoApi = {
  id: number;
  processoId: string;
  titulo: string;
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
  descricao?: string;
  criadoEm?: string;
};

/** Parcela do contrato (mock REST `GET /contratos/:id/parcelas` + `PATCH /parcelas/:id`). */
export type ParcelaApi = {
  id: string;
  contratoId: number;
  numero: number;
  valor: number;
  vencimento: string;
  status: 'pago' | 'pendente';
};

export type CobrancaClienteApi = {
  id: string;
  processo: string;
  descricao?: string;
  valor: number;
  vencimento: string;
  status: 'pago' | 'pendente';
  parcela: number;
  totalParcelas: number;
  percentualPago: number;
};

export type CobrancaDetalheApi = {
  id: string;
  processo: string;
  descricao: string;
  valor: number;
  vencimento: string;
  status: 'pago' | 'pendente';
  parcela: number;
  totalParcelas: number;
};

export type CobrancaPixApi = {
  pixCopiaCola: string;
  qrCodeBase64: string | null;
  expiresAt: string;
};

export type EscritorioDadosBancariosApi = {
  banco: string;
  agencia: string;
  conta: string;
  favorecido: string;
  cnpj: string;
};

export type ClientePerfilApi = {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  endereco: string;
  cpf: string;
  clienteDesde: string;
  fotoPerfil: string | null;
  processoAtivo?: {
    id: string;
    titulo: string;
    subtitulo: string;
    progressoPago: number;
    valorPago: number;
    valorTotal: number;
  };
  preferencias?: { notificacoesAtivas: boolean };
};

export type PerfilEscritorioApi = {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  oab: string;
  endereco: string;
  fotoPerfil: string | null;
  dadosBancarios?: EscritorioDadosBancariosApi;
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

/** Shape normalizado para a Home do cliente (compatível com mock legado e GET /cliente/dashboard). */
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
    id?: string;
    status?: string;
  };
};

export type RelatorioReceitaDespesaApi = {
  labels: string[];
  receita: number[];
  despesa: number[];
};

export type RelatorioReceitaCategoriaApi = {
  categorias: { nome: string; valor: number; percentual: number }[];
};

export type RelatorioDespesasMesApi = {
  labels: string[];
  despesas: number[];
};

export type RelatorioKpiItemApi = {
  valor: string | number;
  variacao: string;
  tipo: 'positivo' | 'negativo';
};

export type RelatorioKpisApi = {
  margemLucro: RelatorioKpiItemApi;
  ticketMedio: RelatorioKpiItemApi;
  inadimplencia: RelatorioKpiItemApi;
  crescimento: RelatorioKpiItemApi;
};

export type RelatorioRankingClientesApi = {
  clientes: { id: string; nome: string; valor: number }[];
};

export type RelatorioInsightsApi = {
  linha: string[];
  pizza: string[];
  barra: string[];
  maioresClientes?: string[];
};

export type IaAnaliseResponseApi = {
  id: string;
  tipoAnalise: string;
  periodo: string;
  resposta: string;
  geradoEm: string;
};

export type IaHistoricoEnvelopeApi = {
  total: number;
  historico: IaAnaliseResponseApi[];
};

export type ImportacaoItemApi = {
  id: string;
  tipo: string;
  arquivo: string;
  data: string;
  status: 'pendente' | 'processando' | 'concluido' | 'erro';
  registros: number;
  novos: number;
  atualizados: number;
  erros: number;
};

export type PagamentosPendentesEnvelopeApi = {
  total: number;
  pagamentos: PagamentoConferirApi[];
};
