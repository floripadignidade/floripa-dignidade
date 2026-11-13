# 🏛️ BITÁCORA DE ARQUITECTURA Y DECISIONES TÉCNICAS (OEDP-V18.1)

## [2026-11-09] HITO 01: Saneamiento de Grafo, Nivelación Source-First y Estabilización de Typecheck

### Contexto y Diagnóstico

Al ejecutar `pnpm typecheck` en el monorepo, 25 proyectos fallaron debido a 4 frentes de
desestabilización:

1. Punteros de compilación hacia rutas inexistentes (`libs/modules/pmf-open-data-engine/`).
2. Contaminación de bloques `references` inyectados por Nx en proyectos configurados con
   `noEmit: true`, provocando `TS6306` y `TS6310`.
3. Punteros residuales en `compilerOptions.paths` hacia archivos `.d.ts` en `dist/out-tsc/`,
   contradiciendo la doctrina Source-First y arrojando `TS2307`.
4. Archivos físicamente truncados en `libs/modules/municipal-open-data-engine/`.

### Decisiones Arquitectónicas Inmutables

1. **Unificación de Identidad Canónica (ISO 11179):**
   - El proyecto ubicado en `libs/engines/data-ingestion-engine/` asume la identidad
     `@floripa-dignidade/data-ingestion-engine`.
   - Se ajustan sus etiquetas a `scope:engines`, `type:data` y `platform:isomorphic`.
2. **Adopción Universal de Source-First (OEDP-V18.1):**
   - Se purgan todas las referencias `dist/out-tsc` en los archivos `tsconfig.lib.json`.
   - Se elimina la propiedad obsoleta `baseUrl` de todas las configuraciones TypeScript.
   - Las bibliotecas no emitirán binarios intermedios durante el typecheck (`noEmit: true`,
     `composite: false`), resolviendo dependencias directamente desde sus puntos de entrada
     `src/index.ts`.
3. **Erradicación de Referencias Compuestas en Proyectos Hoja:**
   - Se eliminan los bloques `"references": [...]` en aplicaciones (`apps/floripa-dignidade`,
     `apps/content-manager-system`) y librerías que no compilan mediante proyectos compuestos.
4. **Purga de Módulos Residuales:**
   - La lógica truncada de `libs/modules/municipal-open-data-engine/` se consolida en el motor
     canónico bajo `libs/engines/`, eliminando duplicidad.

   ***

   ## [2026-11-09] HITO 02: Nivelación Universal Source-First, Saneamiento de Datos Fiscales y Desacoplamiento de Grafo

### Contexto y Diagnóstico

Tras la auditoría forense del monorepo (Snapshot 683 archivos), se identificaron fallas críticas que
bloqueaban `pnpm typecheck` y amenazaban el despliegue en Vercel:

1. Fragmentación del motor fiscal municipal en 3 carpetas (`pmf-open-data-engine`,
   `municipal-open-data-engine` y `data-ingestion-engine`), con el archivo orquestador físicamente
   desconectado de su barril de exportación (`src/index.ts`).
2. Bucle de recursión circular infinito en `libs/shared/utility/tsconfig.json`
   (`"extends": "./tsconfig.json"`).
3. Residuos de compilación compuesta legada (`composite: true`, `noEmit: false`, `baseUrl: "."`,
   rutas a `dist/out-tsc`) en `shared/utility`, `modules/newsletter` y `shared/design-system`.
4. Referencias compuestas cruzadas residuales (`references: [...]`) en `interaction-engine` y
   `messaging-engine` apuntando a librerías con `noEmit: true`, arrojando `TS6306` y `TS6310`.
5. Atrapamiento accidental de excepciones de control de flujo de Next.js (`NEXT_REDIRECT`) dentro
   del bloque `try/catch` de `observatorio/gastos-publicos/page.tsx`.

### Decisiones Arquitectónicas Inmutables y Acciones Ejecutadas

1. **Consolidación Canónica de Ingesta Fiscal:**
   - Se estableció `libs/engines/data-ingestion-engine` como la única biblioteca autorizada
     (`scope:engines`, `type:data`).
   - Se materializó el orquestador `SyncMunicipalityExpenditure.ts` en
     `libs/engines/data-ingestion-engine/src/lib/logic/orchestrators/`, purgado de metáforas
     informales ("aduana"), tipado con tipos bridados y telemetría SRE.
   - Se actualizaron todos los consumidores del Observatorio (`page.tsx`, `ExpenditureTable.tsx`,
     `ExpenditureTableRow.tsx` y `CalculateObservatoryMetrics.ts`) para importar canónicamente desde
     `@floripa-dignidade/contracts` y `@floripa-dignidade/data-ingestion-engine`.
2. **Erradicación de Recursión Circular en `shared/utility`:**
   - Se restauró el Gatekeeper `libs/shared/utility/tsconfig.json` extendiendo limpiamente
     `../../../tsconfig.base.json` (`composite: false`, `noEmit: true`, `files: []`,
     `references: [{ "path": "./tsconfig.lib.json" }]`).
   - Se niveló `libs/shared/utility/tsconfig.lib.json` a Source-First puro, purgando `baseUrl`,
     `composite: true` y punteros a `dist/out-tsc`.
3. **Erradicación de Referencias Compuestas en Capa de Módulos:**
   - Se sanearon los archivos `tsconfig.lib.json` de `newsletter`, `design-system`,
     `interaction-engine` y `messaging-engine`, fijando `composite: false`, `noEmit: true`,
     `references: []` e inyectando tipos de React 19 donde correspondía.
4. **Sincronización Raíz de Alias (`tsconfig.base.json` y Apps):**
   - Se incorporó `@floripa-dignidade/data-ingestion-engine` en `tsconfig.base.json`, manteniendo
     temporalmente el puente `@floripa-dignidade/pmf-open-data-engine` para evitar roturas.
   - Se homogeneizaron y alfabetizaron los mapas `paths` en
     `apps/floripa-dignidade/tsconfig.app.json` y `apps/content-manager-system/tsconfig.app.json`,
     eliminando el alias obsoleto y el archivo fantasma `index.d.ts`.
5. **Inmunización de Redirección Perimetral en Next.js App Router:**
   - Se extrajo `await ValidateObservatoryAccess(...)` fuera del bloque `try/catch` de datos en la
     página del observatorio, permitiendo que la señal `NEXT_REDIRECT` de Next.js opere sin ser
     tratada como colapso de servidor.

   ***

   ## [2026-11-09] HITO 03: Diagnóstico de Sincronización Nx y Plan de Desacoplamiento de Dependencias Fantasma

### Contexto y Diagnóstico Forense

Al ejecutar `pnpm typecheck`, 22 proyectos compilaron nominalmente. Los 10 proyectos restantes
presentaron fallos atribuibles a tres factores externos:

1. El generador `@nx/js:typescript-sync` forzó interactivamente la inserción de bloques `references`
   en `apps/floripa-dignidade`, `identity` y `data-ingestion-engine`, colisionando con el estándar
   `noEmit: true` y arrojando `TS6306`/`TS6310`.
2. Aislamiento estricto de pnpm provocando `TS2307` por dependencias no elevadas a la raíz del
   monorepo (`exceljs`, `clsx`, `tailwind-merge`, `@radix-ui/react-slot`).
3. Declaración impropia de `@testing-library/jest-dom` en el array `types` de
   `tests/tsconfig.lib.json` provocando `TS2688`.

### Decisiones Arquitectónicas Inmutables

1. **Desactivación de `typescript-sync` en `nx.json`:** Se prohíbe la sincronización automática de
   referencias de proyecto para salvaguardar la doctrina Source-First.
2. **Elevación de Dependencias Críticas al Root:** Instalar a nivel de workspace (`-w`) los paquetes
   compartidos por múltiples librerías para garantizar resolución en cualquier contexto de
   compilación.
3. **Saneamiento Definitivo de Aplicaciones:** Ambas aplicaciones (`floripa-dignidade` y
   `content-manager-system`) quedan 100% purgadas de alias legados y archivos fantasmas.

---

## [2026-11-09] HITO 04: Purga Semántica OEDP-V18.1, Nivelación de Ingesta Fiscal y Cierre de Brechas de Persistencia

### Contexto y Diagnóstico Forense

Se ejecutó una auditoría integral de 10 dimensiones técnicas sobre el monorepo (Snapshot completo de
682 archivos), identificando focos residuales de inestabilidad, asimetría relacional y persistencia
de metáforas informales:

1. Simulación estática (_mock_) de partidas fiscales en `SyncMunicipalityExpenditure.ts`.
2. Asimetría en la clave primaria y rol RLS de `database/01_identity_identities_ledger.sql` frente a
   `database/migration_master_schema.sql` y el contrato `IdentityPhysicalRecordSchema`.
3. Ruta de importación rota (`TS2307`) en `UserIdentity.schema.ts` hacia un subdirectorio
   `schemas/UserAccessRole.schema.js` inexistente.
4. Divergencia en las firmas de presencia entre `CalculatePresenceSovereignSignature.ts` (JSON) y
   `CalculatePresenceStateSignature.ts` (concatenación por tuberías `|`).
5. Persistencia de la metáfora prohibida `"Sovereign"` en aparatos clave de utilidad y mensajería
   (`MaskSovereignIdentity.ts`, `GenerateSovereignStoragePath.ts`, `TransformToSovereignBinary.ts`,
   `CreateSovereignDatabaseHeaders.ts`, `ManageSovereignMembership.ts`).

### Decisiones Arquitectónicas Inmutables y Acciones Ejecutadas

1. **Adquisición HTTP de Gastos Públicos con Resiliencia SRE:**
   - Se refactorizó `SyncMunicipalityExpenditure.ts`, implementando un cliente de red con
     `AbortSignal.timeout(8000)` y contingencia certificada de referencia institucional ante caídas
     de los portales gubernamentales.
2. **Saneamiento Relacional del Ledger de Identidades:**
   - Se homologó `01_identity_identities_ledger.sql` a `citizen_id UUID PRIMARY KEY`, alineando las
     columnas con `IIdentityPhysicalRecord` y corrigiendo la política RLS hacia
     `INFRASTRUCTURE_ADMINISTRATIVE_AUDITOR`.
3. **Reparación del SSOT de Identidad Civil:**
   - Se corrigió la importación de `UserAccessRoleSchema` en `UserIdentity.schema.ts`, eliminando
     abreviaciones en transformadores y asegurando exportación simétrica con
     `IdentityProfileSchema`.
4. **Unificación y Purga de Metáforas en Mensajería y Almacenamiento:**
   - Se nivelaron canónicamente `CalculatePresenceStateSignature.ts`, `MaskCitizenIdentity.ts`,
     `GenerateEnterpriseStoragePath.ts`, `TransformToStandardBinaryBuffer.ts`,
     `CreatePrimaryDatabaseHeaders.ts` y `ManageEnterpriseGroupMembership.ts`, preservando alias de
     retrocompatibilidad y sellando tipos nominales bridados con Zod.

   ***

   ## [2026-11-10] HITO 05: Migración de Identidad Institucional GitHub, Saneamiento de Manifiestos y Construcción del Enjambre de Auditoría Cloud

### Contexto y Diagnóstico Forense

1. Migración del repositorio remoto desde la cuenta personal previa hacia la organización oficial
   `floripadignidade/floripa-dignidade.git`, resolviendo la corrupción local de referencias Git
   (`refs/remotes/origin/main: reference broken`).
2. Despliegue en Vercel estabilizado mediante la elevación de `tsx: "^4.19.0"` a `devDependencies`
   en el `package.json` raíz y flexibilización de `engines: { "node": ">=20.9.0" }`.
3. Saneamiento de colisión crítica en `apps/floripa-dignidade/package.json` (sobrescrito
   accidentalmente con el manifiesto raíz) y purga de la carpeta recursiva parásita en
   `libs/tools/.../probes/libs`.

### Decisiones Arquitectónicas Inmutables y Acciones Ejecutadas

1. **Arquitectura de Sondas de Red Activas (Infrastructure Auditor):**
   - Se construyó el contrato formal inmutable `CloudInfrastructureAuditReportSchema`.
   - Se crearon las 6 sondas de red individuales con tipado nominal y telemetría SRE:
     - `AuditPostgresDatabaseProbe.ts`: Handshake SSL nativo (paquete `SSLRequest` FE/BE de
       Postgres) con timeout de 5s.
     - `AuditSupabaseRestProbe.ts`: Consulta REST ping a `/rest/v1/` con clave de servicio.
     - `AuditSupabaseStorageS3Probe.ts`: Firma criptográfica pura AWS Signature Version 4 (SigV4)
       mediante `node:crypto`.
     - `AuditResendEmailProbe.ts`: Validación de API Key y certificación de estado de dominio
       remitente.
     - `AuditHuggingFaceCognitiveProbe.ts`: Pulso de inferencia SLM con detección de Cold Start
       (`HTTP 503`).
     - `AuditWhatsAppMetaGatewayProbe.ts`: Auditoría de entropía y apretón de manos HMAC-SHA256 en
       tiempo constante.
2. **Orquestación Central de Auditoría:**
   - Se construyó `AuditCloudInfrastructureSecrets.ts` para ejecución concurrente y volcado
     estructurado a `reports/infrastructure/`.

   ***

## [2026-11-09] HITO 01: Saneamiento de Grafo, Nivelación Source-First y Estabilización de Typecheck

### Contexto y Diagnóstico

Al ejecutar `pnpm typecheck` en el monorepo, 25 proyectos fallaron debido a 4 frentes de
desestabilización:

1. Punteros de compilación hacia rutas inexistentes (`libs/modules/pmf-open-data-engine/`).
2. Contaminación de bloques `references` inyectados por Nx en proyectos configurados con
   `noEmit: true`, provocando `TS6306` y `TS6310`.
3. Punteros residuales en `compilerOptions.paths` hacia archivos `.d.ts` en `dist/out-tsc/`,
   contradiciendo la doctrina Source-First y arrojando `TS2307`.
4. Archivos físicamente truncados en `libs/modules/municipal-open-data-engine/`.

### Decisiones Arquitectónicas Inmutables

1. **Unificación de Identidad Canónica (ISO 11179):**
   - El proyecto ubicado en `libs/engines/data-ingestion-engine/` asume la identidad
     `@floripa-dignidade/data-ingestion-engine`.
   - Se ajustan sus etiquetas a `scope:engines`, `type:data` y `platform:isomorphic`.
2. **Adopción Universal de Source-First (OEDP-V18.1):**
   - Se purgan todas las referencias `dist/out-tsc` en los archivos `tsconfig.lib.json`.
   - Se elimina la propiedad obsoleta `baseUrl` de todas las configuraciones TypeScript.
   - Las bibliotecas no emitirán binarios intermedios durante el typecheck (`noEmit: true`,
     `composite: false`), resolviendo dependencias directamente desde sus puntos de entrada
     `src/index.ts`.
3. **Erradicación de Referencias Compuestas en Proyectos Hoja:**
   - Se eliminan los bloques `"references": [...]` en aplicaciones (`apps/floripa-dignidade`,
     `apps/content-manager-system`) y librerías que no compilan mediante proyectos compuestos.
4. **Purga de Módulos Residuales:**
   - La lógica truncada de `libs/modules/municipal-open-data-engine/` se consolida en el motor
     canónico bajo `libs/engines/`, eliminando duplicidad.

---

## [2026-11-09] HITO 02: Nivelación Universal Source-First, Saneamiento de Datos Fiscales y Desacoplamiento de Grafo

### Contexto y Diagnóstico

Tras la auditoría forense del monorepo (Snapshot 683 archivos), se identificaron fallas críticas que
bloqueaban `pnpm typecheck` y amenazaban el despliegue en Vercel:

1. Fragmentación del motor fiscal municipal en 3 carpetas (`pmf-open-data-engine`,
   `municipal-open-data-engine` y `data-ingestion-engine`), con el archivo orquestador físicamente
   desconectado de su barril de exportación (`src/index.ts`).
2. Bucle de recursión circular infinito en `libs/shared/utility/tsconfig.json`
   (`"extends": "./tsconfig.json"`).
3. Residuos de compilación compuesta legada (`composite: true`, `noEmit: false`, `baseUrl: "."`,
   rutas a `dist/out-tsc`) en `shared/utility`, `modules/newsletter` y `shared/design-system`.
4. Referencias compuestas cruzadas residuales (`references: [...]`) en `interaction-engine` y
   `messaging-engine` apuntando a librerías con `noEmit: true`, arrojando `TS6306` y `TS6310`.
5. Atrapamiento accidental de excepciones de control de flujo de Next.js (`NEXT_REDIRECT`) dentro
   del bloque `try/catch` de `observatorio/gastos-publicos/page.tsx`.

### Decisiones Arquitectónicas Inmutables y Acciones Ejecutadas

1. **Consolidación Canónica de Ingesta Fiscal:**
   - Se estableció `libs/engines/data-ingestion-engine` como la única biblioteca autorizada
     (`scope:engines`, `type:data`).
   - Se materializó el orquestador `SyncMunicipalityExpenditure.ts` en
     `libs/engines/data-ingestion-engine/src/lib/logic/orchestrators/`, purgado de metáforas
     informales, tipado con tipos bridados y telemetría SRE.
   - Se actualizaron todos los consumidores del Observatorio (`page.tsx`, `ExpenditureTable.tsx`,
     `ExpenditureTableRow.tsx` y `CalculateObservatoryMetrics.ts`) para importar canónicamente desde
     `@floripa-dignidade/contracts` y `@floripa-dignidade/data-ingestion-engine`.
2. **Erradicación de Recursión Circular en `shared/utility`:**
   - Se restauró el Gatekeeper `libs/shared/utility/tsconfig.json` extendiendo limpiamente
     `../../../tsconfig.base.json` (`composite: false`, `noEmit: true`, `files: []`,
     `references: [{ "path": "./tsconfig.lib.json" }]`).
   - Se niveló `libs/shared/utility/tsconfig.lib.json` a Source-First puro, purgando `baseUrl`,
     `composite: true` y punteros a `dist/out-tsc`.
3. **Erradicación de Referencias Compuestas en Capa de Módulos:**
   - Se sanearon los archivos `tsconfig.lib.json` de `newsletter`, `design-system`,
     `interaction-engine` y `messaging-engine`, fijando `composite: false`, `noEmit: true`,
     `references: []` e inyectando tipos de React 19 donde correspondía.
4. **Sincronización Raíz de Alias (`tsconfig.base.json` y Apps):**
   - Se incorporó `@floripa-dignidade/data-ingestion-engine` en `tsconfig.base.json`, manteniendo
     temporalmente el puente `@floripa-dignidade/pmf-open-data-engine` para evitar roturas.
   - Se homogeneizaron y alfabetizaron los mapas `paths` en
     `apps/floripa-dignidade/tsconfig.app.json` y `apps/content-manager-system/tsconfig.app.json`,
     eliminando el alias obsoleto y el archivo fantasma `index.d.ts`.
5. **Inmunización de Redirección Perimetral en Next.js App Router:**
   - Se extrajo `await ValidateObservatoryAccess(...)` fuera del bloque `try/catch` de datos en la
     página del observatorio, permitiendo que la señal `NEXT_REDIRECT` de Next.js opere sin ser
     tratada como colapso de servidor.

---

## [2026-11-09] HITO 03: Diagnóstico de Sincronización Nx y Plan de Desacoplamiento de Dependencias Fantasma

### Contexto y Diagnóstico Forense

Al ejecutar `pnpm typecheck`, 22 proyectos compilaron nominalmente. Los 10 proyectos restantes
presentaron fallos atribuibles a tres factores externos:

1. El generador `@nx/js:typescript-sync` forzó interactivamente la inserción de bloques `references`
   en `apps/floripa-dignidade`, `identity` y `data-ingestion-engine`, colisionando con el estándar
   `noEmit: true` y arrojando `TS6306`/`TS6310`.
2. Aislamiento estricto de pnpm provocando `TS2307` por dependencias no elevadas a la raíz del
   monorepo (`exceljs`, `clsx`, `tailwind-merge`, `@radix-ui/react-slot`).
3. Declaración impropia de `@testing-library/jest-dom` en el array `types` de
   `tests/tsconfig.lib.json` provocando `TS2688`.

### Decisiones Arquitectónicas Inmutables

1. **Desactivación de `typescript-sync` en `nx.json`:** Se prohíbe la sincronización automática de
   referencias de proyecto para salvaguardar la doctrina Source-First.
2. **Elevación de Dependencias Críticas al Root:** Instalar a nivel de workspace (`-w`) los paquetes
   compartidos por múltiples librerías para garantizar resolución en cualquier contexto de
   compilación.
3. **Saneamiento Definitivo de Aplicaciones:** Ambas aplicaciones (`floripa-dignidade` y
   `content-manager-system`) quedan 100% purgadas de alias legados y archivos fantasmas.

---

## [2026-11-09] HITO 04: Purga Semántica OEDP-V18.1, Nivelación de Ingesta Fiscal y Cierre de Brechas de Persistencia

### Contexto y Diagnóstico Forense

Se ejecutó una auditoría integral de 10 dimensiones técnicas sobre el monorepo (Snapshot completo de
682 archivos), identificando focos residuales de inestabilidad, asimetría relacional y persistencia
de metáforas informales:

1. Simulación estática (_mock_) de partidas fiscales en `SyncMunicipalityExpenditure.ts`.
2. Asimetría en la clave primaria y rol RLS de `database/01_identity_identities_ledger.sql` frente a
   `database/migration_master_schema.sql` y el contrato `IdentityPhysicalRecordSchema`.
3. Ruta de importación rota (`TS2307`) en `UserIdentity.schema.ts` hacia un subdirectorio
   `schemas/UserAccessRole.schema.js` inexistente.
4. Divergencia en las firmas de presencia entre `CalculatePresenceSovereignSignature.ts` (JSON) y
   `CalculatePresenceStateSignature.ts` (concatenación por tuberías `|`).
5. Persistencia de la metáfora prohibida `"Sovereign"` en aparatos clave de utilidad y mensajería
   (`MaskSovereignIdentity.ts`, `GenerateSovereignStoragePath.ts`, `TransformToSovereignBinary.ts`,
   `CreateSovereignDatabaseHeaders.ts`, `ManageSovereignMembership.ts`).

### Decisiones Arquitectónicas Inmutables y Acciones Ejecutadas

1. **Adquisición HTTP de Gastos Públicos con Resiliencia SRE:**
   - Se refactorizó `SyncMunicipalityExpenditure.ts`, implementando un cliente de red con
     `AbortSignal.timeout(8000)` y contingencia certificada de referencia institucional ante caídas
     de los portales gubernamentales.
2. **Saneamiento Relacional del Ledger de Identidades:**
   - Se homologó `01_identity_identities_ledger.sql` a `citizen_id UUID PRIMARY KEY`, alineando las
     columnas con `IIdentityPhysicalRecord` y corrigiendo la política RLS hacia
     `INFRASTRUCTURE_ADMINISTRATIVE_AUDITOR`.
3. **Reparación del SSOT de Identidad Civil:**
   - Se corrigió la importación de `UserAccessRoleSchema` en `UserIdentity.schema.ts`, eliminando
     abreviaciones en transformadores y asegurando exportación simétrica con
     `IdentityProfileSchema`.
4. **Unificación y Purga de Metáforas en Mensajería y Almacenamiento:**
   - Se nivelaron canónicamente `CalculatePresenceStateSignature.ts`, `MaskCitizenIdentity.ts`,
     `GenerateEnterpriseStoragePath.ts`, `TransformToStandardBinaryBuffer.ts`,
     `CreatePrimaryDatabaseHeaders.ts` y `ManageEnterpriseGroupMembership.ts`, preservando alias de
     retrocompatibilidad y sellando tipos nominales bridados con Zod.

---

## [2026-11-10] HITO 05: Soberanía de Identidad GitHub, Inferencia Cognitiva Multi-Cloud, Saneamiento de Weaver y Arquitectura de Auditoría Forense de Infraestructura

### 1. Novedades Técnicas

- **Emigración Completa a Control de Versiones Institucional:** Se purgó la identidad personal
  previa (`razpodesta@gmail.com`) y se configuró canónicamente la cuenta institucional
  `iamfloripadignidade@gmail.com` en el repositorio oficial
  `https://github.com/floripadignidade/floripa-dignidade.git`. Se resolvió la corrupción local de
  referencias Git (`refs/remotes/origin/main: reference broken`) y se completó el push histórico
  inicial con 3.639 objetos.
- **Adopción de Google Gemini AI Studio (Inferencia Ultra-Rápida):** Ante la baja definitiva del
  dominio legado `api-inference.huggingface.co`, se integró **Google Gemini 1.5 Flash** mediante la
  API de Google Generative Language (`generativelanguage.googleapis.com`), reduciendo la latencia de
  inferencia cognitiva a menos de 400ms con cero arranques en frío (Zero Cold Starts) y 15 RPM en el
  Tier gratuito.
- **Batería Activa de Sondas de Red (SRE Health Probes):** Se implementó una suite completa de 7
  sondas atómicas de hardware y red, un orquestador maestro y un comando CLI
  (`pnpm audit:infrastructure`) que certifica físicamente el estado de las claves en vivo antes de
  cada despliegue, emitiendo reportes JSON en `reports/infrastructure/`.
- **Saneamiento Absoluto del Compilador Weaver:** Se reestructuraron las 5 piezas del compilador
  lingüístico de internacionalización (`i18n-builder`), erradicando las 15 alertas de consola por
  desincronización de esquemas telemétricos y logrando compilaciones limpias en 142ms.

### 2. Decisiones Arquitectónicas Inmutables

1. **Desacoplamiento del Preset "Services" en Vercel:**  
   Se prohíbe el despliegue de las aplicaciones Next.js (`floripa-dignidade` y
   `content-manager-system`) bajo un único proyecto con Vercel Services. Cada aplicación se
   despliega como un proyecto standalone independiente vinculado al mismo monorepo para evitar
   colisiones críticas de empaquetado estático (`/_next/static/chunks/` ChunkLoadErrors).
2. **Coexistencia Elástica Multi-Proveedor de Inteligencia Artificial:**  
   `Environment.schema.ts` transicionó de exigir obligatoriamente Hugging Face hacia un contrato
   flexible con `.refine()`, el cual valida que al menos un motor cognitivo (`GOOGLE_GEMINI_API_KEY`
   o `HUGGING_FACE_API_TOKEN`) esté configurado. Esto protege al bootstrap de la aplicación
   (`instrumentation.ts`) contra fallos por falta de claves no utilizadas.
3. **Sincronización Geográfica de Almacenamiento S3:**  
   Se corrigió la región por defecto de `S3_REGION` a `sa-east-1` (São Paulo, Brasil), alineándola
   unívocamente con la ubicación física del proyecto Supabase `vekjuwrdeozvvnqyweox` para erradicar
   latencias transcontinentales y fallos de firma AWS SigV4.
4. **Protección de Evidencia en Limpieza de Workspace:**  
   El comando raíz `workspace:clean` fue refactorizado para excluir el subdirectorio `reports/`,
   asegurando que los informes forenses rastreados por Git no sean eliminados accidentalmente en
   limpiezas locales de caché.
5. **Cero Dependencias Pesadas en Sondas de Red:**  
   Todas las sondas físicas operan mediante APIs nativas de Node.js (`node:crypto`, `node:net`,
   `node:tls` y `fetch`), prescindiendo de SDKs pesados de terceros (`@aws-sdk/client-s3`, `pg`,
   `@google/generative-ai`) para garantizar compilaciones livianas y ejecución isomórfica
   ultra-rápida.

### 3. Lógica Implementada

- **`AuditGoogleGeminiCognitiveProbe.ts`:** Ejecuta consultas autenticadas mediante cabecera segura
  `x-goog-api-key` contra `gemini-1.5-flash:generateContent` con `maxOutputTokens: 1` para medir la
  latencia física y certificar la clave sin consumir saldo ni agotar cuotas.
- **`AuditSupabaseStorageS3Probe.ts`:** Implementa la firma canónica AWS Signature Version 4 (SigV4)
  de forma pura con HMAC-SHA256 contra la pasarela S3 de Supabase Storage en el bucket
  `media-vault`.
- **`AuditPostgresDatabaseProbe.ts`:** Realiza un handshake de socket TCP/TLS de bajo nivel enviando
  el paquete `SSLRequest` nativo de PostgreSQL con timeout estricto de 5 segundos.
- **`AuditWhatsAppMetaGatewayProbe.ts`:** Simula la verificación criptográfica del webhook de Meta
  mediante `timingSafeEqual` en tiempo constante para certificar la entropía de los secretos.
- **`AuditCloudInfrastructureSecrets.ts`:** Orquestador central concurrente que despacha las 7
  sondas mediante `Promise.all`, calcula métricas consolidadas SRE y persiste el dictamen inmutable
  en disco.
- **`scripts/src/audit-cloud-infrastructure-secrets.ts`:** Disparador CLI que renderiza la matriz
  visual con colores ANSI y gestiona los códigos de salida (`process.exit(0)` o `1`).

### 4. Justificación Técnica (ADR & ISO Compliance)

- **ISO/IEC 25010 (Confiabilidad y Rendimiento):** La incorporación de Google Gemini elimina la
  fragilidad de los arranques en frío de Hugging Face Serverless, permitiendo que la auditoría de
  denuncias se ejecute en menos de 400ms.
- **ISO/IEC 27001 (Seguridad de la Información):** La inyección de claves mediante cabeceras HTTP
  privadas (`x-goog-api-key`) y la erradicación del acceso directo a `process.env` garantizan que
  ningún secreto cloud sea filtrado en registros de red o trazas de excepción.
- **ADR 0015 (Cloud-Primary / Stateless Developer):** Se preserva la doctrina de cero bases de datos
  locales; toda la infraestructura vive en capas gratuitas gestionadas en la nube.
- **ISO/IEC 11179 (Nomenclatura Prosa):** Toda variable y esquema fue purgado de abreviaturas y
  metáforas informales, sellando contratos nominales con sufijos `*Literal`, `*Quantity` y
  `*Boolean`.

### 5. Tareas Pendientes y Hoja de Ruta

- [ ] **Fase 4: Ejecución de Migración Relacional Master en Supabase:**
  - Ejecutar el script consolidado `database/00_migration_master_schema.sql` en el SQL Editor de
    Supabase.
  - Certificar la creación de las 10 tablas relacionales del Ledger, los índices de alta velocidad y
    las políticas de seguridad por fila (RLS).
- [ ] **Fase 5: Sincronización del Checklist Pre-Vuelo:**
  - Actualizar y sellar formalmente el archivo `.docs/TODO.md` (programado para el siguiente turno
    atómico).
- [ ] **Fase 6: Despliegue en Producción Vercel:**
  - Monitorear la compilación automática en Vercel del commit saneado y certificar la respuesta del
    portal en el Edge (< 50ms).

  ***

  ## [2026-11-11] HITO 06: Erradicación de Errores de Turbopack, Nivelación de Rutas en Vercel, Resiliencia de RootLayout y Manifiesto de Activos Gráficos

### 1. Diagnóstico Forense y Desafíos Resueltos

1. **Erradicación de 8 Errores de Turbopack en Next.js 16:**  
   Se eliminaron las extensiones sintéticas `.js` en las importaciones relativas de código fuente
   dentro de `environment-validator`, `telemetry` y `shared-utility`. El motor de resolución directa
   bajo `moduleResolution: "bundler"` opera ahora con Rutas Limpias (Extensionless).
2. **Nivelación SRE de Sondas de Red y Reducción de Complejidad:**  
   Se atomizó la lógica de decisión en `AuditHuggingFaceCognitiveProbe.ts` y
   `AuditResendEmailProbe.ts`, reduciendo la complejidad ciclomática de 12 y 11 a $\le 3$,
   cumpliendo con el límite máximo de 10 de ESLint. Se corrigió la variable huérfana de timestamp en
   `AuditCloudInfrastructureSecrets.ts`.
3. **Migración a la Convención Next.js 16 Proxy:**  
   Se transicionó `src/middleware.ts` a `src/proxy.ts`, exportando formalmente la función `proxy` y
   suprimiendo la advertencia de deprecación en la plataforma Vercel.
4. **Resolución de la Geometría de Salida en Vercel (`NEXT_NO_ROUTES_MANIFEST`):**  
   Se identificó que el compilador `@nx/next:build` deposita los artefactos de Next.js en
   `/dist/apps/floripa-dignidade/.next`. Al fijar en Vercel el `Output Directory` en
   `../../dist/apps/floripa-dignidade/.next`, el sistema ubicó inmediatamente el
   `routes-manifest.json` y cerró la compilación en verde.
5. **Erradicación de la "Pantalla en Blanco" en el Frontend:**  
   Se diagnosticó que el colapso visual en `/pt-BR` era provocado por una llamada a `notFound()` en
   `RootLayout` ante claves de diccionario no ensambladas por el Weaver (`shared/composite-ui`). Se
   blindó `RootLayout` con un fallback lingüístico institucional inmutable en memoria, garantizando
   que las etiquetas `<html>` y `<body>` siempre se emitan.
6. **Promulgación del Manifiesto de Activos Gráficos (ADR 0028):**  
   Se estructuró la topología jerárquica para la carpeta `public/` (logos horizontales, verticales,
   símbolos, favicons multi-resolución, iconos PWA maskable de 192px/512px y tarjetas
   OpenGraph/Twitter).

### 2. Decisiones Arquitectónicas Inmutables

- **Inmunidad Estructural en RootLayout:** Queda estrictamente prohibido invocar `notFound()` o
  lanzar excepciones no contenidas dentro del layout raíz (`src/app/layout.tsx`). Si un diccionario
  falla, se inyecta el `FALLBACK_HEADER_DICTIONARY_COLLECTION` y se emite una señal telemétrica SRE
  de advertencia.
- **Rutas Limpias Mandatorias:** Todo archivo TypeScript dentro de `libs/` y `apps/` debe utilizar
  importaciones relativas limpias sin extensión `.js`.

---

---

## [2026-11-12] HITO 07: Alineamiento de CMS Payload, Atomización Multimedia, Blindaje Prettier y Auditoría Integral de Silos i18n

### 1. Contexto y Diagnóstico Forense

Durante la auditoría pre-despliegue sobre el snapshot integral del monorepo (`730` archivos), se
detectaron cinco focos de riesgo operativo antes de ejecutar la batería de certificación
(`pnpm preflight`) y construir ambas aplicaciones en Vercel:

1. **`apps/content-manager-system/package.json`:** Carecía de `scripts` locales (`dev`, `build`,
   `start`, `lint`, `typecheck`), restricción `engines`, versión alineada de `next` (`~16.1.6` vs
   `~16.1.7` en raíz/portal) y omitía 3 dependencias directas consumidas en `src/`
   (`@floripa-dignidade/contracts`, `@payloadcms/storage-s3`, `lucide-react`), con riesgo de fallo
   bajo `pnpm` estricto.
2. **`apps/content-manager-system/eslint.config.mjs`:** Ubicaba `ignores` al final del Flat Config y
   carecía de overrides de `projectService: false` para archivos de configuración
   (`next.config.js`), rompiendo paridad con el portal.
3. **Colecciones del CMS (`Organizations.collection.ts` y `MediaVault.collection.ts`):** Mantenían
   el rol legado `'INFRASTRUCTURE_SOVEREIGN_AUDITOR'` (incompatible con
   `IDENTITY_ACCESS_ROLES_COLLECTION.INFRASTRUCTURE_ADMINISTRATIVE_AUDITOR`), emitían señales a
   `EmitTelemetrySignal` con propiedades obsoletas rechazadas silenciosamente por
   `TelemetrySignalSchema`, y `MediaVault` concentraba 4 responsabilidades en 162 líneas.
4. **Colisión determinista en `pnpm preflight` (`format:check`):** `.prettierignore` no excluía
   `pnpm-lock.yaml`, `reports/` ni `apps/floripa-dignidade/src/app/i18n/dictionaries/`, provocando
   fallos inmediatos tras ejecutarse `pnpm audit:workspace` o `pnpm weaver:build` (que generan JSON
   sin salto de línea final).
5. **Brecha crítica de diccionarios i18n en `apps/floripa-dignidade` y `libs/`:** Se constató que
   `apps/floripa-dignidade/src/app/[locale]/layout.tsx`, `[locale]/page.tsx` y
   `[locale]/newsletter/welcome/page.tsx` invocan `ValidateLinguisticContract` contra claves y
   secciones aún inexistentes en los JSON compilados (`shared/composite-ui`, `shared/ui-primitives`,
   `apps/frontpage`, `supportSection`), además de 4 silos en `libs/` sin archivos JSON
   (`search-engine`, `interaction-engine`, `whatsapp`, `build-auditor`) y 3 esquemas desfasados
   respecto a sus JSON.

### 2. Decisiones Arquitectónicas y Cambios Aplicados

1. **Nivelación de Manifiesto y Linter del CMS (`apps/content-manager-system`):**
   - Declaración completa de `scripts`, `engines` y dependencias reales en `package.json` con
     `next: ~16.1.7`.
   - Reordenamiento de `ignores` al inicio de `eslint.config.mjs` (incluyendo `**/payload-types.ts`
     y `**/next-env.d.ts`) e incorporación de `cms-environment-exceptions` y
     `cms-config-files-override`.
2. **Saneamiento RBAC y Atomización SRP en Colecciones del CMS:**
   - `Organizations.collection.ts`: Alineado con `IDENTITY_ACCESS_ROLES_COLLECTION`
     (`@floripa-dignidade/contracts`), validadores puros de slug URL-safe y color hexadecimal (ADR
     0029), y telemetría conforme a `TelemetrySignalSchema` con trazabilidad de operador
     (`perpetratorIdentityLiteral`).
   - `MediaVault.collection.ts`: Pulverizado en 4 átomos bajo
     `src/collections/infrastructure/media-vault/` (`MediaVaultAccessPolicy.ts`,
     `MediaVaultUploadConfig.ts`, `MediaVaultFields.ts`, `MediaVaultForensicHooks.ts`) más
     orquestador limpio, añadiendo auditoría `afterDelete` y validación WCAG de
     `alternativeTextLiteral`.
3. **Blindaje de `.prettierignore`:**
   - Exclusión de `pnpm-lock.yaml`, `node_modules`, directorios de caché/salida,
     `**/payload-types.ts`, `**/next-env.d.ts`, `reports/` y
     `apps/floripa-dignidade/src/app/i18n/dictionaries/`.

### 3. Evidencia de Verificación Ejecutada (Parcial en Curso)

- `pnpm purge:emissions:ci`: **APROBADO** (higiene Source-First en `libs/`).
- `pnpm audit:workspace`: **APROBADO** (`32/32` workspaces conformantes, `0` desalineados).
- `pnpm weaver:build`: **APROBADO** (`194.5 ms`, `15` silos procesados, `3` diccionarios
  persistidos).
- `pnpm format:check`: **PENDIENTE DE RE-EJECUCIÓN** tras guardar `.prettierignore` y correr
  `pnpm format:write` desde el directorio raíz `floripa-dignidade`.
- `pnpm lint`, `pnpm typecheck`, `pnpm test:unit`, `pnpm build:portal`, `pnpm build:cms`:
  **PENDIENTES DE CERTIFICACIÓN FINAL**.

---

## [2026-11-13] HITO 08: Consolidación SSOT Multi-Idioma (ADR 0030), Resiliencia de Estado Local (ADR 0025) y Blindaje de Límites Modulares

### 1. Contexto y Diagnóstico Forense

1. **Desacople de Límites Modulares (`scope:shared` vs `scope:core`):**
   - `@floripa-dignidade/routing` (`scope:core`) comenzó a consumir el catálogo único de idiomas
     desde `@floripa-dignidade/contracts`, el cual poseía la etiqueta `scope:shared` bajo una regla
     raíz que restringía `scope:core` exclusivamente a `scope:core`, además de carecer de
     exportación en `libs/contracts/src/index.ts`, del alias `ISupportedLocale` y de la declaración
     de dependencia en `libs/core/routing/package.json`.
2. **Brechas en `@floripa-dignidade/shared-state-store`:**
   - `GlobalState.schema.ts` mantenía un `z.enum(['pt-BR', 'es-ES', 'en-US'])` hardcodeado y carecía
     de un `GlobalStateSchema` compuesto validable en runtime.
   - `StateHydrationAuditor.ts` y `createSyncSentrySlice.ts` emitían señales a `EmitTelemetrySignal`
     sin `occurrenceTimestampISO` en la raíz del payload, causando su descarte silencioso en
     `TelemetrySignalSchema`.
   - `GlobalInfrastructureStateStore.ts` utilizaba un casteo `null as unknown as Storage` sin
     protección ante `SecurityError`/`QuotaExceededError` ni función `migrate` versionada.

### 2. Decisiones Arquitectónicas y Cambios Ejecutados

1. **Soberanía de Capa 0 en `@floripa-dignidade/contracts`:**
   - Promoción de `libs/contracts/project.json` a `scope:contracts`, corrección de `$schema`
     (`../../node_modules/...`) e incorporación del target `typecheck` sobre `tsconfig.json`.
   - Creación de `LocalesRegistryIntegrity.schema.ts` (unicidad de códigos BCP 47, existencia única
     de idioma default activo y validez referencial de fallbacks) y actualización de
     `SupportedLocales.schema.ts` (exportación de `ISupportedLocale`, `ICatalogedLocale` y
     `ACTIVE_LOCALES_ENTRIES_COLLECTION`).
   - Extracción de esquemas operacionales de identidad a `IdentityOperations.schema.ts`, reemplazo
     de `export *` por exportaciones nominales explícitas (erradicando riesgo `TS2308`) y exposición
     del `@domain 3. INTERNATIONALIZATION` en `libs/contracts/src/index.ts`.
   - Actualización de `eslint.config.mjs` autorizando `scope:contracts` como nodo hoja transversal
     para `scope:core`, `scope:shared`, `scope:engines` y `scope:modules`, y restaurando el bloqueo
     de `type:data` dentro de `type:ui` (ADR 0003).
2. **Nivelación de `@floripa-dignidade/routing`:**
   - Declaración formal de `@floripa-dignidade/contracts` en `libs/core/routing/package.json` y
     alineación de `peerDependencies.next` a `~16.1.7`.
3. **Atomización Integral de `@floripa-dignidade/shared-state-store` (ADR 0025 / ADR 0030):**
   - Declaración de `@floripa-dignidade/contracts` y `zod` en `package.json`.
   - Pulverización de `GlobalState.schema.ts` en 3 átomos de dominio (`StateIdentityAndPresence`,
     `UiAndPreferencesState` conectado al SSOT BCP 47, `GovernanceAndResilienceState`) más el
     esquema compuesto `GlobalStateSchema`.
   - Refactorización de `StateHydrationAuditor.ts` (`PersistedStateSnapshot.schema.ts`,
     `ValidateRehydratedStateSnapshot.ts`, `EmitHydrationAuditSignal.ts` y silo
     `i18n/<locale>/hydration.json`).
   - Refactorización de `createSyncSentrySlice.ts` (`EmitNetworkConnectivitySignal.ts` y silo
     `i18n/<locale>/connectivity.json`).
   - Nivelación de `GlobalInfrastructureStateStore.ts` (`StateStoreConfiguration.ts`,
     `ResolveSafeClientStorage.ts` con migración transparente desde `fd-sovereign-vault-v2`, y
     `MigratePersistedStoreState.ts` validado con Zod).

     ***

     ## [2026-11-13] HITO 09: Certificación Global de Linter y Typecheck (32/32), Diagnóstico de SWC y Nivelación del Módulo Espejo de Pruebas (`qa-mirror`)

### 1. Contexto y Diagnóstico Forense

Tras completar la nivelación multi-idioma (ADR 0030) y de estado local (ADR 0025), se inició la
batería de certificación pre-vuelo sobre el monorepo:

1. **Bloqueo de ejecución en `pnpm test:unit` (`@floripa-dignidade/qa-mirror:test`):**
   - `@swc/jest` falló sobre `tests/src/lib/core/exceptions/GlobalBaseException.spec.ts` con el
     error `cannot process file because it's ignored by .swcrc`, debido a que `@swc/core` leía por
     defecto el `.swcrc` raíz (cuyo campo `exclude` filtra `*.spec.ts`, `*.test.ts`, `*.js` y
     `jest.config.ts` para proteger las compilaciones de librerías con `@nx/js:swc`).
2. **Desalineación de resolución en `tests/jest.config.ts`:**
   - El patrón comodín `^@floripa-dignidade/(.*)$ -> <rootDir>/libs/$1/src/index.ts` resultaba
     incompatible con las librerías ubicadas en subdirectorios de capa (`libs/core/*`,
     `libs/engines/*`, `libs/modules/*`, `libs/shared/*`), incluyendo
     `@floripa-dignidade/exceptions`.
   - La ausencia de `roots: ['<rootDir>/tests']` provocaba un rastreo completo de los archivos del
     monorepo (~38.9 s por ejecución).
3. **Brechas en `tests/src/lib/core/exceptions/GlobalBaseException.spec.ts`:**
   - Empleaba aserción de tipo directa (`as ErrorCode`) sin validar en runtime contra
     `ErrorCodeSchema`, mantenía terminología informal previa a OEDP-V18.1 y carecía de aserciones
     de inmutabilidad física (`Object.isFrozen` / `Object.defineProperty`), protección de claves
     reservadas y conformidad con `ExceptionContractSchema`.

### 2. Decisiones Arquitectónicas y Cambios Ejecutados

1. **Preservación de `.swcrc` Raíz e Aislamiento de `@swc/jest`:**
   - Se mantiene intacto `.swcrc` en la raíz para evitar regresiones en los builds de librerías
     (`@nx/js:swc`).
   - Se verificó mediante prueba directa sobre `@swc/core@1.15.47` y `@swc/jest@0.2.38` que las
     opciones explícitas `swcrc: false` y `configFile: false` habilitan la transpilación limpia de
     especificaciones `.spec.ts`.
2. **Nivelación de `tests/jest.config.ts`:**
   - Inyección de `swcrc: false`, `configFile: false` y `module: { type: 'commonjs' }` dentro de
     `@swc/jest` para compatibilidad determinista con Jest VM sin requerir
     `--experimental-vm-modules`.
   - Configuración de `roots: ['<rootDir>/tests']` manteniendo `rootDir: '../'` para cobertura,
     reduciendo la fase de descubrimiento a ~2.6 s.
   - Reemplazo del comodín por el mapeo explícito 1:1 de los 29 alias `@floripa-dignidade/*`
     sincronizados con `tsconfig.base.json`, además de la regla de respaldo `^(\\.{1,2}/.*)\\.js$`.
3. **Refactorización de `tests/src/lib/core/exceptions/GlobalBaseException.spec.ts`:**
   - Sustitución de aserción directa por `ErrorCodeSchema.parse(...)` y validación integral contra
     `ExceptionContractSchema.safeParse(...)`.
   - Incorporación de cobertura para herencia (`Error`, `GlobalBaseException`), validez de
     `occurrenceTimestampISO`, sellado físico (`Object.isFrozen` + rechazo `TypeError` en
     `Object.defineProperty`) y preservación/blindaje de metadatos en `runtimeContextSnapshot`.
   - Purga de metáforas informales conforme a OEDP-V18.1 e ISO/IEC 11179.
4. **Estrategia Operativa de Compilación en Producción:**
   - Se establece que la certificación local se ejecutará mediante `pnpm preflight` completo en modo
     verboso, delegando las compilaciones finales de producción (`build:portal` y `build:cms`)
     exclusivamente a **Vercel** mediante `git push`.

### 3. Evidencia de Verificación Ejecutada

- `pnpm audit:workspace`: **APROBADO** (`32/32` workspaces conformantes).
- `pnpm weaver:build`: **APROBADO** (`21` módulos consolidados en `pt-BR`, `es-ES` y `en-US`;
  `isParityVerifiedBoolean: true`, `0` violaciones).
- `pnpm lint`: **APROBADO** (`31/31` proyectos con `0` errores y `0` advertencias, tras reducir la
  complejidad ciclomática en cargadores i18n y eliminar aserciones no nulas en
  `LoadNavigationHeaderDictionary.ts`).
- `pnpm typecheck`: **APROBADO** (`32/32` proyectos en verde en `3m` bajo configuración
  Source-First).
- `prettier --check`, `nx lint` y `nx typecheck` sobre `@floripa-dignidade/qa-mirror`
  (`GlobalBaseException.spec.ts` y `tests/jest.config.ts`): **APROBADOS** (`0` errores).
- `pnpm test:unit` y `pnpm preflight` verboso completo: **EN CURSO / PENDIENTE DE CONFIRMACIÓN
  FINAL**.

### 4. Próximos Pasos Inmediatos

- [ ] Confirmar cierre en verde de `pnpm test:unit` y del `pnpm preflight` verboso completo.
- [ ] Nivelar uno a uno los puntos preventivos de Fase 5.5 previos al `git push` hacia Vercel:
  - Cumplimiento estricto de `TelemetrySignalSchema` (`occurrenceTimestampISO` y propiedades
    `*Literal`) en `apps/floripa-dignidade/src/instrumentation.ts`, rutas `/api/*` y módulos
    activos.
  - Actualización de `NavigationLink.tsx` (eliminación de `passHref legacyBehavior` deprecado en
    Next.js 16) y rutas localizadas bajo `typedRoutes: true`.
  - Ocultación de PII en hooks de `CitizenUsers.collection.ts` y `OrganizationsForensicHooks.ts`.
  - Purga de extensiones `.js` residuales en importaciones relativas de librerías para
    compatibilidad plena con Turbopack.

  ***
