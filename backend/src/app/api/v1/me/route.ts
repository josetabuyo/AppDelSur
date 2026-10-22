import { NextRequest } from "next/server";
import { desc, eq } from "drizzle-orm";
import { getDb, registros } from "@/db";
import { authUser, json } from "@/lib/api";
import { toApiRegistro } from "@/lib/registros";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const u = await authUser(req);
  if (!u) return json({ error: "no autorizado" }, 401);
  const db = await getDb();
  const rows = await db.select().from(registros).where(eq(registros.user_id, u.id)).orderBy(desc(registros.created_at));
  return json({ user: { id: u.id, email: u.email, name: u.name, image: u.image }, registros: rows.map(toApiRegistro) });
}
