#!/usr/bin/env python3
"""
Genera las diapositivas que se muestran en la ventana de teoría.

Lee el campo `fuente` de cada pregunta en src/lib/preguntas.ts
("Unidad 3 · diapositiva 13", "Unidad 2 (parte 1) · diapositivas 20-25",
"Unidad 1 · págs. 5-6"…), renderiza esas páginas de los PDFs en public/slides/
y reescribe src/lib/diapositivas.ts.

Uso:
    pip install pymupdf
    python3 scripts/generar-diapositivas.py <carpeta-con-los-pdfs>
"""
import json
import re
import sys
from pathlib import Path

import fitz  # PyMuPDF

RAIZ = Path(__file__).resolve().parent.parent
PREGUNTAS = RAIZ / "src" / "lib" / "preguntas.ts"
SALIDA_TS = RAIZ / "src" / "lib" / "diapositivas.ts"
SALIDA_IMG = RAIZ / "public" / "slides"
MAX_POR_PREGUNTA = 8

# clave: (archivo, prefijo de la etiqueta, zoom)
DOCS = {
    "u1": ("Unidad1-contenidos.pdf", "Pág.", 1.5),
    "u2a": ("Unidad 2-Parte1-2026-V2.pdf", "U2 · Diapositiva", 1.4),
    "u2b": ("Unidad 2- parte2.pdf", "U2 (parte 2) · Diapositiva", 1.4),
    "u3": ("Unidad 3.pdf", "U3 · Diapositiva", 1.4),
}

# Preguntas cuya fuente no cita páginas pero sí tienen una en los PDFs
MANUALES = {
    "c-elementos-sistema": [("u1", 13)],
}


def doc_de(segmento: str):
    if "Presentación" in segmento or "Olaya" in segmento:
        return "ninguno"
    if "Unidad 2 (parte 1)" in segmento:
        return "u2a"
    if "Unidad 2 (parte 2)" in segmento:
        return "u2b"
    if re.search(r"Unidad 3\b", segmento):
        return "u3"
    if re.search(r"Unidad 1\b", segmento):
        return "u1"
    return None


def paginas_de(segmento: str):
    m = re.search(r"(?:diapositivas?|págs?\.)\s+([\d ,y\-–]+)", segmento)
    if not m:
        return []
    paginas = []
    for parte in re.split(r"\s*(?:,|\by\b)\s*", m.group(1).strip()):
        parte = parte.strip()
        if re.fullmatch(r"\d+\s*[-–]\s*\d+", parte):
            a, b = map(int, re.split(r"[-–]", parte))
            paginas += range(a, b + 1)
        elif parte.isdigit():
            paginas.append(int(parte))
    return paginas


def main():
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    carpeta = Path(sys.argv[1]).expanduser()

    fuente_ts = PREGUNTAS.read_text(encoding="utf-8")
    bloques = re.findall(r'\n  \{\n    id: "([^"]+)",(.*?)\n  \},', fuente_ts, re.S)

    mapa, necesarias, sin_diapos = {}, set(), []
    for pid, cuerpo in bloques:
        fuente = re.search(r'fuente: "([^"]*)"', cuerpo).group(1)
        doc, lista = None, []
        for segmento in fuente.split("·"):
            doc = doc_de(segmento) or doc
            if doc and doc != "ninguno":
                lista += [(doc, n) for n in paginas_de(segmento)]
        lista = list(dict.fromkeys(lista + MANUALES.get(pid, [])))[:MAX_POR_PREGUNTA]
        if not lista:
            sin_diapos.append(pid)
            continue
        mapa[pid] = [
            {"src": f"/slides/{d}-{n}.jpg", "etiqueta": f"{DOCS[d][1]} {n}"} for d, n in lista
        ]
        necesarias.update(lista)

    SALIDA_IMG.mkdir(parents=True, exist_ok=True)
    pdfs = {}
    for d, n in sorted(necesarias):
        archivo, _, zoom = DOCS[d]
        if d not in pdfs:
            ruta = carpeta / archivo
            if not ruta.exists():
                sys.exit(f"No encontré {ruta}")
            pdfs[d] = fitz.open(ruta)
        pdf = pdfs[d]
        if not 1 <= n <= len(pdf):
            sys.exit(f"{archivo}: la página {n} no existe (tiene {len(pdf)})")
        pdf[n - 1].get_pixmap(matrix=fitz.Matrix(zoom, zoom)).save(
            SALIDA_IMG / f"{d}-{n}.jpg", jpg_quality=78
        )

    # Una línea por pregunta: compacto y sin bloques repetidos
    def fila(clave, diapos):
        items = ", ".join(
            f"{{ src: {json.dumps(d['src'])}, etiqueta: {json.dumps(d['etiqueta'], ensure_ascii=False)} }}"
            for d in diapos
        )
        return f"  {json.dumps(clave, ensure_ascii=False)}: [{items}],"

    SALIDA_TS.write_text(
        "/** Diapositivas / páginas de los PDFs de cada pregunta (generado desde `fuente`). */\n"
        "export type Diapo = { src: string; etiqueta: string };\n\n"
        "export const DIAPOS: Record<string, Diapo[]> = {\n"
        + "\n".join(fila(k, v) for k, v in mapa.items())
        + "\n};\n",
        encoding="utf-8",
    )

    print(f"{len(mapa)} de {len(bloques)} preguntas con diapositivas · {len(necesarias)} imágenes")
    if sin_diapos:
        print("Sin diapositivas (salen de la clase o la presentación):", ", ".join(sin_diapos))


if __name__ == "__main__":
    main()
