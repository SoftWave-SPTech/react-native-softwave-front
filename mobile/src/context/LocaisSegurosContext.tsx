import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import { loadExpoLocation } from '../utils/expoLocationLazy';
import type { LocalSeguro, LocalSeguroPayload } from '../types/locaisSeguros';
import { isWithinRadiusMeters } from '../utils/geo';
import { useAuth } from './AuthContext';
import { getApiBaseUrl } from '../config/api';
import {
  deleteLocalSeguro,
  fetchLocaisSeguros,
  postLocalSeguro,
  putLocalSeguro,
  putLocaisSegurosConfig,
} from '../services/resources';
import { ApiError } from '../services/http';

type LocationStatus = 'idle' | 'loading' | 'granted' | 'denied' | 'unavailable';

type LocaisSegurosContextData = {
  enabled: boolean;
  locais: LocalSeguro[];
  hydrated: boolean;
  syncing: boolean;
  apiOn: boolean;
  locationStatus: LocationStatus;
  isInsideSafeZone: boolean;
  shouldRestrict: boolean;
  /** Proteção ligada: só pode desligar dentro de um local seguro (com locais ativos cadastrados). */
  canDisableProtection: boolean;
  setEnabled: (value: boolean) => Promise<{ ok: boolean; error?: string }>;
  addLocal: (local: LocalSeguroPayload) => Promise<{ ok: boolean; error?: string }>;
  updateLocal: (id: string, local: LocalSeguroPayload) => Promise<{ ok: boolean; error?: string }>;
  removeLocal: (id: string) => Promise<{ ok: boolean; error?: string }>;
  refreshFromApi: () => Promise<void>;
  refreshLocation: () => Promise<void>;
};

const LocaisSegurosContext = createContext<LocaisSegurosContextData | null>(null);

const noopAsync = async (): Promise<{ ok: boolean; error?: string }> => ({
  ok: false,
  error: 'Faça login para usar locais seguros.',
});

/** Valores padrão na tela de login — sem GPS nem chamadas à API. */
export const LOCAIS_SEGUROS_STUB: LocaisSegurosContextData = {
  enabled: false,
  locais: [],
  hydrated: true,
  syncing: false,
  apiOn: false,
  locationStatus: 'idle',
  isInsideSafeZone: false,
  shouldRestrict: false,
  canDisableProtection: true,
  setEnabled: noopAsync,
  addLocal: noopAsync,
  updateLocal: noopAsync,
  removeLocal: noopAsync,
  refreshFromApi: async () => {},
  refreshLocation: async () => {},
};

function isInsideAnyLocal(lat: number, lon: number, locais: LocalSeguro[]): boolean {
  const ativos = locais.filter((l) => l.ativo);
  if (ativos.length === 0) return false;
  return ativos.some((l) =>
    isWithinRadiusMeters(lat, lon, l.latitude, l.longitude, l.raio),
  );
}

/** Com proteção ligada e locais ativos: alterações só dentro de um local seguro. */
export function podeAlterarLocaisSeguros(
  enabled: boolean,
  locais: LocalSeguro[],
  locationStatus: LocationStatus,
  coords: { latitude: number; longitude: number } | null,
): boolean {
  if (!enabled) return true;
  const ativos = locais.filter((l) => l.ativo);
  if (ativos.length === 0) return true;
  if (locationStatus === 'loading') return false;
  if (locationStatus === 'denied' || locationStatus === 'unavailable' || !coords) {
    return false;
  }
  return isInsideAnyLocal(coords.latitude, coords.longitude, locais);
}

export function mensagemBloqueioGestaoLocais(locationStatus: LocationStatus): string {
  if (locationStatus === 'loading') {
    return 'Aguarde a verificação da sua localização.';
  }
  return 'Vá até um local seguro cadastrado para adicionar, editar ou excluir locais.';
}

export function LocaisSegurosProvider({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();
  const apiOn = !!getApiBaseUrl() && !!token;

  const [enabled, setEnabledState] = useState(false);
  const [locais, setLocais] = useState<LocalSeguro[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [locationStatus, setLocationStatus] = useState<LocationStatus>('idle');
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /** Intervalo de atualização GPS (sem watchPosition — mais estável no Expo Go). */
  const LOCATION_POLL_MS = 45_000;

  const refreshFromApi = useCallback(async () => {
    if (!apiOn || !token) {
      setEnabledState(false);
      setLocais([]);
      setHydrated(true);
      return;
    }
    setSyncing(true);
    try {
      const data = await fetchLocaisSeguros(token);
      if (data) {
        setEnabledState(data.enabled);
        setLocais(data.locais);
      }
    } finally {
      setSyncing(false);
      setHydrated(true);
    }
  }, [apiOn, token]);

  useEffect(() => {
    void refreshFromApi();
  }, [refreshFromApi]);

  const refreshLocation = useCallback(async () => {
    if (!enabled) {
      setLocationStatus('idle');
      setCoords(null);
      return;
    }
    setLocationStatus('loading');
    try {
      const Location = await loadExpoLocation();
      const servicesOn = await Location.hasServicesEnabledAsync();
      if (!servicesOn) {
        setLocationStatus('unavailable');
        setCoords(null);
        return;
      }
      let { status } = await Location.getForegroundPermissionsAsync();
      if (status === 'undetermined') {
        const req = await Location.requestForegroundPermissionsAsync();
        status = req.status;
      }
      if (status !== 'granted') {
        setLocationStatus('denied');
        setCoords(null);
        return;
      }
      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setCoords({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      });
      setLocationStatus('granted');
    } catch {
      setLocationStatus('unavailable');
      setCoords(null);
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled || !hydrated) {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
      setCoords(null);
      setLocationStatus('idle');
      return;
    }

    let cancelled = false;

    const tick = () => {
      if (!cancelled) void refreshLocation();
    };

    const startTimer = setTimeout(() => {
      if (cancelled) return;
      tick();
      pollRef.current = setInterval(tick, LOCATION_POLL_MS);
    }, 2000);

    return () => {
      cancelled = true;
      clearTimeout(startTimer);
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, [enabled, hydrated, refreshLocation]);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (state: AppStateStatus) => {
      if (state === 'active' && enabled) {
        void refreshLocation();
      }
    });
    return () => sub.remove();
  }, [enabled, refreshLocation]);

  const canDisableProtection = useMemo(
    () => podeAlterarLocaisSeguros(enabled, locais, locationStatus, coords),
    [enabled, locais, locationStatus, coords],
  );

  const setEnabled = useCallback(
    async (value: boolean): Promise<{ ok: boolean; error?: string }> => {
      if (!value && enabled && !podeAlterarLocaisSeguros(enabled, locais, locationStatus, coords)) {
        const ativos = locais.filter((l) => l.ativo);
        if (ativos.length > 0) {
          if (locationStatus === 'denied' || locationStatus === 'unavailable' || !coords) {
            return {
              ok: false,
              error: 'Permita o acesso à localização e vá até um local seguro para desativar a proteção.',
            };
          }
          return {
            ok: false,
            error: 'Desative a proteção apenas quando estiver dentro de um local seguro cadastrado.',
          };
        }
      }

      setEnabledState(value);
      if (!apiOn || !token) {
        return { ok: false, error: 'API não configurada.' };
      }
      try {
        await putLocaisSegurosConfig(token, value);
        return { ok: true };
      } catch (e) {
        setEnabledState(!value);
        const msg = e instanceof ApiError ? e.message : 'Não foi possível salvar a configuração.';
        return { ok: false, error: msg };
      }
    },
    [enabled, locais, coords, locationStatus, apiOn, token],
  );

  const addLocal = useCallback(
    async (local: LocalSeguroPayload): Promise<{ ok: boolean; error?: string }> => {
      if (!podeAlterarLocaisSeguros(enabled, locais, locationStatus, coords)) {
        return { ok: false, error: mensagemBloqueioGestaoLocais(locationStatus) };
      }
      if (!apiOn || !token) {
        return { ok: false, error: 'API não configurada.' };
      }
      try {
        const created = await postLocalSeguro(token, local);
        if (created) {
          setLocais((prev) => [created, ...prev]);
        } else {
          await refreshFromApi();
        }
        return { ok: true };
      } catch (e) {
        const msg = e instanceof ApiError ? e.message : 'Não foi possível cadastrar o local.';
        return { ok: false, error: msg };
      }
    },
    [apiOn, token, refreshFromApi, enabled, locais, locationStatus, coords],
  );

  const updateLocal = useCallback(
    async (id: string, local: LocalSeguroPayload): Promise<{ ok: boolean; error?: string }> => {
      if (!podeAlterarLocaisSeguros(enabled, locais, locationStatus, coords)) {
        return { ok: false, error: mensagemBloqueioGestaoLocais(locationStatus) };
      }
      if (!apiOn || !token) {
        return { ok: false, error: 'API não configurada.' };
      }
      try {
        const updated = await putLocalSeguro(token, id, local);
        if (updated) {
          setLocais((prev) => prev.map((l) => (l.id === id ? updated : l)));
        } else {
          await refreshFromApi();
        }
        return { ok: true };
      } catch (e) {
        const msg = e instanceof ApiError ? e.message : 'Não foi possível atualizar o local.';
        return { ok: false, error: msg };
      }
    },
    [apiOn, token, refreshFromApi, enabled, locais, locationStatus, coords],
  );

  const removeLocal = useCallback(
    async (id: string): Promise<{ ok: boolean; error?: string }> => {
      if (!podeAlterarLocaisSeguros(enabled, locais, locationStatus, coords)) {
        return { ok: false, error: mensagemBloqueioGestaoLocais(locationStatus) };
      }
      if (!apiOn || !token) {
        return { ok: false, error: 'API não configurada.' };
      }
      try {
        await deleteLocalSeguro(token, id);
        setLocais((prev) => prev.filter((l) => l.id !== id));
        return { ok: true };
      } catch (e) {
        const msg = e instanceof ApiError ? e.message : 'Não foi possível excluir o local.';
        return { ok: false, error: msg };
      }
    },
    [apiOn, token, enabled, locais, locationStatus, coords],
  );

  const isInsideSafeZone = useMemo(() => {
    if (!enabled || locais.length === 0) return false;
    if (!coords) return false;
    return isInsideAnyLocal(coords.latitude, coords.longitude, locais);
  }, [enabled, locais, coords]);

  const shouldRestrict = useMemo(() => {
    if (!enabled) return false;
    if (locais.length === 0) return true;
    if (locationStatus === 'loading') return true;
    if (locationStatus === 'denied' || locationStatus === 'unavailable') return true;
    return !isInsideSafeZone;
  }, [enabled, locais.length, locationStatus, isInsideSafeZone]);

  const value = useMemo(
    () => ({
      enabled,
      locais,
      hydrated,
      syncing,
      apiOn,
      locationStatus,
      isInsideSafeZone,
      shouldRestrict,
      canDisableProtection,
      setEnabled,
      addLocal,
      updateLocal,
      removeLocal,
      refreshFromApi,
      refreshLocation,
    }),
    [
      enabled,
      locais,
      hydrated,
      syncing,
      apiOn,
      locationStatus,
      isInsideSafeZone,
      shouldRestrict,
      canDisableProtection,
      setEnabled,
      addLocal,
      updateLocal,
      removeLocal,
      refreshFromApi,
      refreshLocation,
    ],
  );

  return (
    <LocaisSegurosContext.Provider value={value}>{children}</LocaisSegurosContext.Provider>
  );
}

/**
 * Na abertura do Expo Go usa sempre o stub (sem GPS/API de locais).
 * Provider real só após login — evita crash nativo ao carregar o bundle.
 */
export function LocaisSegurosGate({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();
  const [providerReady, setProviderReady] = useState(false);

  useEffect(() => {
    if (!token) {
      setProviderReady(false);
      return;
    }
    setProviderReady(false);
    const t = setTimeout(() => setProviderReady(true), 3000);
    return () => clearTimeout(t);
  }, [token]);

  if (!token || !providerReady) {
    return (
      <LocaisSegurosContext.Provider value={LOCAIS_SEGUROS_STUB}>
        {children}
      </LocaisSegurosContext.Provider>
    );
  }
  return <LocaisSegurosProvider>{children}</LocaisSegurosProvider>;
}

export function useLocaisSeguros(): LocaisSegurosContextData {
  const ctx = useContext(LocaisSegurosContext);
  if (!ctx) {
    throw new Error('useLocaisSeguros deve ser usado dentro de LocaisSegurosProvider');
  }
  return ctx;
}

export function useShouldRestrictSensitiveData(): boolean {
  const ctx = useContext(LocaisSegurosContext);
  return ctx?.shouldRestrict ?? false;
}
