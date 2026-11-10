# 📋 CHECKLIST PRE-VUELO: DESPLIEGUE A PRODUCCIÓN (VERCEL & SUPABASE)

- [ ] **Fase 1: Higiene y Compilación Lingüística (Pre-build Gate)**
  - [ ] Ejecutar `pnpm purge:emissions` para eliminar cualquier `.d.ts` o `.js` huérfano en `libs/`.
  - [ ] Ejecutar `pnpm weaver:build` para compilar los diccionarios unificados en `apps/floripa-dignidade/src/app/i18n/dictionaries/`.
  - [ ] Confirmar que no existan advertencias de esquemas en `reports/internationalization-audit-report.json`.

- [ ] **Fase 2: Verificación de Integridad de Tipos y Grafo (TypeScript 5.9)**
  - [ ] Ejecutar `pnpm typecheck` (todos los 32 proyectos del monorepo deben compilar con 0 errores).
  - [ ] Ejecutar `pnpm lint` para auditar la conformidad de límites modulares (`@nx/enforce-module-boundaries`).

- [ ] **Fase 3: Auditoría Física de Secretos e Infraestructura Cloud (Database & APIs)**
  - [ ] Validar variables de entorno en producción (Vercel Project Settings) contra `Environment.schema.ts`:
    - `SUPABASE_URL`: Endpoint HTTPS accesible.
    - `SUPABASE_SERVICE_ROLE_KEY`: Token de servicio con longitud $\ge 50$.
    - `DATABASE_URL`: Connection string Postgres con SSL activo (`sslmode=require`).
    - `S3_ENDPOINT`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_BUCKET`: Conectividad con Supabase Storage.
    - `PAYLOAD_SECRET`: Token criptográfico $\ge 32$ caracteres.
    - `RESEND_API_KEY`: Clave válida iniciada en `re_`.
    - `WHATSAPP_VERIFY_TOKEN` & `WHATSAPP_APP_SECRET`: Handshake activo en Meta Developers.
    - `HUGGING_FACE_API_TOKEN` & `HUGGING_FACE_MODEL_URL`: Modelo SLM en Hugging Face Spaces activo.

- [ ] **Fase 4: Ejecución de Migración Relacional (Supabase SQL)**
  - [ ] Ejecutar `database/migration_master_schema.sql` en la consola SQL de Supabase.
  - [ ] Verificar la activación de Row Level Security (RLS) en las 10 tablas del ledger.

- [ ] **Fase 5: Despliegue Automatizado en Vercel**
  - [ ] Ejecutar `pnpm vercel-build` localmente para simular el pipeline del hosting.
  - [ ] Disparar el build de producción en Vercel con monitoreo de Cold Starts (< 50ms en Edge).

  ---

  - [x] **Fase 1: Higiene y Compilación Lingüística (Pre-build Gate)**
  - [x] Ejecutar `pnpm purge:emissions` para eliminar cualquier `.d.ts` o `.js` huérfano en `libs/`.
  - [x] Ejecutar `pnpm weaver:build` para compilar los diccionarios unificados en `apps/floripa-dignidade/src/app/i18n/dictionaries/`.
  - [x] Confirmar que no existan advertencias de esquemas en `reports/internationalization-audit-report.json`.

- [x] **Fase 2: Verificación de Integridad de Tipos y Grafo (TypeScript 5.9)**
  - [x] Saneamiento de manifiestos y nombres de paquetes (`@floripa-dignidade/floripa-dignidade`).
  - [x] Migración y sincronización con nuevo repositorio remoto `floripadignidade/floripa-dignidade`.

- [/] **Fase 3: Auditoría Física de Secretos e Infraestructura Cloud (Database & APIs)**
  - [x] Construcción del contrato SSOT `CloudInfrastructureAuditReport.schema.ts`.
  - [x] Sonda PostgreSQL (`DATABASE_URL`).
  - [x] Sonda Supabase PostgREST (`SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY`).
  - [x] Sonda Supabase S3 Gateway (`S3_ENDPOINT`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_BUCKET`).
  - [x] Sonda Resend Email (`RESEND_API_KEY` y `RESEND_FROM_EMAIL`).
  - [x] Sonda Hugging Face SLM (`HUGGING_FACE_API_TOKEN` y `HUGGING_FACE_MODEL_URL`).
  - [x] Sonda WhatsApp Webhook (`WHATSAPP_VERIFY_TOKEN` y `WHATSAPP_APP_SECRET`).
  - [x] Orquestador central concurrente (`AuditCloudInfrastructureSecrets.ts`).
  - [ ] Disparador CLI en `scripts/src/audit-cloud-infrastructure-secrets.ts`.

  ---

  