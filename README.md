# Parciales GIS

App para estudiar el primer y el segundo parcial de **Sistemas de Información Geográfica** (Ingeniería en Sistemas de Información, UTN Facultad Regional Resistencia). Recorre los apuntes de la cátedra página por página: primero se lee cada hoja o diapositiva y después se responden las preguntas tipo parcial que salen de ella.

## Qué tiene

- **1er o 2do parcial:** arriba del menú se elige qué parcial se estudia. El 1ro toma las Unidades 1 a 4; el 2do, las Unidades 5 (Estándares), 7 (Fuentes de datos espaciales, GPS y calidad de los datos) y 8 (Sensores remotos). La Unidad 6 no se toma.
- **2do parcial:** 325 preguntas (U5: 79, U7: 158, U8: 88) sobre 215 páginas de los PDFs (la U7 son tres PDFs: fuentes de datos, GPS y calidad), con V/F, multiple choice, relacionar columnas, completar con una lista de palabras, figuras de las diapositivas y ejercicios (interpolación de direcciones, distancia al satélite y desfasaje de relojes, longitud de onda y ambigüedad de fase, NDVI, bits y niveles digitales, píxel mezclado, altura de la vegetación con LiDAR). Las revisaron agentes independientes contra los PDFs y se sacaron las que no tenían nivel de parcial (datos sueltos de memoria, detalles de laboratorio, preguntas de sentido común).
- **Simulacro:** en el 2do parcial, el modo "Simulacro" de "Practicar sin diapositivas" junta 76 preguntas (U5: 14, U7: 31, U8: 31) con el formato del parcial, repartidas según el peso que tuvo cada unidad en el parcial 2023 y lleva el badge **SIMULACRO**. El modo "★ Importantes" no aparece hasta que haya temas marcados de esas unidades.

- **Recorrido de lectura (1er parcial):** 289 páginas de los PDFs, en orden (U1: 14, U2: 103, U3: 72, U4: 100). Las portadas, índices, títulos de sección y fuentes se saltean. Las páginas sin preguntas quedan para leer.
- **349 preguntas** (U1: 45, U2: 105, U3: 71, U4: 128), cada una después de la página de donde sale. Se nombran por su lugar: por ejemplo, *U2 P1 · Diap. 18 · Pregunta 2*.
- **Recorrido completo o por unidad:** desde el inicio se elige recorrer todo o solo una de las cuatro unidades.
- **Practicar sin diapositivas:** para cuando ya se estudió. En el menú se elige el modo (todas las preguntas, ★ importantes o parcial 2025) y la unidad (o todas), y se va directo a las preguntas con sus figuras. Cada combinación tiene su propio avance y sus propias respuestas.
- **★ Importante:** las preguntas de los temas marcados como importantes o "pregunta de parcial" en los apuntes de clase llevan esa marca. Hoy son 84 (U1: 30, U2: 10, U3: 11, U4: 33), incluidas las del parcial 2025.
- **Parcial 2025:** las preguntas del 1er parcial de septiembre de 2025 llevan el badge **PARCIAL 2025** (y cuentan como importantes), ubicadas después de la página de su tema, junto con variantes de cada una. En el menú, "Practicar sin diapositivas" permite elegir el modo Parcial 2025 para practicar solo esas 33.
- **Parciales reales del 2do:** las 23 preguntas del 2do parcial del 23/11/2023 están cargadas como 34 preguntas (las de relacionar columnas se separan por ítem), más 9 variantes (`v23-`). Además hay 12 preguntas de los parciales de 2010, 2012 (y su recuperatorio) y 2016 cuyo tema sigue en los PDFs 2026; lo que ya no está en el programa (proyecto piloto, MAUP, mosaicos) quedó afuera. El badge muestra todos los años en que se tomó cada pregunta (por ejemplo **PARCIAL 2023 · 2016 · 2012 · 2010** en segmentos GPS y órbitas). En el 2do parcial, "Practicar sin diapositivas" tiene el modo Parciales reales. La pregunta abierta de 2023 (componentes de la calidad) quedó como multiple choice y la de órbitas viene de un material que no está en el PDF 2026.
- **Avance guardado** en el navegador: cada recorrido retoma donde quedó, con opción de reiniciarlo.
- **Todas las preguntas se responden marcando casillas y confirmando**, aunque tengan una sola respuesta correcta: la app no avisa cuántas hay que marcar. Cuenta como correcta solo si se marca exactamente la combinación. Las opciones tienen un orden fijo por pregunta.
- **Saltear:** si una página no interesa, se saltea con su botón (o con la tecla `S`) junto con sus preguntas, que no cuentan en el resultado. Al volver a entrar a responderla, deja de estar salteada.
- **Releer:** desde cualquier pregunta se vuelve a la página y, al responder de nuevo, se sigue desde la primera pregunta sin contestar.
- **Ejercicios prácticos:** escalas, coordenadas y áreas en raster, orden BSQ/BIL/BIP, faja Gauss-Krüger, zona UTM, semieje del elipsoide, operaciones de generalización, tipos de variables, clases, cuartiles y tipos de mapas temáticos.
- **Figuras de los PDFs** en las preguntas que las necesitan. Las páginas y las figuras se amplían con un toque.
- **Progreso y racha:** barra con un avión que avanza por las páginas y contador de aciertos seguidos.
- **Resultado final** con el porcentaje, el desglose por unidad y las preguntas para repasar. "Repasar las que fallé" vuelve a mostrar solo esas páginas con solo esas preguntas.
- Pensada para la compu (cada pregunta entra en una pantalla sin scroll) y usable desde el celu.

Las 24 preguntas que salen de lo visto en clase, y no de los PDFs, llevan la etiqueta **"Apunte de clase"** y están ubicadas después de la página del mismo tema.

## Atajos de teclado

| Tecla | Acción |
| --- | --- |
| `1`–`9` | Marcar o desmarcar una opción |
| `Enter` | Pasar a las preguntas, confirmar o seguir |
| `→` | Seguir (en una página o en una pregunta ya respondida) |
| `←` | Volver a la pregunta o página anterior |
| `S` | Saltear la página y sus preguntas |
| `Esc` | Cerrar la imagen ampliada |

## Estructura

```
src/
  app/
    page.tsx                  Página principal
  components/
    Quiz.tsx                  Inicio, lectura, preguntas y resultado
  lib/
    preguntas.ts              Banco de preguntas del 1er parcial
    preguntas-2do.ts          Banco de preguntas del 2do parcial (U5, U7 y U8)
    recorrido.ts              Páginas en orden y preguntas de cada una
public/
  img/                        Figuras recortadas de los PDFs
  slides/                     Páginas de los PDFs que se leen en el recorrido
  video/                      Video de fondo, en tramos
scripts/
  generar-diapositivas.py     Renderiza las páginas del recorrido
```

## Agregar o modificar preguntas

Cada pregunta es un objeto en `src/lib/preguntas.ts`:

```ts
{
  id: "u2-ejemplo",            // único
  unidad: 2,
  tema: "Modelo raster",
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

Para que aparezca, su `id` tiene que estar en la página correspondiente de `src/lib/recorrido.ts`, en el orden en que se quiere responder:

```ts
["u2a", 37, ["u2-malla-coords", "e-raster-coord", "u2-ejemplo"]],
```

Los documentos son `u1` (Unidad 1), `u2a` y `u2b` (Unidad 2, partes 1 y 2), `u3` (Unidad 3), `u4` y `u4c` (Unidad 4: diapositivas y cuadernillo *Conceptos cartográficos* del IGN), `u5` (Unidad 5), `u7`, `u7g` y `u7c` (Unidad 7: fuentes de datos, GPS y calidad) y `u8` (Unidad 8). Para sumar una unidad al 2do parcial, se agrega en `PARCIALES` (`src/lib/preguntas.ts`), en `DOCS` (`src/lib/recorrido.ts`) y en el script de diapositivas. Para dejar una página solo para leer, su lista va vacía; para saltearla, se quita la línea.

## Regenerar las páginas

Los PDFs de la cátedra no están en el repositorio. Si se agregan o quitan páginas del recorrido, con los nueve PDFs en una carpeta:

```bash
pip install pymupdf
python3 scripts/generar-diapositivas.py ~/Downloads
```

El script renderiza en `public/slides/` todas las páginas listadas en `src/lib/recorrido.ts`. Nombres de archivo esperados:

- `Unidad1-contenidos.pdf`
- `Unidad 2-Parte1-2026-V2.pdf`
- `Unidad 2- parte2.pdf`
- `Unidad 3.pdf`
- `Unidad 4-2026.pdf`
- `Conceptos_Cartograficos_def.pdf`
- `Unidad 5 – Estándares para la Información Geográfica.pdf` (se busca por `Unidad 5*.pdf`)
- `Unidad7 - Fuentes de DE2026.pdf` (se busca por `Unidad7*.pdf`)
- `Unidad 8 - 2026.pdf` (se busca por `Unidad 8*.pdf`)

## Tecnologías

Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS 4 y Motion.

## Fuentes

El contenido sale del material de la cátedra de Sistemas de Información Geográfica de UTN FRRe (Ing. Ilse Hodapp – Ing. Rodrigo Valdés): *Unidad 1 – Contenidos*, *Unidad 2 – Modelos para la información geográfica* (partes 1 y 2) y *Unidad 3 – Fundamentos cartográficos y geodésicos* y *Unidad 4 – Visualización de la información geográfica*, *Unidad 5 – Estándares para la información geográfica*, *Unidad 7 – Fuentes de datos espaciales* y *Unidad 8 – Sensores remotos y sistemas de información*, con el cuadernillo *Conceptos cartográficos* del IGN (España), además de lo visto en clase. Es un proyecto de estudio sin fines comerciales.
