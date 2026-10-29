import { API_URL, APP_VERSION } from '../config';
import type { RegistroPayload } from '../lib/payload';

export type User = { id: string; email: string; name: string | null; image: string | null };
export type Registro = RegistroPayload & { id: string; createdAt: string; appVersion?: string };
/** Alguien del padrón del club con el mismo mail que la cuenta (GET /api/v1/me). */
export type PadronPersona = {
  socio: string;
  nombre: string;
  apellido: string;
  categoria: string | null;
  dni: string | null;
  fechaNacimiento: string | null; // YYYY-MM-DD
  deporte: 'rugby' | 'hockey' | 'rugby_inclusivo' | null;
  division: string | null;
  jugador: boolean;
  cargado: boolean;
};
export type MeResponse = { user: User; registros: Registro[]; padron?: PadronPersona[] };

export class ApiError extends Error {
  constructor(
    public status: number,
    public body: unknown,
    message?: string,
  ) {
    super(message ?? `HTTP ${status}`);
  }
  /** Errores de validación por campo (400 {"error":"validacion","campos":{...}}) */
  get campos(): Record<string, string> {
    const b = this.body as { campos?: Record<string, string> } | null;
    return b?.campos ?? {};
  }
}

let upgradeListener: ((minAppVersion?: string) => void) | null = null;
/** El estado global se entera cuando el backend pide actualizar (426). */
export function onUpgradeRequired(cb: ((minAppVersion?: string) => void) | null) {
  upgradeListener = cb;
}

type Opts = { method?: string; token?: string | null; body?: unknown };

export async function request<T>(path: string, { method = 'GET', token, body }: Opts = {}): Promise<T> {
  const headers: Record<string, string> = { Accept: 'application/json', 'X-App-Version': APP_VERSION };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, { method, headers, body: body !== undefined ? JSON.stringify(body) : undefined });
  } catch {
    throw new ApiError(0, null, 'No pudimos conectarnos con el club. Revisá tu conexión y probá de nuevo.');
  }
  const text = await res.text();
  let data: unknown = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  if (res.status === 426) {
    upgradeListener?.((data as { minAppVersion?: string } | null)?.minAppVersion);
    throw new ApiError(426, data, 'Hay una versión nueva de la app.');
  }
  if (!res.ok) throw new ApiError(res.status, data);
  return data as T;
}

export const api = {
  colegios: (q: string) => request<{ colegios: { nombre: string; lugar: string }[] }>(`/api/v1/colegios?q=${encodeURIComponent(q)}`),
  localidades: (q: string) => request<{ localidades: { nombre: string; lugar: string }[] }>(`/api/v1/localidades?q=${encodeURIComponent(q)}`),
  health: () => request<{ ok: boolean; minAppVersion: string; latestAppVersion: string }>('/api/v1/health'),
  devLogin: (email: string, name: string) =>
    request<{ token: string; user: User }>('/api/v1/auth/dev-login', { method: 'POST', body: { email, name } }),
  me: (token: string) => request<MeResponse>('/api/v1/me', { token }),
  borrarCuenta: (token: string) => request<{ ok: true; registrosBorrados: number }>('/api/v1/me', { method: 'DELETE', token }),
  crearRegistro: (token: string, payload: RegistroPayload) =>
    request<{ registro: Registro }>('/api/v1/registros', { method: 'POST', token, body: payload }),
};
