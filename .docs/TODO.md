agregar pnpm add -w clsx tailwind-merge @radix-ui/react-slot exceljs

# 📋 HOJA DE RUTA MAESTRA: ESTABILIZACIÓN Y NIVELACIÓN GLOBAL (OEDP-V18.1)

## 📌 FASE 1: Saneamiento de Identidad y Topología de Motores Huérfanos
- [x] **01. libs/engines/data-ingestion-engine/project.json**
      Corregir identidad (`@floripa-dignidade/data-ingestion-engine`), tags (`scope:engines`) y rutas de `build` y `typecheck`.
- [ ] **02. libs/engines/data-ingestion-engine/package.json**
      Sincronizar nombre canónico de paquete, exportaciones y dependencias del workspace.
- [ ] **03. libs/engines/data-ingestion-engine/tsconfig.json**
      Normalizar gatekeeper sin emisión, extendiendo `tsconfig.base.json`.
- [ ] **04. libs/engines/data-ingestion-engine/tsconfig.lib.json**
      Purgar `baseUrl`, erradicar rutas a `dist/out-tsc` y activar resolución Source-First.
- [ ] **05. libs/engines/data-ingestion-engine/src/index.ts**
      Crear el barril de exportación soberano que unifique la ingesta de datos fiscales abiertos.
- [ ] **06. libs/modules/municipal-open-data-engine/src/lib/logic/orchestrators/SyncMunicipalityExpenditure.ts**
      Sanear el archivo físicamente truncado en la línea 37 (`TS1005`) y consolidar el contrato de retorno.

## 📌 FASE 2: Purga de Referencias Compuestas en Proyectos `noEmit` (Fix TS6306 / TS6310)
- [ ] **07. apps/floripa-dignidade/tsconfig.app.json**
      Purgar 11 referencias compuestas invasivas que bloquean la compilación de la aplicación web.
- [ ] **08. apps/content-manager-system/tsconfig.app.json**
      Purgar 4 referencias compuestas incompatibles con el entorno Payload CMS.
- [ ] **09. libs/modules/identity/tsconfig.lib.json**
      Purgar 3 referencias compuestas y asentar `noEmit: true` determinista.
- [ ] **10. libs/shared/ui-foundry/tsconfig.lib.json**
      Purgar referencias hacia `utility` y `state-store`.
- [ ] **11. libs/shared/state-store/tsconfig.lib.json**
      Purgar referencia hacia `utility/tsconfig.lib.json`.
- [ ] **12. libs/engines/financial-ingestion-engine/tsconfig.lib.json**
      Purgar referencia hacia `environment-validator`.
- [ ] **13. libs/engines/impact-analytics-engine/tsconfig.lib.json**
      Purgar referencias hacia `reputation-engine` y `environment-validator`.
- [ ] **14. libs/modules/whatsapp/communication-service/tsconfig.lib.json**
      Purgar referencia hacia `environment-validator`.
- [ ] **15. libs/tools/tsconfig.lib.json**
      Purgar referencias hacia `data-ingestion-engine` y `environment-validator`.

## 📌 FASE 3: Purga de Punteros Residuales a `dist/out-tsc` y Erradicación de `baseUrl` (Fix TS2307)
- [ ] **16. libs/core/analytics/tsconfig.lib.json**
      Purgar rutas a `dist/out-tsc` en `paths`.
- [ ] **17. libs/core/communication-providers/resend/tsconfig.lib.json**
      Purgar rutas a `dist/out-tsc` en `paths`.
- [ ] **18. libs/core/environment-validator/tsconfig.lib.json**
      Eliminar `baseUrl: "."` y purgar rutas a `dist/out-tsc`.
- [ ] **19. libs/core/routing/tsconfig.lib.json**
      Eliminar `baseUrl: "."` y purgar rutas a `dist/out-tsc`.
- [ ] **20. libs/engines/adversarial-simulation-engine/tsconfig.lib.json**
      Purgar rutas a `dist/out-tsc` en `paths`.
- [ ] **21. libs/engines/health-analysis/tsconfig.lib.json**
      Purgar rutas a `dist/out-tsc` en `paths`.
- [ ] **22. libs/engines/health-monitor/tsconfig.lib.json**
      Purgar rutas a `dist/out-tsc` en `paths`.
- [ ] **23. libs/modules/reputation-engine/tsconfig.lib.json**
      Purgar rutas a `dist/out-tsc` en `paths`.
- [ ] **24. libs/modules/territorial-engine/tsconfig.lib.json**
      Eliminar `baseUrl: "."` y purgar rutas a `dist/out-tsc`.
- [ ] **25. libs/shared/design-system/tsconfig.json**
      Eliminar `baseUrl: "."` y alinear herencia directa.
- [ ] **26. libs/shared/ui-contracts/tsconfig.json**
      Eliminar `baseUrl: "."`.
- [ ] **27. libs/shared/utility/tsconfig.lib.json**
      Eliminar `baseUrl: "."` y purgar rutas a `dist/out-tsc`.
- [ ] **28. libs/tools/tsconfig.json**
      Eliminar `composite: true` y referencias innecesarias.

## 📌 FASE 4: Saneamiento del Búnker de Pruebas Espejo (QA Mirror)
- [ ] **29. tests/tsconfig.json**
      Eliminar `baseUrl: "."`.
- [ ] **30. tests/tsconfig.lib.json**
      Sanear configuración de biblioteca de pruebas.
- [ ] **31. tests/tsconfig.spec.json**
      Alinear `paths` hacia fuentes directas (`libs/*/src/index.ts`) en lugar de `dist/out-tsc`.

## 📌 FASE 5: Consolidación Canónica del Grafo y Verificación Global
- [ ] **32. tsconfig.base.json**
      Sincronizar el mapeo de alias para que refleje la unificación de `@floripa-dignidade/data-ingestion-engine`.
- [ ] **33. Auditoría de Integridad Global**
      Ejecutar `pnpm typecheck`, `pnpm lint` y `pnpm weaver:build` para certificar cero errores en el monorepo.

      ---

.docs/CONTINUIDAD_VERCEL_DEPLOYMENT.md

# 🏛️ PASAPORTE DE CONTINUIDAD TÉCNICA: DESPLIEGUE EN PRODUCCIÓN (VERCEL)
**Ecosistema:** Floripa Dignidade — Red de Respuesta Social y Auditoría Cívica  
**Doctrina:** Reference Architecture (Source-First OEDP-V18.1)  
**Estado del Grafo:** 22 de 32 proyectos compilando limpiamente (68.75% nominal verificado).  
**Objetivo del Próximo Hilo:** Subsanar las 4 dependencias raíz, ajustar `tests/tsconfig.lib.json`, purgar residuos de `references` y certificar `pnpm vercel-build` con código de salida 0.

---

## 1. RESUMEN DE HITOS CONSOLIDADOS (LO QUE YA FUE RESUELTO)

1. **Desactivación de Sabotaje de Nx Sync (`nx.json`):**
   - Se inyectó `"sync": { "applyChanges": false, "disabledTaskSyncGenerators": ["@nx/js:typescript-sync"] }`. Nx ya no volverá a inyectar referencias compuestas invasivas.
2. **Consolidación Canónica de Ingesta Fiscal:**
   - Creado `libs/engines/data-ingestion-engine/src/lib/logic/orchestrators/SyncMunicipalityExpenditure.ts`.
   - Re-exportado canónicamente en `libs/engines/data-ingestion-engine/src/index.ts`.
   - Mapeado canónicamente en `tsconfig.base.json` (`@floripa-dignidade/data-ingestion-engine` y alias `@floripa-dignidade/pmf-open-data-engine`).
   - Todos los componentes del Observatorio (`page.tsx`, `ExpenditureTable.tsx`, `ExpenditureTableRow.tsx`, `CalculateObservatoryMetrics.ts`) fueron migrados a `@floripa-dignidade/contracts` y `@floripa-dignidade/data-ingestion-engine`.
   - Se protegió `page.tsx` moviendo `ValidateObservatoryAccess` fuera del `try/catch` para que `NEXT_REDIRECT` no sea tratado como fallo 500.
3. **Erradicación de Recursión Circular en `shared/utility`:**
   - `libs/shared/utility/tsconfig.json` ahora extiende `../../../tsconfig.base.json` (`files: []`, `references: [{ "path": "./tsconfig.lib.json" }]`).
   - `libs/shared/utility/tsconfig.lib.json` nivelado a Source-First puro (sin `baseUrl`, sin `dist/out-tsc`, sin `composite`).
4. **Nivelación Source-First en Aplicaciones y Módulos Clave:**
   - `apps/floripa-dignidade/tsconfig.app.json`: Purgado de alias huérfano, inyectado plugin Next.js, rutas ordenadas.
   - `apps/content-manager-system/tsconfig.app.json`: Purgado de alias huérfano, purgado de `index.d.ts` fantasma, rutas ordenadas.
   - `libs/modules/newsletter/tsconfig.lib.json`: Purgado de `composite`, rutas a `dist/out-tsc` y `references`.
   - `libs/shared/design-system/tsconfig.lib.json`: Purgado de `composite`, `declaration` y `rootDir`.
   - `libs/modules/interaction-engine/tsconfig.lib.json`: Purgado de `references: []`, inyectado `target: ES2022`.
   - `libs/modules/messaging-engine/tsconfig.lib.json`: Purgado de `references: []`, inyectados tipos de React 19.

---

## 2. DIAGNÓSTICO DE LOS ERRORES RESIDUALES DEL TYPECHECK

En la última ejecución de `pnpm typecheck`, fallaron 10 proyectos debido a tres causas concretas:

### Causa A: Dependencias fantasma no elevadas a la raíz (Error TS2307)
- **Error:** `Cannot find module 'exceljs'`, `Cannot find module 'clsx'`, `Cannot find module 'tailwind-merge'`, `Cannot find module '@radix-ui/react-slot'`.
- **Afecta a:** `financial-ingestion-engine`, `tools`, `shared-utility`, `shared-state-store`, `shared-ui-foundry`, `newsletter`.
- **Solución:** Ejecutar en terminal:
  ```bash
  pnpm add -w clsx tailwind-merge @radix-ui/react-slot exceljs
Causa B: Referencias compuestas reinyectadas por Nx antes de desactivar sync (Error TS6306 / TS6310)
Error: Referenced project ... must have setting "composite": true / may not disable emit.
Afecta a:
apps/floripa-dignidade/tsconfig.app.json (Nx le metió 11 referencias al responder "yes").
libs/modules/identity/tsconfig.lib.json (Nx le metió 1 referencia a contracts).
libs/engines/data-ingestion-engine/tsconfig.lib.json (Nx le metió 1 referencia a contracts).
Solución: Reemplazar el bloque "references": [...] por "references": [] en esos tres archivos.
Causa C: Declaración de tipos en pruebas espejo (Error TS2688)
Error: error TS2688: Cannot find type definition file for '@testing-library/jest-dom'.
Afecta a: tests/tsconfig.lib.json.
Solución: En tests/tsconfig.lib.json, cambiar "types": ["node", "jest", "@testing-library/jest-dom"] por "types": ["node", "jest"].
3. CHECKLIST OPERATIVO PASO A PASO (PARA EJECUTAR EN TERMINAL)
Paso 1: Eliminar carpetas huérfanas en Windows 10
Cmd
rmdir /s /q libs\engines\pmf-open-data-engine
rmdir /s /q libs\modules\municipal-open-data-engine
Paso 2: Instalar dependencias en la raíz del workspace
Cmd
pnpm add -w clsx tailwind-merge @radix-ui/react-slot exceljs
Paso 3: Asegurar references: [] en los 3 archivos reinyectados
Verificar que contengan "references": []:
apps/floripa-dignidade/tsconfig.app.json
libs/modules/identity/tsconfig.lib.json
libs/engines/data-ingestion-engine/tsconfig.lib.json
Paso 4: Corregir tests/tsconfig.lib.json
Eliminar "@testing-library/jest-dom" del array compilerOptions.types.
Paso 5: Ejecutar la verificación estática
Cmd
pnpm weaver:build
pnpm typecheck
Meta: 32 de 32 proyectos en verde ([OK]).
4. VARIABLES DE ENTORNO REQUERIDAS EN VERCEL DASHBOARD
Antes de disparar el despliegue de producción en Vercel, configurar en Project Settings > Environment Variables:
Clave de Entorno	Tipo	Propósito y Formato
NEXT_PUBLIC_SITE_URL	Público	URL del portal institucional (ej: https://floripadignidade.org).
DATABASE_URL	Secreto	Cadena de conexión Postgres con pooling (ej: postgresql://postgres:...@...pooler.supabase.com:6543/postgres).
SUPABASE_URL	Secreto	Endpoint REST de Supabase (ej: https://xyz.supabase.co).
SUPABASE_SERVICE_ROLE_KEY	Secreto	Token de alta autoridad para operaciones de fondo y bypass RLS.
PAYLOAD_SECRET	Secreto	Cadena criptográfica aleatoria de más de 32 caracteres para el CMS.
S3_ENDPOINT	Secreto	Endpoint S3-compatible (ej: https://xyz.supabase.co/storage/v1/s3).
S3_ACCESS_KEY_ID	Secreto	Credencial de acceso para almacenamiento multimedia.
S3_SECRET_ACCESS_KEY	Secreto	Secreto de acceso para almacenamiento multimedia.
S3_REGION	Público	Región física del bucket (ej: us-east-1).
S3_BUCKET	Público	Nombre del contenedor de evidencia (ej: media-vault).
RESEND_API_KEY	Secreto	Token oficial de Resend (inicia con re_).
RESEND_FROM_EMAIL	Secreto	Dirección de correo autorizada en DNS (ej: nao-responda@floripadignidade.org).
WHATSAPP_VERIFY_TOKEN	Secreto	Token secreto para el handshake del Webhook con Meta.
WHATSAPP_APP_SECRET	Secreto	Firma secreta de Meta para validación HMAC-SHA256 en tiempo constante.
SOVEREIGN_EMERGENCY_TOKEN	Secreto	Token de seguridad administrativa superior (> 32 caracteres).
5. COMANDO DE CONSTRUCCIÓN EN VERCEL
El comando oficial configurado en package.json para Vercel es:
Bash
pnpm vercel-build
El cual ejecuta secuencialmente:
pnpm weaver:build (Compila los diccionarios i18n de todos los submódulos).
nx run-many -t build --projects=floripa-dignidade,content-manager-system --prod (Compila ambas aplicaciones con Turbopack/SWC en producción).
🤖 INSTRUCCIÓN DE INICIO PARA EL NUEVO HILO DE CONVERSACIÓN
Copia y pega el siguiente bloque como primer mensaje del nuevo chat:
"Hola. Continúo el proyecto Floripa Dignidade como Arquitecto. Hemos consolidado la arquitectura Source-First OEDP-V18.1 hasta el Hito 03 de la bitácora. Por favor, lee .docs/CONTINUIDAD_VERCEL_DEPLOYMENT.md. Vamos a revisar la instalación de las dependencias raíz ('exceljs', 'clsx', 'tailwind-merge', '@radix-ui/react-slot'), purgar las referencias residuales en 'apps/floripa-dignidade/tsconfig.app.json', 'libs/modules/identity/tsconfig.lib.json' y 'libs/engines/data-ingestion-engine/tsconfig.lib.json', ajustar 'tests/tsconfig.lib.json' y validar con pnpm typecheck hasta lograr 0 errores para el despliegue en Vercel."

RECORDAR BORRAR ESTA ENTRADA UNA VEZ INFORMADA

---