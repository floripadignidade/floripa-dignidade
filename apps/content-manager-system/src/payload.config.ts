/**
 * @section CMS Architecture - Sovereign Orchestrator (GA Stable)
 * @description Punto de ensamblaje maestro para el sistema de gestión de contenidos.
 * Orquesta la persistencia en Postgres, el almacenamiento multimedia en la nube
 * (S3-Compatible), el motor de edición Lexical y la jerarquía de seguridad
 * institucional basada en roles (RBAC).
 *
 * Protocolo OEDP-V17.0 - High Performance & Zero Abbreviations.
 * SANEADO Zenith: Resolución de Paradoja Asíncrona vía Top-Level Await,
 * normalización de rutas físicas (Sovereign Path) e inyección de ADN tipado.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { buildConfig } from 'payload';

/* 1. Almas Lingüísticas (Administrative Interface Internationalization) */
import { en } from '@payloadcms/translations/languages/en';
import { es } from '@payloadcms/translations/languages/es';
import { pt } from '@payloadcms/translations/languages/pt';

/* 2. Infraestructura Core & Guardianes de Integridad */
import { ValidateEnvironmentAduana } from '@floripa-dignidade/environment-validator';

/* 3. Motores de Infraestructura Atomizados (Swiss-Watch Pattern) */
import { CreatePostgresDatabaseAdapter } from './infrastructure/PostgresDatabaseAdapter';
import { LexicalEditorSovereign } from './infrastructure/LexicalEditorSovereign';
import { CreateCloudStoragePlugin } from './infrastructure/CloudStoragePlugin';
import { ResolveAbsoluteSovereignPath } from './utility/pathUtility';

/* 4. Bóveda de Colecciones Soberanas (Domain Specific Logic) */
import { CitizenUsersCollection } from './collections/identity/CitizenUsers.collection';
import { OrganizationsCollection } from './collections/governance/Organizations.collection';
import { MediaVaultCollection } from './collections/infrastructure/MediaVault.collection';

/**
 * @section Pre-flight Infrastructure Audit
 * @description Extraemos y validamos los metadatos del entorno antes del arranque.
 * 🛡️ SANEADO Zenith: Inyección de Top-Level Await.
 * La aduana garantiza de forma asíncrona que el sistema no inicie en un estado de
 * corrupción técnica (Ej: Secrets faltantes en el Edge).
 */
const validatedEnvironmentInfrastructureMetadata = await ValidateEnvironmentAduana();

/**
 * @name SovereignPayloadConfiguration
 * @description Manifiesto de configuración maestro para el búnker administrativo.
 */
export default buildConfig({
  /**
   * @section Gobernanza de Red
   */
  serverURL: validatedEnvironmentInfrastructureMetadata.NEXT_PUBLIC_SITE_URL,

  admin: {
    /** 🛡️ SANEADO: Vinculación con la colección de identidad profesional */
    user: CitizenUsersCollection.slug,

    meta: {
      titleSuffix: '- Floripa Dignidade CMS',
    },
  },

  /**
   * @section Bóveda de Colecciones (Ejes de Valor Social)
   */
  collections:[
    CitizenUsersCollection,
    OrganizationsCollection,
    MediaVaultCollection,
  ],

  /**
   * @section Capas de Persistencia y Edición (Delegación Atómica)
   */
  db: CreatePostgresDatabaseAdapter(validatedEnvironmentInfrastructureMetadata.DATABASE_URL),
  editor: LexicalEditorSovereign,

  /**
   * @section Capa de Plugins (Sovereign Infrastructure Extensions)
   * Implementa el túnel de almacenamiento S3-Compatible hacia Supabase Storage.
   */
  plugins:[
    CreateCloudStoragePlugin({
      endpointLiteral: validatedEnvironmentInfrastructureMetadata.S3_ENDPOINT,
      accessKeyIdSecret: validatedEnvironmentInfrastructureMetadata.S3_ACCESS_KEY_ID,
      secretAccessKeySecret: validatedEnvironmentInfrastructureMetadata.S3_SECRET_ACCESS_KEY,
      regionLiteral: validatedEnvironmentInfrastructureMetadata.S3_REGION,
      bucketNameLiteral: validatedEnvironmentInfrastructureMetadata.S3_BUCKET,
    }),
  ],

  /**
   * @section Seguridad Criptográfica ISO
   */
  secret: validatedEnvironmentInfrastructureMetadata.PAYLOAD_SECRET,

  /**
   * @section Soporte Lingüístico Administrativo
   */
  i18n: {
    supportedLanguages: { pt, es, en },
  },

  /**
   * @section Configuración de ADN Técnico (TypeScript)
   * 🛡️ SANEADO Zenith: Resolución de ruta absoluta para asegurar builds deterministas
   * evitando errores de IO en el sistema de archivos virtual de Vercel/Turbopack.
   */
  typescript: {
    outputFile: ResolveAbsoluteSovereignPath(
      process.cwd(),
      'apps/content-manager-system/src/payload-types.ts'
    ),
  },
});
