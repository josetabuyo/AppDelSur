import type { Metadata, Viewport } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "AppDelSur", description: "La app de Del Sur Rugby Club" };
export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#0C3C6E" };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (<html lang="es"><body>{children}</body></html>);
}
