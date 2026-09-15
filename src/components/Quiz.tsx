"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { EASE } from "@/lib/motion";
import { preguntas, UNIDADES, type Pregunta, type Unidad } from "@/lib/preguntas";
import { TEORIA, terminosEn } from "@/lib/teoria";
import Comentarios from "@/components/Comentarios";
import { DIAPOS } from "@/lib/diapositivas";

const VERDE = "#1E7A3C";
const LETRAS = "ABCDEFGHI";
const VF = ["Verdadero", "Falso"];

type Estado = "inicio" | "jugando" | "final";
/** Una pregunta del intento, con sus opciones ya mezcladas. */
type Item = { p: Pregunta; orden: number[] };

function mezclar<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function armarMazo(lista: Pregunta[]): Item[] {
  return mezclar(lista).map((p) => ({
    p,
    orden: p.tipo === "vf" ? [0, 1] : mezclar(p.opciones.map((_, i) => i)),
  }));
}

function esCorrecta(p: Pregunta, resp: number[] | null): boolean {
  if (!resp) return false;
  return resp.length === p.correctas.length && p.correctas.every((c) => resp.includes(c));
}

const etiquetaTipo: Record<Pregunta["tipo"], string> = {
  unica: "Una sola correcta",
  multiple: "Marcá todas las correctas",
  vf: "Verdadero o falso",
};

const ANCHO = "mx-auto w-full max-w-[1700px] px-5 sm:px-10 lg:px-14";

export default function Quiz() {
  const [estado, setEstado] = useState<Estado>("inicio");
  const [mazo, setMazo] = useState<Item[]>([]);
  const [indice, setIndice] = useState(0);
  const [respuestas, setRespuestas] = useState<(number[] | null)[]>([]);
  const [marcadas, setMarcadas] = useState<number[]>([]);
  const [zoom, setZoom] = useState<string | null>(null);
  const [panel, setPanel] = useState<null | "teoria" | "comentarios">(null);
  const [conteos, setConteos] = useState<Record<string, number>>({});

  // Cuántos comentarios tiene cada pregunta (para el botón)
  useEffect(() => {
    fetch("/api/comentarios")
      .then((r) => r.json())
      .then((d) => setConteos(d.conteos ?? {}))
      .catch(() => {});
  }, []);

  const item = mazo[indice];
  const actual = item?.p;
  const respuesta = respuestas[indice] ?? null;
  const respondida = respuesta !== null;
  const acerto = actual ? esCorrecta(actual, respuesta) : false;
  const contestadas = respuestas.filter((r) => r !== null).length;
  const aciertos = mazo.filter((it, i) => esCorrecta(it.p, respuestas[i] ?? null)).length;
  const conMedia = Boolean(actual?.imagen || actual?.codigo);

  const terminos = useMemo(
    () =>
      actual ? terminosEn([actual.enunciado, ...actual.opciones, actual.codigo ?? ""].join(" \n ")) : [],
    [actual],
  );

  const iniciar = (lista: Pregunta[]) => {
    const nuevo = armarMazo(lista);
    setMazo(nuevo);
    setRespuestas(Array(nuevo.length).fill(null));
    setIndice(0);
    setMarcadas([]);
    setPanel(null);
    setEstado("jugando");
    window.scrollTo({ top: 0 });
  };

  const registrar = useCallback(
    (resp: number[]) => {
      if (!actual || respuestas[indice] !== null) return;
      setRespuestas((prev) => {
        const nuevas = [...prev];
        nuevas[indice] = resp;
        return nuevas;
      });
    },
    [actual, indice, respuestas],
  );

  const tocar = useCallback(
    (original: number) => {
      if (!actual || respondida) return;
      if (actual.tipo === "multiple") {
        setMarcadas((prev) =>
          prev.includes(original) ? prev.filter((x) => x !== original) : [...prev, original],
        );
      } else {
        registrar([original]);
      }
    },
    [actual, respondida, registrar],
  );

  const confirmar = useCallback(() => {
    if (marcadas.length === 0) return;
    registrar([...marcadas]);
  }, [marcadas, registrar]);

  const siguiente = useCallback(() => {
    setPanel(null);
    if (indice + 1 >= mazo.length) setEstado("final");
    else {
      setIndice((i) => i + 1);
      setMarcadas([]);
    }
    window.scrollTo({ top: 0 });
  }, [indice, mazo.length]);

  const atras = useCallback(() => {
    if (indice === 0) return;
    setPanel(null);
    setIndice((i) => i - 1);
    setMarcadas([]);
    window.scrollTo({ top: 0 });
  }, [indice]);

  // Teclado: 1-9 elige, Enter confirma / avanza, ← vuelve, T abre la teoría
  useEffect(() => {
    if (estado !== "jugando" || !item) return;
    const onKey = (e: KeyboardEvent) => {
      if (zoom || panel) {
        if (e.key === "Escape") {
          if (zoom) setZoom(null);
          else setPanel(null);
        }
        return;
      }
      const n = Number(e.key);
      if (n >= 1 && n <= item.orden.length) tocar(item.orden[n - 1]);
      else if (e.key === "Enter") {
        e.preventDefault();
        if (respondida) siguiente();
        else if (item.p.tipo === "multiple") confirmar();
      } else if (e.key === "ArrowLeft") atras();
      else if (e.key === "ArrowRight" && respondida) siguiente();
      else if (e.key === "t" || e.key === "T") setPanel("teoria");
      else if (e.key === "c" || e.key === "C") setPanel("comentarios");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [estado, item, respondida, zoom, panel, tocar, confirmar, siguiente, atras]);

  const porUnidad = ([1, 2, 3] as Unidad[])
    .map((u) => {
      const idx = mazo.map((it, i) => (it.p.unidad === u ? i : -1)).filter((i) => i >= 0);
      const bien = idx.filter((i) => esCorrecta(mazo[i].p, respuestas[i] ?? null)).length;
      return { u, total: idx.length, bien };
    })
    .filter((x) => x.total > 0);

  const nota = mazo.length ? Math.round((aciertos / mazo.length) * 100) : 0;
  const erradas = mazo.filter((it, i) => !esCorrecta(it.p, respuestas[i] ?? null));
  const multiples = preguntas.filter((p) => p.tipo === "multiple").length;
  const conImagen = preguntas.filter((p) => p.imagen).length;

  /* Enunciado: más chico si comparte columna con las opciones */
  const enunciado = actual && (
    <h2
      className={`font-black leading-[1.06] tracking-[-0.03em] ${
        conMedia ? "text-[clamp(22px,2.1vw,34px)]" : "text-[clamp(24px,3.2vw,52px)]"
      }`}
    >
      {actual.enunciado}
    </h2>
  );

  return (
    <main className="min-h-[100svh] w-full bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]">
      <div className="fixed top-0 left-0 right-0 h-[3px] bg-[var(--color-divider)] z-40">
        <motion.div
          className="h-full bg-[var(--color-accent)]"
          initial={false}
          animate={{
            width:
              estado === "inicio"
                ? "0%"
                : estado === "final"
                  ? "100%"
                  : `${(contestadas / Math.max(mazo.length, 1)) * 100}%`,
          }}
          transition={{ type: "spring", stiffness: 220, damping: 30 }}
        />
      </div>

      <AnimatePresence mode="wait">
        {/* ── Inicio ── */}
        {estado === "inicio" && (
          <motion.section
            key="inicio"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.35, ease: EASE }}
            className={`${ANCHO} flex min-h-[100svh] flex-col justify-center py-12`}
          >
            <span className="font-mono text-xs sm:text-sm uppercase tracking-[0.24em] text-[var(--color-accent)]">
              UTN FRRe · Sistemas de Información Geográfica
            </span>

            <div className="mt-4 grid gap-10 lg:grid-cols-12 lg:items-end lg:gap-16">
              <h1 className="font-black uppercase leading-[0.86] tracking-[-0.05em] text-[clamp(68px,13vw,230px)] lg:col-span-7">
                1er parcial <span className="text-[var(--color-accent)]">GIS</span>
              </h1>

              <div className="lg:col-span-5">
                <div className="grid grid-cols-3 gap-4 border-y-2 border-[var(--color-divider)] py-5">
                  {[
                    [preguntas.length, "preguntas"],
                    [multiples, "de selección múltiple"],
                    [conImagen, "con figuras"],
                  ].map(([n, label]) => (
                    <div key={label}>
                      <span className="block font-black leading-none tracking-[-0.04em] text-[clamp(32px,4vw,56px)]">
                        {n}
                      </span>
                      <span className="mt-1 block font-mono text-[11px] uppercase tracking-[0.14em] leading-tight">
                        {label}
                      </span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => iniciar(preguntas)}
                  className="mt-8 w-full rounded-xl bg-[var(--color-accent)] px-8 py-6 text-2xl font-black uppercase tracking-tight text-white transition-opacity hover:opacity-90 active:opacity-80"
                >
                  Empezar →
                </button>
              </div>
            </div>
          </motion.section>
        )}

        {/* ── Preguntas ── */}
        {estado === "jugando" && actual && item && (
          <motion.section
            key={`p-${indice}`}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.25, ease: EASE }}
            className={`${ANCHO} flex min-h-[100svh] flex-col py-5 lg:h-[100svh] lg:py-7`}
          >
            {/* Barra superior */}
            <div className="flex items-center justify-between gap-4 font-mono text-xs sm:text-sm uppercase tracking-[0.18em]">
              <div className="flex items-center gap-4">
                <span>
                  {String(indice + 1).padStart(2, "0")}
                  <span className="text-[var(--color-divider)]"> / </span>
                  {String(mazo.length).padStart(2, "0")}
                </span>
                <span className="font-bold text-[var(--color-accent)]">{etiquetaTipo[actual.tipo]}</span>
                {actual.origen === "clase" && (
                  <span className="rounded border border-[var(--color-text-primary)] px-2 py-0.5 text-[10px] sm:text-xs">
                    Apunte de clase
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4">
                {indice > 0 && (
                  <button onClick={atras} className="transition-colors hover:text-[var(--color-accent)]">
                    ← Anterior
                  </button>
                )}
                <span className="font-bold" style={{ color: VERDE }}>
                  {aciertos} ✓
                </span>
              </div>
            </div>

            <div className="mt-4 grid flex-1 gap-6 lg:mt-6 lg:min-h-0 lg:grid-cols-2 lg:gap-12">
              {/* Izquierda: figura / código, o el enunciado si no hay figura */}
              <div className="flex min-w-0 flex-col lg:min-h-0">
                {conMedia && (
                  <div className="mb-5 lg:hidden">{enunciado}</div>
                )}

                {actual.imagen ? (
                  <button
                    onClick={() => setZoom(`/img/${actual.imagen}.jpg`)}
                    className="flex min-h-0 flex-1 items-center justify-center overflow-hidden rounded-xl border-2 border-[var(--color-divider)] bg-white p-3 transition-colors hover:border-[var(--color-accent)]"
                    aria-label="Ampliar imagen"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`/img/${actual.imagen}.jpg`}
                      alt=""
                      className="max-h-[36svh] max-w-full object-contain lg:max-h-full"
                      draggable={false}
                    />
                  </button>
                ) : actual.codigo ? (
                  <pre className="flex-1 overflow-auto rounded-xl bg-[var(--color-bg-secondary)] px-5 py-4 font-mono text-[13px] leading-relaxed sm:text-sm lg:text-base">
                    {actual.codigo}
                  </pre>
                ) : (
                  <div className="flex flex-1 flex-col justify-center">{enunciado}</div>
                )}
              </div>

              {/* Derecha: enunciado (si hay figura), opciones y devolución */}
              <div className={`flex min-w-0 flex-col lg:min-h-0 lg:overflow-y-auto ${conMedia ? "" : "lg:justify-center"}`}>
                {conMedia && <div className="mb-5 hidden lg:block">{enunciado}</div>}

                <div className="flex flex-col gap-2">
                  {item.orden.map((original, pos) => {
                    const texto = actual.tipo === "vf" ? VF[original] : actual.opciones[original];
                    const esCorr = actual.correctas.includes(original);
                    const elegida = respondida ? respuesta!.includes(original) : marcadas.includes(original);

                    let estilo = "border-[var(--color-divider)]";
                    let inline: React.CSSProperties | undefined;
                    if (respondida) {
                      if (esCorr && elegida) {
                        estilo = "border-transparent";
                        inline = { backgroundColor: VERDE, color: "#FFFFFF" };
                      } else if (esCorr) {
                        estilo = "border-dashed";
                        inline = { borderColor: VERDE, color: VERDE };
                      } else if (elegida) {
                        estilo = "border-transparent";
                        inline = { backgroundColor: "var(--color-accent)", color: "#FFFFFF" };
                      } else {
                        estilo = "border-[var(--color-divider)] opacity-40";
                      }
                    } else if (elegida) {
                      estilo = "border-[var(--color-text-primary)] bg-[var(--color-bg-secondary)]";
                    }

                    return (
                      <button
                        key={original}
                        onClick={() => tocar(original)}
                        disabled={respondida}
                        className={`flex items-start gap-3 rounded-xl border-2 px-4 py-3 lg:py-2.5 text-left text-base leading-snug transition-colors xl:text-lg ${estilo} ${
                          !respondida ? "hover:border-[var(--color-accent)]" : ""
                        }`}
                        style={inline}
                      >
                        <span
                          className={`mt-px flex h-6 w-6 shrink-0 items-center justify-center border-2 font-mono text-xs font-bold ${
                            actual.tipo === "multiple" ? "rounded-md" : "rounded-full"
                          }`}
                          style={{ borderColor: "currentColor", opacity: 0.8 }}
                        >
                          {actual.tipo === "multiple" && elegida ? "✓" : LETRAS[pos]}
                        </span>
                        <span className="min-w-0">{texto}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Devolución compacta */}
                {respondida && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, ease: EASE }}
                    className="mt-4"
                  >
                    <p className="text-base leading-snug xl:text-lg">
                      <span className="font-black" style={{ color: acerto ? VERDE : "var(--color-accent)" }}>
                        {acerto ? "✓ Correcto. " : actual.tipo === "multiple" ? "✗ No es esa combinación. " : "✗ No era esa. "}
                      </span>
                      {actual.explicacion}
                    </p>
                  </motion.div>
                )}

                <div className="mt-3 flex gap-3 pb-1">
                  <button
                    onClick={() => setPanel("teoria")}
                    className="shrink-0 rounded-xl border-2 border-[var(--color-text-primary)] px-4 py-4 text-base font-black uppercase tracking-tight transition-colors hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] sm:px-5"
                  >
                    Teoría
                  </button>

                  <button
                    onClick={() => setPanel("comentarios")}
                    aria-label="Comentarios"
                    className="shrink-0 rounded-xl border-2 border-[var(--color-text-primary)] px-4 py-4 text-base font-black uppercase tracking-tight transition-colors hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] sm:px-5"
                  >
                    <span className="hidden sm:inline">Comentarios</span>
                    <span className="sm:hidden">💬</span>
                    {(conteos[actual.id] ?? 0) > 0 && (
                      <span className="ml-1.5 rounded-full bg-[var(--color-accent)] px-2 py-0.5 text-xs text-white">
                        {conteos[actual.id]}
                      </span>
                    )}
                  </button>

                  {!respondida && actual.tipo === "multiple" && (
                    <button
                      onClick={confirmar}
                      disabled={marcadas.length === 0}
                      className="flex-1 rounded-xl bg-[var(--color-bg-dark)] px-6 py-4 text-lg font-black uppercase tracking-tight text-white transition-opacity hover:opacity-90 disabled:opacity-30"
                    >
                      Confirmar ({marcadas.length})
                    </button>
                  )}

                  {respondida && (
                    <button
                      onClick={siguiente}
                      className="flex-1 rounded-xl bg-[var(--color-bg-dark)] px-6 py-4 text-lg font-black uppercase tracking-tight text-white transition-opacity hover:opacity-90"
                    >
                      {indice + 1 >= mazo.length ? "Ver resultado →" : "Siguiente →"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.section>
        )}

        {/* ── Resultado ── */}
        {estado === "final" && (
          <motion.section
            key="final"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: EASE }}
            className={`${ANCHO} py-12 sm:py-16`}
          >
            <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
              <div className="min-w-0 lg:sticky lg:top-12 lg:self-start">
                <span className="font-mono text-sm uppercase tracking-[0.22em]">Resultado</span>

                <div className="mt-3 flex items-baseline gap-3">
                  <span
                    className="font-black leading-none tracking-[-0.05em] text-[clamp(72px,14vw,170px)]"
                    style={{ color: nota >= 60 ? VERDE : "var(--color-accent)" }}
                  >
                    {aciertos}
                  </span>
                  <span className="font-black leading-none tracking-[-0.04em] text-[clamp(32px,6vw,72px)] text-[var(--color-text-secondary)]">
                    / {mazo.length}
                  </span>
                </div>

                <h2 className="mt-6 font-black leading-[0.95] tracking-[-0.03em] text-[clamp(32px,5vw,60px)]">
                  {nota >= 90
                    ? "Listo para el parcial."
                    : nota >= 60
                      ? "Aprobado. Afiná lo que falló."
                      : "Todavía no. Repasá y volvé."}{" "}
                  <span style={{ color: nota >= 60 ? VERDE : "var(--color-accent)" }}>{nota}%</span>
                </h2>

                <div className="mt-10 flex flex-col gap-4">
                  {porUnidad.map(({ u, total, bien }) => (
                    <div key={u}>
                      <div className="flex items-baseline justify-between font-mono text-xs uppercase tracking-[0.16em]">
                        <span>{UNIDADES[u].corto}</span>
                        <span>
                          {bien} / {total}
                        </span>
                      </div>
                      <div className="mt-2 h-2 w-full rounded-full bg-[var(--color-bg-secondary)]">
                        <motion.div
                          className="h-full rounded-full"
                          style={{ backgroundColor: bien / total >= 0.6 ? VERDE : "var(--color-accent)" }}
                          initial={{ width: 0 }}
                          animate={{ width: `${(bien / total) * 100}%` }}
                          transition={{ duration: 0.6, ease: EASE, delay: 0.2 }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {erradas.length > 0 && (
                  <button
                    onClick={() => iniciar(erradas.map((it) => it.p))}
                    className="mt-10 w-full rounded-xl bg-[var(--color-accent)] px-8 py-6 text-2xl font-black uppercase tracking-tight text-white transition-opacity hover:opacity-90"
                  >
                    Reintentar las {erradas.length} que fallé
                  </button>
                )}
                <button
                  onClick={() => iniciar(preguntas)}
                  className={`${
                    erradas.length > 0
                      ? "mt-3 border-2 border-[var(--color-text-primary)]"
                      : "mt-10 bg-[var(--color-accent)] text-white"
                  } w-full rounded-xl px-8 py-5 text-xl font-black uppercase tracking-tight transition-opacity hover:opacity-90`}
                >
                  Empezar de nuevo
                </button>
              </div>

              {erradas.length > 0 && (
                <div className="min-w-0">
                  <span className="font-mono text-sm uppercase tracking-[0.2em]">Para repasar</span>
                  <ul className="mt-4 flex flex-col gap-6">
                    {erradas.map(({ p }) => (
                      <li key={p.id} className="border-l-4 border-[var(--color-accent)] pl-5">
                        <span className="block text-lg font-bold leading-snug">{p.enunciado}</span>
                        <span className="mt-2 block text-lg leading-snug" style={{ color: VERDE }}>
                          {p.tipo === "vf" ? VF[p.correctas[0]] : p.correctas.map((c) => p.opciones[c]).join(" · ")}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Teoría: modal a pantalla completa con las diapositivas del PDF */}
      <AnimatePresence>
        {panel === "teoria" && actual && (
          <motion.div
            className="fixed inset-0 z-50 flex justify-center bg-black/50 sm:p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setPanel(null)}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label={`Teoría: ${actual.tema}`}
              onClick={(e) => e.stopPropagation()}
              initial={{ y: 24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 24, opacity: 0 }}
              transition={{ duration: 0.28, ease: EASE }}
              className="flex h-full w-full max-w-[1500px] flex-col overflow-hidden bg-white shadow-2xl sm:rounded-2xl"
            >
              <div className="flex shrink-0 items-center justify-between gap-4 border-b-2 border-[var(--color-divider)] px-5 py-4 sm:px-8">
                <span className="font-mono text-xs uppercase tracking-[0.2em] font-bold text-[var(--color-accent)]">
                  {actual.tema}
                </span>
                <button
                  onClick={() => setPanel(null)}
                  className="font-mono text-xs uppercase tracking-[0.18em] hover:text-[var(--color-accent)]"
                >
                  Cerrar ✕
                </button>
              </div>

              <div className="grid flex-1 gap-8 overflow-y-auto px-5 py-6 sm:px-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-12">
                <div className="min-w-0">
                  {TEORIA[actual.tema] && (
                    <>
                      <h3 className="font-black text-3xl leading-none tracking-[-0.03em] sm:text-4xl">Teoría</h3>
                      <p className="mt-3 text-lg leading-relaxed">{TEORIA[actual.tema]}</p>
                      <p className="mt-3 font-mono text-xs uppercase tracking-[0.14em]">Fuente: {actual.fuente}</p>
                    </>
                  )}

                  {terminos.length > 0 && (
                    <>
                      <h3 className="mt-8 font-black text-3xl leading-none tracking-[-0.03em]">Términos</h3>
                      <dl className="mt-4 flex flex-col gap-4">
                        {terminos.map((g) => (
                          <div key={g.termino} className="border-l-4 border-[var(--color-text-primary)] pl-4">
                            <dt className="font-bold text-lg leading-snug">{g.termino}</dt>
                            <dd className="mt-1 text-base leading-snug">{g.definicion}</dd>
                          </div>
                        ))}
                      </dl>
                    </>
                  )}
                </div>

                <div className="min-w-0">
                  <h3 className="font-black text-3xl leading-none tracking-[-0.03em] sm:text-4xl">Diapositivas</h3>
                  {DIAPOS[actual.id]?.length ? (
                    <div className="mt-4 flex flex-col gap-5">
                      {DIAPOS[actual.id].map((d) => (
                        <figure key={d.src}>
                          <button
                            onClick={() => setZoom(d.src)}
                            className="block w-full overflow-hidden rounded-xl border-2 border-[var(--color-divider)] bg-white transition-colors hover:border-[var(--color-accent)]"
                            aria-label={`Ampliar ${d.etiqueta}`}
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={d.src} alt={d.etiqueta} loading="lazy" className="w-full" draggable={false} />
                          </button>
                          <figcaption className="mt-2 font-mono text-xs uppercase tracking-[0.14em]">
                            {d.etiqueta}
                          </figcaption>
                        </figure>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-3 text-lg leading-snug">
                      Esta pregunta sale de la clase o de la presentación: no tiene diapositiva en los PDFs.
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Panel de comentarios */}
      <AnimatePresence>
        {panel === "comentarios" && actual && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-black/40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setPanel(null)}
            />
            <motion.aside
              className="fixed top-0 right-0 bottom-0 z-50 w-full overflow-y-auto bg-white px-6 py-7 shadow-2xl sm:w-[560px] sm:px-8"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.3, ease: EASE }}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs uppercase tracking-[0.2em] font-bold text-[var(--color-accent)]">
                  {actual.tema}
                </span>
                <button
                  onClick={() => setPanel(null)}
                  className="font-mono text-xs uppercase tracking-[0.18em] hover:text-[var(--color-accent)]"
                >
                  Cerrar ✕
                </button>
              </div>
              <Comentarios
                preguntaId={actual.id}
                enunciado={actual.enunciado}
                onCambio={(n) => setConteos((c) => ({ ...c, [actual.id]: n }))}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Imagen ampliada */}
      <AnimatePresence>
        {zoom && (
          <motion.div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/85 p-4 sm:p-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setZoom(null)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={zoom} alt="" className="max-h-full max-w-full rounded-lg bg-white object-contain p-2" />
            <span className="absolute top-4 right-5 font-mono text-xs uppercase tracking-[0.18em] text-white">
              Cerrar ✕
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
