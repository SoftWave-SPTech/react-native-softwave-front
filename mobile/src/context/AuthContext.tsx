import React, { createContext, useContext, useState } from 'react';

export type UserType = 'advogado' | 'cliente';

type AuthContextData = {
  userType: UserType | null;
  token: string | null;
  login: (email: string, senha: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

// Credenciais mock — substituir pela chamada real à API
const MOCK_USERS = [
  { email: 'advogado@softwave.com', senha: '123456', tipo: 'advogado' as UserType, token: 'mock_token_adv_abc123' },
  { email: 'cliente@softwave.com',  senha: '123456', tipo: 'cliente' as UserType, token: 'mock_token_cli_xyz456' },
];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [userType, setUserType] = useState<UserType | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const login = async (email: string, senha: string): Promise<{ success: boolean; error?: string }> => {
    // Simula latência de rede
    await new Promise((r) => setTimeout(r, 900));

    const usuario = MOCK_USERS.find(
      (u) => u.email === email.trim().toLowerCase() && u.senha === senha
    );

    if (!usuario) {
      return { success: false, error: 'E-mail ou senha incorretos.' };
    }

    setUserType(usuario.tipo);
    setToken(usuario.token);
    return { success: true };
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
