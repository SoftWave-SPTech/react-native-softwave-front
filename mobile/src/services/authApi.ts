import type { UserType } from '../context/AuthContext';
import { getLoginApiBaseUrl } from '../config/api';

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

/** Resposta real da API-AUTH-MAIL (`UsuarioTokenDTO`) */
type AuthMailLoginBody = {
  token?: string;
  id?: number;
  nome?: string;
  email?: string;
  tipoUsuario?: string;
  /** Alguns proxies / versões antigas */
  tipo_usuario?: string;
  role?: string;
  foto?: string | null;
};

/** Erros da auth (Spring) ou mock antigo */
type LoginErrorBody = {
  erro?: boolean;
  mensagem?: string;
  message?: string;
};

function decodeJwtPayloadRecord(token: string): Record<string, unknown> | null {
  try {
    const part = token.split('.')[1];
    if (!part) return null;
    const b64 = part.replace(/-/g, '+').replace(/_/g, '/');
    const pad = b64.length % 4;
    const padded = pad ? b64 + '='.repeat(4 - pad) : b64;
    const atobFn = globalThis.atob as ((d: string) => string) | undefined;
    if (!atobFn) return null;
    const binary = atobFn(padded);
    const json = decodeURIComponent(
      Array.from(binary, (c) => `%${`00${c.charCodeAt(0).toString(16)}`.slice(-2)}`).join(''),
    );
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return null;
  }
}

/**
 * Converte `tipoUsuario` da API / JWT para rotas do app (`advogado` = escritório, `cliente` = portal cliente).
 *
 * Valores esperados: `advogado_fisico`, `advogado_juridico`, `usuario_fisico`, `usuario_juridico`,
 * ou nomes de entidade (`UsuarioFisico`, `AdvogadoJuridico`, …).
 */
export function mapTipoUsuarioAuthToApp(tipoUsuario: string | undefined): UserType | null {
  if (!tipoUsuario || String(tipoUsuario).trim().length === 0) {
    return null;
  }
  const raw = String(tipoUsuario).trim();
  const simple = raw.includes('.') ? (raw.split('.').pop() ?? raw) : raw;
  const compact = simple.replace(/_/g, '').toLowerCase();

  if (compact === 'advogadofisico' || compact === 'advogadojuridico') {
    return 'advogado';
  }
  if (compact === 'usuariofisico' || compact === 'usuariojuridico') {
    return 'cliente';
  }

  return null;
}

function tipoUsuarioFromBodyOrJwt(body: AuthMailLoginBody): string | undefined {
  const direct = body.tipoUsuario ?? body.tipo_usuario;
  if (direct && String(direct).trim()) {
    return String(direct).trim();
  }
  const token = body.token;
  if (!token) return undefined;
  const payload = decodeJwtPayloadRecord(token);
  const fromJwt = payload?.tipoUsuario ?? payload?.tipo_usuario;
  return typeof fromJwt === 'string' && fromJwt.trim() ? fromJwt.trim() : undefined;
}

function normalizeLoginSuccess(body: AuthMailLoginBody): LoginApiSuccess | null {
  const token = body.token;
  if (!token) {
    return null;
  }

  const tipoStr = tipoUsuarioFromBodyOrJwt(body);
  const tipo = mapTipoUsuarioAuthToApp(tipoStr);
  if (!tipo) {
    return null;
  }

  const id = body.id != null ? String(body.id) : '';
  const nome = body.nome ?? '';
  const email = body.email ?? '';

  return {
    token,
    usuario: {
      id,
      nome,
      email,
      tipo,
      fotoPerfil: body.foto ?? null,
    },
  };
}

/** Formato antigo do mock (`usuario.tipo` já advogado | cliente). */
type MockShapeLogin = {
  token?: string;
  usuario?: {
    id?: string;
    nome?: string;
    email?: string;
    tipo?: UserType;
    fotoPerfil?: string | null;
  };
};

function tryParseMockShape(data: AuthMailLoginBody & MockShapeLogin): LoginApiSuccess | null {
  const u = data as MockShapeLogin;
  if (!u.token || !u.usuario?.tipo) {
    return null;
  }
  return {
    token: u.token,
    usuario: {
      id: String(u.usuario.id ?? ''),
      nome: u.usuario.nome ?? '',
      email: u.usuario.email ?? '',
      tipo: u.usuario.tipo,
      fotoPerfil: u.usuario.fotoPerfil ?? null,
    },
  };
}

/**
 * Login na API-AUTH-MAIL (`POST /auth/login`) ou mock com o mesmo contrato legado.
 */
export async function loginWithApi(email: string, senha: string): Promise<
  | { ok: true; data: LoginApiSuccess }
  | { ok: false; error: string; isNetworkError?: boolean }
> {
  const base = getLoginApiBaseUrl();
  if (!base) {
    return { ok: false, error: 'API não configurada (EXPO_PUBLIC_AUTH_API_URL ou EXPO_PUBLIC_API_URL).' };
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

    const raw = (await res.json().catch(() => ({}))) as AuthMailLoginBody &
      MockShapeLogin &
      LoginErrorBody;

    if (!res.ok) {
      const msg =
        raw.mensagem || raw.message || 'E-mail ou senha incorretos.';
      return {
        ok: false,
        error: msg,
      };
    }

    const fromMock = tryParseMockShape(raw);
    if (fromMock) {
      return { ok: true, data: fromMock };
    }

    const normalized = normalizeLoginSuccess(raw);
    if (!normalized) {
      const hint = tipoUsuarioFromBodyOrJwt(raw);
      const unsupported = Boolean(hint && !mapTipoUsuarioAuthToApp(hint));
      return {
        ok: false,
        error: unsupported
          ? `Tipo de usuário não reconhecido no app: ${hint}.`
          : 'Resposta inválida do servidor (token ou tipo de usuário ausente).',
      };
    }

    return { ok: true, data: normalized };
  } catch {
    return {
      ok: false,
      isNetworkError: true,
      error:
        'Não foi possível conectar ao servidor de login. Confira EXPO_PUBLIC_AUTH_API_URL (API-AUTH-MAIL, ex.: porta 8083) e o IP na rede.',
    };
  }
}

/** Mesma regra da API (`ResetSenhaRequest`): ≥8 caracteres com maiúscula, minúscula, número e símbolo (@#$%^&+=). */
export const RESET_SENHA_REGEX =
  /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=])(?=\S+$).{8,}$/;

async function parseAuthMailError(res: Response): Promise<string> {
  const text = await res.text();
  if (!text.trim()) {
    return res.statusText || 'Erro na solicitação.';
  }
  try {
    const j = JSON.parse(text) as Record<string, unknown>;
    if (typeof j.message === 'string') return j.message;
    if (typeof j.mensagem === 'string') return j.mensagem;
    const first = Object.values(j).find((v) => typeof v === 'string');
    if (first) return first as string;
    return text;
  } catch {
    return text;
  }
}

/**
 * Solicita e-mail com token de recuperação (`POST /auth/solicitar-reset-senha?email=`).
 */
export async function solicitarResetSenhaAuth(email: string): Promise<
  { ok: true } | { ok: false; error: string; isNetworkError?: boolean }
> {
  const base = getLoginApiBaseUrl();
  if (!base) {
    return {
      ok: false,
      error: 'Configure EXPO_PUBLIC_AUTH_API_URL (API-AUTH-MAIL).',
    };
  }

  try {
    const url = `${base}/auth/solicitar-reset-senha?email=${encodeURIComponent(email.trim())}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Accept: 'application/json, text/plain;q=0.9,*/*;q=0.8',
      },
    });

    if (!res.ok) {
      return {
        ok: false,
        error: await parseAuthMailError(res),
      };
    }

    return { ok: true };
  } catch {
    return {
      ok: false,
      isNetworkError: true,
      error:
        'Não foi possível contatar o servidor de recuperação de senha. Confira EXPO_PUBLIC_AUTH_API_URL.',
    };
  }
}

/**
 * Define nova senha com o token recebido por e-mail (`POST /auth/resetar-senha`).
 */
export async function resetarSenhaAuth(
  tokenHex: string,
  novaSenha: string,
  novaSenhaConfirma: string,
): Promise<{ ok: true } | { ok: false; error: string; isNetworkError?: boolean }> {
  const base = getLoginApiBaseUrl();
  if (!base) {
    return {
      ok: false,
      error: 'Configure EXPO_PUBLIC_AUTH_API_URL (API-AUTH-MAIL).',
    };
  }

  try {
    const res = await fetch(`${base}/auth/resetar-senha`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token: tokenHex.trim().toLowerCase(),
        novaSenha,
        novaSenhaConfirma,
      }),
    });

    if (!res.ok) {
      return {
        ok: false,
        error: await parseAuthMailError(res),
      };
    }

    return { ok: true };
  } catch {
    return {
      ok: false,
      isNetworkError: true,
      error:
        'Não foi possível enviar a nova senha. Confira EXPO_PUBLIC_AUTH_API_URL e sua conexão.',
    };
  }
}
