# 1er Parcial GIS

App para practicar el primer parcial de **Sistemas de Información Geográfica** (Ingeniería en Sistemas de Información, UTN Facultad Regional Resistencia). Tiene preguntas tipo parcial armadas a partir de los apuntes de la cátedra, con la teoría y las diapositivas de cada tema a mano.

## Qué tiene

- **155 preguntas** de las Unidades 1, 2 y 3 (U1: 32, U2: 71, U3: 52), en orden aleatorio en cada intento.
- **Tres tipos de pregunta:** una sola correcta, selección múltiple (cuenta como correcta solo si marcás exactamente la combinación) y verdadero o falso.
- **17 ejercicios prácticos:** escalas, coordenadas y áreas en raster, orden BSQ/BIL/BIP, faja Gauss-Krüger, zona UTM, semieje del elipsoide.
- **Figuras de los PDFs** en las preguntas que las necesitan: imagen a la izquierda, pregunta y opciones a la derecha. Se amplían con un toque.
- **Teoría en cada pregunta:** un botón abre una ventana a pantalla completa con el resumen del tema, los términos técnicos definidos y las diapositivas del PDF de donde sale la pregunta.
- **Comentarios por pregunta:** notas como "pregunta importante" o "revisar la teoría de topología", con atajos rápidos.
- **Resultado final** con el porcentaje, el desglose por unidad, la lista de preguntas para repasar y la opción de reintentar solo las que fallaste.
- Pensada para la compu (cada pregunta entra en una pantalla sin scroll) y usable desde el celu.

Las 14 preguntas que salen de lo visto en clase o de la presentación, y no de los PDFs, llevan la etiqueta **"Apunte de clase"**.

## Atajos de teclado

| Tecla | Acción |
| --- | --- |
| `1`–`9` | Elegir o marcar una opción |
| `Enter` | Confirmar (selección múltiple) o pasar a la siguiente |
| `←` | Volver a la pregunta anterior |
| `T` | Abrir la teoría |
| `C` | Abrir los comentarios |
| `Esc` | Cerrar el zoom o la ventana abierta |

## Estructura

```
src/
  app/
    page.tsx                  Página principal
    api/comentarios/route.ts  API de comentarios (GET, POST, DELETE)
  components/
    Quiz.tsx                  Inicio, preguntas, resultado y ventanas
    Comentarios.tsx           Panel de comentarios de una pregunta
  lib/
    preguntas.ts              Banco de preguntas
    teoria.ts                 Teoría por tema y glosario de términos
    diapositivas.ts           Diapositivas de cada pregunta (generado)
public/
  img/                        Figuras recortadas de los PDFs
  slides/                     Páginas de los PDFs usadas en la teoría
scripts/
  generar-diapositivas.py     Regenera public/slides y diapositivas.ts
```

## Agregar o modificar preguntas

Cada pregunta es un objeto en `src/lib/preguntas.ts`:

```ts
{
  id: "u2-ejemplo",            // único
  unidad: 2,
  tema: "Modelo raster",       // tiene que existir en TEORIA (src/lib/teoria.ts)
  tipo: "unica",               // "unica" | "multiple" | "vf"
  enunciado: "¿…?",
  imagen: "u2-malla-coords",   // opcional: public/img/<nombre>.jpg
  opciones: ["A", "B", "C", "D"],
  correctas: [1],              // índices; en "vf" 0 = Verdadero, 1 = Falso
  explicacion: "Por qué es esa.",
  fuente: "Unidad 2 (parte 1) · diapositivas 36-37",
  origen: "clase",             // opcional: muestra la etiqueta "Apunte de clase"
}
```

El campo `fuente` indica de dónde sale la pregunta y también define qué diapositivas se muestran en la teoría. Si agregás preguntas o cambiás alguna fuente, regenerá las diapositivas.

## Regenerar las diapositivas

Los PDFs de la cátedra no están en el repositorio. Con los cuatro PDFs en una carpeta:

```bash
pip install pymupdf
python3 scripts/generar-diapositivas.py ~/Downloads
```

El script lee la `fuente` de cada pregunta (`diapositiva 13`, `diapositivas 20-25`, `págs. 5-6`…), renderiza esas páginas en `public/slides/` y reescribe `src/lib/diapositivas.ts`. Nombres de archivo esperados:

- `Unidad1-contenidos.pdf`
- `Unidad 2-Parte1-2026-V2.pdf`
- `Unidad 2- parte2.pdf`
- `Unidad 3.pdf`

## Comentarios

Los comentarios se guardan en el servidor, en `data/comentarios.json`, que no se sube al repositorio.

En Vercel el sistema de archivos no es persistente, así que ese archivo no sirve: para tener comentarios en la versión publicada hay que guardarlos en una base de datos.

## Tecnologías

Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS 4 y Motion.

## Fuentes

El contenido sale del material de la cátedra de Sistemas de Información Geográfica de UTN FRRe (Ing. Ilse Hodapp – Ing. Rodrigo Valdés): *Unidad 1 – Contenidos*, *Unidad 2 – Modelos para la información geográfica* (partes 1 y 2) y *Unidad 3 – Fundamentos cartográficos y geodésicos*, además de lo visto en clase. Es un proyecto de estudio sin fines comerciales.
