/**
 * @section Storage Contracts - Cloud Storage Upload Schema (Atom)
 * @description Única Fuente de Verdad (SSOT) para validar parámetros de carga binaria
 * hacia el almacenamiento en la nube (Supabase Storage / S3-Compatible) bajo transporte
 * TLS obligatorio (ADR 0015), control de cuota SRE (15 MB) y correlación distribuida.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Clean Paths).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa), ISO/IEC 25010 e ISO/IEC 27001.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { z } from 'zod';

import { CorrelationIdentifierSchema } from '@floripa-dignidade/telemetry';

/** Límite de carga permitido por la cuota institucional del almacenamiento cloud (15 MiB). */
export const MAXIMUM_STORAGE_UPLOAD_BYTES_QUANTITY = 15_728_640;

/** Tiempo máximo de espera por defecto para transferencias binarias en red (30 segundos). */
export const DEFAULT_STORAGE_UPLOAD_TIMEOUT_IN_MILLISECONDS_QUANTITY = 30_000;

/** Directiva Cache-Control por defecto para objetos almacenados (1 hora en segundos). */
export const DEFAULT_STORAGE_CACHE_CONTROL_SECONDS_LITERAL = '3600';

const MIME_TYPE_VALIDATION_REGEX = /^(image|application|video|audio)\/[a-zA-Z0-9.+_-]+$/;

/**
 * @name CloudStorageUploadParametersSchema
 * @description Aduana Zod inmutable para los parámetros de transferencia física hacia la nube.
 */
export const CloudStorageUploadParametersSchema = z
  .object({
    /** URL absoluta HTTPS del objeto destino en el bucket cloud. */
    targetUploadEndpointLiteral: z
      .string()
      .trim()
      .url({ message: 'INVALID_CLOUD_STORAGE_UPLOAD_URL' })
      .refine((endpointUrlLiteral: string): boolean => endpointUrlLiteral.startsWith('https://'), {
        message: 'CLOUD_STORAGE_UPLOAD_REQUIRES_HTTPS_TLS',
      })
      .describe('Endpoint HTTPS absoluto de destino para la carga binaria en el bucket.'),

    /** Credencial de autorización validada para la pasarela de almacenamiento. */
    cloudAccessSecurityKeySecret: z
      .string()
      .trim()
      .min(10, { message: 'CLOUD_STORAGE_SECURITY_KEY_INVALID' })
      .describe('Clave secreta Bearer/apikey autorizada para escritura en almacenamiento cloud.'),

    /** Identificador MIME normalizado del activo multimedia o documental. */
    contentMimeTypeLiteral: z
      .string()
      .trim()
      .regex(MIME_TYPE_VALIDATION_REGEX, { message: 'INVALID_CLOUD_STORAGE_MIME_TYPE' })
      .describe('Tipo MIME estándar (image/*, application/*, video/*, audio/*).'),

    /** Búfer binario crudo no vacío y acotado a la cuota de almacenamiento. */
    binaryContentBody: z
      .custom<Uint8Array>(
        (candidateValue: unknown): candidateValue is Uint8Array =>
          candidateValue instanceof Uint8Array,
        { message: 'CLOUD_STORAGE_BODY_MUST_BE_UINT8ARRAY' },
      )
      .refine(
        (binaryBufferView: Uint8Array): boolean =>
          binaryBufferView.byteLength > 0 &&
          binaryBufferView.byteLength <= MAXIMUM_STORAGE_UPLOAD_BYTES_QUANTITY,
        { message: 'CLOUD_STORAGE_BINARY_SIZE_OUT_OF_BOUNDS' },
      )
      .describe('Vista binaria cruda no vacía (máximo 15 MiB) lista para transferencia HTTP.'),

    /** Identificador de correlación UUID v4 opcional para trazabilidad distribuida. */
    correlationIdentifier: CorrelationIdentifierSchema.optional().describe(
      'Identificador UUID v4 propagado desde el flujo orquestador superior.',
    ),

    /** Límite opcional de espera en milisegundos para la operación de red. */
    timeoutInMillisecondsQuantity: z
      .number()
      .int()
      .min(1_000)
      .max(120_000)
      .default(DEFAULT_STORAGE_UPLOAD_TIMEOUT_IN_MILLISECONDS_QUANTITY)
      .describe('Tiempo límite en milisegundos antes de abortar la carga por latencia.'),

    /** Habilita sobrescritura idempotente (`x-upsert`) cuando la clave S3 ya existe. */
    isUpsertEnabledBoolean: z
      .boolean()
      .default(true)
      .describe('Permite sobrescribir versiones previas cuando la clave destino coincide.'),

    /** Segundos de retención en caché HTTP del objeto almacenado. */
    cacheControlSecondsLiteral: z
      .string()
      .trim()
      .regex(/^\d+$/, { message: 'INVALID_CACHE_CONTROL_SECONDS_LITERAL' })
      .default(DEFAULT_STORAGE_CACHE_CONTROL_SECONDS_LITERAL)
      .describe('Valor numérico en segundos asignado a la cabecera cache-control.'),
  })
  .readonly();

/** Contrato de entrada compatible con consumidores existentes y opciones extensibles. */
export type ICloudStorageUploadParameters = z.input<typeof CloudStorageUploadParametersSchema>;

/** Contrato purificado y normalizado tras superar la validación Zod. */
export type IValidatedCloudStorageUploadParameters = z.output<
  typeof CloudStorageUploadParametersSchema
>;
