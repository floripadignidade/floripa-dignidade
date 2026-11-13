Search Engine: The Universal Discovery Bunker Estatus: God Tier / Infraestructura de Descubrimiento
Rol: Cerebro de indexación, filtrado por roles (RBAC) y recuperación de información de alta
velocidad. Protocolo: OEDP-V13.0 (Universal Abstraction Layer) 🎯 Visión Holística El
@floripa-dignidade/search-engine no es una simple barra de búsqueda; es el Punto de Acceso Único a
la Verdad del ecosistema. Su objetivo es permitir que ciudadanos, voluntarios y administradores
encuentren información crítica en milisegundos, respetando estrictamente su nivel de autoridad. 🏗️
Arquitectura de Capas (Universal Search Logic) Para evitar la obsolescencia técnica, el búnker se
divide en tres capas atómicas: Capa de Adaptación (The Drivers): Tier 0 (Actual): Fuse.js. Búsqueda
difusa (fuzzy search) en memoria para el Frontpage estático. Tier 1 (Futuro): Payload Search Plugin.
Integración profunda con la base de datos Postgres/MongoDB. Tier 2 (Evolución): Vector Search.
Búsqueda semántica mediante embeddings de IA para entender la intención del ciudadano. Capa de
Seguridad (RBAC Enforcement): Integra directamente con @floripa-dignidade/identity. Cada resultado
de búsqueda posee un metadato requiredAccessRole. El motor filtra automáticamente los resultados: un
ANONYMOUS_USER nunca verá en sus resultados una "Denuncia en Trámite", mientras que un LEGAL_AUDITOR
sí. Capa de Validación (Aduana Zod): Ningún dato entra al índice de búsqueda sin pasar por el
SearchIndexSchema. Garantiza que cada resultado tenga una URL ISO válida y un nivel de relevancia
calculado. 🧬 ADN Estructural (Contratos de Identidad) Cada elemento indexado debe cumplir con la
interfaz ISearchableEntity: code TypeScript interface ISearchableEntity { readonly identifier:
string; // UUID o ID de Payload readonly title: string; // Título legible readonly contentSnippet:
string; // Resumen para el SEO del buscador readonly path: string; // Ruta ISO (ej:
/prensa/noticia-impacto) readonly assignedAccessRole: UserRole; // Nivel de seguridad (RBAC)
readonly category: EntityCategory; // NOTICIA | DENUNCIA | INSTITUCIONAL } 🚀 Roadmap de
Implementación Fase 1: Local Mastery (Implementación Actual) Uso de Fuse.js para indexar las rutas
del portal listadas en el Manifiesto de Frontend. Búsqueda instantánea en el cliente (Client-side)
para viralización y rapidez. Zero Latency en redes 3G/4G. Fase 2: CMS Synergy Conexión con el
Content Manager System. Sincronización de índices mediante Webhooks: cuando se publica una noticia
en Payload, el motor de búsqueda la indexa automáticamente. Fase 3: AI-Driven Discovery
Implementación de Búsqueda por Intención. Si el usuario busca "tengo hambre", el motor entiende la
semántica y prioriza resultados de "Espacio Solidario" y "Red de Apoyo". 🛡️ Instrucciones para la IA
Auditora Zero Abbreviations: No uses idx, usa searchIndex. No uses res, usa searchResult.
Performance: El motor debe reportar su latencia de búsqueda a @floripa-dignidade/telemetry usando
traceExecutionTime. Seguridad: Es mandatorio que la función principal de búsqueda reciba el
UserContext para aplicar los filtros de RBAC antes de retornar cualquier dato. El software de
Floripa Dignidade no solo almacena datos; los hace accesibles para transformar la realidad social.

---
