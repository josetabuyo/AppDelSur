import { NextRequest } from "next/server";
import { json } from "@/lib/api";
import { buscarColegios } from "@/lib/colegios";

// Datos públicos: no pide sesión.
export const GET = (req: NextRequest) => json({ colegios: buscarColegios(req.nextUrl.searchParams.get("q") ?? "") });
