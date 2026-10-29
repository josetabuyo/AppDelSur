import { NextRequest } from "next/server";
import { json } from "@/lib/api";
import { buscarLocalidades } from "@/lib/colegios";

// Datos públicos: no pide sesión.
export const GET = (req: NextRequest) => json({ localidades: buscarLocalidades(req.nextUrl.searchParams.get("q") ?? "") });
