# Estándar Canónico: Autenticación Institucional, Cookies Seguras y Gobernanza del CMS

**Código:** ADR 0031 / OEDP-V18.1  
**Estado:** VIGENTE / LEY DE SEGURIDAD PERIMETRAL  
**Ámbito:** `apps/content-manager-system`, `apps/floripa-dignidade`, `@floripa-dignidade/contracts`,
`@floripa-dignidade/identity`  
**Normas Aplicadas:** ISO/IEC 27001 (Seguridad de la Información), ISO/IEC 27701 / LGPD Lei
13.709/2018 (Privacidad), ISO/IEC 25010 (Seguridad y Confiabilidad), ISO/IEC 11179 (Nomenclatura
Técnica), OWASP ASVS (Session Management), RFC 6265bis (Cookies), W3C WCAG 2.2 AAA.

---

## 1. Principios de Arquitectura de Sesión (Zero-Trust & Fail-Closed)

1. **Soberanía de Cookies en Servidor (`HttpOnly`):**
   - Toda sesión autenticada (tanto en el CMS con Payload CMS como en el Portal con Supabase/OIDC)
     debe almacenarse exclusivamente en cookies emitidas por el servidor con los atributos
     `HttpOnly`, `Secure` (en HTTPS/producción), `SameSite=Lax` (para navegación OIDC/panel) o
     `SameSite=Strict` (para acciones sensibles en el mismo sitio), `Path=/` y tamaño total por
     cookie estrictamente menor a **4 KB**.
   - Queda **estrictamente prohibido** guardar tokens de sesión (`JWT`, `payload-token`,
     `access_token`, `refresh_token`) en `localStorage`, `sessionStorage`, estado global persistido
     (`shared-state-store`) o variables de cliente.
2. **Validación Perimetral en el Servidor (Nunca solo en Cliente):**
   - Ninguna página protegida ni endpoint privado puede confiar en banderas booleanas de cliente ni
     en roles codificados en duro.
   - Toda ruta protegida debe verificar la sesión criptográfica en el servidor antes de renderizar
     datos o ejecutar mutaciones. En caso de ausencia, expiración o rol insuficiente, aplica
     política **Fail-Closed** (redirección controlada o `HTTP 401/403`).
3. **Separación Estructural de Contextos en el CMS (`(app)` vs `(payload)`):**
   - En `apps/content-manager-system/src/app/`, el panel administrativo de Payload y el portal de
     bienvenida/acceso del CMS deben estar aislados en grupos de ruta independientes para no
     colisionar en etiquetas `<html><body>` ni en contextos de cliente/servidor:
     - `src/app/(app)/layout.tsx` y `src/app/(app)/page.tsx`: Carcasa institucional de bienvenida y
       acceso del CMS (verifica cookie de sesión en el servidor).
     - `src/app/(payload)/layout.tsx`: Envoltorio oficial de Payload CMS (`RootLayout` y
       `handleServerFunctions` desde `@payloadcms/next/layouts` + `@payloadcms/next/css`).
     - `src/app/(payload)/admin/[[...segments]]/page.tsx`: Punto de entrada del panel administrativo
       (`RootPage`).
     - `src/app/(payload)/api/*`: Manejadores REST y GraphQL de Payload.
   - Queda prohibido mantener un `src/app/layout.tsx` raíz duplicando `<html>` por encima de
     `(payload)/layout.tsx`.

---

## 2. Flujo Canónico de la Página de Bienvenida y Acceso del CMS (`/`)

La ruta raíz `/` del proyecto `apps/content-manager-system` actúa como **Estación de Bienvenida y
Control de Acceso Institucional**:

1. **Verificación de Sesión en Servidor (RSC):**
   - Al solicitar `/`, un átomo servidor dedicado (`ResolveCmsSessionSnapshot`) lee las cabeceras de
     la solicitud (`await headers()`), resuelve la instancia inicializada de Payload
     (`getPayload({ config })`) y ejecuta `payload.auth({ headers })` (validando la cookie
     `HttpOnly` `payload-token`).
   - En paralelo o de forma condicional, consulta el conteo de usuarios en `citizen-users`
     únicamente si no hay sesión, para detectar el estado de **Bootstrap Inicial**
     (`totalUsers === 0`).
2. **Matriz de Decisión Determinista en `/`:**
   - **Caso A — Sistema sin usuarios (`totalUsers === 0`):** Renderiza vista de bienvenida de
     inicialización controlada invitando únicamente a completar el registro del primer administrador
     en `/admin/create-first-user`.
   - **Caso B — Visitante sin cookie válida o rol insuficiente (`IDENTITY_ANONYMOUS` /
     `IDENTITY_REGISTERED`):**
     - No muestra métricas internas ni enlaces de operación administrativa abierta.
     - Presenta una puerta de acceso institucional (accesible WCAG 2.2 AAA, `noindex/nofollow`) o
       redirige limpiamente hacia `/admin/login` (usando `redirect()` fuera de bloques `try/catch` y
       `TraceExecutionTime`), con mensaje claro y enlace de retorno al Portal Ciudadano
       (`NEXT_PUBLIC_PORTAL_URL` o información institucional).
   - **Caso C — Operador / Auditor Autenticado (`INFRASTRUCTURE_ADMINISTRATIVE_AUDITOR`,
     `PLATFORM_GLOBAL_MANAGER`, `ORGANIZATION_ADMINISTRATOR`, `ORGANIZATION_OPERATOR`):**
     - Renderiza la **Página de Bienvenida Operativa** personalizada con el rol institucional (sin
       exponer PII sensible en telemetría), estado de salud del nodo, enlace directo a `/admin` y
       acceso controlado a cierre de sesión (`POST /api/citizen-users/logout`).
3. **Protección contra Indexación y Caché Indebida:**
   - Tanto `(app)/layout.tsx` como `(payload)/layout.tsx` deben declarar
     `robots: { index: false, follow: false, nocache: true }` y las rutas protegidas de bienvenida
     deben declarar `export const dynamic = 'force-dynamic'` y cabeceras `Cache-Control: no-store`.

---

## 3. Gobernanza de Colección de Usuarios y RBAC (`CitizenUsers`)

1. **Única Fuente de Verdad de Roles:**
   - Los roles autorizados para operar en el CMS y en áreas administrativas del Portal provienen
     exclusivamente de `IDENTITY_ACCESS_ROLES_COLLECTION` (`@floripa-dignidade/contracts`).
2. **Endurecimiento de Registro (`CitizenUsersAccessPolicy`):**
   - Queda prohibido mantener `create: () => true` de forma permanente en colecciones
     administrativas del CMS.
   - Regla obligatoria para `create`:
     - Permitido si el operador autenticado posee `INFRASTRUCTURE_ADMINISTRATIVE_AUDITOR` o
       `PLATFORM_GLOBAL_MANAGER`.
     - Permitido de forma anónima **únicamente** durante el bootstrap inicial
       (`count(citizen-users) === 0`), asignando en hook `beforeChange` el primer rol administrativo
       controlado o validando la integridad inicial.
3. **Protección contra Fuerza Bruta y Bloqueo:**
   - Configuración obligatoria en `auth`: `tokenExpiration` acotado (máximo `7200` segundos = 2
     horas), `maxLoginAttempts: 5`, `lockTime: 600000` (10 minutos).
4. **Privacidad LGPD en Auditoría y Telemetría:**
   - Los hooks forenses (`afterChange`, `afterDelete`, `afterLogin`) y la telemetría de
     autenticación deben emitir señales conformes a `TelemetrySignalSchema`
     (`occurrenceTimestampISO`, `CorrelationIdentifier`, `semanticIntentTag`) usando exclusivamente
     identificadores opacos (`id` o literal enmascarado vía `MaskCitizenIdentity`). Queda
     estrictamente prohibido registrar `email`, contraseñas, tokens o cookies crudas.

---

## 4. Gobernanza de Persistencia PostgreSQL en Producción (Supabase)

1. **Provisión Previa de Tablas:**
   - Ningún despliegue en producción puede depender de la creación automática en frío de tablas de
     Payload (`push` en runtime). Las tablas de colecciones de Payload y las migraciones SQL de
     `database/` deben estar provisionadas en Supabase antes de abrir tráfico.
2. **Resiliencia de Pooler (`PostgresDatabaseAdapter`):**
   - El adaptador de PostgreSQL debe mantener `connectionTimeoutMillis` calibrado para conexiones
     serverless TLS hacia Supabase (`>= 10000` ms) y límite de conexiones acotado (`max <= 10`) para
     no saturar el pooler en capa gratuita.

---

## 5. Integración en el Portal Ciudadano (`apps/floripa-dignidade`)

1. **Reemplazo de Roles Simulados:**
   - `ValidateObservatoryAccess.ts` y cualquier interceptor de rutas protegidas
     (`ValidateRouteAuthority.ts`) deben consumir la sesión verificada desde cookie `HttpOnly`
     (Supabase Auth SSR y futura federación OIDC `gov.br` Niveles Prata/Ouro según
     `.docs/pendientes-a-implementar/gov_br_integration_manifesto.md`), aplicando redirección a
     `/[locale]/unauthorized` ante acceso anónimo o rango insuficiente.
2. **Cierre de Sesión Seguro:**
   - El cierre de sesión invalida la sesión en el servidor, elimina la cookie `HttpOnly` con
     `Max-Age=0` y purga cualquier borrador no público en el cliente si aplica.

   ***
