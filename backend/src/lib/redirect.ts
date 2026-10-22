export const ALLOWED_REDIRECT_PREFIXES = [
  "appdelsur://", "exp://", "exps://",
  "http://localhost", "http://127.0.0.1", "http://192.168.", "http://10.",
];

/** `selfOrigin`: el origen del propio backend (la app web se sirve desde ahí mismo). */
export function isAllowedRedirect(url: string | null | undefined, selfOrigin?: string): url is string {
  if (!url || url.length > 2000) return false;
  if (selfOrigin) {
    try { if (new URL(url).origin === selfOrigin && !new URL(url).username) return true; } catch { return false; }
  }
  if (!ALLOWED_REDIRECT_PREFIXES.some((p) => url.startsWith(p))) return false;
  // Evita "http://localhost@evil.com" y "http://localhost.evil.com": tras el prefijo http debe venir : / ? # o fin
  if (url.startsWith("http://")) {
    try {
      const h = new URL(url).hostname;
      if (!(h === "localhost" || h === "127.0.0.1" || /^192\.168\.\d+\.\d+$/.test(h) || /^10\.\d+\.\d+\.\d+$/.test(h))) return false;
      if (new URL(url).username) return false;
    } catch { return false; }
  }
  return true;
}

export function withToken(redirect: string, token: string): string {
  const [base, hash = ""] = redirect.split("#");
  const sep = base.includes("?") ? "&" : "?";
  return `${base}${sep}token=${encodeURIComponent(token)}${hash ? "#" + hash : ""}`;
}
