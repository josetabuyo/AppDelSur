import type { NextConfig } from "next";
const config: NextConfig = {
  serverExternalPackages: ["@electric-sql/pglite"],
  allowedDevOrigins: ["localhost", "127.0.0.1"],
  // Links cortos para compartir por WhatsApp. Al sacar un APK nuevo, actualizar acá.
  async redirects() {
    return [{
      source: "/android",
      destination: "https://expo.dev/artifacts/eas/qv4F26LiuU192lT0Ez6KDafYi6xLnJrwKxniOkzGGz8.apk",
      permanent: false,
    }];
  },
  // La app web (export de Expo en public/, ver scripts/build-web.sh) se sirve en la raíz.
  async rewrites() {
    return { beforeFiles: [
      { source: "/", destination: "/index.html" },
      { source: "/assets/node_modules/:path*", destination: "/assets/nm/:path*" },
    ], afterFiles: [], fallback: [] };
  },
};
export default config;
