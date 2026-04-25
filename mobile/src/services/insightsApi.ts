import { API_BASE_URL } from '../config/api';

export type TipoInsight =
  | 'RECEITA_DESPESA'
  | 'RECEITA_POR_CATEGORIA'
  | 'DESPESA_POR_CATEGORIA'
  | 'MAIORES_CLIENTES'
  | 'MARGEM_LUCRO'
  | 'INADIMPLENCIA';

export type GerarInsightRequest = {
  tenantId: number;
  tipoInsight: TipoInsight;
  dataInicio: string;
  dataFim: string;
  incluirComparativoPeriodoAnterior: boolean;
};

export type InsightFinanceiroResponse = {
  id: number;
  tenantId: number;
  tipoInsight: TipoInsight;
  dataInicio: string;
  dataFim: string;
  resumoIA: string;
  bullets: string[];
  riscos: string[];
  oportunidades: string[];
  scoreConfianca: number;
  modeloIA: string;
  criadoEm: string;
};

type ApiErrorResponse = {
  message?: string;
  error?: string;
  status?: number;
};

async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    let detail = `Erro HTTP ${response.status}`;

    try {
      const payload = (await response.json()) as ApiErrorResponse;
      if (payload.message) {
        detail = payload.message;
      } else if (payload.error) {
        detail = payload.error;
      }
    } catch {
      // resposta sem JSON de erro
    }

    throw new Error(detail);
  }

  return (await response.json()) as T;
}

export async function gerarInsight(payload: GerarInsightRequest) {
  return apiRequest<InsightFinanceiroResponse>('/insights/gerar', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

/** O backend exige tenantId e tipoInsight na query (sem isso retorna 400). */
export async function obterUltimoInsight(tenantId: number, tipoInsight: TipoInsight) {
  const params = new URLSearchParams({
    tenantId: String(tenantId),
    tipoInsight,
  });
  return apiRequest<InsightFinanceiroResponse>(`/insights/ultimo?${params.toString()}`);
}

type PagedInsights = { content: InsightFinanceiroResponse[] };

export async function listarInsights(tenantId: number, page = 0, size = 20) {
  const params = new URLSearchParams({
    tenantId: String(tenantId),
    page: String(page),
    size: String(size),
  });
  const pageData = await apiRequest<PagedInsights>(`/insights?${params.toString()}`);
  return pageData.content ?? [];
}
