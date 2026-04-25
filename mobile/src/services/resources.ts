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
  TransacaoApi,
  TransacaoCreatePayload,
} from '../types/api';
import { Platform } from 'react-native';
import { getEtlApiBaseUrl } from '../config/api';
import { apiDeleteJson, apiGetJson, apiPatchJson, apiPostJson, apiPutJson } from './http';

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
  try {
    const raw = await apiGetJson<unknown>('/contratos?_sort=id&_order=asc', token);
    return unwrapContratosArray(raw);
  } catch {
    return [];
  }
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

export type TransacaoCriadaResponseApi = { id?: string; mensagem?: string };

export async function createTransacao(
  token: string | null,
  body: TransacaoCreatePayload,
): Promise<TransacaoCriadaResponseApi> {
  return apiPostJson<TransacaoCriadaResponseApi>('/transacoes', token, body);
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

export async function fetchImportacaoHistorico(token: string | null, usuarioId: string): Promise<ImportacaoItemApi[]> {
  try {
    const base = getEtlApiBaseUrl();
    if (!base) return [];
    const url = new URL('/etl/importacao/historico', `${base}/`);
    url.searchParams.set('usuario_id', usuarioId);
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
    usuarioId: string;
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
    uploadUrl.searchParams.set('usuario_id', body.usuarioId);
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
    const url = new URL('/etl/extrato/csv', `${base}/`);
    url.searchParams.set('usuario_id', usuarioId);
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
  const pending = await fetchPagamentosPendentes(token);
  await apiPatchJson('/dashboardResumo/1', token, { pagamentosParaConferir: pending.length });
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
