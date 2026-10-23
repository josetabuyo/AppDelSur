import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import { auth, signIn, hasGoogle } from "../../../../auth";
import { isAllowedRedirect } from "@/lib/redirect";
import { devLoginEnabled } from "@/lib/users";
export const dynamic = "force-dynamic";

export default async function Login({ searchParams }: { searchParams: Promise<{ redirect?: string }> }) {
  const { redirect: r } = await searchParams;
  const h = await headers();
  const selfOrigin = `${h.get("x-forwarded-proto") ?? "http"}://${h.get("host")}`;
  if (!isAllowedRedirect(r, selfOrigin)) {
    return (<main className="hero"><div className="card"><b>Enlace inválido</b><span className="err">Abrí el login desde la app de Del Sur.</span></div></main>);
  }
  const target = `/mobile/callback?redirect=${encodeURIComponent(r)}`;
  if ((await auth())?.user?.email) redirect(target);
  // En producción (sin "entrar de prueba") no hay nada que elegir: directo a Google.
  if (hasGoogle && !devLoginEnabled()) redirect(`/mobile/google?redirect=${encodeURIComponent(r)}`);

  return (
    <main className="hero">
      <img src="/escudo-delsur-ig.png" alt="Escudo Del Sur" />
      <h1>Somos <span>familia</span></h1>
      <p>Entrá con tu cuenta y sumate a la comunidad de Del Sur Rugby Club.</p>
      <div className="card">
        {hasGoogle ? (
          <form action={async () => { "use server"; await signIn("google", { redirectTo: target }); }}>
            <button className="btn" type="submit">Entrar con Google</button>
          </form>
        ) : (<span className="tag">Google no configurado en este entorno</span>)}
        {devLoginEnabled() && (
          <form className="card" style={{ padding: 0, boxShadow: "none" }} action={async (fd: FormData) => {
            "use server";
            try {
              await signIn("dev-login", { email: String(fd.get("email") ?? ""), name: String(fd.get("name") ?? ""), redirectTo: target });
            } catch (e) { if (e instanceof AuthError) return; throw e; }
          }}>
            <span className="tag">Entrar de prueba (solo desarrollo)</span>
            <input name="name" placeholder="Nombre" defaultValue="Prueba" />
            <input name="email" type="email" placeholder="Email" defaultValue="prueba@delsur.test" required />
            <button className="btn alt" type="submit">Entrar de prueba</button>
          </form>
        )}
      </div>
    </main>
  );
}
