import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../../auth";
import { isAllowedRedirect, withToken } from "@/lib/redirect";
import { upsertUser } from "@/lib/users";
import { signAppToken } from "@/lib/token";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const redirect = req.nextUrl.searchParams.get("redirect");
  if (!isAllowedRedirect(redirect, req.nextUrl.origin)) return NextResponse.json({ error: "redirect no permitido" }, { status: 400 });
  const session = await auth();
  const email = session?.user?.email;
  if (!email) {
    const back = new URL("/mobile/login", req.nextUrl.origin);
    back.searchParams.set("redirect", redirect);
    return NextResponse.redirect(back);
  }
  const u = await upsertUser({ email, name: session.user?.name, image: session.user?.image });
  const token = await signAppToken({ sub: u.id, email: u.email, name: u.name ?? undefined });
  return NextResponse.redirect(withToken(redirect, token));
}
