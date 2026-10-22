import { NextRequest, NextResponse } from "next/server";
import { isOutdated, minAppVersion } from "@/lib/version";

const CORS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Access-Control-Allow-Headers": "Authorization, Content-Type, X-App-Version",
  "Access-Control-Max-Age": "86400",
};

export function proxy(req: NextRequest) {
  if (req.method === "OPTIONS") return new NextResponse(null, { status: 204, headers: CORS });
  const path = req.nextUrl.pathname;
  if (path !== "/api/v1/health" && isOutdated(req.headers.get("x-app-version"))) {
    return NextResponse.json({ error: "actualizar", minAppVersion: minAppVersion() }, { status: 426, headers: CORS });
  }
  const res = NextResponse.next();
  for (const [k, v] of Object.entries(CORS)) res.headers.set(k, v);
  return res;
}

export const config = { matcher: "/api/v1/:path*" };
