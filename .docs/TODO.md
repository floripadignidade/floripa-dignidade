# 📋 CHECKLIST PRE-VUELO & DEPLOY TOTAL: FLORIPA DIGNIDADE (OEDP-V18.1)

> **Estado Base:** 32/32 workspaces conformantes, linter base en verde, compilador Weaver activo
> (silos en `pt-BR`, `es-ES`, `en-US` con paridad 100%) y portal base desplegado en Vercel. Este
> documento conserva **exclusivamente tareas verificadas como pendientes** para lograr un despliegue
> integral, funcional y sin regresiones del **Portal**, el **CMS** y las **APIs/Apps**.

---

## [ ] FASE 1: Secretos Cloud, Migraciones SQL y Provisionamiento de Datos (Bloqueante Prod)

### 1.1. Secretos y Sonda de Infraestructura (`pnpm audit:infrastructure`)

- [ ] **`GOOGLE_GEMINI_API_KEY`:** Generar clave válida en Google AI Studio
      (`aistudio.google.com/apikey`) y actualizar en `.env` local y en ambos proyectos de Vercel
      (**Portal** y **CMS**).
- [ ] **`HUGGING_FACE_ROUTER`:** Decidir estrategia en `.env` y Vercel:
  - Opción A: Configurar `HUGGING_FACE_MODEL_URL=https://router.huggingface.co/v1/chat/completions`
    y actualizar `AuditHuggingFaceCognitiveProbe.ts` para validar contra el router
    `/v1/chat/completions`.
  - Opción B: Retirar `HUGGING_FACE_*` si producción operará exclusivamente con Google Gemini.
- [ ] **Re-certificar en vivo `pnpm audit:infrastructure`:** Confirmar los `7/7` (o `6/6`) servicios
      en estado `NOMINAL_OPERATIONAL` / `DEGRADED_LATENCY` (incluyendo `RESEND_TRANSACTIONAL_EMAIL`
      ya nivelado en `TriageResendProbeResponse.ts`).
- [ ] **Sincronizar Variables en Vercel Dashboard:** Verificar que tanto el proyecto
      `floripa-dignidade-portal` como el proyecto del CMS tengan el 100% de las variables exigidas
      por `Environment.schema.ts` (`RESEND_*`, `SUPABASE_*`, `DATABASE_URL`, `S3_*`,
      `PAYLOAD_SECRET`, `SOVEREIGN_EMERGENCY_TOKEN`, `WHATSAPP_*`, `NEXT_PUBLIC_SITE_URL`,
      `GOOGLE_GEMINI_API_KEY`).

### 1.2. Persistencia Relacional en Supabase (`sa-east-1` / Proyecto `vekjuwrdeozvvnqyweox`)

- [ ] **Ejecutar `database/00_migration_master_schema.sql`** en Supabase SQL Editor y certificar la
      creación de `public.citizen_identities_ledger`, índices y políticas RLS.
- [ ] **Crear y ejecutar `database/02_ecosystem_operational_ledgers.sql`** con las 9 tablas
      operacionales consumidas por los módulos:
  - `newsletter_subscribers` (Double Opt-In)
  - `system_telemetry_logs` (Telemetría SRE + Cadena Merkle)
  - `system_notifications_ledger`
  - `direct_messages_ledger`
  - `user_presence_ledger`
  - `communication_groups_ledger`
  - `group_memberships_ledger`
  - `territorial_master_data`
  - `project_financial_ledger`
- [ ] **Deprecar y archivar/eliminar `database/01_identity_identities_ledger.sql`** (desfasado
      frente al master schema).
- [ ] **Provisionar esquema de Payload CMS 3.84:** Ejecutar migración/push inicial de Payload contra
      `DATABASE_URL` para certificar la creación de las tablas de `citizen-users`, `organizations`,
      `media-vault` y colecciones internas de Payload antes de habilitar `/admin` en producción.

---

## [ ] FASE 2: Cero 404, Activos Públicos y Consistencia UI Pre-Deploy (Portal + CMS)

### 2.1. Páginas Destino Obligatorias para Evitar 404 en Flujos Activos

- [ ] **`apps/floripa-dignidade/src/app/[locale]/error/page.tsx`:** Crear página de contingencia (+
      silo `i18n/<locale>/error.json` y esquema Zod), destino actual de
      `HandleConfirmationGatewayError.ts` (`/api/newsletter/confirm`).
- [ ] **`apps/floripa-dignidade/src/app/[locale]/unauthorized/page.tsx`:** Crear página de acceso
      denegado (+ silo `i18n/<locale>/unauthorized.json`), destino de redirección de
      `ValidateObservatoryAccess.ts`.
- [ ] **Rutas enlazadas desde `MainNavigationHeader` (`DesktopNavigationMenu`,
      `MobileNavigationLinkList`, `MobileEmergencyAction`):**
  - [ ] `apps/floripa-dignidade/src/app/[locale]/identidad/page.tsx`
  - [ ] `apps/floripa-dignidade/src/app/[locale]/transparencia/page.tsx`
  - [ ] `apps/floripa-dignidade/src/app/[locale]/prensa/page.tsx`
  - [ ] `apps/floripa-dignidade/src/app/[locale]/denuncia/page.tsx`
- [ ] _(Opcional si se activa `CaptureAnalyticsEvent` en cliente)_ Implementar el Route Handler
      `apps/floripa-dignidade/src/app/api/analytics/events/route.ts` consumido por
      `TransmitAnalyticsBeacon.ts`.

### 2.2. Activos Estáticos y SEO/PWA (`ADR 0028`)

- [ ] **Portal (`apps/floripa-dignidade/public/`):**
  - [ ] Incorporar `/brand/floripa-dignidade-logo-color.png`,
        `/brand/floripa-dignidade-logo-white.png`, `/brand/favicon.ico`,
        `/brand/favicon/favicon.svg`, `/brand/favicon/favicon-16x16.png`,
        `/brand/favicon/favicon-32x32.png` y `/brand/icon-192x192.png`.
  - [ ] Incorporar logotipos vectoriales en `/brand/logos/` (`horizontal`, `vertical`, `symbol`).
  - [ ] Incorporar iconos PWA en `/brand/pwa/` (`apple-touch-icon.png`, `icon-192x192.png`,
        `maskable-icon-192x192.png`, `maskable-icon-512x512.png`) y `public/manifest.webmanifest`.
  - [ ] Incorporar `/meta/opengraph-image.png` (1200x630 px) y `/meta/twitter-image.png`, más
        `robots.txt` y `sitemap.xml` dinámico.
- [ ] **CMS (`apps/content-manager-system/public/`):**
  - [ ] Incorporar `/brand/favicon.ico` referenciado en
        `apps/content-manager-system/src/app/layout.tsx`.
- [ ] **Verificar artefacto fantasma en CMS:** Inspeccionar y limpiar la carpeta vacía
      `apps/content-manager-system/src/app/(payload)/api/rest/^[[...segments^]]/` si fue generada
      accidentalmente en Windows.

### 2.3. Correcciones Puntuales de UI y Manifiestos

- [ ] **Prop `className` vs `externalClassName` en `GlobalActionButton`:** Corregir el paso de
      `className` (que es sobrescrito por `externalClassName`) en:
  - `apps/floripa-dignidade/src/app/[locale]/newsletter/welcome/page.tsx`
  - `libs/shared/ui-foundry/src/lib/organisms/navigation-header/molecules/MobileNavigationDrawer.tsx`
  - `libs/shared/ui-foundry/src/lib/organisms/navigation-header/molecules/NavigationActionsSwarm.tsx`
  - `libs/shared/ui-foundry/src/lib/organisms/newsletter-form/components/SubscriptionInputGroup.tsx`
- [ ] **Integrar Language Switcher Dinámico:** Añadir selector de idiomas en
      `MainNavigationHeader.tsx` consumiendo `ACTIVE_LOCALES_ENTRIES_COLLECTION`
      (`@floripa-dignidade/contracts`).
- [ ] **Alinear dependencias en `package.json` (paridad estricta pnpm):**
  - Declarar `@floripa-dignidade/contracts` y `@floripa-dignidade/environment-validator` en
    `libs/engines/health-analysis/package.json`.
  - Declarar `@floripa-dignidade/contracts` en `libs/engines/health-monitor/package.json`.

---

## [ ] FASE 3: Nivelación Preventiva de Telemetría SRE y Limpieza de Deuda en `libs/`

> Nota: Estos aparatos compilan en verde hoy, pero emiten señales descartadas por
> `TelemetrySignalSchema` (falta `occurrenceTimestampISO` o usan campos legados `severityLevel`,
> `moduleIdentifier`, `operationCode`, `message`) o aún invocan alias `@deprecated`.

### 3.1. `libs/shared/ui-foundry` (Componentes activos en el Portal)

- [ ] `src/lib/organisms/navigation-header/molecules/DesktopNavigationMenu.tsx` (inyectar
      `occurrenceTimestampISO`)
- [ ] `src/lib/molecules/hooks/useSearchHardwareSentry.ts` (inyectar `occurrenceTimestampISO`)
- [ ] `src/lib/organisms/newsletter-form/components/NewsletterInfrastructureAlert.tsx` (inyectar
      `occurrenceTimestampISO`)

### 3.2. `libs/modules/*`

- [ ] **`interaction-engine`:** `ProcessPublicReactionTransaction.ts`,
      `ExecutePublicReactionFlow.ts`, `usePublicReaction.ts` (contrato `TelemetrySignalSchema` +
      migrar `IUserIdentity` desde `@floripa-dignidade/contracts`).
- [ ] **`messaging-engine`:** `DispatchPushNotification.ts`, `DispatchSystemNotification.ts`,
      `SendDirectMessage.ts`, `usePresenceTransmissionConnector.ts`,
      `ExecutePresenceSyncTransaction.ts`, `ArchiveMessageThread.ts`, `CreateCommunicationGroup.ts`,
      `DelegateVotingAuthority.ts`, `ManageGroupMembership.ts`, `MarkNotificationAsRead.ts`,
      `UpdateMessageThreadStatus.ts`, `UpdateUserPresence.ts`, `GetUnifiedCitizenInbox.ts`,
      `GetUnreadNotificationsCount.ts` (contrato `TelemetrySignalSchema`, migrar
      `ValidateEnvironmentAduana` ➔ `ValidateEnvironmentContract`, `MaskSovereignIdentity` ➔
      `MaskCitizenIdentity`, `CreateSovereignDatabaseHeaders` ➔ `CreatePrimaryDatabaseHeaders`).
- [ ] **`reputation-engine`:** `ReportReputationSubmissionOutcome.ts`,
      `ValidateCognitiveVeracityAdn.ts`, `ValidatePublicEvaluationAduana.ts`.
- [ ] **`territorial-engine`:** `FetchIbgeDistricts.ts`, `PersistTerritorialEntitiesToCloud.ts`,
      `ProcessTerritorialBatch.ts`, `SyncFlorianopolisTerritorialData.ts`.

### 3.3. `libs/engines/*` y `libs/tools`

- [ ] **`impact-analytics-engine`:** `AggregateTerritorialSentiment.ts`, `DetectSocialAnomaly.ts`,
      `AggregateBayesianImpactMetrics.ts`, `GenerateImpactAnalyticsReport.ts`,
      `LinkPmfExpenditureToSocialImpact.ts`.
- [ ] **`financial-ingestion-engine`:** `MapFinancialRecordsToLedger.ts`,
      `TransmitFinancialBatch.ts`, `ExtractWorkbookData.ts`, `PersistFinancialLedgerToCloud.ts`.
- [ ] **`adversarial-simulation-engine`:** `ExecuteAdversarialFuzzing.ts`,
      `ExecuteSecurityAuditPipeline.ts`, `EvaluateAuditIntegrityVerdict.ts`,
      `ExportShannonForensicReport.ts`.
- [ ] **`tools`:** `AuditExceptionsBuildArtifacts.ts` (inyectar `occurrenceTimestampISO`).

---

## [ ] FASE 4: Certificación Pre-Vuelo Total y Despliegue en Vivo (Portal + CMS)

- [ ] **Ejecutar batería completa local (`pnpm` estricto, ADR 0027):**
  - `pnpm format:write` (si hubo ediciones) y `pnpm preflight` (`purge:emissions:ci` +
    `audit:workspace` + `format:check` + `weaver:build` + `lint` + `typecheck` + `test:unit`).
  - `pnpm build:portal` y `pnpm build:cms` (validar que ambas apps compilen en modo producción con
    Turbopack/Next.js 16 y Payload 3.84 sin errores ni warnings bloqueantes).
- [ ] **Despliegue y Monitoreo en Vercel (`git push` a `main`):**
  - [ ] Verificar build verde de `@floripa-dignidade/floripa-dignidade`
        (`floripa-dignidade-portal`).
  - [ ] Verificar build verde de `@floripa-dignidade/content-manager-system`.
- [ ] **Smoke Testing HTTP y Funcional en Producción:**
  - [ ] Portal: `/pt-BR`, `/es-ES`, `/en-US` (imágenes de marca cargadas sin 404, switcher de idioma
        operativo, formulario de newsletter enviando `202 Accepted` + correo vía Resend +
        confirmación `/api/newsletter/confirm` ➔ `/newsletter/welcome` y fallback
        `/newsletter/invalid-token` / `/error`).
  - [ ] Observatorio: `/pt-BR/observatorio/gastos-publicos` cargando datos y anonimizando CNPJ.
  - [ ] CMS: `/admin` cargando login, creación de primer administrador y subida de prueba a
        `MediaVault` (Supabase S3 `media-vault`).
  - [ ] Webhook WhatsApp: validar handshake `GET /api/whatsapp/webhook` con token de verificación.

---

## [ ] FASE 5: Evolución Arquitectónica Post-Deploy (Sin Bloquear Salida Inicial)

- [ ] **Sesión Real y RBAC:** Reemplazar el rol simulado en `ValidateObservatoryAccess.ts` por la
      sesión real del usuario autenticado y conectar integración `gov.br` OIDC
      (`.docs/pendientes-a-implementar/gov_br_integration_manifesto.md`).
- [ ] **TanStack Query (`ADR 0026`):** Implementar _pre-fetching_ de gastos públicos en el
      Observatorio y mutaciones resilientes offline conectadas a `SyncSentrySlice`.
- [ ] **Migración Gradual de Silos `i18n/` (`ADR 0030`):** Convertir los 13 silos aún en
      `LEGACY_FLAT_FILE` (`apps/.../newsletter/welcome`, `apps/.../observatorio` y librerías
      restantes) al formato canónico `i18n/<locale>/<namespace>.json` y activar
      `isFailFastOnParityViolationBoolean: true` en todos los entornos.
- [ ] **Cobertura QA Mirror (`tests/`):** Ampliar especificaciones `.spec.ts` en `tests/` para
      cubrir contratos, gateways API, drivers de IA y utilidades hacia el umbral del 80% configurado
      en `tests/jest.config.ts`.
