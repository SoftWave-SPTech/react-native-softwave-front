import type {
  ClienteDashboardApi,
  ClientePerfilApi,
  CobrancaClienteApi,
  CobrancaDetalheApi,
  CobrancaPixApi,
  ContratoApi,
  DashboardResumoApi,
  EscritorioDadosBancariosApi,
  IaAnaliseResponseApi,
  IaHistoricoEnvelopeApi,
  ImportacaoItemApi,
  NotificacaoAdvApi,
  PagamentoConferirApi,
  PagamentosPendentesEnvelopeApi,
  ParcelaApi,
  PerfilEscritorioApi,
  RelatorioDespesasMesApi,
  RelatorioInsightsApi,
  RelatorioKpisApi,
  RelatorioRankingClientesApi,
  RelatorioReceitaCategoriaApi,
  RelatorioReceitaDespesaApi,
  TransacaoApi,
} from '../types/api';
import { apiDeleteJson, apiFetch, apiGetJson, apiPatchJson, apiPostJson, apiPutJson } from './http';

export async function fetchDashboardResumo(token: string | null): Promise<DashboardResumoApi | null> {
  const rows = await apiGetJson<DashboardResumoApi[]>('/dashboardResumo', token);
  return rows[0] ?? null;
}

export async function fetchTransacoes(token: string | null): Promise<TransacaoApi[]> {
  return apiGetJson<TransacaoApi[]>('/transacoes?_sort=ordem&_order=desc', token);
}

export async function fetchTransacoesRecentes(token: string | null, limit: number): Promise<TransacaoApi[]> {
  return apiGetJson<TransacaoApi[]>(
    `/transacoes?_sort=ordem&_order=desc&_limit=${limit}`,
    token,
  );
}

function notifAdvIdFromApi(id: string | number): number {
  if (typeof id === 'number') return id;
  const n = Number(id);
  return Number.isFinite(n) ? n : 0;
}

export async function fetchNotificacoesAdvogado(token: string | null): Promise<NotificacaoAdvApi[]> {
  try {
    const env = await apiGetJson<{
      notificacoes: Array<{
        id: string;
        tipo: string;
        titulo: string;
        mensagem: string;
        data: string;
        lida: boolean;
      }>;
    }>('/notificacoes', token);
    return (env.notificacoes ?? []).map((r) => {
      const tipos: NotificacaoAdvApi['tipo'][] = ['pagamento', 'alerta', 'sucesso', 'lembrete', 'insight'];
      const tipo = (tipos.includes(r.tipo as NotificacaoAdvApi['tipo']) ? r.tipo : 'alerta') as NotificacaoAdvApi['tipo'];
      return {
        id: notifAdvIdFromApi(r.id),
        tipo,
        titulo: r.titulo,
        mensagem: r.mensagem,
        data: r.data,
        lida: r.lida,
      };
    });
  } catch {
    return apiGetJson<NotificacaoAdvApi[]>('/notificacoesAdvogado?_sort=id&_order=desc', token);
  }
}

export async function putNotificacaoAdvLida(token: string | null, id: number): Promise<void> {
  await apiPutJson(`/notificacoes/${id}/lida`, token);
}

function formatVencimentoClienteDash(v: string): string {
  if (!v || v.includes('/')) return v;
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(v);
  if (m) return `${m[3]}/${m[2]}/${m[1]}`;
  return v;
}

export async function fetchClienteDashboard(token: string | null): Promise<ClienteDashboardApi | null> {
  try {
    const d = await apiGetJson<{
      nome: string;
      totalPago: number;
      totalPendente: number;
      totalContrato: number;
      percentualPago: number;
      parcelasRestantes: number;
      notificacoesNaoLidas: number;
      ultimaCobranca?: {
        id?: string;
        descricao?: string;
        vencimento: string;
        valor: number;
        status?: string;
      };
    }>('/cliente/dashboard', token);
    const uc = d.ultimaCobranca;
    return {
      id: 0,
      nome: d.nome,
      totalPago: d.totalPago,
      totalPendente: d.totalPendente,
      totalContrato: d.totalContrato,
      percentualPago: d.percentualPago,
      parcelasRestantes: d.parcelasRestantes,
      notificacoesNaoLidas: d.notificacoesNaoLidas,
      ultimaCobranca: uc
        ? {
            parcelaLabel: uc.descricao || '',
            vencimento: formatVencimentoClienteDash(uc.vencimento),
            valor: uc.valor,
            id: uc.id,
            status: uc.status,
          }
        : undefined,
    };
  } catch {
    try {
      const rows = await apiGetJson<ClienteDashboardApi[]>('/clienteDashboard', token);
      return rows[0] ?? null;
    } catch {
      return null;
    }
  }
}

export async function putClienteNotificacaoLida(token: string | null, id: number): Promise<void> {
  await apiPutJson(`/cliente/notificacoes/${id}/lida`, token);
}

export type NotificacaoClienteApi = {
  id: number;
  tipo: string;
  titulo: string;
  mensagem: string;
  data: string;
  lida: boolean;
  icon: string;
  color: string;
};

export async function fetchNotificacoesCliente(token: string | null): Promise<NotificacaoClienteApi[]> {
  return apiGetJson<NotificacaoClienteApi[]>('/notificacoesCliente?_sort=id&_order=desc', token);
}

export async function fetchContratos(token: string | null): Promise<ContratoApi[]> {
  return apiGetJson<ContratoApi[]>('/contratos?_sort=id&_order=asc', token);
}

export async function fetchPagamentosPendentes(token: string | null): Promise<PagamentoConferirApi[]> {
  try {
    const env = await apiGetJson<PagamentosPendentesEnvelopeApi>('/pagamentos/pendentes', token);
    return env.pagamentos ?? [];
  } catch {
    return apiGetJson<PagamentoConferirApi[]>(
      '/pagamentosParaConferir?status=pendente&_sort=id&_order=desc',
      token,
    );
  }
}

export async function fetchTransacaoById(token: string | null, id: string): Promise<TransacaoApi | null> {
  try {
    return await apiGetJson<TransacaoApi>(`/transacoes/${encodeURIComponent(id)}`, token);
  } catch {
    return null;
  }
}

export async function createTransacao(token: string | null, body: TransacaoApi): Promise<TransacaoApi> {
  return apiPostJson<TransacaoApi>('/transacoes', token, body);
}

export async function updateTransacao(
  token: string | null,
  id: string,
  body: Partial<TransacaoApi>,
): Promise<TransacaoApi> {
  return apiPatchJson<TransacaoApi>(`/transacoes/${encodeURIComponent(id)}`, token, body);
}

export async function deleteTransacao(token: string | null, id: string): Promise<void> {
  return apiDeleteJson(`/transacoes/${encodeURIComponent(id)}`, token);
}

export async function updatePagamentoConferir(
  token: string | null,
  id: number,
  body: Partial<PagamentoConferirApi>,
): Promise<void> {
  if (body.status === 'aprovado') {
    await apiPutJson(`/pagamentos/${id}/aprovar`, token);
    return;
  }
  if (body.status === 'reprovado') {
    await apiPutJson(`/pagamentos/${id}/reprovar`, token, {
      motivo: body.motivoRejeicao ?? '',
    });
    return;
  }
  await apiPatchJson<PagamentoConferirApi>(`/pagamentosParaConferir/${id}`, token, body);
}

function relatorioPeriodoQuery(periodo: string): string {
  const p = periodo === 'ano' ? 'ano' : 'mes';
  return `?periodo=${p}`;
}

export async function fetchRelatorioReceitaDespesa(
  token: string | null,
  periodo: string,
): Promise<RelatorioReceitaDespesaApi | null> {
  try {
    return await apiGetJson<RelatorioReceitaDespesaApi>(
      `/relatorios/receita-despesa${relatorioPeriodoQuery(periodo)}`,
      token,
    );
  } catch {
    return null;
  }
}

export async function fetchRelatorioReceitaCategoria(
  token: string | null,
  periodo: string,
): Promise<RelatorioReceitaCategoriaApi | null> {
  try {
    return await apiGetJson<RelatorioReceitaCategoriaApi>(
      `/relatorios/receita-categoria${relatorioPeriodoQuery(periodo)}`,
      token,
    );
  } catch {
    return null;
  }
}

export async function fetchRelatorioDespesasMes(
  token: string | null,
  periodo: string,
): Promise<RelatorioDespesasMesApi | null> {
  try {
    return await apiGetJson<RelatorioDespesasMesApi>(
      `/relatorios/despesas-mes${relatorioPeriodoQuery(periodo)}`,
      token,
    );
  } catch {
    return null;
  }
}

export async function fetchRelatorioKpis(
  token: string | null,
  periodo: string,
): Promise<RelatorioKpisApi | null> {
  try {
    return await apiGetJson<RelatorioKpisApi>(`/relatorios/kpis${relatorioPeriodoQuery(periodo)}`, token);
  } catch {
    return null;
  }
}

export async function fetchRelatorioRankingClientes(
  token: string | null,
  periodo: string,
): Promise<RelatorioRankingClientesApi | null> {
  try {
    return await apiGetJson<RelatorioRankingClientesApi>(
      `/relatorios/ranking-clientes${relatorioPeriodoQuery(periodo)}&limit=10`,
      token,
    );
  } catch {
    return null;
  }
}

export async function fetchRelatorioInsights(
  token: string | null,
  periodo: string,
): Promise<RelatorioInsightsApi | null> {
  try {
    return await apiGetJson<RelatorioInsightsApi>(
      `/relatorios/insights${relatorioPeriodoQuery(periodo)}`,
      token,
    );
  } catch {
    return null;
  }
}

export async function postIaAnalise(
  token: string | null,
  body: { tipoAnalise: string; dataInicio: string; dataFim: string },
): Promise<IaAnaliseResponseApi | null> {
  try {
    return await apiPostJson<IaAnaliseResponseApi>('/ia/analise', token, body);
  } catch {
    return null;
  }
}

export async function fetchIaHistorico(
  token: string | null,
  tipo?: string,
): Promise<IaHistoricoEnvelopeApi | null> {
  try {
    const q = tipo && tipo !== 'todos' ? `?tipo=${encodeURIComponent(tipo)}` : '';
    return await apiGetJson<IaHistoricoEnvelopeApi>(`/ia/historico${q}`, token);
  } catch {
    return null;
  }
}

export async function fetchImportacaoHistorico(token: string | null): Promise<ImportacaoItemApi[]> {
  try {
    const env = await apiGetJson<{ importacoes: ImportacaoItemApi[] }>('/importacao/historico', token);
    return env.importacoes ?? [];
  } catch {
    return [];
  }
}

export async function postImportacaoUpload(
  token: string | null,
  body: { tipo: string; arquivoNome: string },
): Promise<{ id: string; mensagem: string; status: string } | null> {
  try {
    return await apiPostJson<{ id: string; mensagem: string; status: string }>(
      '/importacao/upload',
      token,
      body,
    );
  } catch {
    return null;
  }
}

export async function fetchExportacaoTransacoesCsv(token: string | null): Promise<string | null> {
  try {
    const res = await apiFetch(`/exportacao/transacoes?formato=csv`, { method: 'GET', token });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

/** Mantém o KPI da home alinhado à quantidade real de pagamentos pendentes. */
export async function syncPagamentosDashboardCount(token: string | null): Promise<void> {
  const pending = await fetchPagamentosPendentes(token);
  await apiPatchJson('/dashboardResumo/1', token, { pagamentosParaConferir: pending.length });
}

export async function postEsqueciSenha(email: string): Promise<{ mensagem: string }> {
  return apiPostJson<{ mensagem: string }>('/auth/esqueci-senha', null, { email });
}

export async function fetchContratoById(token: string | null, id: string): Promise<ContratoApi | null> {
  try {
    return await apiGetJson<ContratoApi>(`/contratos/${encodeURIComponent(id)}`, token);
  } catch {
    return null;
  }
}

export async function fetchParcelasContrato(token: string | null, contratoId: string): Promise<ParcelaApi[]> {
  const envelope = await apiGetJson<{ parcelas: ParcelaApi[] }>(
    `/contratos/${encodeURIComponent(contratoId)}/parcelas`,
    token,
  );
  return envelope.parcelas ?? [];
}

export async function patchParcelaStatus(
  token: string | null,
  parcelaId: string,
  status: ParcelaApi['status'],
): Promise<ParcelaApi> {
  return apiPatchJson<ParcelaApi>(`/parcelas/${encodeURIComponent(parcelaId)}`, token, { status });
}

export async function postGerarCobrancaParcela(
  token: string | null,
  parcelaId: string,
): Promise<{ mensagem: string; cobrancaId: string }> {
  return apiPostJson<{ mensagem: string; cobrancaId: string }>(
    `/parcelas/${encodeURIComponent(parcelaId)}/gerar-cobranca`,
    token,
    {},
  );
}

export async function fetchClienteCobrancas(
  token: string | null,
  status?: 'pendente' | 'pago',
): Promise<CobrancaClienteApi[]> {
  const q = status ? `?status=${status}` : '';
  const envelope = await apiGetJson<{ cobrancas: CobrancaClienteApi[] }>(`/cliente/cobrancas${q}`, token);
  return envelope.cobrancas ?? [];
}

export async function fetchCobrancaDetalhe(token: string | null, id: string): Promise<CobrancaDetalheApi | null> {
  try {
    return await apiGetJson<CobrancaDetalheApi>(`/cobrancas/${encodeURIComponent(id)}`, token);
  } catch {
    return null;
  }
}

export async function fetchCobrancaPix(token: string | null, id: string): Promise<CobrancaPixApi | null> {
  try {
    return await apiGetJson<CobrancaPixApi>(`/cobrancas/${encodeURIComponent(id)}/pix`, token);
  } catch {
    return null;
  }
}

export async function fetchEscritorioDadosBancarios(token: string | null): Promise<EscritorioDadosBancariosApi | null> {
  try {
    return await apiGetJson<EscritorioDadosBancariosApi>('/escritorio/dados-bancarios', token);
  } catch {
    return null;
  }
}

export async function fetchClientePerfil(token: string | null): Promise<ClientePerfilApi | null> {
  try {
    return await apiGetJson<ClientePerfilApi>('/cliente/perfil', token);
  } catch {
    return null;
  }
}

export async function fetchPerfilEscritorio(token: string | null): Promise<PerfilEscritorioApi | null> {
  try {
    return await apiGetJson<PerfilEscritorioApi>('/perfil', token);
  } catch {
    return null;
  }
}
