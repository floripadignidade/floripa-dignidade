/**
 * @file apps/content-manager-system/src/payload.config.ts
 * @section CMS Infrastructure - Enterprise Administration Configuration (Payload 3.84+)
 * @description Manifiesto central de configuración para el sistema de gestión de contenidos (CMS).
 * Orquesta PostgreSQL (Supabase Pooler), bóveda multimedia S3 (`media-vault`) con `sharp`,
 * editor Lexical, internacionalización administrativa (`pt`, `es`, `en`), lista blanca de
 * orígenes CSRF/CORS y aislamiento estricto de cookies `__Host-` bajo RFC 6265bis (ADR 0031 / ADR 0032).
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Clean Paths).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa), ISO/IEC 25010, ISO/IEC 27001 y RFC 6265bis.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildConfig } from 'payload';
import sharp from 'sharp';

/* 1. Internacionalización de la Interfaz Administrativa de Payload */
import { en } from '@payloadcms/translations/languages/en';
import { es } from '@payloadcms/translations/languages/es';
import { pt } from '@payloadcms/translations/languages/pt';

/* 2. Infraestructura Core de Entorno y Telemetría */
import {
  GatherEnvironmentMetadata,
  ValidateEnvironmentContract,
} from '@floripa-dignidade/environment-validator';
import {
  EmitTelemetrySignal,
  GenerateCorrelationIdentifier,
  type ModuleIdentifier,
  ModuleIdentifierSchema,
  type OperationCode,
  OperationCodeSchema,
} from '@floripa-dignidade/telemetry';

/* 3. Adaptadores y Motores de Infraestructura Locales */
import { CreateCloudStoragePlugin } from './infrastructure/CloudStoragePlugin';
import { LexicalEditorSovereign } from './infrastructure/LexicalEditorSovereign';
import { CreatePostgresDatabaseAdapter } from './infrastructure/PostgresDatabaseAdapter';
import { ResolveAbsoluteSovereignPath } from './utility/pathUtility';

/* 4. Colecciones de Identidad, Gobernanza y Acervo */
import { OrganizationsCollection } from './collections/governance/Organizations.collection';
import { CitizenUsersCollection } from './collections/identity/CitizenUsers.collection';
import { MediaVaultCollection } from './collections/infrastructure/MediaVault.collection';

const CMS_CONFIG_MODULE_IDENTIFIER: ModuleIdentifier = ModuleIdentifierSchema.parse(
  'CMS_PAYLOAD_CONFIGURATION',
);

const CMS_CONFIG_OPERATION_CODE: OperationCode = OperationCodeSchema.parse(
  'CMS_PAYLOAD_CONFIGURATION_INITIALIZED',
);

const normalizeOriginLiteral = (rawCandidateLiteral: string | undefined): string | null => {
  if (!rawCandidateLiteral || rawCandidateLiteral.trim() === '') {
    return null;
  }

  const trimmedLiteral = rawCandidateLiteral.trim().replace(/\/+$/, '');
  if (trimmedLiteral.startsWith('https://') || trimmedLiteral.startsWith('http://')) {
    return trimmedLiteral;
  }

  return `https://${trimmedLiteral}`;
};

const resolveServerUrlLiteral = (
  canonicalSiteUrlLiteral: string,
  environmentMetadataSnapshot: Readonly<Record<string, string | undefined>>,
): string => {
  const isPreviewDeploymentBoolean = environmentMetadataSnapshot['VERCEL_ENV'] === 'preview';
  const previewOriginLiteral = normalizeOriginLiteral(environmentMetadataSnapshot['VERCEL_URL']);

  if (isPreviewDeploymentBoolean && previewOriginLiteral !== null) {
    return previewOriginLiteral;
  }

  return canonicalSiteUrlLiteral;
};

const resolveAllowedOriginsCollection = (
  resolvedServerUrlLiteral: string,
  canonicalSiteUrlLiteral: string,
  environmentMetadataSnapshot: Readonly<Record<string, string | undefined>>,
): string[] => {
  const rawOriginCandidatesCollection = [
    resolvedServerUrlLiteral,
    canonicalSiteUrlLiteral,
    normalizeOriginLiteral(environmentMetadataSnapshot['VERCEL_URL']),
    normalizeOriginLiteral(environmentMetadataSnapshot['VERCEL_BRANCH_URL']),
    normalizeOriginLiteral(environmentMetadataSnapshot['VERCEL_PROJECT_PRODUCTION_URL']),
  ];

  return Array.from(
    new Set(
      rawOriginCandidatesCollection.filter(
        (originLiteral): originLiteral is string => originLiteral !== null,
      ),
    ),
  );
};

const validatedEnvironmentMetadata = await ValidateEnvironmentContract();
const runtimeEnvironmentSnapshot = GatherEnvironmentMetadata();

const canonicalSiteUrlLiteral = validatedEnvironmentMetadata.NEXT_PUBLIC_SITE_URL.trim().replace(
  /\/+$/,
  '',
);
const resolvedServerUrlLiteral = resolveServerUrlLiteral(
  canonicalSiteUrlLiteral,
  runtimeEnvironmentSnapshot,
);
const allowedOriginsCollection = resolveAllowedOriginsCollection(
  resolvedServerUrlLiteral,
  canonicalSiteUrlLiteral,
  runtimeEnvironmentSnapshot,
);

const isProductionEnvironmentBoolean = validatedEnvironmentMetadata.NODE_ENV === 'production';
const isSecureHttpsProtocolBoolean = resolvedServerUrlLiteral.startsWith('https://');
const isHostPrefixedCookieEligibleBoolean =
  isProductionEnvironmentBoolean && isSecureHttpsProtocolBoolean;

const cmsCookiePrefixLiteral = isHostPrefixedCookieEligibleBoolean ? '__Host-fd_cms' : 'fd_cms';
const currentConfigDirectoryPathLiteral = dirname(fileURLToPath(import.meta.url));

void EmitTelemetrySignal({
  occurrenceTimestampISO: new Date().toISOString(),
  severityLevelLiteral: 'INFO',
  moduleIdentifierLiteral: CMS_CONFIG_MODULE_IDENTIFIER,
  operationCodeLiteral: CMS_CONFIG_OPERATION_CODE,
  correlationIdentifier: GenerateCorrelationIdentifier(),
  messageContentLiteral: 'Configuración central de Payload CMS ensamblada nominalmente.',
  semanticIntentTag: 'CMS_BOOTSTRAP_CONFIGURATION',
  contextMetadataSnapshot: Object.freeze({
    isProductionEnvironmentBoolean,
    isHostPrefixedCookieEligibleBoolean,
    allowedOriginsCountQuantity: allowedOriginsCollection.length,
  }),
});

/**
 * @name payloadConfigurationMaster
 * @description Configuración exportada para el panel administrativo, API REST y GraphQL de Payload.
 */
export default buildConfig({
  serverURL: resolvedServerUrlLiteral,
  cookiePrefix: cmsCookiePrefixLiteral,
  csrf: allowedOriginsCollection,
  cors: allowedOriginsCollection,
  sharp,

  admin: {
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

  db: CreatePostgresDatabaseAdapter(validatedEnvironmentMetadata.DATABASE_URL),
  editor: LexicalEditorSovereign,

  plugins: [
    CreateCloudStoragePlugin({
      endpointLiteral: validatedEnvironmentMetadata.S3_ENDPOINT,
      accessKeyIdSecret: validatedEnvironmentMetadata.S3_ACCESS_KEY_ID,
      secretAccessKeySecret: validatedEnvironmentMetadata.S3_SECRET_ACCESS_KEY,
      regionLiteral: validatedEnvironmentMetadata.S3_REGION,
      bucketNameLiteral: validatedEnvironmentMetadata.S3_BUCKET,
    }),
  ],

  secret: validatedEnvironmentMetadata.PAYLOAD_SECRET,

  i18n: {
    supportedLanguages: { pt, es, en },
  },

  typescript: {
    outputFile: ResolveAbsoluteSovereignPath(currentConfigDirectoryPathLiteral, 'payload-types.ts'),
  },
});
