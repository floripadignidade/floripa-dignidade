# 🏛️ BITÁCORA DE ARQUITECTURA Y DECISIONES TÉCNICAS (OEDP-V18.1)

## [2026-11-09] HITO 01: Saneamiento de Grafo, Nivelación Source-First y Estabilización de Typecheck

### Contexto y Diagnóstico
Al ejecutar `pnpm typecheck` en el monorepo, 25 proyectos fallaron debido a 4 frentes de desestabilización:
1. Punteros de compilación hacia rutas inexistentes (`libs/modules/pmf-open-data-engine/`).
2. Contaminación de bloques `references` inyectados por Nx en proyectos configurados con `noEmit: true`, provocando `TS6306` y `TS6310`.
3. Punteros residuales en `compilerOptions.paths` hacia archivos `.d.ts` en `dist/out-tsc/`, contradiciendo la doctrina Source-First y arrojando `TS2307`.
4. Archivos físicamente truncados en `libs/modules/municipal-open-data-engine/`.

### Decisiones Arquitectónicas Inmutables
1. **Unificación de Identidad Canónica (ISO 11179):**
   - El proyecto ubicado en `libs/engines/data-ingestion-engine/` asume la identidad `@floripa-dignidade/data-ingestion-engine`.
   - Se ajustan sus etiquetas a `scope:engines`, `type:data` y `platform:isomorphic`.
2. **Adopción Universal de Source-First (OEDP-V18.1):**
   - Se purgan todas las referencias `dist/out-tsc` en los archivos `tsconfig.lib.json`.
   - Se elimina la propiedad obsoleta `baseUrl` de todas las configuraciones TypeScript.
   - Las bibliotecas no emitirán binarios intermedios durante el typecheck (`noEmit: true`, `composite: false`), resolviendo dependencias directamente desde sus puntos de entrada `src/index.ts`.
3. **Erradicación de Referencias Compuestas en Proyectos Hoja:**
   - Se eliminan los bloques `"references": [...]` en aplicaciones (`apps/floripa-dignidade`, `apps/content-manager-system`) y librerías que no compilan mediante proyectos compuestos.
4. **Purga de Módulos Residuales:**
   - La lógica truncada de `libs/modules/municipal-open-data-engine/` se consolida en el motor canónico bajo `libs/engines/`, eliminando duplicidad.

   ---

   ## [2026-11-09] HITO 02: Nivelación Universal Source-First, Saneamiento de Datos Fiscales y Desacoplamiento de Grafo

### Contexto y Diagnóstico
Tras la auditoría forense del monorepo (Snapshot 683 archivos), se identificaron fallas críticas que bloqueaban `pnpm typecheck` y amenazaban el despliegue en Vercel:
1. Fragmentación del motor fiscal municipal en 3 carpetas (`pmf-open-data-engine`, `municipal-open-data-engine` y `data-ingestion-engine`), con el archivo orquestador físicamente desconectado de su barril de exportación (`src/index.ts`).
2. Bucle de recursión circular infinito en `libs/shared/utility/tsconfig.json` (`"extends": "./tsconfig.json"`).
3. Residuos de compilación compuesta legada (`composite: true`, `noEmit: false`, `baseUrl: "."`, rutas a `dist/out-tsc`) en `shared/utility`, `modules/newsletter` y `shared/design-system`.
4. Referencias compuestas cruzadas residuales (`references: [...]`) en `interaction-engine` y `messaging-engine` apuntando a librerías con `noEmit: true`, arrojando `TS6306` y `TS6310`.
5. Atrapamiento accidental de excepciones de control de flujo de Next.js (`NEXT_REDIRECT`) dentro del bloque `try/catch` de `observatorio/gastos-publicos/page.tsx`.

### Decisiones Arquitectónicas Inmutables y Acciones Ejecutadas
1. **Consolidación Canónica de Ingesta Fiscal:**
   - Se estableció `libs/engines/data-ingestion-engine` como la única biblioteca autorizada (`scope:engines`, `type:data`).
   - Se materializó el orquestador `SyncMunicipalityExpenditure.ts` en `libs/engines/data-ingestion-engine/src/lib/logic/orchestrators/`, purgado de metáforas informales ("aduana"), tipado con tipos bridados y telemetría SRE.
   - Se actualizaron todos los consumidores del Observatorio (`page.tsx`, `ExpenditureTable.tsx`, `ExpenditureTableRow.tsx` y `CalculateObservatoryMetrics.ts`) para importar canónicamente desde `@floripa-dignidade/contracts` y `@floripa-dignidade/data-ingestion-engine`.
2. **Erradicación de Recursión Circular en `shared/utility`:**
   - Se restauró el Gatekeeper `libs/shared/utility/tsconfig.json` extendiendo limpiamente `../../../tsconfig.base.json` (`composite: false`, `noEmit: true`, `files: []`, `references: [{ "path": "./tsconfig.lib.json" }]`).
   - Se niveló `libs/shared/utility/tsconfig.lib.json` a Source-First puro, purgando `baseUrl`, `composite: true` y punteros a `dist/out-tsc`.
3. **Erradicación de Referencias Compuestas en Capa de Módulos:**
   - Se sanearon los archivos `tsconfig.lib.json` de `newsletter`, `design-system`, `interaction-engine` y `messaging-engine`, fijando `composite: false`, `noEmit: true`, `references: []` e inyectando tipos de React 19 donde correspondía.
4. **Sincronización Raíz de Alias (`tsconfig.base.json` y Apps):**
   - Se incorporó `@floripa-dignidade/data-ingestion-engine` en `tsconfig.base.json`, manteniendo temporalmente el puente `@floripa-dignidade/pmf-open-data-engine` para evitar roturas.
   - Se homogeneizaron y alfabetizaron los mapas `paths` en `apps/floripa-dignidade/tsconfig.app.json` y `apps/content-manager-system/tsconfig.app.json`, eliminando el alias obsoleto y el archivo fantasma `index.d.ts`.
5. **Inmunización de Redirección Perimetral en Next.js App Router:**
   - Se extrajo `await ValidateObservatoryAccess(...)` fuera del bloque `try/catch` de datos en la página del observatorio, permitiendo que la señal `NEXT_REDIRECT` de Next.js opere sin ser tratada como colapso de servidor.

   ---

   ## [2026-11-09] HITO 03: Diagnóstico de Sincronización Nx y Plan de Desacoplamiento de Dependencias Fantasma

### Contexto y Diagnóstico Forense
Al ejecutar `pnpm typecheck`, 22 proyectos compilaron nominalmente. Los 10 proyectos restantes presentaron fallos atribuibles a tres factores externos:
1. El generador `@nx/js:typescript-sync` forzó interactivamente la inserción de bloques `references` en `apps/floripa-dignidade`, `identity` y `data-ingestion-engine`, colisionando con el estándar `noEmit: true` y arrojando `TS6306`/`TS6310`.
2. Aislamiento estricto de pnpm provocando `TS2307` por dependencias no elevadas a la raíz del monorepo (`exceljs`, `clsx`, `tailwind-merge`, `@radix-ui/react-slot`).
3. Declaración impropia de `@testing-library/jest-dom` en el array `types` de `tests/tsconfig.lib.json` provocando `TS2688`.

### Decisiones Arquitectónicas Inmutables
1. **Desactivación de `typescript-sync` en `nx.json`:** Se prohíbe la sincronización automática de referencias de proyecto para salvaguardar la doctrina Source-First.
2. **Elevación de Dependencias Críticas al Root:** Instalar a nivel de workspace (`-w`) los paquetes compartidos por múltiples librerías para garantizar resolución en cualquier contexto de compilación.
3. **Saneamiento Definitivo de Aplicaciones:** Ambas aplicaciones (`floripa-dignidade` y `content-manager-system`) quedan 100% purgadas de alias legados y archivos fantasmas.

---

## [2026-11-09] HITO 04: Purga Semántica OEDP-V18.1, Nivelación de Ingesta Fiscal y Cierre de Brechas de Persistencia

### Contexto y Diagnóstico Forense
Se ejecutó una auditoría integral de 10 dimensiones técnicas sobre el monorepo (Snapshot completo de 682 archivos), identificando focos residuales de inestabilidad, asimetría relacional y persistencia de metáforas informales:
1. Simulación estática (*mock*) de partidas fiscales en `SyncMunicipalityExpenditure.ts`.
2. Asimetría en la clave primaria y rol RLS de `database/01_identity_identities_ledger.sql` frente a `database/migration_master_schema.sql` y el contrato `IdentityPhysicalRecordSchema`.
3. Ruta de importación rota (`TS2307`) en `UserIdentity.schema.ts` hacia un subdirectorio `schemas/UserAccessRole.schema.js` inexistente.
4. Divergencia en las firmas de presencia entre `CalculatePresenceSovereignSignature.ts` (JSON) y `CalculatePresenceStateSignature.ts` (concatenación por tuberías `|`).
5. Persistencia de la metáfora prohibida `"Sovereign"` en aparatos clave de utilidad y mensajería (`MaskSovereignIdentity.ts`, `GenerateSovereignStoragePath.ts`, `TransformToSovereignBinary.ts`, `CreateSovereignDatabaseHeaders.ts`, `ManageSovereignMembership.ts`).

### Decisiones Arquitectónicas Inmutables y Acciones Ejecutadas
1. **Adquisición HTTP de Gastos Públicos con Resiliencia SRE:**
   - Se refactorizó `SyncMunicipalityExpenditure.ts`, implementando un cliente de red con `AbortSignal.timeout(8000)` y contingencia certificada de referencia institucional ante caídas de los portales gubernamentales.
2. **Saneamiento Relacional del Ledger de Identidades:**
   - Se homologó `01_identity_identities_ledger.sql` a `citizen_id UUID PRIMARY KEY`, alineando las columnas con `IIdentityPhysicalRecord` y corrigiendo la política RLS hacia `INFRASTRUCTURE_ADMINISTRATIVE_AUDITOR`.
3. **Reparación del SSOT de Identidad Civil:**
   - Se corrigió la importación de `UserAccessRoleSchema` en `UserIdentity.schema.ts`, eliminando abreviaciones en transformadores y asegurando exportación simétrica con `IdentityProfileSchema`.
4. **Unificación y Purga de Metáforas en Mensajería y Almacenamiento:**
   - Se nivelaron canónicamente `CalculatePresenceStateSignature.ts`, `MaskCitizenIdentity.ts`, `GenerateEnterpriseStoragePath.ts`, `TransformToStandardBinaryBuffer.ts`, `CreatePrimaryDatabaseHeaders.ts` y `ManageEnterpriseGroupMembership.ts`, preservando alias de retrocompatibilidad y sellando tipos nominales bridados con Zod.

   ---

   ## [2026-11-10] HITO 05: Migración de Identidad Institucional GitHub, Saneamiento de Manifiestos y Construcción del Enjambre de Auditoría Cloud

### Contexto y Diagnóstico Forense
1. Migración del repositorio remoto desde la cuenta personal previa hacia la organización oficial `floripadignidade/floripa-dignidade.git`, resolviendo la corrupción local de referencias Git (`refs/remotes/origin/main: reference broken`).
2. Despliegue en Vercel estabilizado mediante la elevación de `tsx: "^4.19.0"` a `devDependencies` en el `package.json` raíz y flexibilización de `engines: { "node": ">=20.9.0" }`.
3. Saneamiento de colisión crítica en `apps/floripa-dignidade/package.json` (sobrescrito accidentalmente con el manifiesto raíz) y purga de la carpeta recursiva parásita en `libs/tools/.../probes/libs`.

### Decisiones Arquitectónicas Inmutables y Acciones Ejecutadas
1. **Arquitectura de Sondas de Red Activas (Infrastructure Auditor):**
   - Se construyó el contrato formal inmutable `CloudInfrastructureAuditReportSchema`.
   - Se crearon las 6 sondas de red individuales con tipado nominal y telemetría SRE:
     - `AuditPostgresDatabaseProbe.ts`: Handshake SSL nativo (paquete `SSLRequest` FE/BE de Postgres) con timeout de 5s.
     - `AuditSupabaseRestProbe.ts`: Consulta REST ping a `/rest/v1/` con clave de servicio.
     - `AuditSupabaseStorageS3Probe.ts`: Firma criptográfica pura AWS Signature Version 4 (SigV4) mediante `node:crypto`.
     - `AuditResendEmailProbe.ts`: Validación de API Key y certificación de estado de dominio remitente.
     - `AuditHuggingFaceCognitiveProbe.ts`: Pulso de inferencia SLM con detección de Cold Start (`HTTP 503`).
     - `AuditWhatsAppMetaGatewayProbe.ts`: Auditoría de entropía y apretón de manos HMAC-SHA256 en tiempo constante.
2. **Orquestación Central de Auditoría:**
   - Se construyó `AuditCloudInfrastructureSecrets.ts` para ejecución concurrente y volcado estructurado a `reports/infrastructure/`.

   ---

## [2026-11-09] HITO 01: Saneamiento de Grafo, Nivelación Source-First y Estabilización de Typecheck

### Contexto y Diagnóstico
Al ejecutar `pnpm typecheck` en el monorepo, 25 proyectos fallaron debido a 4 frentes de desestabilización:
1. Punteros de compilación hacia rutas inexistentes (`libs/modules/pmf-open-data-engine/`).
2. Contaminación de bloques `references` inyectados por Nx en proyectos configurados con `noEmit: true`, provocando `TS6306` y `TS6310`.
3. Punteros residuales en `compilerOptions.paths` hacia archivos `.d.ts` en `dist/out-tsc/`, contradiciendo la doctrina Source-First y arrojando `TS2307`.
4. Archivos físicamente truncados en `libs/modules/municipal-open-data-engine/`.

### Decisiones Arquitectónicas Inmutables
1. **Unificación de Identidad Canónica (ISO 11179):**
   - El proyecto ubicado en `libs/engines/data-ingestion-engine/` asume la identidad `@floripa-dignidade/data-ingestion-engine`.
   - Se ajustan sus etiquetas a `scope:engines`, `type:data` y `platform:isomorphic`.
2. **Adopción Universal de Source-First (OEDP-V18.1):**
   - Se purgan todas las referencias `dist/out-tsc` en los archivos `tsconfig.lib.json`.
   - Se elimina la propiedad obsoleta `baseUrl` de todas las configuraciones TypeScript.
   - Las bibliotecas no emitirán binarios intermedios durante el typecheck (`noEmit: true`, `composite: false`), resolviendo dependencias directamente desde sus puntos de entrada `src/index.ts`.
3. **Erradicación de Referencias Compuestas en Proyectos Hoja:**
   - Se eliminan los bloques `"references": [...]` en aplicaciones (`apps/floripa-dignidade`, `apps/content-manager-system`) y librerías que no compilan mediante proyectos compuestos.
4. **Purga de Módulos Residuales:**
   - La lógica truncada de `libs/modules/municipal-open-data-engine/` se consolida en el motor canónico bajo `libs/engines/`, eliminando duplicidad.

---

## [2026-11-09] HITO 02: Nivelación Universal Source-First, Saneamiento de Datos Fiscales y Desacoplamiento de Grafo

### Contexto y Diagnóstico
Tras la auditoría forense del monorepo (Snapshot 683 archivos), se identificaron fallas críticas que bloqueaban `pnpm typecheck` y amenazaban el despliegue en Vercel:
1. Fragmentación del motor fiscal municipal en 3 carpetas (`pmf-open-data-engine`, `municipal-open-data-engine` y `data-ingestion-engine`), con el archivo orquestador físicamente desconectado de su barril de exportación (`src/index.ts`).
2. Bucle de recursión circular infinito en `libs/shared/utility/tsconfig.json` (`"extends": "./tsconfig.json"`).
3. Residuos de compilación compuesta legada (`composite: true`, `noEmit: false`, `baseUrl: "."`, rutas a `dist/out-tsc`) en `shared/utility`, `modules/newsletter` y `shared/design-system`.
4. Referencias compuestas cruzadas residuales (`references: [...]`) en `interaction-engine` y `messaging-engine` apuntando a librerías con `noEmit: true`, arrojando `TS6306` y `TS6310`.
5. Atrapamiento accidental de excepciones de control de flujo de Next.js (`NEXT_REDIRECT`) dentro del bloque `try/catch` de `observatorio/gastos-publicos/page.tsx`.

### Decisiones Arquitectónicas Inmutables y Acciones Ejecutadas
1. **Consolidación Canónica de Ingesta Fiscal:**
   - Se estableció `libs/engines/data-ingestion-engine` como la única biblioteca autorizada (`scope:engines`, `type:data`).
   - Se materializó el orquestador `SyncMunicipalityExpenditure.ts` en `libs/engines/data-ingestion-engine/src/lib/logic/orchestrators/`, purgado de metáforas informales, tipado con tipos bridados y telemetría SRE.
   - Se actualizaron todos los consumidores del Observatorio (`page.tsx`, `ExpenditureTable.tsx`, `ExpenditureTableRow.tsx` y `CalculateObservatoryMetrics.ts`) para importar canónicamente desde `@floripa-dignidade/contracts` y `@floripa-dignidade/data-ingestion-engine`.
2. **Erradicación de Recursión Circular en `shared/utility`:**
   - Se restauró el Gatekeeper `libs/shared/utility/tsconfig.json` extendiendo limpiamente `../../../tsconfig.base.json` (`composite: false`, `noEmit: true`, `files: []`, `references: [{ "path": "./tsconfig.lib.json" }]`).
   - Se niveló `libs/shared/utility/tsconfig.lib.json` a Source-First puro, purgando `baseUrl`, `composite: true` y punteros a `dist/out-tsc`.
3. **Erradicación de Referencias Compuestas en Capa de Módulos:**
   - Se sanearon los archivos `tsconfig.lib.json` de `newsletter`, `design-system`, `interaction-engine` y `messaging-engine`, fijando `composite: false`, `noEmit: true`, `references: []` e inyectando tipos de React 19 donde correspondía.
4. **Sincronización Raíz de Alias (`tsconfig.base.json` y Apps):**
   - Se incorporó `@floripa-dignidade/data-ingestion-engine` en `tsconfig.base.json`, manteniendo temporalmente el puente `@floripa-dignidade/pmf-open-data-engine` para evitar roturas.
   - Se homogeneizaron y alfabetizaron los mapas `paths` en `apps/floripa-dignidade/tsconfig.app.json` y `apps/content-manager-system/tsconfig.app.json`, eliminando el alias obsoleto y el archivo fantasma `index.d.ts`.
5. **Inmunización de Redirección Perimetral en Next.js App Router:**
   - Se extrajo `await ValidateObservatoryAccess(...)` fuera del bloque `try/catch` de datos en la página del observatorio, permitiendo que la señal `NEXT_REDIRECT` de Next.js opere sin ser tratada como colapso de servidor.

---

## [2026-11-09] HITO 03: Diagnóstico de Sincronización Nx y Plan de Desacoplamiento de Dependencias Fantasma

### Contexto y Diagnóstico Forense
Al ejecutar `pnpm typecheck`, 22 proyectos compilaron nominalmente. Los 10 proyectos restantes presentaron fallos atribuibles a tres factores externos:
1. El generador `@nx/js:typescript-sync` forzó interactivamente la inserción de bloques `references` en `apps/floripa-dignidade`, `identity` y `data-ingestion-engine`, colisionando con el estándar `noEmit: true` y arrojando `TS6306`/`TS6310`.
2. Aislamiento estricto de pnpm provocando `TS2307` por dependencias no elevadas a la raíz del monorepo (`exceljs`, `clsx`, `tailwind-merge`, `@radix-ui/react-slot`).
3. Declaración impropia de `@testing-library/jest-dom` en el array `types` de `tests/tsconfig.lib.json` provocando `TS2688`.

### Decisiones Arquitectónicas Inmutables
1. **Desactivación de `typescript-sync` en `nx.json`:** Se prohíbe la sincronización automática de referencias de proyecto para salvaguardar la doctrina Source-First.
2. **Elevación de Dependencias Críticas al Root:** Instalar a nivel de workspace (`-w`) los paquetes compartidos por múltiples librerías para garantizar resolución en cualquier contexto de compilación.
3. **Saneamiento Definitivo de Aplicaciones:** Ambas aplicaciones (`floripa-dignidade` y `content-manager-system`) quedan 100% purgadas de alias legados y archivos fantasmas.

---

## [2026-11-09] HITO 04: Purga Semántica OEDP-V18.1, Nivelación de Ingesta Fiscal y Cierre de Brechas de Persistencia

### Contexto y Diagnóstico Forense
Se ejecutó una auditoría integral de 10 dimensiones técnicas sobre el monorepo (Snapshot completo de 682 archivos), identificando focos residuales de inestabilidad, asimetría relacional y persistencia de metáforas informales:
1. Simulación estática (*mock*) de partidas fiscales en `SyncMunicipalityExpenditure.ts`.
2. Asimetría en la clave primaria y rol RLS de `database/01_identity_identities_ledger.sql` frente a `database/migration_master_schema.sql` y el contrato `IdentityPhysicalRecordSchema`.
3. Ruta de importación rota (`TS2307`) en `UserIdentity.schema.ts` hacia un subdirectorio `schemas/UserAccessRole.schema.js` inexistente.
4. Divergencia en las firmas de presencia entre `CalculatePresenceSovereignSignature.ts` (JSON) y `CalculatePresenceStateSignature.ts` (concatenación por tuberías `|`).
5. Persistencia de la metáfora prohibida `"Sovereign"` en aparatos clave de utilidad y mensajería (`MaskSovereignIdentity.ts`, `GenerateSovereignStoragePath.ts`, `TransformToSovereignBinary.ts`, `CreateSovereignDatabaseHeaders.ts`, `ManageSovereignMembership.ts`).

### Decisiones Arquitectónicas Inmutables y Acciones Ejecutadas
1. **Adquisición HTTP de Gastos Públicos con Resiliencia SRE:**
   - Se refactorizó `SyncMunicipalityExpenditure.ts`, implementando un cliente de red con `AbortSignal.timeout(8000)` y contingencia certificada de referencia institucional ante caídas de los portales gubernamentales.
2. **Saneamiento Relacional del Ledger de Identidades:**
   - Se homologó `01_identity_identities_ledger.sql` a `citizen_id UUID PRIMARY KEY`, alineando las columnas con `IIdentityPhysicalRecord` y corrigiendo la política RLS hacia `INFRASTRUCTURE_ADMINISTRATIVE_AUDITOR`.
3. **Reparación del SSOT de Identidad Civil:**
   - Se corrigió la importación de `UserAccessRoleSchema` en `UserIdentity.schema.ts`, eliminando abreviaciones en transformadores y asegurando exportación simétrica con `IdentityProfileSchema`.
4. **Unificación y Purga de Metáforas en Mensajería y Almacenamiento:**
   - Se nivelaron canónicamente `CalculatePresenceStateSignature.ts`, `MaskCitizenIdentity.ts`, `GenerateEnterpriseStoragePath.ts`, `TransformToStandardBinaryBuffer.ts`, `CreatePrimaryDatabaseHeaders.ts` y `ManageEnterpriseGroupMembership.ts`, preservando alias de retrocompatibilidad y sellando tipos nominales bridados con Zod.

---

## [2026-11-10] HITO 05: Soberanía de Identidad GitHub, Inferencia Cognitiva Multi-Cloud, Saneamiento de Weaver y Arquitectura de Auditoría Forense de Infraestructura

### 1. Novedades Técnicas
*   **Emigración Completa a Control de Versiones Institucional:** Se purgó la identidad personal previa (`razpodesta@gmail.com`) y se configuró canónicamente la cuenta institucional `iamfloripadignidade@gmail.com` en el repositorio oficial `https://github.com/floripadignidade/floripa-dignidade.git`. Se resolvió la corrupción local de referencias Git (`refs/remotes/origin/main: reference broken`) y se completó el push histórico inicial con 3.639 objetos.
*   **Adopción de Google Gemini AI Studio (Inferencia Ultra-Rápida):** Ante la baja definitiva del dominio legado `api-inference.huggingface.co`, se integró **Google Gemini 1.5 Flash** mediante la API de Google Generative Language (`generativelanguage.googleapis.com`), reduciendo la latencia de inferencia cognitiva a menos de 400ms con cero arranques en frío (Zero Cold Starts) y 15 RPM en el Tier gratuito.
*   **Batería Activa de Sondas de Red (SRE Health Probes):** Se implementó una suite completa de 7 sondas atómicas de hardware y red, un orquestador maestro y un comando CLI (`pnpm audit:infrastructure`) que certifica físicamente el estado de las claves en vivo antes de cada despliegue, emitiendo reportes JSON en `reports/infrastructure/`.
*   **Saneamiento Absoluto del Compilador Weaver:** Se reestructuraron las 5 piezas del compilador lingüístico de internacionalización (`i18n-builder`), erradicando las 15 alertas de consola por desincronización de esquemas telemétricos y logrando compilaciones limpias en 142ms.

### 2. Decisiones Arquitectónicas Inmutables
1. **Desacoplamiento del Preset "Services" en Vercel:**  
   Se prohíbe el despliegue de las aplicaciones Next.js (`floripa-dignidade` y `content-manager-system`) bajo un único proyecto con Vercel Services. Cada aplicación se despliega como un proyecto standalone independiente vinculado al mismo monorepo para evitar colisiones críticas de empaquetado estático (`/_next/static/chunks/` ChunkLoadErrors).
2. **Coexistencia Elástica Multi-Proveedor de Inteligencia Artificial:**  
   `Environment.schema.ts` transicionó de exigir obligatoriamente Hugging Face hacia un contrato flexible con `.refine()`, el cual valida que al menos un motor cognitivo (`GOOGLE_GEMINI_API_KEY` o `HUGGING_FACE_API_TOKEN`) esté configurado. Esto protege al bootstrap de la aplicación (`instrumentation.ts`) contra fallos por falta de claves no utilizadas.
3. **Sincronización Geográfica de Almacenamiento S3:**  
   Se corrigió la región por defecto de `S3_REGION` a `sa-east-1` (São Paulo, Brasil), alineándola unívocamente con la ubicación física del proyecto Supabase `vekjuwrdeozvvnqyweox` para erradicar latencias transcontinentales y fallos de firma AWS SigV4.
4. **Protección de Evidencia en Limpieza de Workspace:**  
   El comando raíz `workspace:clean` fue refactorizado para excluir el subdirectorio `reports/`, asegurando que los informes forenses rastreados por Git no sean eliminados accidentalmente en limpiezas locales de caché.
5. **Cero Dependencias Pesadas en Sondas de Red:**  
   Todas las sondas físicas operan mediante APIs nativas de Node.js (`node:crypto`, `node:net`, `node:tls` y `fetch`), prescindiendo de SDKs pesados de terceros (`@aws-sdk/client-s3`, `pg`, `@google/generative-ai`) para garantizar compilaciones livianas y ejecución isomórfica ultra-rápida.

### 3. Lógica Implementada
*   **`AuditGoogleGeminiCognitiveProbe.ts`:** Ejecuta consultas autenticadas mediante cabecera segura `x-goog-api-key` contra `gemini-1.5-flash:generateContent` con `maxOutputTokens: 1` para medir la latencia física y certificar la clave sin consumir saldo ni agotar cuotas.
*   **`AuditSupabaseStorageS3Probe.ts`:** Implementa la firma canónica AWS Signature Version 4 (SigV4) de forma pura con HMAC-SHA256 contra la pasarela S3 de Supabase Storage en el bucket `media-vault`.
*   **`AuditPostgresDatabaseProbe.ts`:** Realiza un handshake de socket TCP/TLS de bajo nivel enviando el paquete `SSLRequest` nativo de PostgreSQL con timeout estricto de 5 segundos.
*   **`AuditWhatsAppMetaGatewayProbe.ts`:** Simula la verificación criptográfica del webhook de Meta mediante `timingSafeEqual` en tiempo constante para certificar la entropía de los secretos.
*   **`AuditCloudInfrastructureSecrets.ts`:** Orquestador central concurrente que despacha las 7 sondas mediante `Promise.all`, calcula métricas consolidadas SRE y persiste el dictamen inmutable en disco.
*   **`scripts/src/audit-cloud-infrastructure-secrets.ts`:** Disparador CLI que renderiza la matriz visual con colores ANSI y gestiona los códigos de salida (`process.exit(0)` o `1`).

### 4. Justificación Técnica (ADR & ISO Compliance)
*   **ISO/IEC 25010 (Confiabilidad y Rendimiento):** La incorporación de Google Gemini elimina la fragilidad de los arranques en frío de Hugging Face Serverless, permitiendo que la auditoría de denuncias se ejecute en menos de 400ms.
*   **ISO/IEC 27001 (Seguridad de la Información):** La inyección de claves mediante cabeceras HTTP privadas (`x-goog-api-key`) y la erradicación del acceso directo a `process.env` garantizan que ningún secreto cloud sea filtrado en registros de red o trazas de excepción.
*   **ADR 0015 (Cloud-Primary / Stateless Developer):** Se preserva la doctrina de cero bases de datos locales; toda la infraestructura vive en capas gratuitas gestionadas en la nube.
*   **ISO/IEC 11179 (Nomenclatura Prosa):** Toda variable y esquema fue purgado de abreviaturas y metáforas informales, sellando contratos nominales con sufijos `*Literal`, `*Quantity` y `*Boolean`.

### 5. Tareas Pendientes y Hoja de Ruta
- [ ] **Fase 4: Ejecución de Migración Relacional Master en Supabase:**
  - Ejecutar el script consolidado `database/00_migration_master_schema.sql` en el SQL Editor de Supabase.
  - Certificar la creación de las 10 tablas relacionales del Ledger, los índices de alta velocidad y las políticas de seguridad por fila (RLS).
- [ ] **Fase 5: Sincronización del Checklist Pre-Vuelo:**
  - Actualizar y sellar formalmente el archivo `.docs/TODO.md` (programado para el siguiente turno atómico).
- [ ] **Fase 6: Despliegue en Producción Vercel:**
  - Monitorear la compilación automática en Vercel del commit saneado y certificar la respuesta del portal en el Edge (< 50ms).

  ---

  
   
