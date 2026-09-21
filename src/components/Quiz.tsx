"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { EASE } from "@/lib/motion";
import { UNIDADES, type Pregunta, type Unidad } from "@/lib/preguntas";
import { DOCS, RECORRIDO, REFERENCIA, type Pagina } from "@/lib/recorrido";

const VERDE = "#1E7A3C";
const LETRAS = "ABCDEFGHI";
const VF = ["Verdadero", "Falso"];

type Estado = "inicio" | "leyendo" | "final";
/** Qué se recorre: todas las unidades o una sola. */
type Modo = "todo" | "u1" | "u2" | "u3" | "u4";
/** Dónde está parado: una página (pregunta null = leyéndola) o una de sus preguntas. */
type Paso = { pagina: number; pregunta: number | null };

const MODOS: { modo: Modo; titulo: string }[] = [
  { modo: "u1", titulo: "Unidad 1" },
  { modo: "u2", titulo: "Unidad 2" },
  { modo: "u3", titulo: "Unidad 3" },
  { modo: "u4", titulo: "Unidad 4" },
];

const GUARDADO = "gis-recorrido-v1";
/** Cómo se estudia: leyendo las páginas, solo las preguntas o solo las importantes. */
type Vista = "lectura" | "preguntas" | "importantes" | "parcial";
/** Sin lectura se arranca directo en la primera pregunta. */
const inicioDe = (solo: boolean): Paso => ({ pagina: 0, pregunta: solo ? 0 : null });
/** Cada forma de estudiar guarda su propia posición y sus propias respuestas. */
const claveDe = (m: Modo, vista: Vista) => (vista === "lectura" ? m : `${m}-${vista}`);
type Grupo = Vista;
type Respuestas = Record<string, number[]>;
/** Páginas salteadas, por su clave "documento-página". */
type Salteadas = Record<string, true>;
const claveP = (p: Pagina) => `${p.doc}-${p.n}`;

const paginasDe = (modo: Modo, vista: Vista = "lectura"): Pagina[] => {
  const suyas = modo === "todo" ? RECORRIDO : RECORRIDO.filter((p) => `u${p.unidad}` === modo);
  if (vista === "lectura") return suyas;
  const filtro = vista === "importantes" ? (q: Pregunta) => !!q.importante : vista === "parcial" ? (q: Pregunta) => !!q.parcial : null;
  const paginas = filtro ? suyas.map((p) => ({ ...p, preguntas: p.preguntas.filter(filtro) })) : suyas;
  return paginas.filter((p) => p.preguntas.length > 0);
};

/** Posición de la pregunta actual dentro de todas las del recorrido (0 = la primera). */
const indicePregunta = (paginas: Pagina[], paso: Paso) =>
  paginas.slice(0, paso.pagina).reduce((n, p) => n + p.preguntas.length, 0) + (paso.pregunta ?? 0);

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

const ordenDe = (p: Pregunta) => (p.tipo === "vf" ? [0, 1] : mezclarFijo(p.opciones.map((_, i) => i), p.id));

/** Ajusta una imagen a su proporción: ocupa todo el lugar posible sin franjas vacías. */
function ajustarFigura(img: HTMLImageElement | null) {
  if (!img?.naturalWidth) return;
  const r = img.naturalWidth / img.naturalHeight;
  img.style.width = `min(100cqw, calc(100cqh * ${r.toFixed(4)}))`;
  img.style.aspectRatio = String(r);
}

function esCorrecta(p: Pregunta, resp: number[] | undefined): boolean {
  if (!resp) return false;
  return resp.length === p.correctas.length && p.correctas.every((c) => resp.includes(c));
}

const ANCHO = "mx-auto w-full max-w-[1700px] px-5 sm:px-10 lg:px-14";
const BOTON_OSCURO =
  "flex-1 rounded-xl bg-[var(--color-bg-dark)] px-6 py-4 text-lg font-black uppercase tracking-tight text-white transition-opacity hover:opacity-90 disabled:opacity-30";

/** El video de fondo, cortado en tramos de ~10 MB sin recomprimir (se reproducen en cadena). */
const TRAMOS = Array.from({ length: 17 }, (_, i) => `/video/tierra-${String(i).padStart(2, "0")}.mp4`);

export default function Quiz() {
  const [estado, setEstado] = useState<Estado>("inicio");
  const [modo, setModo] = useState<Modo>("todo");
  /** Repaso de las falladas: las mismas páginas, solo con esas preguntas. */
  const [repaso, setRepaso] = useState<Pagina[] | null>(null);
  const [vista, setVista] = useState<Vista>("lectura");
  /** Sin lectura: se va directo a las preguntas. */
  const solo = vista !== "lectura";
  const [paso, setPaso] = useState<Paso>(inicioDe(false));
  // Cada forma de estudiar guarda sus respuestas y sus salteos por separado
  const vacio = { lectura: {}, preguntas: {}, importantes: {}, parcial: {} };
  const [respuestasPor, setRespuestasPor] = useState<Record<Grupo, Respuestas>>(vacio);
  const [salteadasPor, setSalteadasPor] = useState<Record<Grupo, Salteadas>>(vacio);
  const [posiciones, setPosiciones] = useState<Record<string, Paso>>({});
  const [cargado, setCargado] = useState(false);
  const [marcadas, setMarcadas] = useState<number[]>([]);
  const [zoom, setZoom] = useState<string | null>(null);
  /** Si la hoja A4 ya se leyó hasta abajo (para ocultar el aviso de scroll). */
  const [finHoja, setFinHoja] = useState(false);

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

  // Avance guardado en el navegador: respuestas y por dónde va cada recorrido
  useEffect(() => {
    try {
      const g = JSON.parse(localStorage.getItem(GUARDADO) ?? "null");
      if (g?.respuestasPor) setRespuestasPor({ ...vacio, ...g.respuestasPor });
      else if (g?.respuestas) setRespuestasPor({ ...vacio, lectura: g.respuestas });
      if (g?.salteadasPor) setSalteadasPor({ ...vacio, ...g.salteadasPor });
      if (g?.posiciones) setPosiciones(g.posiciones);
    } catch {
      /* sin avance guardado */
    }
    setCargado(true);
  }, []);

  useEffect(() => {
    if (!cargado) return;
    try {
      localStorage.setItem(GUARDADO, JSON.stringify({ respuestasPor, salteadasPor, posiciones }));
    } catch {
      /* navegador sin almacenamiento */
    }
  }, [cargado, respuestasPor, salteadasPor, posiciones]);

  const grupo: Grupo = vista;
  const respuestas = respuestasPor[grupo];
  const cambiarRespuestas = useCallback(
    (g: Grupo, f: (prev: Respuestas) => Respuestas) => setRespuestasPor((prev) => ({ ...prev, [g]: f(prev[g]) })),
    [],
  );
  const clave = claveDe(modo, vista);
  const salteadas = salteadasPor[grupo];
  const marcarSalteada = useCallback(
    (clavePagina: string, saltear: boolean) =>
      setSalteadasPor((prev) => {
        const nuevas = { ...prev[grupo] };
        if (saltear) nuevas[clavePagina] = true;
        else delete nuevas[clavePagina];
        return { ...prev, [grupo]: nuevas };
      }),
    [grupo],
  );

  const paginas = repaso ?? paginasDe(modo, vista);
  const pagina = paginas[paso.pagina];
  const actual = pagina && paso.pregunta !== null ? pagina.preguntas[paso.pregunta] : undefined;
  const orden = useMemo(() => (actual ? ordenDe(actual) : []), [actual]);
  const respuesta = actual ? respuestas[actual.id] : undefined;
  const respondida = respuesta !== undefined;
  const acerto = actual ? esCorrecta(actual, respuesta) : false;
  const conMedia = Boolean(actual?.imagen || actual?.codigo);

  /** Aciertos y resultado se cuentan siempre sobre todo el recorrido elegido, no sobre el repaso. */
  const delRecorrido = paginasDe(modo, vista)
    .filter((p) => !salteadas[claveP(p)])
    .flatMap((p) => p.preguntas);
  const salteadasAqui = paginasDe(modo, vista).filter((p) => salteadas[claveP(p)]).length;
  /** Preguntas de lo que se está recorriendo ahora (en el repaso, solo las falladas). */
  const enCurso = paginas.filter((p) => !salteadas[claveP(p)]).flatMap((p) => p.preguntas);
  const aciertos = delRecorrido.filter((p) => esCorrecta(p, respuestas[p.id])).length;
  let racha = 0;
  const respondidas = delRecorrido.filter((p) => respuestas[p.id]);
  for (let i = respondidas.length - 1; i >= 0 && esCorrecta(respondidas[i], respuestas[respondidas[i].id]); i--) racha++;
  const totalPreguntas = enCurso.length;
  const avance =
    estado === "final" || !pagina
      ? 1
      : solo
        ? indicePregunta(paginas, paso) / Math.max(totalPreguntas, 1)
        : (paso.pagina +
          (paso.pregunta === null ? 0 : (paso.pregunta + 1) / (pagina.preguntas.length + 1))) /
        paginas.length;

  /** Moverse y recordar la posición del recorrido (el repaso no se guarda). */
  const ir = useCallback(
    (p: Paso) => {
      setPaso(p);
      setMarcadas([]);
      setFinHoja(false);
      if (!repaso) setPosiciones((prev) => ({ ...prev, [clave]: p }));
      window.scrollTo({ top: 0 });
    },
    [clave, repaso],
  );

  const terminar = useCallback(() => {
    if (!repaso) setPosiciones((prev) => ({ ...prev, [clave]: { pagina: paginas.length, pregunta: null } }));
    setEstado("final");
    window.scrollTo({ top: 0 });
  }, [clave, paginas.length, repaso]);

  const avanzar = useCallback(() => {
    if (!pagina) return;
    // Al volver a responder después de releer, sigue desde la primera sin contestar
    if (salteadas[claveP(pagina)]) marcarSalteada(claveP(pagina), false);
    const pendiente = pagina.preguntas.findIndex((q) => !respuestas[q.id]);
    const siguiente = paso.pregunta === null ? Math.max(pendiente, 0) : paso.pregunta + 1;
    if (siguiente < pagina.preguntas.length) ir({ pagina: paso.pagina, pregunta: siguiente });
    else if (paso.pagina + 1 < paginas.length) ir({ pagina: paso.pagina + 1, pregunta: solo ? 0 : null });
    else terminar();
  }, [pagina, paso, paginas.length, respuestas, salteadas, marcarSalteada, solo, ir, terminar]);

  const retroceder = useCallback(() => {
    if (solo) {
      if (paso.pregunta) ir({ pagina: paso.pagina, pregunta: paso.pregunta - 1 });
      else if (paso.pagina > 0) ir({ pagina: paso.pagina - 1, pregunta: paginas[paso.pagina - 1].preguntas.length - 1 });
    } else if (paso.pregunta !== null) {
      ir({ pagina: paso.pagina, pregunta: paso.pregunta === 0 ? null : paso.pregunta - 1 });
    } else if (paso.pagina > 0) {
      const anterior = paginas[paso.pagina - 1];
      ir({ pagina: paso.pagina - 1, pregunta: anterior.preguntas.length ? anterior.preguntas.length - 1 : null });
    }
  }, [solo, paso, paginas, ir]);

  /** Saltea la página y sus preguntas: no cuentan en el resultado. */
  const saltear = useCallback(() => {
    if (!pagina) return;
    marcarSalteada(claveP(pagina), true);
    if (paso.pagina + 1 < paginas.length) ir({ pagina: paso.pagina + 1, pregunta: solo ? 0 : null });
    else terminar();
  }, [pagina, paso.pagina, paginas.length, marcarSalteada, solo, ir, terminar]);

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
    if (!actual || respondida || marcadas.length === 0) return;
    cambiarRespuestas(grupo, (prev) => ({ ...prev, [actual.id]: [...marcadas] }));
  }, [actual, respondida, marcadas, grupo, cambiarRespuestas]);

  const empezar = (m: Modo, v: Vista) => {
    const guardada = posiciones[claveDe(m, v)] ?? inicioDe(v !== "lectura");
    setModo(m);
    setVista(v);
    setRepaso(null);
    setMarcadas([]);
    if (guardada.pagina >= paginasDe(m, v).length) {
      setEstado("final");
    } else {
      setPaso(guardada);
      setEstado("leyendo");
    }
    window.scrollTo({ top: 0 });
  };

  const reiniciar = (m: Modo, v: Vista) => {
    const ids = new Set(paginasDe(m).flatMap((p) => p.preguntas.map((q) => q.id)));
    cambiarRespuestas(v, (prev) =>
      Object.fromEntries(Object.entries(prev).filter(([id]) => !ids.has(id))),
    );
    setSalteadasPor((prev) => {
      const ids = new Set(paginasDe(m).map(claveP));
      const g: Grupo = v;
      return { ...prev, [g]: Object.fromEntries(Object.entries(prev[g]).filter(([k]) => !ids.has(k))) };
    });
    setPosiciones((prev) => {
      const nuevas = { ...prev };
      // Reiniciar el recorrido completo reinicia también cada unidad
      for (const k of m === "todo" ? (["todo", "u1", "u2", "u3", "u4"] as Modo[]) : [m]) delete nuevas[claveDe(k, v)];
      return nuevas;
    });
  };

  const repasarFalladas = () => {
    const falladas = paginas
      .map((p) => ({ ...p, preguntas: p.preguntas.filter((q) => !esCorrecta(q, respuestas[q.id])) }))
      .filter((p) => p.preguntas.length);
    const ids = new Set(falladas.flatMap((p) => p.preguntas.map((q) => q.id)));
    cambiarRespuestas(grupo, (prev) => Object.fromEntries(Object.entries(prev).filter(([id]) => !ids.has(id))));
    setRepaso(falladas);
    setPaso(inicioDe(solo));
    setMarcadas([]);
    setEstado("leyendo");
    window.scrollTo({ top: 0 });
  };

  const alMenu = () => {
    setRepaso(null);
    setEstado("inicio");
  };

  // Teclado: 1-9 marca, Enter confirma / avanza, ← vuelve, → avanza
  useEffect(() => {
    if (estado !== "leyendo" || !pagina) return;
    const onKey = (e: KeyboardEvent) => {
      if (zoom) {
        if (e.key === "Escape") setZoom(null);
        return;
      }
      if (e.key === "ArrowLeft") return retroceder();
      if (e.key === "s" || e.key === "S") return saltear();
      if (!actual) {
        if (e.key === "Enter" || e.key === "ArrowRight") {
          e.preventDefault();
          avanzar();
        }
        return;
      }
      const n = Number(e.key);
      if (n >= 1 && n <= orden.length) tocar(orden[n - 1]);
      else if (e.key === "Enter") {
        e.preventDefault();
        if (respondida) avanzar();
        else confirmar();
      } else if (e.key === "ArrowRight" && respondida) avanzar();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [estado, pagina, actual, orden, respondida, zoom, tocar, confirmar, avanzar, retroceder, saltear]);

  const esUltimaPagina = paso.pagina + 1 >= paginas.length;
  const textoSiguiente = (quedanPreguntas: boolean) =>
    quedanPreguntas ? "Siguiente pregunta →" : esUltimaPagina ? "Ver resultado →" : "Siguiente página →";

  const porUnidad = ([1, 2, 3, 4] as Unidad[])
    .map((u) => {
      const lista = delRecorrido.filter((p) => p.unidad === u);
      return { u, total: lista.length, bien: lista.filter((p) => esCorrecta(p, respuestas[p.id])).length };
    })
    .filter((x) => x.total > 0);
  const nota = delRecorrido.length ? Math.round((aciertos / delRecorrido.length) * 100) : 0;
  const erradas = delRecorrido.filter((p) => !esCorrecta(p, respuestas[p.id]));

  /* Enunciado: más chico si comparte columna con la figura */
  const enunciado = actual && (
    <h2
      className={`trazo font-black leading-[1.08] tracking-[-0.01em] ${
        conMedia ? "text-[clamp(22px,2.1vw,34px)]" : "text-[clamp(24px,3.2vw,52px)]"
      }`}
    >
      {actual.enunciado}
    </h2>
  );

  /* Barra superior de la lectura y de las preguntas */
  const barra = pagina && (
    <div className="sombra flex flex-wrap items-center justify-between gap-x-4 gap-y-2 whitespace-nowrap font-mono text-xs uppercase tracking-[0.18em] sm:text-sm">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <button
          onClick={alMenu}
          className="rounded-full border-2 border-white px-3 py-1 font-bold transition-colors hover:bg-white hover:text-[var(--color-text-primary)] hover:[text-shadow:none]"
        >
          ← Menú<span className="hidden sm:inline"> principal</span>
        </button>
        <span className="font-bold">{actual ? REFERENCIA[actual.id] : pagina.etiqueta}</span>
        {repaso && <span className="rounded border border-white px-2 py-0.5 text-[10px] sm:text-xs">Repaso</span>}
        {actual?.origen === "clase" && (
          <span className="rounded border border-white px-2 py-0.5 text-[10px] sm:text-xs">Apunte de clase</span>
        )}
        {actual?.parcial && (
          <span className="rounded bg-[var(--color-accent)] px-2 py-0.5 text-[10px] font-bold text-white [text-shadow:none] sm:text-xs">
            Parcial {actual.parcial}
          </span>
        )}
        {actual?.importante && !actual.parcial && (
          <span className="rounded bg-[#F2C744] px-2 py-0.5 text-[10px] font-bold text-black [text-shadow:none] sm:text-xs">
            ★ Importante
          </span>
        )}
        {solo && !repaso && (
          <span className="hidden opacity-80 lg:inline">
            {vista === "importantes" ? "Solo importantes" : vista === "parcial" ? "Solo parcial 2025" : "Solo preguntas"}
          </span>
        )}
      </div>
      <div className="flex items-center gap-4">
        {(paso.pagina > 0 || paso.pregunta !== null) && (
          <button onClick={retroceder} className="transition-opacity hover:opacity-70">
            ←<span className="hidden sm:inline"> Anterior</span>
          </button>
        )}
        <button onClick={saltear} className="transition-opacity hover:opacity-70" title="Saltear esta página y sus preguntas (S)">
          Saltear<span className="hidden sm:inline"> página</span> ⇥
        </button>
        <span className="font-bold">{aciertos} ✓</span>
      </div>
    </div>
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
            <span className="sombra font-mono text-xs uppercase tracking-[0.24em] sm:text-sm">
              UTN FRRe · Sistemas de Información Geográfica
            </span>

            <div className="mt-4 grid gap-10 lg:grid-cols-12 lg:items-end lg:gap-16">
              <h1 className="trazo font-black uppercase leading-[0.88] tracking-[-0.04em] text-[clamp(52px,8.5vw,150px)] lg:col-span-7">
                1er parcial <span className="text-[var(--color-accent)]">GIS</span>
              </h1>

              <div className="flex flex-col gap-3 lg:col-span-5">
                <TarjetaModo
                  titulo="Recorrido completo"
                  paginas={paginasDe("todo")}
                  posicion={posiciones.todo}
                  onEmpezar={() => empezar("todo", "lectura")}
                  onReiniciar={() => reiniciar("todo", "lectura")}
                  destacada
                />
                <div className="grid grid-cols-2 gap-3">
                  {MODOS.map(({ modo: m, titulo }) => (
                    <TarjetaModo
                      key={m}
                      titulo={titulo}
                      paginas={paginasDe(m)}
                      posicion={posiciones[m]}
                      onEmpezar={() => empezar(m, "lectura")}
                      onReiniciar={() => reiniciar(m, "lectura")}
                    />
                  ))}
                </div>

                {/* Práctica directa: solo las preguntas, con sus figuras */}
                {(
                  [
                    { vista: "preguntas" as Vista, titulo: "Solo preguntas · sin diapositivas" },
                    { vista: "importantes" as Vista, titulo: "★ Solo las importantes" },
                  ]
                ).map(({ vista: v, titulo }) => (
                  <div key={v} className="contents">
                    <div className="mt-2 flex items-center justify-between gap-3">
                      <span className="sombra font-mono text-xs font-bold uppercase tracking-[0.2em]">{titulo}</span>
                      {v === "importantes" && (
                        /* Las preguntas del parcial de septiembre 2025, todas juntas */
                        <button
                          onClick={() => empezar("todo", "parcial")}
                          className="shrink-0 rounded-full bg-[var(--color-accent)] px-3 py-0.5 font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-white transition-opacity hover:opacity-85"
                        >
                          Parcial 2025 ·{" "}
                          {(() => {
                            const total = paginasDe("todo", "parcial").reduce((n, pg) => n + pg.preguntas.length, 0);
                            const pos = posiciones[claveDe("todo", "parcial")];
                            if (!pos) return `${total} preg.`;
                            if (pos.pagina >= paginasDe("todo", "parcial").length) return "terminado";
                            return `▶ ${indicePregunta(paginasDe("todo", "parcial"), pos) + 1}/${total}`;
                          })()}
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
                      {([{ modo: "todo" as Modo, titulo: "Todas" }, ...MODOS]).map(({ modo: m, titulo: t }) => (
                        <TarjetaModo
                          key={m}
                          titulo={t.replace("Unidad ", "U")}
                          paginas={paginasDe(m, v)}
                          posicion={posiciones[claveDe(m, v)]}
                          onEmpezar={() => empezar(m, v)}
                          onReiniciar={() => reiniciar(m, v)}
                          solo
                        />
                      ))}
                    </div>
                  </div>
                ))}

              </div>
            </div>
          </motion.section>
        )}

        {/* ── Lectura de la página ── */}
        {estado === "leyendo" && pagina && !actual && (
          <motion.section
            key={`l-${paso.pagina}`}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.25, ease: EASE }}
            className={`${ANCHO} flex min-h-[100svh] flex-col pt-5 pb-24 lg:h-[100svh] lg:pb-16`}
          >
            {barra}

            <div className="mt-4 grid flex-1 gap-5 lg:min-h-0 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-10">
              {DOCS[pagina.doc].vertical ? (
                /* Hoja A4: se lee con scroll dentro de la hoja */
                <div className="relative mx-auto w-full max-w-[920px] overflow-hidden rounded-xl bg-white shadow-2xl lg:min-h-0">
                  <div
                    className="lector lg:h-full lg:overflow-y-scroll"
                    onScroll={(e) => {
                      const el = e.currentTarget;
                      setFinHoja(el.scrollTop + el.clientHeight >= el.scrollHeight - 24);
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={pagina.src} alt={pagina.etiqueta} className="w-full" draggable={false} />
                  </div>
                  <AnimatePresence>
                    {!finHoja && (
                      <motion.span
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: [0, 4, 0] }}
                        exit={{ opacity: 0 }}
                        transition={{ y: { repeat: Infinity, duration: 1.6 }, opacity: { duration: 0.2 } }}
                        className="pointer-events-none absolute bottom-4 left-1/2 hidden -translate-x-1/2 rounded-full bg-black/75 px-4 py-2 font-mono text-xs uppercase tracking-[0.14em] text-white lg:block"
                      >
                        ↓ Deslizá para leer más
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                /* Diapositiva: entra entera en la pantalla */
                <button
                  onClick={() => setZoom(pagina.src)}
                  className="group relative aspect-[4/3] w-full [container-type:size] lg:aspect-auto lg:min-h-0"
                  aria-label={`Ampliar ${pagina.etiqueta}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    ref={ajustarFigura}
                    onLoad={(e) => ajustarFigura(e.currentTarget)}
                    src={pagina.src}
                    alt={pagina.etiqueta}
                    className="absolute inset-0 m-auto h-auto max-h-full w-full max-w-full rounded-xl border-2 border-white bg-white shadow-2xl transition-colors group-hover:border-[var(--color-accent)]"
                    draggable={false}
                  />
                </button>
              )}

              <aside className="flex flex-col gap-3 lg:justify-center">
                <div className="rounded-2xl bg-white/90 p-5">
                  <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--color-accent)]">
                    {DOCS[pagina.doc].nombre}
                  </span>
                  <p className="mt-1 text-4xl font-black leading-none tracking-[-0.03em]">
                    {DOCS[pagina.doc].pagina} {pagina.n}
                  </p>
                  <p className="mt-3 text-base leading-snug">
                    {pagina.preguntas.length === 0
                      ? "Esta página no tiene preguntas: leela y seguí."
                      : `Leela y después respondé ${pagina.preguntas.length === 1 ? "1 pregunta" : `${pagina.preguntas.length} preguntas`}.`}
                  </p>
                </div>

                <button
                  onClick={avanzar}
                  className="rounded-xl bg-[var(--color-accent)] px-6 py-5 text-xl font-black uppercase tracking-tight text-white transition-opacity hover:opacity-90"
                >
                  {pagina.preguntas.length
                    ? pagina.preguntas.every((q) => respuestas[q.id])
                      ? "Ver preguntas →"
                      : `Responder (${pagina.preguntas.length}) →`
                    : esUltimaPagina
                      ? "Ver resultado →"
                      : "Siguiente página →"}
                </button>
                <button
                  onClick={() => setZoom(pagina.src)}
                  className="rounded-xl border-2 border-[var(--color-text-primary)] bg-white/85 px-6 py-3 text-base font-black uppercase tracking-tight transition-colors hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
                >
                  Ampliar página
                </button>
                <button
                  onClick={saltear}
                  className="sombra font-mono text-xs uppercase tracking-[0.16em] transition-opacity hover:opacity-70"
                >
                  Saltear esta página ⇥
                </button>
              </aside>
            </div>
          </motion.section>
        )}

        {/* ── Preguntas de la página ── */}
        {estado === "leyendo" && pagina && actual && (
          <motion.section
            key={`p-${paso.pagina}-${paso.pregunta}`}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.25, ease: EASE }}
            className={`${ANCHO} flex min-h-[100svh] flex-col pt-5 pb-24 lg:h-[100svh] lg:pb-16`}
          >
            {barra}

            <div className="mt-4 grid flex-1 gap-6 lg:min-h-0 lg:grid-cols-2 lg:gap-12">
              {/* Izquierda: figura / código, o el enunciado si no hay figura */}
              <div className="flex min-w-0 flex-col lg:min-h-0">
                {conMedia && <div className="mb-5 lg:hidden">{enunciado}</div>}

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
                  {orden.map((original, pos) => {
                    const texto = actual.tipo === "vf" ? VF[original] : actual.opciones[original];
                    const esCorr = actual.correctas.includes(original);
                    const elegida = respondida ? respuesta.includes(original) : marcadas.includes(original);

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
                        className={`flex items-start gap-3 rounded-xl border-2 px-4 py-3 text-left text-base leading-snug transition-colors lg:py-2 xl:text-lg ${estilo} ${
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
                  {!solo && (
                  <button
                    onClick={() => ir({ pagina: paso.pagina, pregunta: null })}
                    className="shrink-0 rounded-xl border-2 border-[var(--color-text-primary)] bg-white/85 px-5 py-4 text-base font-black uppercase tracking-tight transition-colors hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
                    aria-label="Volver a leer la página"
                    title="Volver a leer la página"
                  >
                    ←<span className="hidden sm:inline"> Releer</span>
                  </button>
                  )}

                  {respondida ? (
                    <button onClick={avanzar} className={BOTON_OSCURO}>
                      {textoSiguiente((paso.pregunta ?? 0) + 1 < pagina.preguntas.length)}
                    </button>
                  ) : (
                    <button onClick={confirmar} disabled={marcadas.length === 0} className={BOTON_OSCURO}>
                      Confirmar ({marcadas.length})
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
                <span className="font-mono text-sm uppercase tracking-[0.22em]">
                  {repaso ? "Resultado después del repaso" : "Resultado"}
                </span>

                <div className="mt-3 flex items-baseline gap-3">
                  <span
                    className="font-black leading-none tracking-[-0.05em] text-[clamp(72px,14vw,170px)]"
                    style={{ color: nota >= 60 ? VERDE : "var(--color-accent)" }}
                  >
                    {aciertos}
                  </span>
                  <span className="font-black leading-none tracking-[-0.04em] text-[clamp(32px,6vw,72px)] text-[var(--color-text-secondary)]">
                    / {delRecorrido.length}
                  </span>
                </div>

                {salteadasAqui > 0 && (
                  <p className="mt-3 font-mono text-xs uppercase tracking-[0.14em]">
                    {salteadasAqui === 1 ? "1 página salteada" : `${salteadasAqui} páginas salteadas`}: sus preguntas no cuentan
                  </p>
                )}

                <h2 className="mt-6 font-black leading-[0.95] tracking-[-0.03em] text-[clamp(32px,5vw,60px)]">
                  {delRecorrido.length === 0
                    ? "Salteaste todas las páginas."
                    : nota >= 90
                    ? "Listo para el parcial."
                    : nota >= 60
                      ? "Aprobado. Afiná lo que falló."
                      : "Todavía no. Repasá y volvé."}{" "}
                  {delRecorrido.length > 0 && (
                    <span style={{ color: nota >= 60 ? VERDE : "var(--color-accent)" }}>{nota}%</span>
                  )}
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
                    onClick={repasarFalladas}
                    className="mt-10 w-full rounded-xl bg-[var(--color-accent)] px-8 py-6 text-2xl font-black uppercase tracking-tight text-white transition-opacity hover:opacity-90"
                  >
                    Repasar las {erradas.length} que fallé
                  </button>
                )}
                {!repaso && (
                  <button
                    onClick={() => {
                      reiniciar(modo, vista);
                      setPaso(inicioDe(solo));
                      setEstado("leyendo");
                    }}
                    className={`${
                      erradas.length > 0
                        ? "mt-3 border-2 border-[var(--color-text-primary)]"
                        : "mt-10 bg-[var(--color-accent)] text-white"
                    } w-full rounded-xl px-8 py-5 text-xl font-black uppercase tracking-tight transition-opacity hover:opacity-90`}
                  >
                    Empezar de nuevo
                  </button>
                )}
                <button
                  onClick={alMenu}
                  className="mt-3 w-full rounded-xl border-2 border-[var(--color-text-primary)] px-8 py-4 text-lg font-black uppercase tracking-tight transition-opacity hover:opacity-80"
                >
                  Volver al inicio
                </button>
              </div>

              {erradas.length > 0 && (
                <div className="min-w-0 self-start rounded-2xl bg-white/90 p-6 sm:p-8">
                  <span className="font-mono text-sm uppercase tracking-[0.2em]">Para repasar</span>
                  <ul className="mt-4 flex flex-col gap-6">
                    {erradas.map((p) => (
                      <li key={p.id} className="border-l-4 border-[var(--color-accent)] pl-5">
                        <span className="block font-mono text-xs uppercase tracking-[0.12em] text-[var(--color-accent)]">
                          {p.parcial ? `Parcial ${p.parcial} · ` : p.importante ? "★ " : ""}
                          {REFERENCIA[p.id]}
                        </span>
                        <span className="mt-1 block text-lg font-bold leading-snug">{p.enunciado}</span>
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
        {estado === "leyendo" && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.3, ease: EASE }}
            className="fixed bottom-4 left-1/2 z-40 flex w-[min(680px,calc(100vw-2rem))] -translate-x-1/2 items-center gap-3 rounded-full bg-black/55 px-4 py-2.5 font-mono text-[11px] uppercase tracking-[0.14em] text-white backdrop-blur-md sm:gap-5 sm:px-6 sm:text-xs lg:bottom-3 lg:py-1.5"
          >
            <span className="shrink-0 tabular-nums">
              {solo ? (
                <>
                  {Math.min(indicePregunta(paginas, paso) + 1, totalPreguntas)}
                  <span className="opacity-60">/{totalPreguntas}</span>
                  <span className="hidden sm:inline"> preg.</span>
                </>
              ) : (
                <>
                  {Math.min(paso.pagina + 1, paginas.length)}
                  <span className="opacity-60">/{paginas.length}</span>
                  <span className="hidden sm:inline"> pág.</span>
                </>
              )}
            </span>

            <div
              className="relative h-8 flex-1"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={paginas.length}
              aria-valuenow={paso.pagina}
            >
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

      {/* Imagen ampliada */}
      <AnimatePresence>
        {zoom && (
          <motion.div
            className="fixed inset-0 z-[60] flex items-start justify-start overflow-auto bg-black/85 p-4 sm:items-center sm:justify-center sm:p-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setZoom(null)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {/* En el celu se ve al doble de ancho y se recorre con scroll */}
            <img
              src={zoom}
              alt=""
              className="w-[200vw] max-w-none rounded-lg bg-white object-contain p-2 sm:max-h-full sm:w-auto sm:max-w-full"
            />
            <span className="fixed top-4 right-5 rounded bg-black/60 px-2 py-1 font-mono text-xs uppercase tracking-[0.18em] text-white">
              Cerrar ✕
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

/** Botón del menú para un recorrido: muestra si se puede continuar y cuánto falta. */
function TarjetaModo({
  titulo,
  paginas,
  posicion,
  onEmpezar,
  onReiniciar,
  destacada = false,
  solo = false,
}: {
  titulo: string;
  paginas: Pagina[];
  posicion?: Paso;
  onEmpezar: () => void;
  onReiniciar: () => void;
  destacada?: boolean;
  /** Tarjeta chica de "solo preguntas": el avance se cuenta en preguntas. */
  solo?: boolean;
}) {
  const preguntas = paginas.reduce((n, p) => n + p.preguntas.length, 0);
  const terminado = posicion ? posicion.pagina >= paginas.length : false;
  const total = solo ? preguntas : paginas.length;
  const hecha = !posicion ? 0 : terminado ? total : solo ? indicePregunta(paginas, posicion) : posicion.pagina;
  const detalle = !posicion
    ? solo
      ? `${preguntas} preg.`
      : `${total} páginas · ${preguntas} preguntas`
    : terminado
      ? solo
        ? "Terminado"
        : "Terminado · ver resultado"
      : solo
        ? `▶ ${hecha + 1}/${total}`
        : `Continuar · pág. ${hecha + 1} de ${total}`;

  return (
    <div
      className={`relative overflow-hidden rounded-xl ${
        destacada ? "bg-[var(--color-accent)] text-white" : "border-2 border-white bg-white/90"
      }`}
    >
      <button
        onClick={onEmpezar}
        className={`flex w-full flex-col items-start text-left transition-opacity hover:opacity-85 ${
          solo ? "px-4 pt-6 pb-3" : "px-5 py-4"
        } ${destacada ? "sm:px-8 sm:py-5" : ""}`}
      >
        <span
          className={`font-black uppercase tracking-tight ${
            destacada ? "text-xl sm:text-2xl" : solo ? "text-lg" : "text-xl"
          } ${posicion && !solo ? "pr-16" : ""}`}
        >
          {titulo}
          {destacada ? " →" : ""}
        </span>
        <span className="mt-1 font-mono text-[11px] uppercase tracking-[0.14em]">{detalle}</span>
      </button>
      {posicion && (
        <>
          <div className={`h-1 w-full ${destacada ? "bg-white/25" : "bg-black/10"}`}>
            <div
              className={`h-full ${destacada ? "bg-white" : "bg-[#1F8A70]"}`}
              style={{ width: `${(hecha / total) * 100}%` }}
            />
          </div>
          <button
            onClick={onReiniciar}
            className={`absolute right-3 font-mono text-[10px] uppercase tracking-[0.14em] opacity-70 hover:opacity-100 ${
              solo ? "top-1.5 right-2.5 text-[9px]" : "top-2"
            }`}
            aria-label={`Reiniciar ${titulo}`}
          >
            Reiniciar
          </button>
        </>
      )}
    </div>
  );
}
