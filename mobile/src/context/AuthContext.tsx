import React, { createContext, useContext, useState } from 'react';
import { getLoginApiBaseUrl } from '../config/api';
import { loginWithApi } from '../services/authApi';

export type UserType = 'advogado' | 'cliente';

export type LoginResult = { success: boolean; error?: string; userType?: UserType | null };

type AuthContextData = {
  userType: UserType | null;
  token: string | null;
  login: (email: string, senha: string) => Promise<LoginResult>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [userType, setUserType] = useState<UserType | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const login = async (email: string, senha: string): Promise<LoginResult> => {
    const loginBase = getLoginApiBaseUrl();

    if (loginBase) {
      const result = await loginWithApi(email, senha);
      if (result.ok) {
        const ut = result.data.usuario.tipo;
        setUserType(ut);
        setToken(result.data.token);
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
  };

  return (
    <AuthContext.Provider value={{ userType, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
