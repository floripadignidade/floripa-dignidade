# 📋 CHECKLIST PRE-VUELO & HOJA DE RUTA: FLORIPA DIGNIDADE (OEDP-V18.1)

> **Instrucción de Hidratación:** Este documento contiene **únicamente las tareas estrictamente
> pendientes**. Todo ítem previo fue certificado en código y validado por `pnpm audit:workspace`
> (32/32), `pnpm weaver:build` (21 módulos, paridad 100%), `pnpm typecheck` (32/32),
> `pnpm format:check` y `pnpm test:unit` (qa-mirror 4/4 pasando).

---

## [ ] FASE 1: Monitoreo y Verificación del Despliegue en Producción (Vercel)

- [ ] **Despliegue de Aplicaciones en Vercel:**
  - [ ] Monitorear el build del portal `@floripa-dignidade/floripa-dignidade` en Vercel tras el
        `git push`.
  - [ ] Monitorear el build del CMS `@floripa-dignidade/content-manager-system` en Vercel.
  - [ ] Confirmar que las variables de entorno en Vercel Dashboard coincidan con
        `Environment.schema.ts`.
- [ ] **Certificación en Vivo (Smoke Testing HTTP):**
  - [ ] Validar respuesta Edge en `https://floripa-dignidade.vercel.app/pt-BR` (y `/es-ES`,
        `/en-US`) sin pantalla en blanco.
  - [ ] Validar carga del Observatorio en `/pt-BR/observatorio/gastos-publicos`.
  - [ ] Validar inicialización del panel administrativo `/admin` en el proyecto del CMS.

---

## [ ] FASE 2: Saneamiento de Deuda Técnica Restante Pre-Deploy (Fase 5.5)

### 2.1. Privacidad LGPD en el CMS

- [ ] **`apps/content-manager-system/src/collections/identity/CitizenUsers.collection.ts`:**
  - [ ] Reemplazar `req.user?.email` (PII) en el hook `afterChange` por un identificador opaco
        (`req.user?.id`).
- [ ] **`apps/content-manager-system/src/collections/governance/organizations/OrganizationsForensicHooks.ts`:**
  - [ ] Reemplazar `req.user?.email` por el identificador de operador sin exponer correos en
        telemetría.

### 2.2. Páginas Destino y Ruteo Localizado (`typedRoutes: true`)

- [ ] **Crear páginas de contingencia en el App Router:**
  - [ ] `apps/floripa-dignidade/src/app/[locale]/newsletter/invalid-token/page.tsx` (para tokens
        expirados/inválidos).
  - [ ] `apps/floripa-dignidade/src/app/[locale]/error/page.tsx` (con fallback de visualización de
        errores).
- [ ] **Alinear navegación móvil:**
  - [ ] Actualizar `MobileNavigationLink.tsx` y `MobileEmergencyAction.tsx` para inyectar
        `occurrenceTimestampISO` en telemetría y soportar rutas localizadas.

### 2.3. Cumplimiento de Telemetría SRE (`TelemetrySignalSchema`)

- [ ] **Inyectar `occurrenceTimestampISO` y propiedades `*Literal` en 20 aparatos activos:**
  - [ ] `apps/floripa-dignidade/src/app/[locale]/components/FeatureActionCard.tsx`
  - [ ] `apps/floripa-dignidade/src/app/[locale]/observatorio/gastos-publicos/components/ObservatoryHeader.tsx`
  - [ ] `apps/floripa-dignidade/src/app/api/newsletter/subscribe/route.ts`
  - [ ] `apps/floripa-dignidade/src/app/api/newsletter/confirm/route.ts`
  - [ ] `apps/floripa-dignidade/src/app/api/whatsapp/webhook/route.ts`
  - [ ] `libs/core/analytics/src/lib/captureAnalyticsEvent.ts`
  - [ ] `libs/core/communication-providers/resend` (`AuditResendHealthProbe.ts` y
        `SendTransactionalEmail.ts`)
  - [ ] `libs/core/routing` (`GlobalRequestOrchestrator.ts`, `ValidateLinguisticContract.ts`,
        `ValidateRouteAuthority.ts`, `FilterAutomatedInterference.ts`)
  - [ ] `libs/modules/newsletter` (`ConfirmNewsletterSubscription.ts`,
        `DispatchNewsletterVerification.ts`, `ProcessNewsletterSubscriptionRequest.ts`,
        `SavePendingSubscriptionToSupabase.ts`)
  - [ ] `libs/modules/whatsapp/communication-service` (`HandleIndividualWhatsAppMessage.ts`,
        `UpdateMessageTraceStatus.ts`, `ValidateMetaSignature.ts`,
        `ProcessIncomingWhatsAppEvent.ts`)

### 2.4. Purga Preventiva de Extensiones `.js` en Importaciones Internas (Turbopack Clean Paths)

- [ ] Purgar sufijos `.js` en importaciones relativas de:
  - `libs/modules/identity` (`src/index.ts`, `CalculateIdentityAuthority.ts`,
    `EvaluateIdentityAuthorityHierarchy.ts`, `MapAuthorityToLedgerRecord.ts`)
  - `libs/modules/territorial-engine` (`src/index.ts`, `AssembleTerritorialEntity.ts`,
    `MapIbgeToTerritorialEntity.ts`)
  - `libs/modules/reputation-engine` (`AnalyzeEvaluationVeracity.ts`,
    `schemas/AnalyzeEvaluationVeracity.schema.ts`,
    `schemas/ProcessPublicEvaluationSubmission.schema.ts`)
  - `libs/modules/messaging-engine` (`CalculatePresenceStateSignature.ts`,
    `ManageSovereignMembership.ts`)
  - `libs/modules/newsletter/src/lib/logic/atomic/ParseSubscriberActivationResult.ts`
  - `libs/engines/impact-analytics-engine/src/lib/logic/atomic/AssemblePopularAcceptanceIndicator.ts`
  - `libs/engines/search-engine` (`SearchEngineConfiguration.ts`, `ExecuteFuzzySearch.schema.ts`)
  - `libs/engines/health-analysis/src/index.ts`
  - `libs/shared/utility/src/storage/logic/` (`GenerateSovereignStoragePath.ts`,
    `TransformToSovereignBinary.ts`)

### 2.5. Actualización de Nomenclatura en Observatorio

- [ ] En
      `apps/floripa-dignidade/src/app/[locale]/observatorio/gastos-publicos/components/ExpenditureTableRow.tsx`:
  - Migrar la importación de `MaskSovereignIdentity` a `MaskCitizenIdentity`.

---

## [ ] FASE 3: Ejecución de Migración Relacional (Supabase Cloud Ledger)

- [] **Ejecución en Supabase SQL Editor (Proyecto `vekjuwrdeozvvnqyweox`):**
  - [ ] Ejecutar `database/00_migration_master_schema.sql` y certificar la creación de
        `public.citizen_identities_ledger`, índices y políticas RLS.
  - [ ] Crear y ejecutar `database/02_ecosystem_operational_ledgers.sql` conteniendo las tablas del
        enjambre operacional:
    - `newsletter_subscribers`
    - `system_telemetry_logs`
    - `system_notifications_ledger`
    - `direct_messages_ledger`
    - `user_presence_ledger`
    - `communication_groups_ledger`
    - `group_memberships_ledger`
    - `territorial_master_data`
    - `project_financial_ledger`
  - [ ] Archivar o suprimir `database/01_identity_identities_ledger.sql` (desfasado respecto al
        master schema).

---

## [ ] FASE 4: Activos Públicos y Frontend Cívico (ADR 0025 / ADR 0026 / ADR 0028)

- [ ] **Paso 4.1 (Activos Gráficos ADR 0028 en `apps/floripa-dignidade/public/`):**
  - [ ] Incorporar activos en `/brand/favicon/*` (`favicon-16x16.png`, `favicon-32x32.png`,
        `favicon.svg`).
  - [ ] Incorporar logotipos vectoriales en `/brand/logos/*` (`horizontal`, `vertical`, `symbol`).
  - [ ] Incorporar iconos PWA en `/brand/pwa/*` (`apple-touch-icon.png`, `icon-192x192.png`,
        `maskable-icon-512x512.png`).
  - [ ] Crear `/meta/opengraph-image.png` (1200x630 px) y `/meta/twitter-image.png`.
- [ ] **Paso 4.2 (Language Switcher Dinámico):**
  - [ ] Diseñar e integrar el selector de idioma en `GlobalMainNavigationHeader.tsx` consumiendo
        dinámicamente `ACTIVE_LOCALES_ENTRIES_COLLECTION` (`@floripa-dignidade/contracts`).
- [ ] **Paso 4.3 (Rutas Institucionales de Impacto):**
  - [ ] Construir las páginas `/identidad`, `/transparencia`, `/prensa`, `/denuncia` y
        `/unauthorized`.
  - [ ] Reemplazar el rol simulado en `ValidateObservatoryAccess.ts` por la sesión real del usuario.
- [ ] **Paso 4.4 (Evolución TanStack Query - ADR 0026):**
  - [ ] Implementar pre-fetching de gastos públicos en segundo plano y mutaciones resilientes
        offline.

---

# 📋 CHECKLIST PRE-VUELO & HOJA DE RUTA: FLORIPA DIGNIDADE (OEDP-V18.1)

> **Instrucción de Hidratación:** Este documento contiene **únicamente las tareas estrictamente
> pendientes y certificadas en vivo**. Todo ítem marcado con `[x]` fue validado por
> `pnpm audit:workspace` (32/32), `pnpm weaver:build` (21 módulos, paridad 100%), `pnpm typecheck`
> (32/32), `pnpm format:check` y despliegue en Vercel (Commit `3dab970` en producción).

---

## [ ] FASE 1: Monitoreo, Certificación en Vivo y Secretos Cloud

- [x] **Despliegue del Portal en Vercel:** Portal `@floripa-dignidade/floripa-dignidade` compilado
      exitosamente con Turbopack en 21.4s y desplegado en
      `https://floripa-dignidade.vercel.app/es-ES` (Commit `3dab970`).
- [ ] **Despliegue del CMS en Vercel:** Monitorear compilación y arranque de
      `@floripa-dignidade/content-manager-system` en Vercel.
- [ ] **Certificación de Servicios en Sonda Cloud (`pnpm audit:infrastructure`):**
  - [x] `DATABASE_POSTGRES_RELATIONAL`: Nominal (`aws-0-sa-east-1.pooler.supabase.com:6543`).
  - [x] `SUPABASE_REST_DATA_LAKE`: Nominal (PostgREST HTTP 200).
  - [x] `SUPABASE_STORAGE_S3_GATEWAY`: Nominal (`media-vault` autenticado vía AWS SigV4 atomizado).
  - [x] `META_WHATSAPP_COMMUNICATION_GATEWAY`: Nominal (HMAC-SHA256 en tiempo constante).
  - [ ] `RESEND_TRANSACTIONAL_EMAIL`: Nivelar `AuditResendEmailProbe.ts` para reconocer respuesta
        legítima `restricted_api_key` como nominal o proveer clave con permiso `Full Access`.
  - [ ] `GOOGLE_GEMINI_API_KEY`: Generar clave válida en Google AI Studio
        (`aistudio.google.com/apikey`) y actualizar en `.env` / Vercel.
  - [ ] `HUGGING_FACE_ROUTER`: Retirar variables obsoletas en `.env` y Vercel (o migrar a modelo
        activo) para que la cola elástica ejecute solo Gemini.
- [ ] **Smoke Testing en Producción:**
  - [x] `/es-ES`: Frontpage, menús localizados, tipografía `Lexend`/`Inter` y paletas
        institucionales operativas.
  - [ ] `/pt-BR` y `/en-US`: Certificar respuesta en el Edge.
  - [ ] `/pt-BR/observatorio/gastos-publicos`: Validar carga y fallback en vivo.
  - [ ] `/admin`: Validar login de Payload CMS.

---

## [ ] FASE 2: Saneamiento de Deuda Técnica y Privacidad (Fase 5.5)

### 2.1. Privacidad LGPD en el CMS

- [ ] **`apps/content-manager-system/src/collections/identity/CitizenUsers.collection.ts`:**
  - Reemplazar PII (`doc['email']` y `req.user?.email`) en hooks por identificadores opacos
    (`req.user?.id`).
  - Atomizar en `CitizenUsersAccessPolicy`, `CitizenUsersFields`, `CitizenUsersForensicHooks`.
- [ ] **`apps/content-manager-system/src/collections/governance/organizations/OrganizationsForensicHooks.ts`:**
  - Reemplazar `req.user?.email` por `resolveOperatorIdentifierLiteral(req.user)`.

### 2.2. Páginas Destino y Rutas de Contingencia (Cero 404)

- [ ] Crear `apps/floripa-dignidade/src/app/[locale]/newsletter/invalid-token/page.tsx` (+ silo i18n
      ADR 0030).
- [ ] Crear `apps/floripa-dignidade/src/app/[locale]/error/page.tsx` (+ silo i18n ADR 0030).
- [x] **Navegación móvil nivelada:** `MobileNavigationLink.tsx` y `MobileEmergencyAction.tsx`
      sincronizados con `UrlObject` y `occurrenceTimestampISO`.

### 2.3. Cumplimiento Estricto de Telemetría SRE (`TelemetrySignalSchema`)

- [x] `instrumentation.ts` y `useHeaderMountTelemetry.ts` nivelados.
- [ ] Inyectar `occurrenceTimestampISO` y propiedades `*Literal` en:
  - `apps/floripa-dignidade`: `FeatureActionCard.tsx`, `ObservatoryHeader.tsx`,
    `/api/newsletter/subscribe/route.ts`, `/api/newsletter/confirm/route.ts`,
    `/api/whatsapp/webhook/route.ts`.
  - `libs/core`: `captureAnalyticsEvent.ts`, `AuditResendHealthProbe.ts`,
    `SendTransactionalEmail.ts`, `GlobalRequestOrchestrator.ts`, `ValidateLinguisticContract.ts`,
    `ValidateRouteAuthority.ts` (y alinear `RouteAuthorityManifesto.ts` al SSOT
    `@floripa-dignidade/contracts`), `FilterAutomatedInterference.ts`.
  - `libs/modules/newsletter`: `ConfirmNewsletterSubscription.ts`,
    `DispatchNewsletterVerification.ts`, `ProcessNewsletterSubscriptionRequest.ts`,
    `SavePendingSubscriptionToSupabase.ts`.
  - `libs/modules/whatsapp`: `HandleIndividualWhatsAppMessage.ts`, `UpdateMessageTraceStatus.ts`,
    `ValidateMetaSignature.ts`, `ProcessIncomingWhatsAppEvent.ts`.

### 2.4. Rutas Limpias (Extensionless) para Turbopack

- [ ] Purgar sufijos `.js` en importaciones relativas de:
  - `libs/modules/identity` (`src/index.ts`, `CalculateIdentityAuthority.ts`,
    `EvaluateIdentityAuthorityHierarchy.ts`, `MapAuthorityToLedgerRecord.ts`).
  - `libs/modules/territorial-engine` (`src/index.ts`, `AssembleTerritorialEntity.ts`,
    `MapIbgeToTerritorialEntity.ts`).
  - `libs/modules/reputation-engine` (`AnalyzeEvaluationVeracity.ts`, schemas asociados).
  - `libs/modules/messaging-engine` (`CalculatePresenceStateSignature.ts`,
    `ManageSovereignMembership.ts`).
  - `libs/modules/newsletter` (`ParseSubscriberActivationResult.ts`).
  - `libs/engines/impact-analytics-engine` (`AssemblePopularAcceptanceIndicator.ts`).
  - `libs/engines/search-engine` (`SearchEngineConfiguration.ts`, `ExecuteFuzzySearch.schema.ts`).
  - `libs/engines/health-analysis` (`src/index.ts`).
  - `libs/shared/utility` (`GenerateSovereignStoragePath.ts`, `TransformToSovereignBinary.ts`).

### 2.5. Nomenclatura en Observatorio

- [x] Migrado `ExpenditureTableRow.tsx` a `MaskCitizenIdentity`.

---

## [ ] FASE 3: Persistencia Relacional y Migración Cloud (Supabase)

- [ ] **Ejecución en Supabase SQL Editor (Proyecto `sa-east-1`):**
  - Ejecutar `database/00_migration_master_schema.sql` y certificar
    `public.citizen_identities_ledger`, índices y RLS.
  - Crear y ejecutar `database/02_ecosystem_operational_ledgers.sql` con las 9 tablas operacionales
    (`newsletter_subscribers`, `system_telemetry_logs`, `system_notifications_ledger`,
    `direct_messages_ledger`, `user_presence_ledger`, `communication_groups_ledger`,
    `group_memberships_ledger`, `territorial_master_data`, `project_financial_ledger`).
  - Deprecar y archivar `database/01_identity_identities_ledger.sql`.

---

## [ ] FASE 4: Activos Gráficos, Frontend Cívico y Ecosistema (ADR 0028 / ADR 0030)

- [ ] **Paso 4.1 (Activos Gráficos ADR 0028 en `apps/floripa-dignidade/public/`):**
  - Resolver el icono de imagen rota en header proveyendo `/brand/floripa-dignidade-logo-color.png`,
    `/brand/floripa-dignidade-logo-white.png`, `/brand/favicon.ico`, `/brand/favicon/favicon.svg`,
    `/brand/pwa/apple-touch-icon.png`, `/brand/pwa/icon-192x192.png`, `/brand/pwa/icon-512x512.png`
    y `/manifest.webmanifest`.
- [ ] **Paso 4.2 (Language Switcher Dinámico):**
  - Integrar selector de idioma en `GlobalMainNavigationHeader.tsx` consumiendo
    `ACTIVE_LOCALES_ENTRIES_COLLECTION` (`@floripa-dignidade/contracts`).
- [ ] **Paso 4.3 (Rutas Institucionales de Impacto):**
  - Construir `/identidad`, `/transparencia`, `/prensa`, `/denuncia` y `/unauthorized`.
  - Reemplazar el rol simulado en `ValidateObservatoryAccess.ts` por sesión real de usuario.
- [ ] **Paso 4.4 (Evolución TanStack Query - ADR 0026):**
  - Implementar pre-fetching de gastos públicos en segundo plano y mutaciones offline resilientes.

  ***
