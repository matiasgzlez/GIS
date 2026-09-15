"use client";

import { useEffect, useState } from "react";

type Comentario = { cid: string; texto: string; nombre: string; fecha: string };

const CLAVE_NOMBRE = "gis-parcial-nombre";
const ATAJOS = ["⭐ Pregunta importante", "📖 Revisar la teoría", "❓ No me queda clara", "✅ Ya la entendí"];

function leerNombre(): string {
  try {
    return localStorage.getItem(CLAVE_NOMBRE) ?? "";
  } catch {
    return "";
  }
}

function guardarNombre(nombre: string) {
  try {
    localStorage.setItem(CLAVE_NOMBRE, nombre);
  } catch {
    /* sin storage: se pide de nuevo la próxima vez */
  }
}

function fechaCorta(iso: string): string {
  return new Date(iso).toLocaleString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

type Props = {
  preguntaId: string;
  enunciado: string;
  onCambio: (cantidad: number) => void;
};

/** Comentarios de una pregunta: se guardan en el servidor (data/comentarios.json). */
export default function Comentarios({ preguntaId, enunciado, onCambio }: Props) {
  const [lista, setLista] = useState<Comentario[] | null>(null);
  const [texto, setTexto] = useState("");
  const [nombre, setNombre] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => setNombre(leerNombre()), []);

  useEffect(() => {
    let cancelado = false;
    setLista(null);
    fetch(`/api/comentarios?id=${encodeURIComponent(preguntaId)}`)
      .then((r) => r.json())
      .then((d) => !cancelado && setLista(d.comentarios ?? []))
      .catch(() => !cancelado && setError("No se pudieron cargar los comentarios."));
    return () => {
      cancelado = true;
    };
  }, [preguntaId]);

  const actualizar = (comentarios: Comentario[]) => {
    setLista(comentarios);
    onCambio(comentarios.length);
  };

  const enviar = async () => {
    if (!texto.trim() || enviando) return;
    setEnviando(true);
    setError(null);
    try {
      const res = await fetch("/api/comentarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: preguntaId, texto, nombre }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error ?? "No se pudo guardar.");
      guardarNombre(nombre.trim());
      setTexto("");
      actualizar(d.comentarios);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo guardar.");
    } finally {
      setEnviando(false);
    }
  };

  const borrar = async (cid: string) => {
    if (!window.confirm("¿Borrar este comentario?")) return;
    try {
      const res = await fetch(
        `/api/comentarios?id=${encodeURIComponent(preguntaId)}&cid=${encodeURIComponent(cid)}`,
        { method: "DELETE" },
      );
      const d = await res.json();
      if (!res.ok) throw new Error(d.error ?? "No se pudo borrar.");
      actualizar(d.comentarios);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo borrar.");
    }
  };

  const atajo = (a: string) => setTexto((t) => (t.trim() ? `${t.trim()} ${a}` : a));

  return (
    <div>
      <h3 className="mt-5 font-black text-3xl leading-none tracking-[-0.03em]">Comentarios</h3>
      <p className="mt-2 text-base leading-snug line-clamp-2">{enunciado}</p>

      {/* Nuevo comentario */}
      <div className="mt-5 flex flex-wrap gap-2">
        {ATAJOS.map((a) => (
          <button
            key={a}
            onClick={() => atajo(a)}
            className="rounded-full border-2 border-[var(--color-divider)] px-3 py-1.5 text-sm font-bold transition-colors hover:border-[var(--color-accent)]"
          >
            {a}
          </button>
        ))}
      </div>

      <textarea
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) enviar();
        }}
        maxLength={1000}
        rows={4}
        placeholder="Ej.: acá revisar la teoría de topología…"
        className="mt-3 w-full resize-y rounded-xl border-2 border-[var(--color-divider)] px-4 py-3 text-base leading-snug outline-none focus:border-[var(--color-text-primary)]"
      />

      <div className="mt-2 flex gap-2">
        <input
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          maxLength={40}
          placeholder="Tu nombre (opcional)"
          className="min-w-0 flex-1 rounded-xl border-2 border-[var(--color-divider)] px-4 py-3 text-base outline-none focus:border-[var(--color-text-primary)]"
        />
        <button
          onClick={enviar}
          disabled={!texto.trim() || enviando}
          className="shrink-0 rounded-xl bg-[var(--color-bg-dark)] px-5 py-3 text-base font-black uppercase tracking-tight text-white transition-opacity hover:opacity-90 disabled:opacity-30"
        >
          {enviando ? "Guardando…" : "Guardar"}
        </button>
      </div>

      {error && <p className="mt-3 text-base font-bold text-[var(--color-accent)]">{error}</p>}

      {/* Lista */}
      <div className="mt-7">
        {lista === null && !error && <p className="text-base">Cargando…</p>}
        {lista?.length === 0 && <p className="text-base">Todavía no hay comentarios en esta pregunta.</p>}
        {lista && lista.length > 0 && (
          <ul className="flex flex-col gap-4">
            {[...lista].reverse().map((c) => (
              <li key={c.cid} className="border-l-4 border-[var(--color-text-primary)] pl-4">
                <div className="flex items-baseline justify-between gap-3 font-mono text-xs uppercase tracking-[0.14em]">
                  <span className="font-bold">
                    {c.nombre || "Anónimo"} · {fechaCorta(c.fecha)}
                  </span>
                  <button onClick={() => borrar(c.cid)} className="hover:text-[var(--color-accent)]">
                    Borrar
                  </button>
                </div>
                <p className="mt-1 whitespace-pre-wrap break-words text-base leading-snug">{c.texto}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
