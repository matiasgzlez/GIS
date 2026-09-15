"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { EASE } from "@/lib/motion";
import { NUMERO, preguntas, UNIDADES, type Pregunta, type Unidad } from "@/lib/preguntas";
import { TEORIA, terminosEn } from "@/lib/teoria";
import { DIAPOS } from "@/lib/diapositivas";

const VERDE = "#1E7A3C";
const LETRAS = "ABCDEFGHI";
const VF = ["Verdadero", "Falso"];

type Estado = "inicio" | "jugando" | "final";
/** Una pregunta del intento, con sus opciones ya mezcladas. */
type Item = { p: Pregunta; orden: number[] };

/** Mezcla siempre igual para la misma semilla: las opciones tienen un orden fijo por pregunta. */
function mezclarFijo<T>(arr: T[], semilla: string): T[] {
  let h = 2166136261;
  for (const c of semilla) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  const azar = () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(azar() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Sin azar: las preguntas van por su número (U1 → U2 → U3). */
function armarMazo(lista: Pregunta[]): Item[] {
  return [...lista]
    .sort((a, b) => NUMERO[a.id] - NUMERO[b.id])
    .map((p) => ({
      p,
      orden: p.tipo === "vf" ? [0, 1] : mezclarFijo(p.opciones.map((_, i) => i), p.id),
    }));
}

/** Ajusta la figura a su proporción: ocupa todo el lugar posible sin franjas vacías. */
function ajustarFigura(img: HTMLImageElement | null) {
  if (!img?.naturalWidth) return;
  const r = img.naturalWidth / img.naturalHeight;
  img.style.width = `min(100cqw, calc(100cqh * ${r.toFixed(4)}))`;
  img.style.aspectRatio = String(r);
}

function esCorrecta(p: Pregunta, resp: number[] | null): boolean {
  if (!resp) return false;
  return resp.length === p.correctas.length && p.correctas.every((c) => resp.includes(c));
}

/** Qué se practica: una unidad o todas (null). */
type Seleccion = Unidad | null;
const delaSeleccion = (sel: Seleccion) => (sel === null ? preguntas : preguntas.filter((p) => p.unidad === sel));

const ANCHO = "mx-auto w-full max-w-[1700px] px-5 sm:px-10 lg:px-14";

/** El video de fondo, cortado en tramos de ~10 MB sin recomprimir (se reproducen en cadena). */
const TRAMOS = Array.from({ length: 17 }, (_, i) => `/video/tierra-${String(i).padStart(2, "0")}.mp4`);

export default function Quiz() {
  const [estado, setEstado] = useState<Estado>("inicio");
  const [mazo, setMazo] = useState<Item[]>([]);
  const [indice, setIndice] = useState(0);
  const [respuestas, setRespuestas] = useState<(number[] | null)[]>([]);
  const [marcadas, setMarcadas] = useState<number[]>([]);
  const [zoom, setZoom] = useState<string | null>(null);
  const [panel, setPanel] = useState<null | "teoria">(null);
  const [seleccion, setSeleccion] = useState<Seleccion>(null);
  // Dos videos: uno se ve y el otro precarga el tramo siguiente para pasar sin cortes
  const videos = [useRef<HTMLVideoElement>(null), useRef<HTMLVideoElement>(null)];
  const [slots, setSlots] = useState<[number, number]>([0, 1]);
  const [activo, setActivo] = useState(0);

  // Sin video en movimiento para quien prefiere movimiento reducido
  useEffect(() => {
    const v = videos[0].current;
    if (!v) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) v.pause();
    else v.play().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const finTramo = (slot: number) => {
    if (slot !== activo) return;
    const otro = 1 - slot;
    videos[otro].current?.play().catch(() => {});
    setActivo(otro);
    setSlots((prev) => {
      const nuevos: [number, number] = [...prev];
      nuevos[slot] = (prev[otro] + 1) % TRAMOS.length;
      return nuevos;
    });
  };

  const item = mazo[indice];
  const actual = item?.p;
  const respuesta = respuestas[indice] ?? null;
  const respondida = respuesta !== null;
  const acerto = actual ? esCorrecta(actual, respuesta) : false;
  const contestadas = respuestas.filter((r) => r !== null).length;
  const aciertos = mazo.filter((it, i) => esCorrecta(it.p, respuestas[i] ?? null)).length;
  const conMedia = Boolean(actual?.imagen || actual?.codigo);
  let racha = 0;
  for (let i = contestadas - 1; i >= 0 && esCorrecta(mazo[i].p, respuestas[i] ?? null); i--) racha++;
  const avance = mazo.length ? contestadas / mazo.length : 0;

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
      // Todas se marcan como casillas: no se revela cuántas correctas hay
      setMarcadas((prev) =>
        prev.includes(original) ? prev.filter((x) => x !== original) : [...prev, original],
      );
    },
    [actual, respondida],
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
        else confirmar();
      } else if (e.key === "ArrowLeft") atras();
      else if (e.key === "ArrowRight" && respondida) siguiente();
      else if (e.key === "t" || e.key === "T") setPanel("teoria");
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
  const empezar = (sel: Seleccion) => {
    setSeleccion(sel);
    iniciar(delaSeleccion(sel));
  };

  /* Enunciado: más chico si comparte columna con las opciones */
  const enunciado = actual && (
    <h2
      className={`trazo font-black leading-[1.08] tracking-[-0.01em] ${
        conMedia ? "text-[clamp(22px,2.1vw,34px)]" : "text-[clamp(24px,3.2vw,52px)]"
      }`}
    >
      {actual.enunciado}
    </h2>
  );

  return (
    <main className="min-h-[100svh] w-full text-[var(--color-text-primary)]">
      {/* Fondo: la Tierra en movimiento */}
      <div className="fixed inset-0 -z-10 overflow-hidden bg-[var(--color-bg-primary)]" aria-hidden="true">
        {slots.map((tramo, slot) => (
          <video
            key={slot}
            ref={videos[slot]}
            className={`absolute inset-0 h-full w-full object-cover ${slot === activo ? "opacity-100" : "opacity-0"}`}
            src={TRAMOS[tramo]}
            poster={slot === 0 ? "/video/tierra-poster.jpg" : undefined}
            muted
            playsInline
            preload="auto"
            onEnded={() => finTramo(slot)}
          />
        ))}
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
            <span className="sombra font-mono text-xs sm:text-sm uppercase tracking-[0.24em]">
              UTN FRRe · Sistemas de Información Geográfica
            </span>

            <div className="mt-4 grid gap-10 lg:grid-cols-12 lg:items-end lg:gap-16">
              <h1 className="trazo font-black uppercase leading-[0.88] tracking-[-0.04em] text-[clamp(52px,8.5vw,150px)] lg:col-span-7">
                1er parcial <span className="text-[var(--color-accent)]">GIS</span>
              </h1>

              <div className="flex flex-col gap-3 lg:col-span-5">
                <button
                  onClick={() => empezar(null)}
                  className="flex w-full flex-col items-start gap-1 rounded-xl bg-[var(--color-accent)] px-6 py-5 text-left text-white sm:flex-row sm:items-center sm:justify-between sm:gap-4 transition-opacity hover:opacity-90 active:opacity-80 sm:px-8"
                >
                  <span className="text-xl font-black uppercase tracking-tight sm:text-2xl">Empezar global →</span>
                  <span className="font-mono text-xs uppercase tracking-[0.14em]">{preguntas.length} preguntas</span>
                </button>

                <div className="grid grid-cols-2 gap-3">
                  {([1, 2, 3] as Unidad[]).map((u) => (
                    <button
                      key={u}
                      onClick={() => empezar(u)}
                      className="flex flex-col items-start rounded-xl border-2 border-white bg-white/90 px-5 py-4 text-left transition-colors hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
                    >
                      <span className="text-xl font-black uppercase tracking-tight">Unidad {u}</span>
                      <span className="mt-1 font-mono text-[11px] uppercase tracking-[0.14em]">
                        {delaSeleccion(u).length} preguntas
                      </span>
                    </button>
                  ))}
                  <button
                    disabled
                    className="flex cursor-not-allowed flex-col items-start rounded-xl border-2 border-dashed border-white bg-white/50 px-5 py-4 text-left"
                  >
                    <span className="text-xl font-black uppercase tracking-tight opacity-60">Unidad 4</span>
                    <span className="mt-1 font-mono text-[11px] uppercase tracking-[0.14em] opacity-60">Próximamente</span>
                  </button>
                </div>
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
            className={`${ANCHO} flex min-h-[100svh] flex-col pt-5 pb-24 lg:h-[100svh] lg:pt-5 lg:pb-16`}
          >
            {/* Barra superior */}
            <div className="sombra flex flex-wrap items-center justify-between gap-x-4 gap-y-2 whitespace-nowrap font-mono text-xs sm:text-sm uppercase tracking-[0.18em]">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                <button
                  onClick={() => setEstado("inicio")}
                  className="rounded-full border-2 border-white px-3 py-1 font-bold transition-colors hover:bg-white hover:text-[var(--color-text-primary)] hover:[text-shadow:none]"
                >
                  ← Menú<span className="hidden sm:inline"> principal</span>
                </button>
                <span className="font-bold">Nº {NUMERO[actual.id]}</span>
                <span className="hidden sm:inline">{UNIDADES[actual.unidad].corto}</span>
                {actual.origen === "clase" && (
                  <span className="rounded border border-white px-2 py-0.5 text-[10px] sm:text-xs">
                    Apunte de clase
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4">
                {indice > 0 && (
                  <button onClick={atras} className="transition-opacity hover:opacity-70">
                    ←<span className="hidden sm:inline"> Anterior</span>
                  </button>
                )}
                <span className="font-bold">
                  {aciertos} ✓
                </span>
              </div>
            </div>

            <div className="mt-4 grid flex-1 gap-6 lg:mt-4 lg:min-h-0 lg:grid-cols-2 lg:gap-12">
              {/* Izquierda: figura / código, o el enunciado si no hay figura */}
              <div className="flex min-w-0 flex-col lg:min-h-0">
                {conMedia && (
                  <div className="mb-5 lg:hidden">{enunciado}</div>
                )}

                {actual.imagen ? (
                  <button
                    onClick={() => setZoom(`/img/${actual.imagen}.jpg`)}
                    className="group relative h-[36svh] w-full [container-type:size] lg:h-auto lg:min-h-0 lg:flex-1"
                    aria-label="Ampliar imagen"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      ref={ajustarFigura}
                      onLoad={(e) => ajustarFigura(e.currentTarget)}
                      src={`/img/${actual.imagen}.jpg`}
                      alt=""
                      className="absolute inset-0 m-auto h-auto max-h-full w-full max-w-full rounded-xl border-2 border-white bg-white object-contain p-2 transition-colors group-hover:border-[var(--color-accent)]"
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

                    let estilo = "border-[var(--color-divider)] bg-white/85";
                    let inline: React.CSSProperties | undefined;
                    if (respondida) {
                      if (esCorr && elegida) {
                        estilo = "border-transparent";
                        inline = { backgroundColor: VERDE, color: "#FFFFFF" };
                      } else if (esCorr) {
                        estilo = "border-dashed bg-white/85";
                        inline = { borderColor: VERDE, color: VERDE };
                      } else if (elegida) {
                        estilo = "border-transparent";
                        inline = { backgroundColor: "var(--color-accent)", color: "#FFFFFF" };
                      } else {
                        estilo = "border-[var(--color-divider)] bg-white/85 opacity-50";
                      }
                    } else if (elegida) {
                      estilo = "border-[var(--color-bg-dark)] bg-[var(--color-bg-dark)] text-white";
                    }

                    return (
                      <button
                        key={original}
                        onClick={() => tocar(original)}
                        disabled={respondida}
                        className={`flex items-start gap-3 rounded-xl border-2 px-4 py-3 lg:py-2 text-left text-base leading-snug transition-colors xl:text-lg ${estilo} ${
                          !respondida ? "hover:border-[var(--color-accent)]" : ""
                        }`}
                        style={inline}
                      >
                        <span
                          className="mt-px flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 font-mono text-xs font-bold"
                          style={{ borderColor: "currentColor", opacity: 0.8 }}
                        >
                          {elegida ? "✓" : LETRAS[pos]}
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
                    <p className="rounded-xl bg-white/85 px-3 py-2 text-base leading-snug xl:text-lg">
                      <span className="font-black" style={{ color: acerto ? VERDE : "var(--color-accent)" }}>
                        {acerto ? "✓ Correcto. " : "✗ Incorrecto. "}
                      </span>
                      {actual.explicacion}
                    </p>
                  </motion.div>
                )}

                <div className="mt-3 flex gap-3 pb-1">
                  <button
                    onClick={() => setPanel("teoria")}
                    className="shrink-0 rounded-xl border-2 border-[var(--color-text-primary)] bg-white/85 px-4 py-4 text-base font-black uppercase tracking-tight transition-colors hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] sm:px-5"
                  >
                    Teoría
                  </button>

                  {!respondida && (
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
              <div className="min-w-0 rounded-2xl bg-white/90 p-6 sm:p-8 lg:sticky lg:top-12 lg:self-start">
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
                  onClick={() => empezar(seleccion)}
                  className={`${
                    erradas.length > 0
                      ? "mt-3 border-2 border-[var(--color-text-primary)]"
                      : "mt-10 bg-[var(--color-accent)] text-white"
                  } w-full rounded-xl px-8 py-5 text-xl font-black uppercase tracking-tight transition-opacity hover:opacity-90`}
                >
                  Empezar de nuevo
                </button>
                <button
                  onClick={() => setEstado("inicio")}
                  className="mt-3 w-full rounded-xl border-2 border-[var(--color-text-primary)] px-8 py-4 text-lg font-black uppercase tracking-tight transition-opacity hover:opacity-80"
                >
                  Volver al inicio
                </button>
              </div>

              {erradas.length > 0 && (
                <div className="min-w-0 self-start rounded-2xl bg-white/90 p-6 sm:p-8">
                  <span className="font-mono text-sm uppercase tracking-[0.2em]">Para repasar</span>
                  <ul className="mt-4 flex flex-col gap-6">
                    {erradas.map(({ p }) => (
                      <li key={p.id} className="border-l-4 border-[var(--color-accent)] pl-5">
                        <span className="block text-lg font-bold leading-snug">
                          <span className="font-mono text-sm text-[var(--color-accent)]">Nº {NUMERO[p.id]} · </span>
                          {p.enunciado}
                        </span>
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

      {/* Progreso: la ruta del avión y la racha de aciertos */}
      <AnimatePresence>
        {estado === "jugando" && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.3, ease: EASE }}
            className="fixed bottom-4 left-1/2 z-40 flex w-[min(680px,calc(100vw-2rem))] -translate-x-1/2 items-center gap-3 rounded-full bg-black/55 px-4 py-2.5 lg:bottom-3 lg:py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-white backdrop-blur-md sm:gap-5 sm:px-6 sm:text-xs"
          >
            <span className="shrink-0 tabular-nums">
              {contestadas}
              <span className="opacity-60">/{mazo.length}</span>
            </span>

            <div className="relative h-8 flex-1" role="progressbar" aria-valuemin={0} aria-valuemax={mazo.length} aria-valuenow={contestadas}>
              <div className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-[#6E7F2E]" />
              <motion.div
                className="absolute left-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-gradient-to-r from-[#1F8A70] to-[#7CC242]"
                initial={false}
                animate={{ width: `${avance * 100}%` }}
                transition={{ type: "spring", stiffness: 120, damping: 22 }}
              />
              <motion.svg
                viewBox="0 0 24 24"
                className="absolute top-1/2 h-7 w-7 -translate-x-1/2 -translate-y-1/2 drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]"
                initial={false}
                animate={{ left: `${avance * 100}%` }}
                transition={{ type: "spring", stiffness: 120, damping: 22 }}
                aria-hidden="true"
              >
                <path
                  fill="#F2C744"
                  transform="rotate(90 12 12)"
                  d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"
                />
              </motion.svg>
            </div>

            <span className="flex shrink-0 items-center gap-1.5">
              <span className="hidden sm:inline">Racha</span>
              <motion.span
                key={racha}
                initial={{ scale: racha > 0 ? 1.6 : 1 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
                className={`inline-block text-sm font-bold tabular-nums sm:text-base ${racha >= 3 ? "text-[#F2C744]" : ""}`}
              >
                {racha >= 3 ? "🔥" : "⚡"} {racha}
              </motion.span>
            </span>
          </motion.div>
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
