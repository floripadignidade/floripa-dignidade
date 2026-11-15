/**
 * @file apps/content-manager-system/src/payload.config.ts
 * @section CMS Infrastructure - Enterprise Administration Configuration (Payload 3.93)
 * @description Manifiesto central de configuración para el sistema de gestión de contenidos (CMS).
 * Orquesta la persistencia en PostgreSQL (Supabase Pooler), la integración con la bóveda
 * multimedia S3 (`media-vault`), el motor de edición de texto Lexical, la internacionalización
 * administrativa (`pt`, `es`, `en`) y la gobernanza estricta de cookies de sesión aisladas
 * conforme a RFC 6265bis, OWASP ASVS v4.0 e ISO/IEC 27001 (ADR 0031 / ADR 0032).
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Clean Paths).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa), ISO/IEC 25010, ISO/IEC 27001 y RFC 6265bis.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { buildConfig } from 'payload';

/* 1. Internacionalización de la Interfaz Administrativa de Payload */
import { en } from '@payloadcms/translations/languages/en';
import { es } from '@payloadcms/translations/languages/es';
import { pt } from '@payloadcms/translations/languages/pt';

/* 2. Infraestructura Core de Entorno y Validación de Secretos */
import { ValidateEnvironmentContract } from '@floripa-dignidade/environment-validator';

/* 3. Adaptadores y Motores de Infraestructura Locales */
import { CreateCloudStoragePlugin } from './infrastructure/CloudStoragePlugin';
import { LexicalEditorSovereign } from './infrastructure/LexicalEditorSovereign';
import { CreatePostgresDatabaseAdapter } from './infrastructure/PostgresDatabaseAdapter';
import { ResolveAbsoluteSovereignPath } from './utility/pathUtility';

/* 4. Colecciones de Identidad, Gobernanza y Acervo */
import { OrganizationsCollection } from './collections/governance/Organizations.collection';
import { CitizenUsersCollection } from './collections/identity/CitizenUsers.collection';
import { MediaVaultCollection } from './collections/infrastructure/MediaVault.collection';

/**
 * @section Auditoría de Entorno Pre-Arranque (Top-Level Await)
 * Certifica que todos los secretos requeridos de base de datos, almacenamiento S3
 * y claves criptográficas estén presentes antes de inicializar Payload CMS.
 */
const validatedEnvironmentInfrastructureMetadata = await ValidateEnvironmentContract();

const isProductionEnvironmentBoolean =
  validatedEnvironmentInfrastructureMetadata.NODE_ENV === 'production';

const isSecureHttpsProtocolBoolean =
  validatedEnvironmentInfrastructureMetadata.NEXT_PUBLIC_SITE_URL.startsWith('https://');

/**
 * @section Gobernanza de Prefijo de Cookie (RFC 6265bis / ADR 0032)
 * En entornos de producción sobre HTTPS se inyecta el prefijo canónico '__Host-fd_cms'
 * (generando la cookie de sesión '__Host-fd_cms-token'), lo que garantiza que la cookie
 * sea exclusiva del host emisor (sin atributo Domain), requiera transporte TLS y esté
 * físicamente aislada del Portal Ciudadano para mitigar ataques de Cookie Tossing.
 */
const isHostPrefixedCookieEligibleBoolean =
  isProductionEnvironmentBoolean && isSecureHttpsProtocolBoolean;

const cmsCookiePrefixLiteral = isHostPrefixedCookieEligibleBoolean ? '__Host-fd_cms' : 'fd_cms';

/**
 * @name payloadConfigurationMaster
 * @description Configuración exportada para el panel administrativo, API REST y GraphQL de Payload.
 */
export default buildConfig({
  /**
   * @section Gobernanza de Red y Origen Canónico
   */
  serverURL: validatedEnvironmentInfrastructureMetadata.NEXT_PUBLIC_SITE_URL,

  /**
   * Prefijo institucional para todas las cookies emitidas por Payload CMS.
   */
  cookiePrefix: cmsCookiePrefixLiteral,

  /**
   * Lista blanca de orígenes autorizados para protección contra CSRF en peticiones con cookies.
   */
  csrf: [validatedEnvironmentInfrastructureMetadata.NEXT_PUBLIC_SITE_URL],

  /**
   * Orígenes permitidos para peticiones CORS cross-origin institucionales.
   */
  cors: [validatedEnvironmentInfrastructureMetadata.NEXT_PUBLIC_SITE_URL],

  admin: {
    /** Vinculación obligatoria con la colección de usuarios del CMS */
    user: CitizenUsersCollection.slug,

    meta: {
      titleSuffix: '- Floripa Dignidade CMS',
      icons: [
        {
          rel: 'icon',
          type: 'image/svg+xml',
          url: '/brand/favicon/favicon.svg',
        },
      ],
      openGraph: {
        images: [
          {
            url: '/meta/opengraph-image.png',
          },
        ],
      },
    },
  },

  /**
   * @section Bóveda de Colecciones Institucionales
   * Enriquecemos la autenticación de `CitizenUsersCollection` con los atributos de transporte seguro.
   */
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
    OrganizationsCollection,
    MediaVaultCollection,
  ],

  /**
   * @section Adaptador Relacional PostgreSQL (Supabase Pooler)
   */
  db: CreatePostgresDatabaseAdapter(validatedEnvironmentInfrastructureMetadata.DATABASE_URL),

  /**
   * @section Editor de Texto Enriquecido
   */
  editor: LexicalEditorSovereign,

  /**
   * @section Adaptador de Almacenamiento S3 (Supabase Storage)
   */
  plugins: [
    CreateCloudStoragePlugin({
      endpointLiteral: validatedEnvironmentInfrastructureMetadata.S3_ENDPOINT,
      accessKeyIdSecret: validatedEnvironmentInfrastructureMetadata.S3_ACCESS_KEY_ID,
      secretAccessKeySecret: validatedEnvironmentInfrastructureMetadata.S3_SECRET_ACCESS_KEY,
      regionLiteral: validatedEnvironmentInfrastructureMetadata.S3_REGION,
      bucketNameLiteral: validatedEnvironmentInfrastructureMetadata.S3_BUCKET,
    }),
  ],

  /**
   * @section Clave Criptográfica de Sesión
   */
  secret: validatedEnvironmentInfrastructureMetadata.PAYLOAD_SECRET,

  /**
   * @section Internacionalización de Interfaz
   */
  i18n: {
    supportedLanguages: { pt, es, en },
  },

  /**
   * @section Generación Determinista de Tipos TypeScript
   */
  typescript: {
    outputFile: ResolveAbsoluteSovereignPath(
      process.cwd(),
      'apps/content-manager-system/src/payload-types.ts',
    ),
  },
});
