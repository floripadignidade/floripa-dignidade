# 03. ARQUITECTURA EDITORIAL DE BLOG DE NOTICIAS, CMS Y PORTAL CIUDADANO

**Código:** ADR 0034 / OEDP-V18.1  
**Estado:** VIGENTE / NORMA TÉCNICA  
**Ámbito de Aplicación:** `apps/content-manager-system`, `apps/floripa-dignidade`,
`@floripa-dignidade/contracts`, `@floripa-dignidade/environment-validator`,
`@floripa-dignidade/search-engine`, `@floripa-dignidade/reputation-engine`,
`@floripa-dignidade/telemetry`  
**Normas de Referencia:** ISO/IEC 11179 (Nomenclatura Prosa), ISO/IEC 25010 (Confiabilidad y
Rendimiento), ISO/IEC 27001 / 27701, LGPD (Lei 13.709/2018), W3C WCAG 2.2 Nivel AAA, BCP 47
(RFC 5646) y Schema.org (`NewsArticle`)  
**Objetivo Técnico:** Establecer la arquitectura de extremo a extremo para la creación, custodia
multimedia, publicación multilingüe, sincronización segura entre aplicaciones y renderizado de alto
rendimiento de las noticias del Blog institucional (`/[locale]/prensa` y secciones derivadas)
originadas en Payload CMS hacia el Portal Ciudadano.

---

## 1. Misión y Fundamento Técnico (El Porqué)

El Portal Ciudadano (`apps/floripa-dignidade`) y el Content Manager System
(`apps/content-manager-system`) se despliegan como aplicaciones Next.js 16 independientes sobre
Vercel (ADR 0031 / ADR 0032). Las noticias y boletines editoriales nacen en el CMS bajo flujo
autenticado con editor Lexical e imágenes almacenadas en `media-vault` (Supabase S3), pero deben
consumirse públicamente en el Portal con latencia mínima, SEO técnico de grado E-E-A-T, validación
Zod en runtime y cero exposición de datos personales o credenciales administrativas.

Este estándar define las colecciones canónicas del CMS, los contratos compartidos en
`@floripa-dignidade/contracts`, la pasarela de ingesta incremental con revalidación bajo demanda y
las garantías de privacidad LGPD para todo el ciclo editorial.

---

## 2. Reglas de Inviolabilidad (Leyes de Oro / Prohibiciones)

1. **Aislamiento Total de Sesiones y Bases Administrativas:**
   - El Portal Ciudadano jamás importará credenciales de administrador de Payload ni leerá cookies
     `__Host-fd_cms-token`. Toda consulta editorial desde el Portal hacia el CMS consume
     exclusivamente endpoints públicos de solo lectura sobre registros en estado `PUBLISHED`.
2. **Prohibición de Renderizar Datos Crudos del CMS sin Validación Zod:**
   - Ninguna respuesta JSON proveniente de Payload CMS puede ingresar directamente a componentes
     React o `next/image`. Debe superar una aduana `safeParse()` estricta en servidor; todo registro
     malformado se descarta individualmente emitiendo una señal `WARNING` a `EmitTelemetrySignal`.
3. **Prohibición de Imágenes Remotas sin `remotePatterns` ni Texto Alternativo:**
   - Toda fotografía de portada cargada en `media-vault` exige `alternativeTextLiteral` accesible
     (WCAG 2.2). `apps/floripa-dignidade/next.config.js` debe autorizar explícitamente los orígenes
     HTTPS del CMS y Supabase Storage mediante `images.remotePatterns`.
4. **Prohibición de Exposición de PII en Autorías y Metadatos (LGPD):**
   - Los artículos públicos jamás exponen `email`, CPF ni identificadores privados del operador
     creador. La autoría pública muestra únicamente el alias institucional editorial o nombre
     público autorizado.
5. **Disponibilidad Continua (Resiliencia Fail-Soft en Lectura Pública):**
   - Si el CMS no está configurado en el entorno o experimenta latencia/caída de red, las páginas
     públicas del Portal no deben devolver error HTTP 500 ni pantalla en blanco; aplican respaldo
     curado en memoria/i18n y registran el incidente en telemetría SRE.

---

## 3. Especificación Técnica y Contratos Estructurales

### 3.1. Colecciones Canónicas en `apps/content-manager-system`

Todas las colecciones editoriales residen en
`apps/content-manager-system/src/collections/editorial/` siguiendo el patrón atómico de 4 archivos
(`AccessPolicy`, `Fields`, `ForensicHooks` y orquestador `.collection.ts`):

1. **`municipal-secretariats` (`MunicipalSecretariats.collection.ts`):**
   - `secretariatIdentifier`: identificador único inmutable (ejemplo: `SOCIAL_ASSISTANCE`,
     `PUBLIC_HEALTH`, `EDUCATION_CITIZENSHIP`, `INFRASTRUCTURE_SANITATION`).
   - `slugLiteral`: ruta URL-safe única.
   - Campos localizados (`localized: true` en Payload para `pt`, `es`, `en`):
     `secretariatNameLiteral`, `executiveSummaryLiteral`, `keyFocusAreaLiteral`.
   - `displayOrderNumeric`: orden editorial en portada.
   - `operationalStatusLiteral`: `'ACTIVE' | 'ARCHIVED'`.
   - Política RBAC: lectura pública solo para registros `ACTIVE`; escritura restringida a
     `INFRASTRUCTURE_ADMINISTRATIVE_AUDITOR`, `PLATFORM_GLOBAL_MANAGER` y
     `ORGANIZATION_ADMINISTRATOR`.

2. **`news-articles` (`NewsArticles.collection.ts`):**
   - `slugLiteral`: identificador único URL-safe para `/[locale]/prensa/[slug]`.
   - `editorialChannelLiteral`: `'PRESS_BLOG' | 'TRANSPARENCY_GAZETTE' | 'BOTH'`.
   - `isFeaturedInHeroCarouselBoolean`: bandera para destacar en el carrusel Hero principal.
   - `carouselPriorityNumeric`: prioridad de ordenamiento en portada (descendente).
   - `secretariatRelation`: relación obligatoria hacia `municipal-secretariats`.
   - `coverMediaRelation`: relación `upload` hacia `media-vault` (aprovecha variantes
     `standard_card` WebP y `forensic_high_definition` AVIF).
   - Campos localizados (`pt`, `es`, `en`): `headlineLiteral`, `summaryLiteral` (resumen ejecutivo
     acotado para tarjetas y carrusel, `<= 280` caracteres), `articleRichContent` (Lexical Editor).
   - `verificationStatusLiteral`: `'VERIFIED_AUDIT' | 'MONITORING_ACTIVE' | 'CRITICAL_ALERT'`.
   - `sourceReferenceLiteral`: respaldo documental oficial (Diário Oficial, Contrato, Termo MROSC).
   - `targetObservatoryPathLiteral`: enlace relativo interno validado hacia
     `/observatorio/gastos-publicos` o `/denuncia`.
   - `publicationStatusLiteral`: `'DRAFT' | 'PUBLISHED' | 'ARCHIVED'` (lectura pública restringida
     estrictamente a `'PUBLISHED'` en `NewsArticlesAccessPolicy`).
   - `publishedAtTimestampISO`: fecha de publicación oficial.
   - `publicAuthorAliasLiteral` y `organizationOwnerIdentifier`: referencia multi-tenant y autoría
     libre de PII.

### 3.2. Contrato SSOT en `@floripa-dignidade/contracts`

Se define un contrato compartido inmutable (`NewsArticleSummarySchema` y
`MunicipalSecretariatSummarySchema`) con `.readonly()`, validación estricta de rutas relativas
(`/^\/(?!\/)[^\s]*$/`), validación HTTPS en `coverImageUrlLiteral` y normalización de fecha ISO para
su consumo seguro tanto por `apps/floripa-dignidade` como por `@floripa-dignidade/search-engine`
(`NEWS_ARTICLE`) y `@floripa-dignidade/reputation-engine` (`NEWS_ARTICLE_CONTENT`).

### 3.3. Estrategia de Sincronización, Caché y Revalidación (CMS ➔ Portal)

1. **Lectura en Servidor (RSC) con Timeout SRE:**
   - El adaptador del Portal consulta el endpoint REST del CMS con `AbortSignal.timeout(5000)`,
     filtrando `where[publicationStatusLiteral][equals]=PUBLISHED` y mapeando el código BCP 47 del
     Portal (`pt-BR`, `es-ES`, `en-US`) al código base del CMS (`pt`, `es`, `en`) mediante el
     catálogo SSOT `SUPPORTED_LOCALES_REGISTRY`.
2. **ISR + Revalidación Instantánea por Webhook:**
   - Las consultas emplean
     `next: { revalidate: 60, tags: ['cms-news-articles', 'cms-secretariats'] }`.
   - El hook `afterChange` / `afterDelete` de `NewsArticlesForensicHooks` notifica al endpoint
     `POST /api/cms/revalidate` del Portal usando firma HMAC o token validado en tiempo constante
     (`timingSafeEqual`) para ejecutar `revalidateTag(...)` sin esperar los 60 segundos.

### 3.4. SEO Técnico, Metadatos E-E-A-T y Core Web Vitals

- Cada página individual de artículo (`/[locale]/prensa/[slug]`) inyecta JSON-LD `NewsArticle`
  (`headline`, `description`, `datePublished`, `dateModified`, `image`, `publisher` institucional y
  `inLanguage` BCP 47), además de etiquetas `hreflang` dinámicas y `opengraph-image` optimizada.
- Las fotografías de portada consumidas vía `next/image` utilizan siempre formatos AVIF/WebP,
  `sizes` responsivos y contenedor con relación de aspecto fija (`aspect-[16/9]` o altura explícita)
  para garantizar **`CLS = 0`**.

---

## 4. Matriz de Compatibilidad y Mitigación de Regresiones

| Escenario                                    | Riesgo Técnico                          | Mitigación Obligatoria                                                                                                   |
| :------------------------------------------- | :-------------------------------------- | :----------------------------------------------------------------------------------------------------------------------- |
| CMS sin URL configurada o en mantenimiento   | Fallo en build o HTTP 500 en el Portal  | Respaldo automático en diccionario local/memoria (`Resolve*InMemoryFallback`) y señal `WARNING` en telemetría.           |
| `next build` ejecutando fetch externo        | Timeout o fallo de compilación estática | Usar `dynamic = 'force-dynamic'` o fallback resiliente en `generateStaticParams` cuando no exista `CMS_PUBLIC_BASE_URL`. |
| URL de imagen S3 rechazada por Next.js       | Error de optimización en `/_next/image` | Declarar `images.remotePatterns` HTTPS en `apps/floripa-dignidade/next.config.js` para CMS y Supabase Storage.           |
| Fuga de borradores no publicados (`DRAFT`)   | Exposición prematura de investigaciones | Política `read` en `NewsArticlesAccessPolicy` bloqueando `DRAFT`/`ARCHIVED` para peticiones no autenticadas.             |
| Exposición de correo del periodista/operador | Infracción de privacidad bajo LGPD      | Uso exclusivo de `publicAuthorAliasLiteral` y exclusión explícita de campos PII en respuestas públicas.                  |

---
