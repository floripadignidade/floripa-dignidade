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

   
