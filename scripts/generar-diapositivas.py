#!/usr/bin/env python3
"""
Renderiza las páginas de los PDFs que se leen en el recorrido.

Lee las páginas listadas en src/lib/recorrido.ts y las guarda en public/slides/
como <documento>-<página>.jpg.

Uso:
    pip install pymupdf
    python3 scripts/generar-diapositivas.py <carpeta-con-los-pdfs>
"""
import re
import sys
from pathlib import Path

import fitz  # PyMuPDF

RAIZ = Path(__file__).resolve().parent.parent
RECORRIDO = RAIZ / "src" / "lib" / "recorrido.ts"
SALIDA_IMG = RAIZ / "public" / "slides"

# documento: (archivo, zoom). Las hojas A4 (U1 y el cuadernillo del IGN) van con más zoom para leerlas bien.
DOCS = {
    "u1": ("Unidad1-contenidos.pdf", 2.0),
    "u2a": ("Unidad 2-Parte1-2026-V2.pdf", 1.8),
    "u2b": ("Unidad 2- parte2.pdf", 1.8),
    "u3": ("Unidad 3.pdf", 1.8),
    "u4": ("Unidad 4-2026.pdf", 1.8),
    "u4c": ("Conceptos_Cartograficos_def.pdf", 2.0),
}


def main():
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    carpeta = Path(sys.argv[1]).expanduser()

    paginas = sorted(
        {(d, int(n)) for d, n in re.findall(r'\["(u1|u2a|u2b|u3|u4|u4c)", (\d+),', RECORRIDO.read_text(encoding="utf-8"))}
    )

    SALIDA_IMG.mkdir(parents=True, exist_ok=True)
    pdfs = {}
    for d, n in paginas:
        archivo, zoom = DOCS[d]
        if d not in pdfs:
            ruta = carpeta / archivo
            if not ruta.exists():
                sys.exit(f"No encontré {ruta}")
            pdfs[d] = fitz.open(ruta)
        pdf = pdfs[d]
        if not 1 <= n <= len(pdf):
            sys.exit(f"{archivo}: la página {n} no existe (tiene {len(pdf)})")
        pdf[n - 1].get_pixmap(matrix=fitz.Matrix(zoom, zoom)).save(SALIDA_IMG / f"{d}-{n}.jpg", jpg_quality=80)

    print(f"{len(paginas)} páginas renderizadas en {SALIDA_IMG.relative_to(RAIZ)}")


if __name__ == "__main__":
    main()
