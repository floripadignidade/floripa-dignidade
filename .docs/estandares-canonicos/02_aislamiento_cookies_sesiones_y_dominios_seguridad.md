# 02. AISLAMIENTO DE COOKIES, SESIONES Y DOMINIOS DE SEGURIDAD

**Código:** ADR 0032 / OEDP-V18.1  
**Estado:** VIGENTE / NORMA TÉCNICA  
**Ámbito de Aplicación:** `apps/content-manager-system`, `apps/floripa-dignidade`,
`@floripa-dignidade/routing`, `@floripa-dignidade/shared-state-store`,
`@floripa-dignidade/environment-validator`  
**Normas de Referencia:** RFC 6265bis (Prefijos `__Host-` y `__Secure-`), OWASP ASVS v4.0 (Secciones
V3 y V8), ISO/IEC 27001 (Control A.9), ISO/IEC 27701, LGPD (Lei 13.709/2018) e ISO/IEC 11179  
**Objetivo Técnico:** Gobernar el ciclo de vida criptográfico, el aislamiento por dominio de origen
y las restricciones de almacenamiento de sesiones autenticadas entre el CMS y el Portal Ciudadano,
anulando ataques de XSS, CSRF y Cookie Tossing.

---

## 1. Misión y Fundamento Técnico (El Porqué)

El ecosistema Floripa Dignidade despliega dos aplicaciones Next.js independientes
(`apps/content-manager-system` y `apps/floripa-dignidade`). Compartir nombres de cookie por defecto
(`payload-token`), exponer tokens en almacenamiento accesible desde JavaScript o omitir
restricciones de host abre vectores críticos de secuestro de sesión entre subdominios y escalamiento
de privilegios.

Este estándar impone separación criptográfica y operativa absoluta entre ambos contextos de
ejecución (_Fail-Closed_ en servidor y aislamiento estricto _Host-Only_ bajo RFC 6265bis).

---

## 2. Reglas de Inviolabilidad (Leyes de Oro / Prohibiciones)

1. **Aislamiento Total de Contextos (CMS vs. Portal):**
   - Queda estrictamente prohibido compartir nombre, prefijo o clave de firma de cookie entre el CMS
     y el Portal Ciudadano.
   - Ninguna aplicación intentará leer, decodificar ni validar la cookie emitida por la otra
     aplicación.
2. **Prohibición de Almacenamiento en Cliente:**
   - Queda terminantemente prohibido almacenar tokens de sesión (`JWT`, `access_token`,
     `refresh_token`), secretos o contraseñas en `localStorage`, `sessionStorage`, `IndexedDB` o en
     `@floripa-dignidade/shared-state-store`.
3. **Prohibición de Atributo `Domain` en Cookies `__Host-`:**
   - En producción sobre HTTPS, toda cookie `__Host-` debe omitir el atributo `Domain` (quedando
     restringida al host exacto emisor) y declarar obligatoriamente `Secure: true` y `Path=/`.
4. **Prohibición de Acceso Directo a `process.env`:**
   - La lectura de entorno para determinar `NODE_ENV` o el protocolo HTTPS debe resolverse mediante
     `ValidateEnvironmentContract()` o `GatherEnvironmentMetadata()`.
5. **Política Fail-Closed en Servidor:**
   - Ninguna ruta privada ni endpoint autenticado puede confiar en banderas booleanas de cliente.
     Ante cookie ausente, expirada o corrupta, el servidor debe invalidar la cookie (`Max-Age=0`) y
     responder con redirección controlada o estado HTTP `401`/`403` propagando
     `X-Floripa-Correlation-ID`.

---

## 3. Especificación Técnica y Contratos Estructurales

### 3.1. Matriz Canónica de Nombres de Cookie

| Aplicación                    | Entorno                       | Identificador / Prefijo Configurado | Cookie Emitida al Navegador |
| :---------------------------- | :---------------------------- | :---------------------------------- | :-------------------------- |
| `apps/content-manager-system` | Producción HTTPS              | `cookiePrefix: '__Host-fd_cms'`     | `__Host-fd_cms-token`       |
| `apps/content-manager-system` | Desarrollo HTTP (`localhost`) | `cookiePrefix: 'fd_cms'`            | `fd_cms-token`              |
| `apps/floripa-dignidade`      | Producción HTTPS              | Cookie de sesión ciudadana          | `__Host-fd_citizen_session` |
| `apps/floripa-dignidade`      | Desarrollo HTTP (`localhost`) | Cookie de sesión ciudadana          | `fd_citizen_session`        |

### 3.2. Atributos Obligatorios de Transporte y Tamaño

- `HttpOnly: true`: inaccesible desde `document.cookie` (mitigación XSS).
- `Secure`: `true` en producción y siempre que el origen utilice `https://`; `false` únicamente en
  desarrollo local sobre `http://localhost` para compatibilidad con navegadores.
- `SameSite`: `'Lax'` para sesiones de navegación o `'Strict'` para tokens sensibles de mutación en
  el mismo sitio.
- `Path`: `'/'`.
- **Presupuesto de cabecera:** el tamaño acumulado de las cookies por solicitud HTTP debe mantenerse
  estrictamente por debajo de **4 KB** para evitar rechazos
  `HTTP 431 Request Header Fields Too Large` en Vercel Edge.

### 3.3. Conexión Verificada en Payload CMS (`payload.config.ts`)

En Payload CMS 3.84+, el nombre físico de la cookie de autenticación se deriva automáticamente del
campo `cookiePrefix` como `${cookiePrefix}-token`. El objeto `auth.cookies` no recibe la propiedad
`name`, sino únicamente `secure`, `sameSite` y `domain` (omitido para conservar el comportamiento
_Host-Only_):

```typescript
const validatedEnvironmentMetadata = await ValidateEnvironmentContract();
const isProductionEnvironmentBoolean = validatedEnvironmentMetadata.NODE_ENV === 'production';
const isSecureHttpsProtocolBoolean = resolvedServerUrlLiteral.startsWith('https://');
const isHostPrefixedCookieEligibleBoolean =
  isProductionEnvironmentBoolean && isSecureHttpsProtocolBoolean;

const cmsCookiePrefixLiteral = isHostPrefixedCookieEligibleBoolean ? '__Host-fd_cms' : 'fd_cms';

export default buildConfig({
  serverURL: resolvedServerUrlLiteral,
  cookiePrefix: cmsCookiePrefixLiteral,
  csrf: allowedOriginsCollection,
  cors: allowedOriginsCollection,
  collections: [
    {
      ...CitizenUsersCollection,
      auth: {
        ...(typeof CitizenUsersCollection.auth === 'object' ? CitizenUsersCollection.auth : {}),
        cookies: {
          secure: isSecureHttpsProtocolBoolean,
          sameSite: 'Lax' as const,
        },
      },
    },
  ],
});


3.4. Validación y Purga en Servidor
En apps/content-manager-system, ResolveCmsSessionSnapshot valida la cookie recibida mediante payload.auth({ headers, canSetHeaders: false }) en rutas force-dynamic sin exponer PII en TelemetrySignalSchema.
El cierre de sesión en el CMS ejecuta POST /api/citizen-users/logout con credentials: 'include', invalidando la cookie desde el servidor.
En apps/floripa-dignidade, los interceptores y páginas protegidas validan la sesión ciudadana exclusivamente en el servidor antes de emitir datos fiscales o administrativos.
4. Matriz de Compatibilidad y Mitigación de Regresiones
Escenario	Riesgo Técnico	Mitigación Obligatoria
Desarrollo local sobre http://localhost	Los navegadores rechazan cookies __Host- sin TLS.	Conmutar dinámicamente el prefijo a 'fd_cms' cuando la URL no inicia con https://.
Despliegues de previsualización en Vercel	Bloqueo CSRF (403) si solo se autoriza el dominio final de producción.	Incluir dinámicamente VERCEL_URL, VERCEL_BRANCH_URL y VERCEL_PROJECT_PRODUCTION_URL en csrf y cors.
Variable NODE_ENV=development en Vercel	Desactiva el prefijo __Host- en producción.	No fijar NODE_ENV manualmente en el panel de Vercel; delegar la inyección nativa de la plataforma.

---


```
