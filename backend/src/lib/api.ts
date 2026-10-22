import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb, users } from "@/db";
import { verifyAppToken } from "./token";

export const json = (body: unknown, status = 200) => NextResponse.json(body, { status });

/** Usuario autenticado por Bearer, o null. */
export async function authUser(req: NextRequest) {
  const h = req.headers.get("authorization") ?? "";
  const m = /^Bearer (.+)$/.exec(h);
  if (!m) return null;
  const claims = await verifyAppToken(m[1]);
  if (!claims) return null;
  const db = await getDb();
  return (await db.select().from(users).where(eq(users.id, claims.sub)))[0] ?? null;
}
