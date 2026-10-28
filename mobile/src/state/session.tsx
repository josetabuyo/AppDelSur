import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, ApiError, onUpgradeRequired, PadronPersona, Registro, User } from '../services/api';
import { loginWithBrowser, takeTokenFromLocation } from '../services/auth';
import { clearToken, getToken, setToken } from '../services/storage';

type Status = 'loading' | 'anon' | 'authed';

type SessionValue = {
  status: Status;
  token: string | null;
  user: User | null;
  registros: Registro[];
  /** Jugadores del padrón del club con el mail de esta cuenta: si hay, la app va directo a completarlos. */
  padron: PadronPersona[];
  upgradeRequired: string | false; // false o la minAppVersion pedida
  loginGoogle: () => Promise<void>;
  loginDev: () => Promise<void>;
  logout: () => Promise<void>;
  /** Borra la cuenta y todo lo cargado en el backend, y cierra la sesión. */
  borrarCuenta: () => Promise<void>;
  refresh: () => Promise<void>;
  addRegistro: (r: Registro) => void;
};

const SessionContext = createContext<SessionValue | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<Status>('loading');
  const [token, setTok] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [registros, setRegistros] = useState<Registro[]>([]);
  const [upgradeRequired, setUpgrade] = useState<string | false>(false);
  const [padron, setPadron] = useState<PadronPersona[]>([]);

  useEffect(() => {
    onUpgradeRequired((min) => setUpgrade(min ?? 'nueva'));
    return () => onUpgradeRequired(null);
  }, []);

  const adopt = useCallback(async (t: string) => {
    const me = await api.me(t);
    setTok(t);
    setUser(me.user);
    setRegistros(me.registros ?? []);
    setPadron((me.padron ?? []).filter((p) => p.jugador));
    setStatus('authed');
  }, []);

  // Al arrancar: si hay token guardado y sigue valiendo, pasamos de largo el login.
  useEffect(() => {
    (async () => {
      const fromRedirect = takeTokenFromLocation();
      if (fromRedirect) {
        await setToken(fromRedirect);
      }
      const saved = fromRedirect ?? (await getToken().catch(() => null));
      if (!saved) return setStatus('anon');
      try {
        await adopt(saved);
      } catch (e) {
        if (e instanceof ApiError && e.status === 401) await clearToken();
        setStatus('anon');
      }
    })();
  }, [adopt]);

  const loginWith = useCallback(
    async (t: string) => {
      await setToken(t);
      await adopt(t);
    },
    [adopt],
  );

  const logout = useCallback(async () => {
    await clearToken();
    setTok(null);
    setUser(null);
    setRegistros([]);
    setPadron([]);
    setStatus('anon');
  }, []);

  const value = useMemo<SessionValue>(
    () => ({
      status,
      token,
      user,
      registros,
      padron,
      upgradeRequired,
      loginGoogle: async () => loginWith(await loginWithBrowser()),
      loginDev: async () => {
        const r = await api.devLogin('prueba@delsur.dev', 'Socia de Prueba');
        await loginWith(r.token);
      },
      logout,
      borrarCuenta: async () => {
        if (token) await api.borrarCuenta(token);
        await logout();
      },
      refresh: async () => {
        if (token) await adopt(token);
      },
      addRegistro: (r) => {
        setRegistros((prev) => [...prev, r]);
        if (r.socio) setPadron((prev) => prev.map((p) => (p.socio === r.socio ? { ...p, cargado: true } : p)));
      },
    }),
    [status, token, user, registros, padron, upgradeRequired, loginWith, adopt, logout],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionValue {
  const v = useContext(SessionContext);
  if (!v) throw new Error('useSession fuera de SessionProvider');
  return v;
}
