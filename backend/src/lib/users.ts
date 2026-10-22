import { eq } from "drizzle-orm";
import { getDb, users } from "@/db";

export async function upsertUser(p: { email: string; name?: string | null; image?: string | null; googleSub?: string | null }) {
  const db = await getDb();
  const email = p.email.trim().toLowerCase();
  const existing = (await db.select().from(users).where(eq(users.email, email)))[0];
  if (existing) {
    const [u] = await db.update(users).set({
      name: p.name ?? existing.name, image: p.image ?? existing.image, google_sub: p.googleSub ?? existing.google_sub,
    }).where(eq(users.id, existing.id)).returning();
    return u;
  }
  const [u] = await db.insert(users).values({ email, name: p.name ?? email.split("@")[0], image: p.image ?? null, google_sub: p.googleSub ?? null }).returning();
  return u;
}

export const devLoginEnabled = () => !process.env.VERCEL && process.env.NODE_ENV !== "production";
