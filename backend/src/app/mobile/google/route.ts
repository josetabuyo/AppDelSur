import { NextRequest, NextResponse } from "next/server";
import { signIn } from "../../../../auth";
import { isAllowedRedirect } from "@/lib/redirect";
export const dynamic = "force-dynamic";

// Va directo a Google (sin página intermedia con otro botón) y vuelve por /mobile/callback.
export async function GET(req: NextRequest) {
  const redirect = req.nextUrl.searchParams.get("redirect");
  if (!isAllowedRedirect(redirect, req.nextUrl.origin)) return NextResponse.json({ error: "redirect no permitido" }, { status: 400 });
  return signIn("google", { redirectTo: `/mobile/callback?redirect=${encodeURIComponent(redirect)}` });
}
