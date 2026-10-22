import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import type { Provider } from "next-auth/providers";
import { upsertUser, devLoginEnabled } from "@/lib/users";

const providers: Provider[] = [];

if (devLoginEnabled()) {
  providers.push(
    Credentials({
      id: "dev-login",
      name: "Entrar de prueba",
      credentials: { email: {}, name: {} },
      async authorize(c) {
        if (typeof c?.email !== "string" || !c.email) return null;
        const u = await upsertUser({ email: c.email, name: typeof c.name === "string" ? c.name : undefined });
        return { id: u.id, email: u.email, name: u.name, image: u.image };
      },
    }),
  );
}

if (process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET) {
  providers.push(Google({ clientId: process.env.AUTH_GOOGLE_ID, clientSecret: process.env.AUTH_GOOGLE_SECRET }));
}

export const hasGoogle = !!(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET);

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers,
  session: { strategy: "jwt" },
  trustHost: true,
  callbacks: {
    async signIn({ account, profile }) {
      if (account?.provider === "google" && profile?.email) {
        await upsertUser({
          email: profile.email, name: profile.name, image: (profile.picture as string | undefined) ?? null, googleSub: profile.sub,
        });
      }
      return true;
    },
  },
});
