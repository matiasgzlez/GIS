# 1er Parcial GIS

App para estudiar el primer parcial de **Sistemas de Información Geográfica** (Ingeniería en Sistemas de Información, UTN Facultad Regional Resistencia). Recorre los apuntes de la cátedra página por página: primero se lee cada hoja o diapositiva y después se responden las preguntas tipo parcial que salen de ella.

## Qué tiene

- **Recorrido de lectura:** 289 páginas de los PDFs, en orden (U1: 14, U2: 103, U3: 72, U4: 100). Las portadas, índices, títulos de sección y fuentes se saltean. Las páginas sin preguntas quedan para leer.
- **307 preguntas** (U1: 39, U2: 94, U3: 64, U4: 110), cada una después de la página de donde sale. Se nombran por su lugar: por ejemplo, *U2 P1 · Diap. 18 · Pregunta 2*.
- **Recorrido completo o por unidad:** desde el inicio se elige recorrer todo o solo una de las cuatro unidades.
- **Solo preguntas:** para cuando ya se estudió, cada unidad (o todas) se puede practicar sin ver las diapositivas, directo a las preguntas con sus figuras. Tiene su propio avance y sus propias respuestas.
- **★ Importante:** las preguntas de los temas marcados como importantes o "pregunta de parcial" en los apuntes de clase llevan esa marca.
- **Avance guardado** en el navegador: cada recorrido retoma donde quedó, con opción de reiniciarlo.
- **Todas las preguntas se responden marcando casillas y confirmando**, aunque tengan una sola respuesta correcta: la app no avisa cuántas hay que marcar. Cuenta como correcta solo si se marca exactamente la combinación. Las opciones tienen un orden fijo por pregunta.
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
| `Esc` | Cerrar la imagen ampliada |

## Estructura

```
src/
  app/
    page.tsx                  Página principal
  components/
    Quiz.tsx                  Inicio, lectura, preguntas y resultado
  lib/
    preguntas.ts              Banco de preguntas
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

Los documentos son `u1` (Unidad 1), `u2a` y `u2b` (Unidad 2, partes 1 y 2) `u3` (Unidad 3) y `u4` y `u4c` (Unidad 4: diapositivas y cuadernillo *Conceptos cartográficos* del IGN). Para dejar una página solo para leer, su lista va vacía; para saltearla, se quita la línea.

## Regenerar las páginas

Los PDFs de la cátedra no están en el repositorio. Si se agregan o quitan páginas del recorrido, con los seis PDFs en una carpeta:

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

## Tecnologías

Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS 4 y Motion.

## Fuentes

El contenido sale del material de la cátedra de Sistemas de Información Geográfica de UTN FRRe (Ing. Ilse Hodapp – Ing. Rodrigo Valdés): *Unidad 1 – Contenidos*, *Unidad 2 – Modelos para la información geográfica* (partes 1 y 2) y *Unidad 3 – Fundamentos cartográficos y geodésicos* y *Unidad 4 – Visualización de la información geográfica*, con el cuadernillo *Conceptos cartográficos* del IGN (España), además de lo visto en clase. Es un proyecto de estudio sin fines comerciales.
