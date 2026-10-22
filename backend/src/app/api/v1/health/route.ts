import { json } from "@/lib/api";
import { minAppVersion, latestAppVersion } from "@/lib/version";
export const dynamic = "force-dynamic";
export const GET = () => json({ ok: true, apiVersion: 1, minAppVersion: minAppVersion(), latestAppVersion: latestAppVersion() });
