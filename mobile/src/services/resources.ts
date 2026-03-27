import type {
  ClienteDashboardApi,
  ContratoApi,
  DashboardResumoApi,
  NotificacaoAdvApi,
  PagamentoConferirApi,
  TransacaoApi,
} from '../types/api';
import { apiDeleteJson, apiGetJson, apiPatchJson, apiPostJson } from './http';

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

export async function fetchNotificacoesAdvogado(token: string | null): Promise<NotificacaoAdvApi[]> {
  return apiGetJson<NotificacaoAdvApi[]>('/notificacoesAdvogado?_sort=id&_order=desc', token);
}

export async function fetchClienteDashboard(token: string | null): Promise<ClienteDashboardApi | null> {
  const rows = await apiGetJson<ClienteDashboardApi[]>('/clienteDashboard', token);
  return rows[0] ?? null;
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
  return apiGetJson<PagamentoConferirApi[]>(
    '/pagamentosParaConferir?status=pendente&_sort=id&_order=desc',
    token,
  );
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
): Promise<PagamentoConferirApi> {
  return apiPatchJson<PagamentoConferirApi>(`/pagamentosParaConferir/${id}`, token, body);
}

/** Mantém o KPI da home alinhado à quantidade real de pagamentos pendentes. */
export async function syncPagamentosDashboardCount(token: string | null): Promise<void> {
  const pending = await fetchPagamentosPendentes(token);
  await apiPatchJson('/dashboardResumo/1', token, { pagamentosParaConferir: pending.length });
}
