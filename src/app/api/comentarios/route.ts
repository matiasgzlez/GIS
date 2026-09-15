import { randomUUID } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { preguntas } from "@/lib/preguntas";

/**
 * Comentarios por pregunta, guardados en data/comentarios.json.
 * GET                 → { conteos: { [preguntaId]: n } }
 * GET ?id=X           → { comentarios: Comentario[] }
 * POST { id, texto, nombre? }
 * DELETE ?id=X&cid=Y
 */
export const dynamic = "force-dynamic";

export type Comentario = { cid: string; texto: string; nombre: string; fecha: string };
type Base = Record<string, Comentario[]>;

const ARCHIVO = path.join(process.cwd(), "data", "comentarios.json");
const IDS = new Set(preguntas.map((p) => p.id));
const MAX_TEXTO = 1000;
const MAX_NOMBRE = 40;

async function leer(): Promise<Base> {
  try {
    return JSON.parse(await readFile(ARCHIVO, "utf-8")) as Base;
  } catch {
    return {};
  }
}

// Las escrituras van en fila para que dos comentarios simultáneos no se pisen.
let fila: Promise<unknown> = Promise.resolve();
function modificar(cambio: (base: Base) => void): Promise<Base> {
  const tarea = fila.then(async () => {
    const base = await leer();
    cambio(base);
    await mkdir(path.dirname(ARCHIVO), { recursive: true });
    const tmp = `${ARCHIVO}.tmp`;
    await writeFile(tmp, JSON.stringify(base, null, 2), "utf-8");
    await rename(tmp, ARCHIVO);
    return base;
  });
  fila = tarea.catch(() => {});
  return tarea;
}

export async function GET(req: Request) {
  const id = new URL(req.url).searchParams.get("id");
  const base = await leer();
  if (id) return NextResponse.json({ comentarios: base[id] ?? [] });
  const conteos = Object.fromEntries(Object.entries(base).map(([k, v]) => [k, v.length]));
  return NextResponse.json({ conteos });
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as { id?: unknown; texto?: unknown; nombre?: unknown } | null;
  const id = typeof body?.id === "string" ? body.id : "";
  const texto = typeof body?.texto === "string" ? body.texto.trim() : "";
  const nombre = typeof body?.nombre === "string" ? body.nombre.trim().slice(0, MAX_NOMBRE) : "";

  if (!IDS.has(id)) return NextResponse.json({ error: "Pregunta inexistente" }, { status: 400 });
  if (!texto) return NextResponse.json({ error: "El comentario está vacío" }, { status: 400 });
  if (texto.length > MAX_TEXTO)
    return NextResponse.json({ error: `Máximo ${MAX_TEXTO} caracteres` }, { status: 400 });

  const nuevo: Comentario = { cid: randomUUID(), texto, nombre, fecha: new Date().toISOString() };
  const base = await modificar((b) => {
    b[id] = [...(b[id] ?? []), nuevo];
  });
  return NextResponse.json({ comentarios: base[id] });
}

export async function DELETE(req: Request) {
  const params = new URL(req.url).searchParams;
  const id = params.get("id") ?? "";
  const cid = params.get("cid") ?? "";
  if (!IDS.has(id) || !cid) return NextResponse.json({ error: "Parámetros inválidos" }, { status: 400 });

  const base = await modificar((b) => {
    b[id] = (b[id] ?? []).filter((c) => c.cid !== cid);
    if (b[id].length === 0) delete b[id];
  });
  return NextResponse.json({ comentarios: base[id] ?? [] });
}
