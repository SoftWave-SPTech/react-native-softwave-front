import React, { createContext, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { getLoginApiBaseUrl } from '../config/api';
import { loginWithApi } from '../services/authApi';

const isWeb = Platform.OS === 'web';

export type UserType = 'advogado' | 'cliente';

export type LoginResult = { success: boolean; error?: string; userType?: UserType | null };

type AuthContextData = {
  userType: UserType | null;
  token: string | null;
  userId: string | null;
  login: (email: string, senha: string) => Promise<LoginResult>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextData>({} as AuthContextData);
const AUTH_STORAGE_KEY = 'softwave.auth.session';

type PersistedAuthSession = {
  userType: UserType;
  token: string;
  userId: string;
};

function loadPersistedSession(): PersistedAuthSession | null {
  if (isWeb) return null;
  try {
    if (typeof globalThis.localStorage === 'undefined') return null;
    const raw = globalThis.localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<PersistedAuthSession>;
    if (
      (parsed.userType === 'advogado' || parsed.userType === 'cliente') &&
      typeof parsed.token === 'string' &&
      parsed.token.trim().length > 0 &&
      typeof parsed.userId === 'string' &&
      parsed.userId.trim().length > 0
    ) {
      return {
        userType: parsed.userType,
        token: parsed.token,
        userId: parsed.userId,
      };
    }
    return null;
  } catch {
    return null;
  }
}

function persistSession(session: PersistedAuthSession | null): void {
  if (isWeb) {
    try {
      if (typeof globalThis.localStorage !== 'undefined') {
        globalThis.localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    } catch {
      /* ignore */
    }
    return;
  }
  try {
    if (typeof globalThis.localStorage === 'undefined') return;
    if (!session) {
      globalThis.localStorage.removeItem(AUTH_STORAGE_KEY);
      return;
    }
    globalThis.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
  } catch {
    // Ignora erros de persistência para não bloquear login/logout.
  }
}

function getInitialAuthState(): {
  userType: UserType | null;
  token: string | null;
  userId: string | null;
} {
  const saved = loadPersistedSession();
  if (!saved) {
    return { userType: null, token: null, userId: null };
  }
  return {
    userType: saved.userType,
    token: saved.token,
    userId: saved.userId,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const initial = getInitialAuthState();
  const [userType, setUserType] = useState<UserType | null>(initial.userType);
  const [token, setToken] = useState<string | null>(initial.token);
  const [userId, setUserId] = useState<string | null>(initial.userId);

  useEffect(() => {
    if (isWeb) persistSession(null);
  }, []);

  const login = async (email: string, senha: string): Promise<LoginResult> => {
    const loginBase = getLoginApiBaseUrl();

    if (loginBase) {
      const result = await loginWithApi(email, senha);
      if (result.ok) {
        const ut = result.data.usuario.tipo;
        const uid = result.data.usuario.id || null;
        setUserType(ut);
        setToken(result.data.token);
        setUserId(uid);
        if (uid) {
          persistSession({
            userType: ut,
            token: result.data.token,
            userId: uid,
          });
        }
        return { success: true, userType: ut };
      }
      return { success: false, error: result.error };
    }

    return {
      success: false,
      error: 'Configure EXPO_PUBLIC_API_URL ou EXPO_PUBLIC_AUTH_API_URL para fazer login na API.',
    };
  };

  const logout = () => {
    setUserType(null);
    setToken(null);
    setUserId(null);
    persistSession(null);
  };

  return (
    <AuthContext.Provider value={{ userType, token, userId, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
