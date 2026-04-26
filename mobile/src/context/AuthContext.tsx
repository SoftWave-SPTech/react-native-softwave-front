import React, { createContext, useContext, useState, useEffect } from 'react';
import { getLoginApiBaseUrl } from '../config/api';
import { loginWithApi } from '../services/authApi';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type UserType = 'advogado' | 'cliente';

export type LoginResult = { success: boolean; error?: string; userType?: UserType | null };

type AuthContextData = {
  userType: UserType | null;
  token: string | null;
  user: any;
  userId: string | null;
  login: (email: string, senha: string) => Promise<LoginResult>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [userType, setUserType] = useState<UserType | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [userId, setUserId] = useState<string | null>(null);

  const API_URL = process.env.EXPO_PUBLIC_API_URL;

  const fetchUser = async () => {
    const storedUserId = await AsyncStorage.getItem('userId');
    const storedToken = await AsyncStorage.getItem('token');

    if (!storedUserId || !storedToken || !API_URL) return;

    try {
      const res = await fetch(`${API_URL}/usuarios/${storedUserId}`, {
        headers: {
          Authorization: `Bearer ${storedToken}`,
        },
      });

      const data = await res.json();

      setUser(data);
      setUserType(data.tipoUsuario ?? data.tipo); // suporta ambos
      setToken(storedToken);
      setUserId(storedUserId);
    } catch (err) {
      console.error('Erro ao buscar usuário', err);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const login = async (email: string, senha: string): Promise<LoginResult> => {
    const loginBase = getLoginApiBaseUrl();

    if (!loginBase) {
      return {
        success: false,
        error: 'Configure EXPO_PUBLIC_API_URL ou EXPO_PUBLIC_AUTH_API_URL.',
      };
    }

    const result = await loginWithApi(email, senha);

    if (!result.ok) {
      return { success: false, error: result.error };
    }

    const { token, usuario } = result.data;

    const ut = usuario.tipo;
    const id = usuario.id.toString();

    setUserType(ut);
    setToken(token);
    setUser(usuario);
    setUserId(id);

    await AsyncStorage.setItem('token', token);
    await AsyncStorage.setItem('userId', id);

    return { success: true, userType: ut };
  };

  const logout = async () => {
    setUserType(null);
    setToken(null);
    setUser(null);
    setUserId(null);

    await AsyncStorage.clear();
  };

  return (
    <AuthContext.Provider value={{ userType, token, user, userId, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
