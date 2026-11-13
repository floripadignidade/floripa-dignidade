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

- [ ] **Ejecución en Supabase SQL Editor (Proyecto `vekjuwrdeozvvnqyweox`):**
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
