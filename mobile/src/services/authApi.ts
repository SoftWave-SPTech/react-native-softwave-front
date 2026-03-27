import { getApiBaseUrl } from '../config/api';
import type { UserType } from '../context/AuthContext';

type LoginApiSuccess = {
  token: string;
  usuario: {
    id: string;
    nome: string;
    email: string;
    tipo: UserType;
    fotoPerfil?: string | null;
  };
};

type LoginApiErrorBody = {
  erro?: boolean;
  mensagem?: string;
};

/**
 * Tenta login no mock-api (`POST /auth/login`).
 * @returns sucesso com token + tipo, ou erro de rede/HTTP.
 */
export async function loginWithApi(email: string, senha: string): Promise<
  | { ok: true; data: LoginApiSuccess }
  | { ok: false; error: string; isNetworkError?: boolean }
> {
  const base = getApiBaseUrl();
  if (!base) {
    return { ok: false, error: 'API não configurada.' };
  }

  try {
    const res = await fetch(`${base}/auth/login`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: email.trim(), senha }),
    });

    const data = (await res.json().catch(() => ({}))) as LoginApiSuccess & LoginApiErrorBody;

    if (!res.ok) {
      return {
        ok: false,
        error: data.mensagem || 'E-mail ou senha incorretos.',
      };
    }

    if (!data.token || !data.usuario?.tipo) {
      return { ok: false, error: 'Resposta inválida do servidor.' };
    }

    return {
      ok: true,
      data: {
        token: data.token,
        usuario: data.usuario,
      },
    };
  } catch {
    return {
      ok: false,
      isNetworkError: true,
      error:
        'Não foi possível conectar ao servidor. Confira se o JSON Server está rodando e se o IP em EXPO_PUBLIC_API_URL está correto.',
    };
  }
}
