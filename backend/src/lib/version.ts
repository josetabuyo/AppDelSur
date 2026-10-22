/** Compara semver simple "a.b.c". Devuelve <0, 0, >0. */
export function compareVersions(a: string, b: string): number {
  const pa = a.split(".").map((n) => parseInt(n, 10) || 0);
  const pb = b.split(".").map((n) => parseInt(n, 10) || 0);
  for (let i = 0; i < 3; i++) {
    const d = (pa[i] ?? 0) - (pb[i] ?? 0);
    if (d !== 0) return d;
  }
  return 0;
}
export const minAppVersion = () => process.env.MIN_APP_VERSION || "0.1.0";
export const latestAppVersion = () => process.env.LATEST_APP_VERSION || "0.1.0";
/** true si la versión informada es menor a la mínima. Sin header => no se bloquea. */
export function isOutdated(appVersion: string | null | undefined, min = minAppVersion()): boolean {
  if (!appVersion) return false;
  return compareVersions(appVersion, min) < 0;
}
