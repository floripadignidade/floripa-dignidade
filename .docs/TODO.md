# 📋 CHECKLIST PRE-VUELO: DESPLIEGUE A PRODUCCIÓN (VERCEL & SUPABASE)

---

## [x] Fase 1: Higiene y Compilación Lingüística (Pre-build Gate)
- [x] Ejecutar `pnpm purge:emissions` para eliminar binarios `.d.ts` o `.js` huérfanos en `libs/`.
- [x] Nivelar el enjambre del compilador Weaver (`i18n-builder`), erradicando advertencias en el despachador de telemetría.
- [x] Ejecutar `pnpm weaver:build` para consolidar los diccionarios unificados en `apps/floripa-dignidade/src/app/i18n/dictionaries/` (completado nominalmente en 142ms).
- [x] Confirmar la generación e integridad del informe forense en `reports/internationalization-audit-report.json`.

---

## [x] Fase 2: Verificación de Integridad de Tipos y Grafo (TypeScript 5.9 / Nx 22)
- [x] Migrar el repositorio remoto de Git a la cuenta institucional oficial: `https://github.com/floripadignidade/floripa-dignidade.git`.
- [x] Corregir la colisión de manifiestos en `apps/floripa-dignidade/package.json` y purgar archivos `.md` parásitos.
- [x] Homogeneizar la versión de Next.js a `~16.1.7` en todo el monorepo.
- [x] Elevar `tsx: "^4.19.0"` a `devDependencies` en el `package.json` raíz y normalizar engines (`node >=20.9.0`).
- [x] Regenerar `pnpm-lock.yaml` localmente y verificar compilación limpia en CI con `--frozen-lockfile`.

---

## [x] Fase 3: Auditoría Física de Secretos e Infraestructura Cloud (Database & APIs)
- [x] Formalizar el contrato inmutable de auditoría en `libs/tools/src/lib/infrastructure-auditor/schemas/CloudInfrastructureAuditReport.schema.ts`.
- [x] Implementar la batería completa de 7 sondas físicas de red y hardware:
  - [x] **PostgreSQL (`DATABASE_URL`):** Handshake SSL de bajo nivel (`node:net` y `node:tls`) con paquete nativo `SSLRequest`.
  - [x] **Supabase REST (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`):** Solicitud ping autenticada a `/rest/v1/`.
  - [x] **Supabase Storage S3 (`S3_*`):** Autenticación AWS Signature Version 4 (SigV4) pura contra bucket `media-vault` en región `sa-east-1`.
  - [x] **Resend Transactional Email (`RESEND_API_KEY`, `RESEND_FROM_EMAIL`):** Validación de token y verificación de dominio remitente.
  - [x] **Google Gemini AI (`GOOGLE_GEMINI_API_KEY`):** Inferencia REST de ultra-baja latencia (< 400ms) contra `gemini-1.5-flash:generateContent`.
  - [x] **Hugging Face Router (`HUGGING_FACE_*`):** Compatibilidad con el nuevo enrutador `router.huggingface.co/hf-inference`.
  - [x] **WhatsApp Meta Gateway (`WHATSAPP_*`):** Verificación de entropía y apretón de manos HMAC-SHA256 en tiempo constante.
- [x] Construir el orquestador concurrente `AuditCloudInfrastructureSecrets.ts` con persistencia en `reports/infrastructure/infrastructure-secrets-audit-report.json`.
- [x] Registrar el disparador CLI en `scripts/src/audit-cloud-infrastructure-secrets.ts` y habilitar el comando `pnpm audit:infrastructure`.

---

## [ ] Fase 4: Ejecución de Migración Relacional (Supabase SQL Ledger)
- [ ] Abrir el panel de Supabase en el proyecto institucional `vekjuwrdeozvvnqyweox` e ingresar al **SQL Editor**.
- [ ] Ejecutar el script maestro de migración: `database/00_migration_master_schema.sql`.
- [ ] Verificar la materialización de la tabla principal `public.citizen_identities_ledger`:
  - [ ] Clave primaria `citizen_id UUID DEFAULT uuid_generate_v4()`.
  - [ ] Índices de alta velocidad: `idx_citizen_email_lookup`, `idx_citizen_trust_weight_score_desc`, `idx_citizen_assigned_authority_role`.
  - [ ] Trigger de actualización automática: `trg_citizen_identity_update_timestamp`.
- [ ] Certificar la activación de Seguridad por Fila (Row Level Security - RLS):
  - [ ] Política de control total para auditores: `Administrative_Auditor_Full_Access`.
  - [ ] Políticas de lectura y actualización restringida para el ciudadano: `Citizen_Self_Read_Access` y `Citizen_Self_Update_Access`.
  - [ ] Política de registro inicial anónimo/delegado: `Citizen_Initial_Registration_Insert`.

---

## [ ] Fase 5: Despliegue Automatizado y Certificación en Producción (Vercel)
- [ ] Confirmar que el commit con las credenciales y el lockfile sincronizado compile en verde en Vercel.
- [ ] Verificar que las variables de entorno de producción contengan:
  - `NEXT_PUBLIC_SITE_URL`
  - `DATABASE_URL`
  - `SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `S3_ENDPOINT`
  - `S3_ACCESS_KEY_ID`
  - `S3_SECRET_ACCESS_KEY`
  - `S3_REGION=sa-east-1`
  - `S3_BUCKET=media-vault`
  - `PAYLOAD_SECRET`
  - `SOVEREIGN_EMERGENCY_TOKEN`
  - `RESEND_API_KEY`
  - `RESEND_FROM_EMAIL`
  - `GOOGLE_GEMINI_API_KEY`
  - `WHATSAPP_VERIFY_TOKEN`
  - `WHATSAPP_APP_SECRET`
- [ ] Realizar una petición de verificación HTTP contra el portal en producción y certificar arranque en frío en Edge (< 50ms).
- [ ] Acceder al panel administrativo `/admin` de Payload CMS y verificar la conexión con PostgreSQL y el almacenamiento S3.

---

