/**
 * Teoría breve por tema y glosario de términos.
 * Todo sale de los PDFs de la cátedra (Hodapp – Valdés). Lo que viene de la
 * clase o de la presentación, y no de los PDFs, está aclarado como tal.
 */

export const TEORIA: Record<string, string> = {
  /* ── Unidad 1 ── */
  Concepto:
    "Un SIG es una integración organizada de hardware, software y datos geográficos diseñada para capturar, almacenar, manipular, analizar y desplegar información geográficamente referenciada, con el fin de resolver problemas complejos de planificación y gestión.",
  Componentes:
    "Según el apunte de la U1 son cinco: hardware (la computadora donde opera el SIG; se evalúa velocidad, costo, soporte, administración, escalabilidad y seguridad), software (SMBD, herramientas de ingreso y manipulación, de consulta, análisis y visualización, e interfaz gráfica), datos (el componente más importante: 60-80% del presupuesto), personal (sin gente los datos se desactualizan) y métodos (plan y reglas propias de cada organización). En clase se listaron además los procedimientos.",
  "Componentes según Olaya":
    "Tema de clase (no está en los PDFs; el libro de Olaya figura como fuente de la U2). Olaya agrupa hardware y software como “tecnología” y considera además los datos, los procesos o métodos de análisis, la visualización y el factor organizativo (las personas). Verificá esta lista con tus apuntes.",
  "Capacidades de un SIG":
    "De la presentación de la U1: los SIG son herramientas muy versátiles, adaptables a distintas situaciones y entornos. Según el caso se usa prioritariamente una u otra capacidad: ANÁLISIS, CONSULTA y VISUALIZACIÓN/REPRESENTACIÓN. En conjunto ofrecen utilidades que cada comunidad emplea según las necesidades de su trabajo.",
  "Papeles de un SIG":
    "De la presentación de la U1. Modelizadora: usa análisis espacial para modelizar realidades geográficas complejas. Toma de decisiones: decide en función de distintas variables, cada una en una capa que se combinan (caso particular de la anterior). Difusión de información geográfica: acerca funcionalidades SIG a usuarios sin perfil técnico (la web es clave con mapas interactivos) y en campos técnicos cataliza avances. Centralizadora: coordina las tareas de un equipo y organiza la información en una base de datos geográfica.",
  Definiciones:
    "Aronoff (1989): conjunto de procedimientos manuales o computarizados para almacenar y tratar datos geográficos. NCGIA (1990): hardware, software y procedimientos para obtener, gestionar, analizar, modelar y representar datos espaciales y resolver problemas de planificación y gestión. Rodríguez Pascual (1993): modelo informatizado del mundo real, en un sistema de referencia ligado a la Tierra, para responder un conjunto de preguntas concreto. Huxhold y Levishohn (1995): tecnología de la información, datos y procedimientos para captar, almacenar, analizar y presentar en mapas y estadísticas.",
  "Preguntas que responde un SIG":
    "Un SIG debe poder responder: ¿dónde está A?, ¿dónde está A con relación a B?, ¿cuántas ocurrencias de A hay a una distancia D de B?, ¿qué valor toma Z en la posición X?, ¿cuál es la dimensión de B (perímetro, área, volumen)?, ¿qué resulta de intersectar distintos tipos de información?, ¿cuál es el camino más corto o de menor costo?, ¿qué hay en (X, Y)?, ¿qué objetos están próximos a otros con ciertas características?, clasificar información espacial y simular un proceso P en un tiempo T dado un escenario S.",
  "Consulta y análisis":
    "Consulta: por ejemplo, ¿dónde están los sitios adecuados para construir casas?, ¿qué suelo domina en un tipo de bosque? Análisis (análisis espacial o geoprocesamiento): es donde los SIG “funcionan en su terreno”; permite buscar patrones y tendencias y elaborar escenarios. Ejemplos: casas a menos de 100 m de una fuente de agua, clientes en 10 km de un negocio, alfalfa a 500 m de un pozo.",
  "Áreas de aplicación":
    "Usos del apunte: producción cartográfica, evaluaciones ambientales y de recursos naturales, estudio de redes de servicios (electricidad, telefonía, emergencias médicas) y transportes, y sistemas de catastro. Ejemplos concretos: inventario y avalúo de predios, emergencias, estratificación socioeconómica, uso de la tierra, control ambiental, áreas de riesgo, localización de equipamiento social, red vial y planes de desarrollo.",
  Utilidad:
    "La utilidad principal de un SIG es construir modelos del mundo real a partir de bases de datos digitales y usarlos para simular los efectos de un proceso natural o una acción antrópica (degradación del relieve y subsuelo causada por el hombre) sobre un escenario en una época específica. Sirve para analizar tendencias y evaluar consecuencias de decisiones de planificación.",
  "SIG en la vida cotidiana":
    "Guías de calles; empresas de electricidad y agua que ubican un corte y el área afectada; servicios de emergencia que ubican el hecho y el hospital más cercano; seguimiento satelital de vehículos que transportan mercaderías (ruta, distancia al destino, dónde está detenido).",
  "Revisión histórica":
    "Predecesores: John Snow (1854) ubica el foco de cólera en el Soho cartografiando casos. Cuatro etapas: inicial (primeros intentos), segunda (impulso tecnológico de los 70), tercera (desarrollo industrial y adquisición por instituciones) y cuarta (abaratamiento y acceso de usuarios a programas y datos, opciones libres).",
  Evolución:
    "MIMO (1959, Tobler): cartografía por ordenador. CGIS (1964, Canadá, Roger Tomlinson): primer SIG. DIME (1967, EE.UU.): estructuras topológicas vectoriales. SYMAP (1968, Harvard), base de POLYVRT (que incorpora topología); junto a él se desarrolla GRID (raster). McHarg, Design with Nature (1969): superposición de transparentes. ESRI (1969). ODYSSEY (1975): primer SIG vectorial. PIOS (ESRI) base de ARC/INFO. MAP (Tomlin, 1983): raster, base de OSU MAP, IDRISI y ERDAS.",
  "Fase comercial":
    "A fines de los 80 y comienzos de los 90 se abaratan software y hardware y se multiplican los SIG comerciales. ESRI con Arc/INFO (1987) lidera el sector; en PC surgen ERDAS, ATLAS, SPANS, MapInfo, etc. GRASS: 1982 Cuerpo de Ingenieros del Ejército de EE.UU., 1991 libre para UNIX/Linux, 1997 Universidad de Baylor, 1999 código fuente bajo licencia GNU.",
  "Etapa de usuarios":
    "Desde los 90 los SIG se vuelven accesibles a cualquier persona. Ejemplos de interés: NCGIA (1988, National Science Foundation), laboratorios de investigación regional de Gran Bretaña y el programa CORINE de la UE. El OGC (1994, más de 250 organizaciones) busca estándares abiertos e interoperables, acuerdos entre empresas e intercambio de información.",
  "Evolución en Argentina":
    "1987: I Conferencia Latinoamericana sobre SIG (Costa Rica). 1ª generación (1987-90): OSU MAP-for-the-PC 2.0 y PC ARC/INFO 3.2.1, el SIG como “elemento de poder”. 2ª (1991-94): nuevos sistemas como SPANS (IBM). 3ª (1995+): grupos no atados a ningún software. Cursos pioneros en 1988 (CRICYT, Luján), SELPER 1989 en Bariloche, primer simposio argentino del IGM en 1990, SIBSIG 1995 en Mendoza; tecnicaturas en Cuyo (1995) y UNCPBA (1999); electivas en UTN FR Santa Fe y Resistencia.",
  "Ámbitos de aplicación en Argentina":
    "Organismos públicos (INDEC, INTA, DAIS), municipios (catastro con objetivo principalmente tributario), empresas de servicios por red (AM/FM: Aguas Argentinas, EDESUR) e instituciones educativas (puerta de entrada, pero con poca participación en consultoría). Productos masivos: guías en CD-ROM, cartografía IGN–ICC y atlas electrónicos con ArcView 1.0.",
  Perspectivas:
    "Grandes hitos: SIG en investigación y universidades, tercera generación de usuarios, cursos de grado y posgrado, tecnicaturas, una revista argentina especializada (1999) y productos masivos. Pendientes: posgrados formales (especializaciones, maestrías, doctorados), reuniones científicas periódicas y desarrollo de software (en América Latina solo Brasil lo logró con excelencia).",
  "Anexo CORINE":
    "CORINE Land Cover 2000: la Agencia Europea de Medio Ambiente fotointerpreta la cobertura del suelo con imágenes LANDSAT del proyecto IMAGE2000. Unidad mínima de mapeo: 25 ha; elementos lineales solo si miden más de 30 m de ancho; capa de cambios 1990-2000 con unidad mínima de 5 ha. “Sin costuras”: se armonizan los polígonos en las fronteras entre países.",

  /* ── Unidad 2 ── */
  "Información geográfica":
    "Es el elemento diferenciador de un SIG y tiene dos componentes: espacial (¿dónde? posición dentro de un sistema de referencia) y temática (¿qué? naturaleza o características del fenómeno en esa localización). Ejemplo: la forma de un lago en el mapa (espacial) y sus niveles de contaminación (temática).",
  "Organización de la información":
    "La información geográfica es compleja y voluminosa, por eso se divide. División horizontal: criterios puramente espaciales, se “corta” en zonas (zonas UTM, provincias, departamentos). División vertical: por características temáticas comunes, formando CAPAS. La capa es la unidad básica de almacenamiento: guarda la componente temática y la espacial; sobre ellas se almacena, se consulta y se opera, y con un conjunto de ellas se forma un mapa.",
  Modelos:
    "Problema: la realidad tiene detalle prácticamente infinito y la representación y el almacenamiento son finitos. Hay que extraer elementos y valores característicos que se guardan como números. Se hace en 3 niveles, de mayor a menor abstracción: modelo geográfico (conceptual, ALTO nivel), modelo de representación (serie finita de elementos) y modelo de almacenamiento (cómo guardarlo, BAJO nivel, naturaleza informática).",
  "Modelo geográfico":
    "Es el primer paso: un esquema mental de cómo entender la realidad. Se conceptualiza el espacio estudiado, la variable tratada y la variación de la variable en el espacio. Regla de oro: NO incorpora nada de software ni almacenamiento. Dos paradigmas: campos y entidades discretas.",
  Campos:
    "Un campo es una función φ: Rⁿ → Rᵐ que asocia a cada punto un valor único; es continuo porque todos los puntos tienen valor. Origen: R² si depende de (x, y), R³ si suma elevación, y puede sumar tiempo (poco habitual). Destino: m = 1 campo escalar (elevación, temperatura, presión); m > 1 campo vectorial (viento: velocidad y dirección), que en un SIG se suele guardar como varias capas escalares. “Vectorial” acá es terminología matemática, no el modelo vectorial.",
  "Entidades discretas":
    "Concibe el entorno como un espacio vacío sobre el que se sitúan entidades que lo van rellenando: puntos, líneas, polígonos (o volúmenes). No asocia un valor a cada punto: un punto puede no pertenecer a ninguna entidad o a varias (dos calles que se cruzan). Ejemplos: vías de comunicación, variables nominales como tipo de suelo o número de parcela.",
  "Modelos de representación":
    "Reducen el modelo geográfico a un conjunto finito de elementos. Hay dos familias: raster (frecuentemente asociado a campos) y vectorial (frecuentemente asociado a entidades discretas), aunque la equiparación no es del todo cierta. Ejemplo: la elevación puede representarse con malla de celdas (raster), curvas de nivel, TIN o puntos regulares (vectoriales).",
  "Modelo raster":
    "Divide el espacio de forma regular y sistemática en celdas (píxeles), en una malla con origen en la esquina superior izquierda; cada celda toma el valor de lo que hay en su posición. Sistematicidad: las celdas son contiguas, cubren todo el espacio y no se solapan, así que la posición de una depende de las demás. Se guarda la ubicación de una celda, la orientación (Norte arriba) y el tamaño de celda o resolución, que depende de los datos y medios de captura, permite calcular coordenadas y áreas y equivale a la escala. Es especialmente adecuado para el análisis.",
  "Modelo vectorial":
    "No divide el espacio sistemáticamente: define la realidad con primitivas geométricas (punto, línea, polígono) con coordenadas explícitas y valores asociados. Línea = puntos en un orden; polígono = línea cerrada. Una capa vectorial contiene un único tipo de primitiva; se elige según el fenómeno y la precisión (ciudad: punto o polígono), lo que se relaciona con escala y generalización. También sirve para representar campos.",
  "Componente temática":
    "Raster: la matriz de valores (temática) tiene una estructura que por sí misma da la posición (espacial); no necesita base de datos externa. Vectorial: la componente espacial se recoge explícitamente con puntos y se relaciona después, mediante un identificador único, con una tabla de atributos (base de datos relacional).",
  "Tratamiento de la información":
    "Con ambas componentes estructuradas se analiza de tres formas: puramente temático (solo atributos, como SQL: ¿cuántas parcelas superan 100 ha?), puramente espacial (geometría o mediciones topológicas: perímetro, longitud) y conjunto, el corazón del SIG (parcelas de cultivo que intersecan a menos de 500 m de un río).",
  Topología:
    "Relaciones espaciales entre entidades que surgen de sus posiciones; aunque sean obvias a simple vista, el software debe establecerlas con un lenguaje y reglas de geometría matemática. Una capa tiene topología si almacena de algún modo esas relaciones; si no, es puramente cartográfica (en clase: solo sirve para visualizar). Raster: topología implícita pero débil. Vectorial: hay que registrarla explícitamente. Permite automatizar análisis y edición (áreas, caminos críticos), mantener la coherencia (sin falsos solapes ni polígonos muy pequeños) y analizar redes (cruces, pasos elevados, sentidos de circulación). Sin topología = modelo spaghetti: lista de coordenadas, simple, bueno para representar pero no para analizar. No todos los SIG la manejan.",
  "DIME y arco-nodo":
    "Modelos con topología basados en un diccionario de puntos (un punto puede pertenecer a varias entidades). Arco-nodo (el más difundido): arco = sucesión de segmentos con 0 a n vértices entre dos nodos; nodo = inicio/fin de arco o donde se unen tres o más arcos; vértice = punto de una sola entidad. Los polígonos se forman con arcos y los adyacentes comparten arcos. DIME (1967): cada segmento recto es una unidad y todos los vértices son nodos. En ambos cada arco tiene dirección y registra el polígono a su derecha e izquierda.",
  "Relaciones topológicas":
    "Contigüidad o adyacencia: polígonos que comparten parte de su contorno. Conectividad: arcos que comparten un nodo (redes). Inclusión: entidades dentro de otras (punto, línea o polígono en polígono). Proximidad: cálculo de cercanía entre entidades. Pertenencia: un arco forma parte de un polígono. En la tabla de adyacencia aparece el polígono universal (el exterior).",
  "Raster vs. vectorial":
    "Raster: afinidad con campos, malla regular, precisión menor (depende del píxel), un valor por celda, estructura simple; usos: teledetección, imágenes, altimetría; grandes extensiones a pequeña escala, límites difusos, análisis rápidos de variabilidad temporal. Vectorial: afinidad con entidades discretas, geometrías explícitas, precisión alta, múltiples atributos vía BD, estructura compleja (topología y RDBMS); usos: catastro, redes viales, división política, arqueología; extensiones pequeñas a medianas/grandes escalas. No hay un modelo idóneo global: depende de la variable, el análisis y el contexto.",
  "Modelos de almacenamiento":
    "Esquema de cómo convertir en números y almacenar los elementos del modelo de representación. Dos necesidades básicas: minimizar el espacio ocupado y maximizar la eficiencia de cálculo.",
  "Almacenamiento raster":
    "Se guarda el tamaño de celda (simple, un valor), las coordenadas (simple) y los valores de las celdas (complejo, muchos valores). Como matriz es intuitiva, fácil de implementar, de recorrer y de operar completa, pero listar cada valor es ineficiente: se comprime con o sin pérdida de información (en clase: JPG como ejemplo con pérdida). Con varias bandas: BSQ banda por banda; BIP por píxel (la celda 0,0 de todas las bandas, luego la 0,1…); BIL por filas (fila 1 de todas las bandas, luego la 2…).",
  "Almacenamiento vectorial":
    "Espacio de almacenamiento mínimo, pero eficiencia de las operaciones muy baja; además hay que almacenar los atributos (modelo relacional). Para mejorar el rendimiento, lo clave es el acceso a los datos: índices espaciales.",
  "Índices espaciales":
    "Los datos espaciales tienen necesidades de indexación distintas. Enfoque continuo: usa las coordenadas de las entidades simplificándolas (rectángulo envolvente). Enfoque discreto: discretiza el espacio en celdas. El esquema más usado es el R-Tree, que almacena MBR (Minimum Bounding Rectangle) en un árbol: rectángulos que agrupan a otros más chicos.",
  Formatos:
    "Vector en archivos: ESRI Shapefile (estándar de facto; obligatorios .shp geometrías, .shx índice posicional, .dbf atributos en dBase IV; opcionales .prj proyección, .sbn/.sbx índice espacial, .shp.xml metadatos), MapInfo, GML (XML, estándar técnico), KML (Google, similar a GML, modelos 3D, adoptado por la OGC), GeoJSON (JavaScript, más compacto, simple de parsear, ideal web), GeoRSS. Raster en archivos: TIFF/GeoTIFF, JPEG2000, ASCII Grids, MrSID, ERDAS Imagine (.img).",
  "Bases de datos espaciales":
    "SDBMS: motor de base de datos con capacidad espacial; una columna guarda la geometría en binario y el nuevo tipo de dato trae operaciones asociadas. Tablas G (objetos geográficos + ID) y tablas D (atributos + ID), distinción solo conceptual; una vista D + G da una nueva capa vectorial. Vector: Oracle Spatial, DB2 Spatial Extender, SQL Server 2008, MySQL, PostgreSQL/PostGIS, SpatiaLite, NoSQL (MongoDB, CouchDB). Raster: PostGIS, Rasterlite, Oracle GeoRaster.",
  PostGIS:
    "Extensión de PostgreSQL que añade funcionalidad espacial; sirve de backend para aplicaciones GIS. Funciones para crear geometrías (GeometryFromText), tests geométricos (ST_Intersects) y reproyección (ST_Transform(geom, srid)). Es compatible con OGC SFS-SQL, que define geometry_columns (metadatos de columnas GEOMETRY) y spatial_ref_sys (catálogo de SRSs).",

  /* ── Unidad 3 ── */
  Geodesia:
    "Ciencia que estudia la forma y dimensiones de la Tierra. Tipos: geodesia geométrica (aspecto geométrico), geodesia física (campo gravitatorio y sus variaciones) y astronomía geodésica (coordenadas mediante mediciones de los astros).",
  Cartografía:
    "Conjunto de operaciones y procesos para crear, editar y analizar mapas; también el conjunto de documentos territoriales de un ámbito. Se basa en que la realidad puede modelarse para comunicar información espacial efectivamente. Problemas: definir objetivo y rasgos (edición), representar en el plano (proyecciones), eliminar lo no relevante y reducir complejidad (generalización) y organizar los elementos para comunicar (diseño).",
  Generalización:
    "Según el apunte (U3): eliminar las características del objeto representado que no son relevantes al objetivo del mapa y reducir la complejidad de lo que se representa. En clase se vieron dos tipos: al vuelo (se generaliza en el momento de mostrar) y multiescala (se tienen versiones preparadas para distintas escalas). Los tipos no están en los PDFs: verificalos con tus apuntes.",
  "Elementos de un mapa":
    "El apunte indica que la escala debe estar consignada en los mapas y que el diseño organiza los elementos del mapa para comunicar el mensaje. La lista de elementos se vio en clase (título, leyenda, escala, orientación, fuente, entre otros): verificala con tus apuntes, no está en los PDFs.",
  Escala:
    "Relación matemática entre las dimensiones reales y las representadas, expresada modelo : realidad. Tipos: natural (1:1), de reducción (1:50, 1:10.000, 1:250.000, planos y mapas) y de ampliación (2:1, 10:1, piezas pequeñas). Representaciones: numérica (1:100), unidad por unidad (1 cm = 4 km) y gráfica (segmentos). Para calcular: distancia real = distancia en el mapa × denominador (cuidado con pasar las unidades: 1 m = 100 cm, 1 km = 100.000 cm).",
  "Forma de la Tierra":
    "Para cálculos sencillos se la piensa esfera, pero es más compleja: achatada en los polos, abultada en el Ecuador y con el hemisferio sur algo más voluminoso; además tiene relieve. Cuando el territorio es extenso (un país) su forma no puede ignorarse; en el plano de una casa es irrelevante. Se manejan aproximaciones: geoide y elipsoide.",
  Geoide:
    "Primera aproximación: superficie equipotencial del campo gravitatorio que mejor se ajusta al nivel medio del mar; une los puntos de igual gravedad. El campo gravitatorio depende de la densidad, que no es igual en todas partes, y la gravedad cambia con la altura: por eso el geoide es irregular, similar a una esfera, con diferencias menores a 100 m, e imposible de describir con una fórmula matemática.",
  Elipsoide:
    "Segunda aproximación: figura geométrica aproximada al geoide, fácil de representar matemáticamente; se obtiene rotando una elipse sobre uno de sus ejes. Parámetros: semieje mayor o ecuatorial (a), semieje menor o polar (b) y achatamiento f = 1 − b/a (se escribe 1/f por ser muy pequeño). Hayford: a = 6.378.388 m, f = 1/297. WGS 84: a = 6.378.137 m, f = 1/298,257223563. GRS 80: a = 6.378.137 m, f = 1/298,257222101.",
  "Geoide y elipsoide":
    "Superficie de la Tierra (topográfica), geoide (nivel medio del mar, irregular) y elipsoide (figura matemática) no coinciden. En la figura del apunte: 1 océano, 2 elipsoide, 3 vector gravedad, 4 corteza, 5 geoide. El mapa de desviación EGM96 – WGS84 muestra en rojo las zonas del geoide por encima del elipsoide y en azul las de abajo (de −107 m a +85,4 m).",
  "Coordenadas geográficas":
    "Expresan cualquier posición sobre la superficie con dos ángulos medidos desde el centro de la Tierra. Latitud: ángulo entre el punto y el Ecuador (0°); sus líneas son los paralelos (de +90 a −90). Longitud: ángulo a lo largo del Ecuador desde el meridiano de Greenwich (0°); sus líneas son los meridianos, grandes círculos que pasan por los polos.",
  "Sistemas de referencia":
    "Soporte matemático para asignar coordenadas a puntos de la superficie, con origen, orientación y escala accesibles a todos. Local: un punto DATUM donde coinciden la normal al elipsoide y la vertical al geoide (ahí coinciden coordenadas astronómicas Φ, Λ y geodésicas φ, λ); cambia con la ubicación del datum, es planimétrico y da distintas coordenadas para un mismo punto que otros sistemas locales. Global: origen en el geocentro; Z hacia el polo, X en el meridiano de Greenwich, Y en el plano ecuatorial perpendicular a XZ; coordenadas XYZ que se transforman a latitud, longitud y altura.",
  "Marcos de referencia":
    "Materialización de un sistema de referencia mediante mediciones: coordenadas de una red de puntos, consistentes entre sí para una época. Ejemplo: Campo Inchauspe (1969), marco de referencia local argentino con unidades geodésicas de triangulación y poligonación. El marco actual es POSGAR 07.",
  Proyecciones:
    "El elipsoide es tridimensional y el mapa bidimensional: la proyección cartográfica es la transformación matemática que relaciona coordenadas geográficas con planas. Se clasifican según las características que preservan y según su superficie desarrollable. Siempre distorsiona forma, área, distancia o dirección, y buena parte de la superficie queda más chica que la escala nominal. Conformes: preservan formas locales y ángulos (grilla a 90°) pero deforman áreas. Equivalentes: preservan el área (meridianos y paralelos pueden no cortarse en los ángulos correctos). Equidistantes: preservan la distancia solo sobre una o más líneas.",
  "Superficie desarrollable":
    "Algunas proyecciones usan formas que se aplanan sin deformarse: cilindros, planos y conos. Los puntos o líneas de contacto con el globo tienen distorsión cero. Cónicas: tangentes a un paralelo estándar o secantes a dos, con meridiano central y de corte. Cilíndricas: aspecto normal, transverso u oblicuo.",
  "Proyecciones planas":
    "Usan un plano (también llamadas acimutales o cenitales); el punto de contacto define el aspecto: polar, ecuatorial u oblicuo. Según la perspectiva (desde dónde se proyecta): gnomónica (desde el centro), estereográfica (desde el extremo opuesto de la esfera), ortográfica (rayos paralelos) y escenográfica (desde afuera de la esfera).",
  "Códigos EPSG":
    "Como hay distintos elipsoides, puntos fundamentales y proyecciones, el EPSG (European Petroleum Survey Group) creó el EPSG Geodetic Dataset: códigos para cada CRS (Coordinate Reference System, también SRS) y las operaciones de coordenadas o reproyecciones entre ellos. Sirven para identificar el CRS de una capa, reproyectar y pedir datos a servicios web. EPSG:4326 = WGS84 en grados con Greenwich como meridiano 0. EPSG:3857 = coordenadas proyectadas de los mapas online (Google, OSM, Bing). Se definen en proj4 o WKT (Well Known Text).",
  "Marcos en Argentina":
    "Ente responsable: IGN (ex Militar). Marco actual: POSGAR 07. Proyección oficial: Gauss-Krüger, variación de UTM: 7 fajas de 3° (1°30' a cada lado del meridiano central), con meridianos centrales 72°, 69°, 66°, 63°, 60°, 57° y 54° oeste. Chaco: fajas 4 y 5, mayoritariamente la 5. EPSG 2217X = POSGAR 98 faja X. En proj4, faja 5: +proj=tmerc +lon_0=-60 +x_0=5500000 +ellps=GRS80; faja 4: +lon_0=-63 +x_0=4500000.",
  UTM:
    "Universal Transverse Mercator: proyección cilíndrica transversa y conforme, desarrollada por el Cuerpo de Ingenieros del Ejército de EE.UU. en los 40. Artificio de Tyson: divide el globo en 60 fajas de 6° y rota el cilindro para que la tangencia coincida con el meridiano central de cada faja (MCF). Zonas: husos 1 a 60 de oeste a este y 20 bandas de 8° de latitud (C a X, sin I ni O); zonas polares con Universal Polar Stereographic. Ventaja: distorsión mínima. Desventaja: discontinuidad entre zonas.",
};

export type Termino = { termino: string; patron: RegExp; definicion: string };

const t = (termino: string, patron: string, definicion: string): Termino => ({
  termino,
  patron: new RegExp(`(?<![\\p{L}\\d])(?:${patron})(?![\\p{L}\\d])`, "iu"),
  definicion,
});

export const GLOSARIO: Termino[] = [
  t("Georreferenciado", "georreferenciad\\p{L}*|geográficamente referenciad\\p{L}*|espacialmente referenciad\\p{L}*", "Que tiene asociada una posición dentro de un sistema de referencia ligado a la Tierra."),
  t("Capa", "capas?", "Unidad básica de almacenamiento de un SIG: información de un tipo concreto sobre una zona, con su componente temática y espacial. Con varias capas se forma un mapa."),
  t("Raster", "raster|ráster", "Modelo de representación que divide el espacio de forma regular en celdas (píxeles), cada una con un valor."),
  t("Vectorial", "vectorial(?:es)?", "Modelo de representación con primitivas geométricas (puntos, líneas, polígonos) de coordenadas explícitas. No confundir con “campo vectorial”, término matemático."),
  t("Celda / píxel", "celdas?|píxel(?:es)?|pixel(?:es)?", "Unidad mínima en que se divide el espacio en el modelo raster; toma el valor de lo que hay en su posición."),
  t("Resolución", "resolución", "En raster, el tamaño de celda. Mayor tamaño de celda → menor resolución y menor precisión."),
  t("Banda", "bandas?", "Cada nivel de una imagen raster; sus valores indican en general la reflectancia en una determinada longitud de onda."),
  t("Reflectancia", "reflectancia", "Lo que registran los valores de las bandas de una imagen, para una determinada longitud de onda."),
  t("Campo (modelo)", "campos?(?! inchauspe| gravitatori)", "Modelo geográfico en que cada punto tiene un valor único de la variable. Es continuo."),
  t("Campo escalar", "escalar(?:es)?", "Campo donde cada punto tiene un único valor (m = 1): elevación, temperatura, presión."),
  t("Entidades discretas", "entidades discretas", "Modelo geográfico que ve el espacio vacío con entidades que lo van rellenando; un punto puede no pertenecer a ninguna o a varias."),
  t("Rⁿ → Rᵐ", "R[²³⁴¹ⁿᵐ]|Rⁿ", "Forma de la función de un campo: n dimensiones de origen (x, y, z, t) y m del valor de destino."),
  t("Primitiva geométrica", "primitivas?", "Elementos del modelo vectorial: punto, línea y polígono."),
  t("Polígono", "polígonos?", "Primitiva vectorial: línea cerrada que delimita un área, definida por la serie de puntos de su perímetro."),
  t("TIN", "TIN", "Red de Triángulos Irregulares: forma de representar la elevación con polígonos."),
  t("Curvas de nivel", "curvas de nivel", "Representación vectorial (líneas) de la elevación."),
  t("Atributos", "atributos?", "Valores asociados a una entidad (componente temática); en vectorial se guardan en una tabla enlazada por ID."),
  t("Topología", "topolog\\p{L}*", "Relaciones espaciales entre entidades que se establecen por su posición (adyacencia, conectividad, inclusión…). Una capa tiene topología si las almacena."),
  t("Spaghetti", "spaghetti|spaguetti", "Modelo vectorial sin topología: cada entidad es una lista de coordenadas sin relación con las demás."),
  t("Arco", "arcos?", "En arco-nodo: sucesión de segmentos conectados entre dos nodos, con 0 a n vértices intermedios."),
  t("Nodo", "nodos?", "Punto inicial o final de un arco, o donde conectan tres o más arcos."),
  t("Vértice", "vértices?", "Punto que solo pertenece a una entidad."),
  t("Adyacencia", "adyacen\\p{L}*|contigü\\p{L}*|colindante\\p{L}*", "Relación entre polígonos que comparten una parte de su contorno."),
  t("Conectividad", "conectividad", "Relación entre entidades lineales que comparten un nodo; permite recorrer una red."),
  t("DIME", "DIME", "Dual Independent Map Encoding (EE.UU., 1967): cada línea recta entre dos puntos es una unidad."),
  t("Overlay", "overlay|superposición", "Capacidad de superponer capas (ya presente en ODYSSEY; McHarg lo hacía con transparentes)."),
  t("Geoprocesamiento", "geoprocesamiento|análisis espacial", "Análisis de datos geográficos que permite buscar patrones y tendencias y elaborar escenarios."),
  t("MBR", "MBR", "Minimum Bounding Rectangle: rectángulo mínimo que envuelve una entidad; lo almacenan los R-Trees."),
  t("R-Tree", "R-Trees?", "Esquema de índice espacial más utilizado: árbol de MBR."),
  t("Índice espacial", "índices? espacial\\p{L}*", "Estructura para mejorar el acceso a datos espaciales. Enfoques continuo y discreto."),
  t("BSQ / BIL / BIP", "BSQ|BIL|BIP", "Orden de almacenamiento con varias bandas: BSQ banda por banda, BIP por píxel, BIL por filas."),
  t("Shapefile", "shapefile", "Formato vectorial de ESRI, estándar de facto: .shp, .shx y .dbf obligatorios."),
  t(".dbf", "\\.dbf|dBase", "Archivo del shapefile con los atributos de cada shape, en formato dBase IV."),
  t(".prj", "\\.prj", "Archivo opcional del shapefile con la proyección."),
  t("GML", "GML", "Geographic Markup Language: lenguaje XML de intercambio de información geográfica vectorial. Estándar técnico."),
  t("KML", "KML", "Keyhole Markup Language: creado por Google, similar a GML, adoptado como estándar técnico por la OGC."),
  t("GeoJSON", "GeoJSON", "Formato basado en JavaScript, más compacto que GML/KML, ideal para aplicaciones web."),
  t("SDBMS", "SDBMS|bases? de datos espacial\\p{L}*", "Motor de base de datos con capacidad espacial: guarda la geometría en una columna binaria."),
  t("PostGIS", "PostGIS", "Extensión de PostgreSQL que añade funcionalidad espacial; backend para aplicaciones GIS."),
  t("SRS", "SRSs?|SRID", "Spatial Reference System: otro nombre del CRS. PostGIS los cataloga en spatial_ref_sys."),
  t("OGC", "OGC|Open Geospatial Consortium", "Open Geospatial Consortium (1994): define estándares abiertos e interoperables para SIG."),
  t("SMBD", "SMBD", "Sistema de Manejo de Base de Datos: componente del software de un SIG."),
  t("Catastro", "catastr\\p{L}*", "Sistema de registro de parcelas (nomenclatura, titular, superficie, estado legal); uno de los usos principales de los SIG."),
  t("AM/FM", "AM/FM", "Automated Mapping / Facilities Management: SIG de empresas de servicios por red (ej. Aguas Argentinas, EDESUR)."),
  t("Antrópico", "antrópic\\p{L}*", "Según el apunte: procesos de degradación del relieve y del subsuelo causados por la acción del hombre."),
  t("Hectárea", "hectáreas?", "Unidad de superficie: 1 ha = 10.000 m²."),
  t("Landsat", "LANDSAT", "Imágenes satelitales usadas, por ejemplo, en CORINE y en la actualización de la cartografía del IGN."),
  t("Geodesia", "geodesia|geodésic\\p{L}*", "Ciencia que estudia la forma y dimensiones de la Tierra."),
  t("Generalización", "generaliza\\p{L}*", "Eliminar características no relevantes al objetivo del mapa y reducir la complejidad de lo representado."),
  t("Al vuelo / multiescala", "al vuelo|multiescala", "Tipos de generalización vistos en clase: al vuelo (en el momento de mostrar) y multiescala (versiones preparadas por escala)."),
  t("Escala", "escalas?", "Relación matemática entre las dimensiones reales y las representadas (modelo : realidad)."),
  t("Geoide", "geoide", "Superficie equipotencial del campo gravitatorio que mejor se ajusta al nivel medio del mar. Irregular."),
  t("Equipotencial", "equipotencial", "Con igual potencial gravitatorio en todos sus puntos (misma atracción terrestre)."),
  t("Elipsoide", "elipsoides?", "Figura geométrica aproximada al geoide: rotar una elipse sobre uno de sus ejes."),
  t("Achatamiento", "achatamiento", "f = 1 − (b/a). Se expresa como 1/f por ser muy pequeño."),
  t("Semieje", "semiejes?", "a: semieje ecuatorial o mayor. b: semieje polar o menor."),
  t("Hayford / Internacional", "Hayford|intl", "Elipsoide con a = 6.378.388 m y f = 1/297 (+ellps=intl en proj4, usado por Campo Inchauspe)."),
  t("WGS84", "WGS\\s?84", "Elipsoide con a = 6.378.137 m y f = 1/298,257223563. EPSG:4326 lo usa en coordenadas geográficas."),
  t("GRS80", "GRS\\s?80", "Elipsoide con a = 6.378.137 m y f = 1/298,257222101 (+ellps=GRS80 en POSGAR 98)."),
  t("Datum", "datum", "En un sistema local, punto donde coinciden la normal al elipsoide y la vertical al geoide."),
  t("Geocentro", "geocentro|geocéntric\\p{L}*", "Centro de masa de la Tierra: origen de un sistema de referencia global."),
  t("Latitud", "latitud", "Ángulo entre un punto y el Ecuador (0°). Sus líneas son los paralelos."),
  t("Longitud", "longitud(?! de onda)", "Ángulo a lo largo del Ecuador desde el meridiano de Greenwich (0°). Sus líneas son los meridianos."),
  t("Meridiano", "meridianos?", "Línea de igual longitud: gran círculo que pasa por los polos."),
  t("Paralelo", "paralelos?", "Línea de igual latitud."),
  t("MCF", "MCF|meridiano central", "Meridiano central de faja: donde el cilindro es tangente y la distorsión es mínima."),
  t("Planimétrico", "planimétric\\p{L}*", "Sin alturas asociadas."),
  t("Proyección cartográfica", "proyecci\\p{L}+|reproyect\\p{L}*", "Transformación matemática que relaciona coordenadas geográficas con coordenadas planas."),
  t("Conforme", "conformes?", "Proyección que preserva formas locales y ángulos (grilla a 90°); deforma mucho las áreas."),
  t("Equivalente", "equivalentes?", "Proyección que preserva el área de los objetos."),
  t("Equidistante", "equidistantes?", "Proyección que preserva la distancia sobre una o más líneas."),
  t("Tangente / secante", "tangen\\p{L}*|secantes?", "La superficie de proyección toca el globo en una línea (tangente) o lo corta (secante)."),
  t("Transverso", "transvers\\p{L}*", "Aspecto del cilindro tangente a un meridiano (el que usa UTM)."),
  t("Acimutal", "acimutal\\p{L}*|cenital\\p{L}*|planares", "Otro nombre de las proyecciones planas."),
  t("Gnomónica / estereográfica / ortográfica", "gnomónica|estereográfica|ortográfica|escenográfica", "Perspectivas de las proyecciones planas según el punto desde el que se proyecta."),
  t("Mercator", "Mercator", "Proyección que en la comparación de áreas agranda mucho Groenlandia. Web Mercator (EPSG:3857) es la de los mapas online; UTM es una Mercator transversa."),
  t("UTM", "UTM", "Universal Transverse Mercator: cilíndrica transversa y conforme, 60 husos de 6°."),
  t("Huso / faja", "husos?|fajas?", "Franja de longitud con su propio meridiano central: 6° en UTM, 3° en Gauss-Krüger."),
  t("Gauss-Krüger", "Gauss-Kr[uü]ger", "Proyección oficial argentina, variación de UTM: 7 fajas de 3°."),
  t("POSGAR", "POSGAR", "Posiciones Geodésicas Argentinas: marco de referencia argentino (actual POSGAR 07)."),
  t("Campo Inchauspe", "Inchauspe", "Marco de referencia local argentino de 1969."),
  t("IGN", "IGN", "Instituto Geográfico Nacional (ex Militar), ente responsable de los marcos de referencia en Argentina."),
  t("CRS", "CRS", "Coordinate Reference System: sistema de referencia de coordenadas identificado, por ejemplo, con un código EPSG."),
  t("EPSG", "EPSG", "European Petroleum Survey Group: su dataset asigna códigos a cada CRS y define reproyecciones."),
  t("proj4", "proj4|\\+proj", "Formato de texto para definir un CRS con parámetros (+proj, +lon_0, +x_0, +ellps…)."),
  t("WKT", "WKT|Well Known Text", "Well Known Text: otro formato de texto para definir un CRS (GEOGCS[…])."),
  t("tmerc", "tmerc", "Valor de +proj en las definiciones Gauss-Krüger del apunte (transversa de Mercator)."),
  t("+x_0 (falso este)", "x_0|falso este", "Valor sumado a las X: 5.500.000 en faja 5 y 4.500.000 en faja 4; el primer dígito coincide con la faja."),
  t("+towgs84", "towgs84", "Parámetros para pasar a WGS84: en POSGAR 98 son todos 0; en Campo Inchauspe no."),
  t("Web Mercator", "Web Mercator|3857", "EPSG:3857: coordenadas proyectadas de los mapas online (Google, OSM, Bing)."),
  t("Marco de referencia", "marcos? de referencia", "Materialización de un sistema de referencia: coordenadas de una red de puntos para una época."),
  t("Artificio de Tyson", "Tyson", "Dividir el globo en fajas y rotar el cilindro para que sea tangente al meridiano central de cada una."),
  t("Papeles de un SIG", "herramienta (?:modelizadora|centralizadora|para (?:toma|difusión)\\p{L}*)", "Clasificación de clase: modelizadora, para toma de decisiones, para difusión de información geográfica y centralizadora."),
];

/** Términos del glosario que aparecen en un texto. */
export function terminosEn(texto: string): Termino[] {
  return GLOSARIO.filter((g) => g.patron.test(texto));
}
