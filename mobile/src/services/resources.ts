import type {
  ClienteAdvogadoApi,
  ClienteDashboardApi,
  ClientePerfilApi,
  ClientesListEnvelopeApi,
  CobrancaClienteApi,
  CobrancaDetalheApi,
  CobrancaPixApi,
  ContratoApi,
  DashboardResumoApi,
  EscritorioDadosBancariosApi,
  IaAnaliseResponseApi,
  IaHistoricoEnvelopeApi,
  InsightFinanceiroResponseApi,
  ImportacaoItemApi,
  NotificacaoAdvApi,
  PagamentoConferirApi,
  PagamentosPendentesEnvelopeApi,
  ParcelaApi,
  PerfilEscritorioApi,
  ProcessoResumoApi,
  RelatorioDespesasMesApi,
  RelatorioInsightsApi,
  RelatorioKpisApi,
  RelatorioRankingClientesApi,
  RelatorioReceitaCategoriaApi,
  RelatorioReceitaDespesaApi,
  TipoInsightApi,
  TransacaoApi,
  TransacaoCreatePayload,
  TransacoesListApi,
} from '../types/api';
import { prepareUploadFile } from '../utils/uploadFile';
import { getEtlApiBaseUrl, getIaApiBaseUrl } from '../config/api';
import { Platform } from 'react-native';
import { ApiError, apiDeleteJson, apiFetch, apiGetJson, apiPatchJson, apiPostFormData, apiPostJson, apiPutJson } from './http';

/** Spring / outros backends costumam envolver a lista em `{ data }` ou `{ contratos }`. */
function unwrapContratosArray(raw: unknown): ContratoApi[] {
  if (Array.isArray(raw)) return raw as ContratoApi[];
  if (raw && typeof raw === 'object') {
    const o = raw as Record<string, unknown>;
    for (const key of ['contratos', 'data', 'content', 'items']) {
      const v = o[key];
      if (Array.isArray(v)) return v as ContratoApi[];
    }
  }
  return [];
}

export async function fetchDashboardResumo(token: string | null): Promise<DashboardResumoApi | null> {
  try {
    const d = await apiGetJson<DashboardResumoApi>('/dashboard/resumo', token);
    return {
      id: d.id ?? 1,
      valorDisponivel: d.valorDisponivel ?? 0,
      lucroLiquidoMes: d.lucroLiquidoMes ?? 0,
      receitaMensal: d.receitaMensal ?? 0,
      despesaMensal: d.despesaMensal ?? 0,
      pendentes: d.pendentes ?? 0,
      variacaoReceita: d.variacaoReceita ?? '+0%',
      variacaoPendentes: d.variacaoPendentes ?? '+0%',
      variacaoDespesa: d.variacaoDespesa ?? '+0%',
      variacaoLucro: d.variacaoLucro ?? '+0%',
      pagamentosParaConferir: d.pagamentosParaConferir ?? 0,
    };
  } catch {
    return null;
  }
}

export async function fetchTransacoes(
  token: string | null,
  params?: {
    tipo?: 'receita' | 'despesa';
    status?: 'pago' | 'pendente' | 'atrasado' | 'cancelado';
    periodoDias?: 15 | 30 | 60 | 90;
    dataInicio?: string;
    dataFim?: string;
    page?: number;
    limit?: number;
  },
): Promise<TransacoesListApi> {
  const search = new URLSearchParams();
  if (params?.tipo) search.set('tipo', params.tipo);
  if (params?.status) search.set('status', params.status);
  if (params?.periodoDias) search.set('periodoDias', String(params.periodoDias));
  if (params?.dataInicio) search.set('dataInicio', params.dataInicio);
  if (params?.dataFim) search.set('dataFim', params.dataFim);
  search.set('page', String(params?.page ?? 1));
  search.set('limit', String(params?.limit ?? 20));
  const q = search.toString();
  const env = await apiGetJson<TransacoesListApi>(`/transacoes${q ? `?${q}` : ''}`, token);
  return {
    transacoes: env.transacoes ?? [],
    page: env.page ?? 1,
    pageSize: env.pageSize ?? 20,
    total: env.total ?? 0,
    totalPages: env.totalPages ?? 1,
  };
}

export async function fetchTransacoesRecentes(token: string | null, limit: number): Promise<TransacaoApi[]> {
  const env = await apiGetJson<{ transacoes: TransacaoApi[] }>(`/dashboard/transacoes-recentes?limit=${limit}`, token);
  return env.transacoes ?? [];
}

function notifIdFromApi(id: string | number): string {
  if (typeof id === 'string' && id.startsWith('ntf_')) return id;
  if (typeof id === 'number') return `ntf_${id}`;
  const n = Number(id);
  return Number.isFinite(n) ? `ntf_${n}` : 'ntf_0';
}

export async function fetchNotificacoesAdvogado(token: string | null): Promise<NotificacaoAdvApi[]> {
  const env = await apiGetJson<{
    naoLidas?: number;
    notificacoes: Array<{
      id: string | number;
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
      id: notifIdFromApi(r.id),
      tipo,
      titulo: r.titulo,
      mensagem: r.mensagem,
      data: r.data,
      lida: r.lida,
    };
  });
}

export async function fetchNotificacoesNaoLidasAdvogado(token: string | null): Promise<number> {
  try {
    const env = await apiGetJson<{ naoLidas?: number }>('/notificacoes?limit=1', token);
    return env.naoLidas ?? 0;
  } catch {
    return 0;
  }
}

export async function putNotificacaoAdvLida(token: string | null, id: string): Promise<void> {
  const rawId = id.startsWith('ntf_') ? id.substring(4) : id;
  await apiPutJson(`/notificacoes/${encodeURIComponent(rawId)}/lida`, token);
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
    return null;
  }
}

export async function putClienteNotificacaoLida(token: string | null, id: string): Promise<void> {
  const rawId = id.startsWith('ntf_') ? id.substring(4) : id;
  await apiPutJson(`/cliente/notificacoes/${encodeURIComponent(rawId)}/lida`, token);
}

export type NotificacaoClienteApi = {
  id: string;
  tipo: string;
  titulo: string;
  mensagem: string;
  data: string;
  lida: boolean;
  icon: string;
  color: string;
};

export async function fetchNotificacoesCliente(token: string | null): Promise<NotificacaoClienteApi[]> {
  const env = await apiGetJson<{
    notificacoes: Array<{
      id: string | number;
      tipo: string;
      titulo: string;
      mensagem: string;
      data: string;
      lida: boolean;
    }>;
  }>('/cliente/notificacoes', token);
  return (env.notificacoes ?? []).map((n) => ({
    id: notifIdFromApi(n.id),
    tipo: n.tipo,
    titulo: n.titulo,
    mensagem: n.mensagem,
    data: n.data,
    lida: n.lida,
    icon: 'bell-outline',
    color: '#0d9488',
  }));
}

export async function fetchContratos(token: string | null): Promise<ContratoApi[]> {
  try {
    const raw = await apiGetJson<unknown>('/contratos?_sort=id&_order=asc', token);
    return unwrapContratosArray(raw);
  } catch {
    return [];
  }
}

export async function fetchPagamentosPendentes(token: string | null): Promise<PagamentoConferirApi[]> {
  const env = await apiGetJson<PagamentosPendentesEnvelopeApi>('/pagamentos/pendentes', token);
  return (env.pagamentos ?? []).map((p) => ({
    ...p,
    id: typeof p.id === 'string' && p.id.startsWith('pag_') ? p.id : `pag_${p.id}`,
  }));
}

export async function fetchTransacaoById(token: string | null, id: string): Promise<TransacaoApi | null> {
  try {
    return await apiGetJson<TransacaoApi>(`/transacoes/${encodeURIComponent(id)}`, token);
  } catch {
    return null;
  }
}

export type TransacaoCriadaResponseApi = { id?: string; mensagem?: string };

export async function createTransacao(
  token: string | null,
  body: TransacaoCreatePayload,
): Promise<TransacaoCriadaResponseApi> {
  return apiPostJson<TransacaoCriadaResponseApi>('/transacoes', token, body);
}

export type UploadComprovanteResponseApi = {
  mensagem: string;
  comprovanteUrl?: string;
};

export type UploadableFile = {
  uri: string;
  name: string;
  type: string;
  /** No web, o fetch espera File/Blob real no FormData. */
  file?: File | Blob;
};

export async function postCobrancaComprovante(
  token: string | null,
  cobrancaId: string,
  arquivo: UploadableFile,
): Promise<UploadComprovanteResponseApi> {
  const prepared = await prepareUploadFile(arquivo);
  const fd = new FormData();
  if (prepared.file) {
    fd.append('arquivo', prepared.file, prepared.name);
  } else {
    fd.append('arquivo', {
      uri: prepared.uri,
      name: prepared.name,
      type: prepared.type,
    } as unknown as Blob);
  }
  return apiPostFormData<UploadComprovanteResponseApi>(
    `/cobrancas/${encodeURIComponent(cobrancaId)}/comprovante`,
    token,
    fd,
  );
}

export async function postTransacaoComprovante(
  token: string | null,
  transacaoId: string,
  arquivo: UploadableFile,
): Promise<UploadComprovanteResponseApi> {
  const rawId = transacaoId.startsWith('txn_') ? transacaoId.substring(4) : transacaoId;
  const prepared = await prepareUploadFile(arquivo);
  const fd = new FormData();
  if (prepared.file) {
    fd.append('arquivo', prepared.file, prepared.name);
  } else {
    fd.append('arquivo', {
      uri: prepared.uri,
      name: prepared.name,
      type: prepared.type,
    } as unknown as Blob);
  }
  return apiPostFormData<UploadComprovanteResponseApi>(
    `/transacoes/${encodeURIComponent(rawId)}/comprovante`,
    token,
    fd,
  );
}

export async function fetchClientesAdvogado(token: string | null): Promise<ClienteAdvogadoApi[]> {
  try {
    const env = await apiGetJson<ClientesListEnvelopeApi>('/clientes', token);
    return env.clientes ?? [];
  } catch {
    return [];
  }
}

export async function fetchProcessosAdvogado(token: string | null): Promise<ProcessoResumoApi[]> {
  try {
    const raw = await apiGetJson<unknown>('/processos', token);
    if (Array.isArray(raw)) return raw as ProcessoResumoApi[];
    return [];
  } catch {
    return [];
  }
}

export type ClienteCreatePayload = {
  nome: string;
  email?: string;
  telefone?: string;
  processoIds?: number[];
};

export async function createClienteRapido(
  token: string | null,
  body: ClienteCreatePayload,
): Promise<ClienteAdvogadoApi & { mensagem?: string }> {
  return apiPostJson<ClienteAdvogadoApi & { mensagem?: string }>('/clientes', token, body);
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
  id: string | number,
  body: Partial<PagamentoConferirApi>,
): Promise<void> {
  if (!token) {
    throw new ApiError('Token ausente para atualizar pagamento.', 401);
  }
  const rawId = String(id).startsWith('pag_') ? String(id).substring(4) : String(id);
  if (body.status === 'aprovado') {
    await apiPutJson(`/pagamentos/${rawId}/aprovar`, token);
    return;
  }
  if (body.status === 'reprovado') {
    await apiPutJson(`/pagamentos/${rawId}/reprovar`, token, {
      motivo: body.motivoRejeicao ?? '',
    });
    return;
  }
  await apiPatchJson<PagamentoConferirApi>(`/pagamentos/${rawId}`, token, body);
}

function relatorioPeriodoQuery(periodo: string): string {
  const p = periodo === 'ano' || periodo === 'semestre' ? periodo : 'mes';
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
    const tipoMap: Record<string, TipoInsightApi> = {
      'receita-despesa': 'RECEITA_DESPESA',
      'receita-categoria': 'RECEITA_POR_CATEGORIA',
      'despesa-categoria': 'DESPESA_POR_CATEGORIA',
      'maiores-clientes': 'MAIORES_CLIENTES',
      'margem-lucro': 'MARGEM_LUCRO',
      inadimplencia: 'INADIMPLENCIA',
    };
    const tipoInsight = tipoMap[body.tipoAnalise] ?? 'RECEITA_DESPESA';
    const insight = await iaRequest<InsightFinanceiroResponseApi>('/insights/gerar', token, {
      method: 'POST',
      body: JSON.stringify({
        tipoInsight,
        dataInicio: body.dataInicio,
        dataFim: body.dataFim,
        incluirComparativoPeriodoAnterior: true,
      }),
    });
    return {
      id: String(insight.id),
      tipoAnalise: body.tipoAnalise,
      periodo: `${insight.dataInicio} - ${insight.dataFim}`,
      resposta: insight.resumoIA,
      geradoEm: insight.criadoEm,
    };
  } catch {
    return null;
  }
}

export async function fetchIaHistorico(
  token: string | null,
  tipo?: string,
): Promise<IaHistoricoEnvelopeApi | null> {
  try {
    const tipoMap: Record<string, TipoInsightApi> = {
      'receita-despesa': 'RECEITA_DESPESA',
      'receita-categoria': 'RECEITA_POR_CATEGORIA',
      'despesa-categoria': 'DESPESA_POR_CATEGORIA',
      'maiores-clientes': 'MAIORES_CLIENTES',
      'margem-lucro': 'MARGEM_LUCRO',
      inadimplencia: 'INADIMPLENCIA',
    };
    const params = new URLSearchParams({ page: '0', size: '50' });
    if (tipo && tipo !== 'todos' && tipoMap[tipo]) {
      params.set('tipoInsight', tipoMap[tipo]);
    }
    const env = await iaRequest<{ content?: InsightFinanceiroResponseApi[] }>(
      `/insights?${params.toString()}`,
      token,
      { cache: 'no-store' },
    );
    const historico = (env.content ?? []).map((item) => ({
      id: String(item.id),
      tipoAnalise: item.tipoInsight,
      periodo: `${item.dataInicio} - ${item.dataFim}`,
      resposta: item.resumoIA,
      geradoEm: item.criadoEm,
    }));
    return { total: historico.length, historico };
  } catch {
    return null;
  }
}

export async function postInsightGerar(
  token: string | null,
  body: {
    tenantId?: number;
    tipoInsight: TipoInsightApi;
    dataInicio: string;
    dataFim: string;
    incluirComparativoPeriodoAnterior: boolean;
  },
): Promise<InsightFinanceiroResponseApi | null> {
  try {
    return await iaRequest<InsightFinanceiroResponseApi>('/insights/gerar', token, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  } catch {
    return null;
  }
}

export async function fetchInsightsHistorico(
  token: string | null,
  tenantId?: number,
  tipoInsight?: TipoInsightApi,
  page = 0,
  size = 50,
): Promise<InsightFinanceiroResponseApi[]> {
  try {
    const params = new URLSearchParams({
      page: String(page),
      size: String(size),
    });
    if (tenantId != null) params.set('tenantId', String(tenantId));
    if (tipoInsight) params.set('tipoInsight', tipoInsight);
    const env = await iaRequest<{ content?: InsightFinanceiroResponseApi[] }>(
      `/insights?${params.toString()}`,
      token,
      { cache: 'no-store' },
    );
    return env.content ?? [];
  } catch {
    return [];
  }
}

async function iaRequest<T>(path: string, token: string | null, init?: RequestInit): Promise<T> {
  const base = getIaApiBaseUrl();
  if (!base) throw new ApiError('API de IA não configurada (defina EXPO_PUBLIC_IA_API_URL).', 500);
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const buildHeaders = (includeAuth: boolean) => {
    const headers = new Headers(init?.headers);
    headers.set('Accept', 'application/json');
    if (init?.body != null && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }
    if (includeAuth && token) headers.set('Authorization', `Bearer ${token}`);
    if (!includeAuth) headers.delete('Authorization');
    return headers;
  };

  const doRequest = async (includeAuth: boolean) => {
    return fetch(`${base}${normalizedPath}`, { ...init, headers: buildHeaders(includeAuth) });
  };

  let res = await doRequest(Boolean(token));
  if (res.status === 401 && token) {
    // API-IA-MOBILE pode estar sem JWT configurado; reenvia sem Authorization.
    res = await doRequest(false);
  }
  if (!res.ok) {
    const body = await res.text();
    const preview = body.length > 200 ? `${body.slice(0, 200)}…` : body;
    throw new ApiError(`[${res.status}] ${res.statusText} em ${path}${preview ? ` | body: ${preview}` : ''}`, res.status);
  }
  return res.json() as Promise<T>;
}

function normalizeUsuarioId(usuarioId: string): number | null {
  const parsed = Number(usuarioId);
  if (!Number.isInteger(parsed) || parsed <= 0) return null;
  return parsed;
}

export async function fetchImportacaoHistorico(token: string | null, usuarioId: string): Promise<ImportacaoItemApi[]> {
  try {
    const base = getEtlApiBaseUrl();
    if (!base) return [];
    const usuarioIdNumerico = normalizeUsuarioId(usuarioId);
    if (!usuarioIdNumerico) return [];
    const url = new URL('/etl/importacao/historico', `${base}/`);
    url.searchParams.set('usuario_id', String(usuarioIdNumerico));
    const res = await fetch(url.toString(), {
      method: 'GET',
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    if (!res.ok) return [];
    const env = (await res.json()) as { importacoes: ImportacaoItemApi[] };
    return env.importacoes ?? [];
  } catch {
    return [];
  }
}

export async function postImportacaoUpload(
  token: string | null,
  body: {
    usuarioId: number;
    banco: 'c6' | 'bradesco' | 'itau';
    file: { uri: string; name: string; mimeType?: string; webFile?: File | null };
    persistir?: boolean;
  },
): Promise<
  | {
      ok: true;
      data: {
        mensagem: string;
        banco: string;
        arquivo_origem: string;
        total_extraido: number;
        duplicatas_ignoradas: number;
        inseridas: number;
      };
    }
  | {
      ok: false;
      error: string;
      status?: number;
    }
> {
  try {
    const base = getEtlApiBaseUrl();
    if (!base) return { ok: false, error: 'API ETL não configurada.' };

    const formData = new FormData();
    const mimeType = body.file.mimeType ?? (body.banco === 'itau' ? 'application/pdf' : 'text/csv');
    if (Platform.OS === 'web') {
      const maybeFile = body.file.webFile;
      if (maybeFile instanceof File) {
        formData.append('arquivo', maybeFile, body.file.name);
      } else {
        const blobRes = await fetch(body.file.uri);
        const blob = await blobRes.blob();
        formData.append('arquivo', blob, body.file.name);
      }
    } else {
      formData.append('arquivo', {
        uri: body.file.uri,
        name: body.file.name,
        type: mimeType,
      } as unknown as Blob);
    }

    const uploadUrl = new URL('/etl/upload', `${base}/`);
    uploadUrl.searchParams.set('banco', body.banco);
    uploadUrl.searchParams.set('usuario_id', String(body.usuarioId));
    uploadUrl.searchParams.set('persistir', body.persistir === false ? 'false' : 'true');
    const res = await fetch(uploadUrl.toString(), {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      body: formData,
    });
    if (!res.ok) {
      let detalhe = `Falha no upload (${res.status})`;
      try {
        const err = (await res.json()) as { detail?: string };
        if (err?.detail) detalhe = err.detail;
      } catch {
        // Ignora parse de erro e mantém mensagem padrão.
      }
      return { ok: false, error: detalhe, status: res.status };
    }
    const data = (await res.json()) as {
      mensagem: string;
      banco: string;
      arquivo_origem: string;
      total_extraido: number;
      duplicatas_ignoradas: number;
      inseridas: number;
    };
    return { ok: true, data };
  } catch {
    return { ok: false, error: 'Não foi possível conectar na API ETL.' };
  }
}

export async function fetchExportacaoTransacoesCsv(token: string | null, usuarioId: string): Promise<string | null> {
  try {
    const base = getEtlApiBaseUrl();
    if (!base) return null;
    const usuarioIdNumerico = normalizeUsuarioId(usuarioId);
    if (!usuarioIdNumerico) return null;
    const url = new URL('/etl/extrato/csv', `${base}/`);
    url.searchParams.set('usuario_id', String(usuarioIdNumerico));
    const res = await fetch(url.toString(), {
      method: 'GET',
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

/** Mantém o KPI da home alinhado à quantidade real de pagamentos pendentes. */
export async function syncPagamentosDashboardCount(token: string | null): Promise<void> {
  void token;
  return;
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
