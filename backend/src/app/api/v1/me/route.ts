import { NextRequest } from "next/server";
import { desc, eq } from "drizzle-orm";
import { getDb, registros } from "@/db";
import { authUser, json } from "@/lib/api";
import { padronDeEmail } from "@/lib/padron";
import { toApiRegistro } from "@/lib/registros";
import { deleteUserData } from "@/lib/users";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const u = await authUser(req);
  if (!u) return json({ error: "no autorizado" }, 401);
  const db = await getDb();
  const rows = await db.select().from(registros).where(eq(registros.user_id, u.id)).orderBy(desc(registros.created_at));
  const padron = await padronDeEmail(u.email);
  return json({ user: { id: u.id, email: u.email, name: u.name, image: u.image }, registros: rows.map(toApiRegistro), padron });
}

export async function DELETE(req: NextRequest) {
  const u = await authUser(req);
  if (!u) return json({ error: "no autorizado" }, 401);
  const r = await deleteUserData(u.id);
  return json({ ok: true, registrosBorrados: r.registros });
}
