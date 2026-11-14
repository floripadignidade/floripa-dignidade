/**
 * @section Infrastructure Auditor - AWS SigV4 Request Contracts (Atom)
 * @description Única Fuente de Verdad (SSOT) para los contratos Zod inmutables,
 * constantes criptográficas y tipos de salida de la firma AWS Signature Version 4.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Clean Paths).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa), ISO/IEC 25010 (Seguridad) e ISO/IEC 27001.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { z } from 'zod';

/**
 * @constant EMPTY_PAYLOAD_SHA256_HASH_HEX_LITERAL
 * @description Digest SHA-256 canónico de un cuerpo HTTP vacío exigido por AWS SigV4.
 */
export const EMPTY_PAYLOAD_SHA256_HASH_HEX_LITERAL =
  'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';

/**
 * @constant AWS_S3_SERVICE_IDENTIFIER_LITERAL
 * @description Identificador canónico de servicio AWS para el ámbito de credenciales SigV4.
 */
export const AWS_S3_SERVICE_IDENTIFIER_LITERAL = 's3';

/**
 * @name BuildAwsSigV4RequestParametersSchema
 * @description Aduana Zod inmutable para validar credenciales y coordenadas S3 antes de firmar.
 */
export const BuildAwsSigV4RequestParametersSchema = z
  .object({
    s3EndpointLiteral: z
      .string()
      .trim()
      .min(1, { message: 'S3_ENDPOINT_LITERAL_REQUIRED' })
      .describe(
        'URI base de la pasarela S3-Compatible (ej. https://<ref>.storage.supabase.co/storage/v1/s3).',
      ),
    accessKeyIdentifierSecret: z
      .string()
      .trim()
      .min(1, { message: 'S3_ACCESS_KEY_IDENTIFIER_REQUIRED' })
      .describe('Identificador de clave de acceso S3 para el encabezado Credential de SigV4.'),
    secretAccessKeySecret: z
      .string()
      .trim()
      .min(1, { message: 'S3_SECRET_ACCESS_KEY_REQUIRED' })
      .describe('Clave secreta S3 utilizada para derivar la llave de firma HMAC-SHA256.'),
    bucketNameLiteral: z
      .string()
      .trim()
      .min(1, { message: 'S3_BUCKET_NAME_REQUIRED' })
      .describe('Nombre del bucket S3 objetivo de la sonda de verificación.'),
    regionNameLiteral: z
      .string()
      .trim()
      .min(1, { message: 'S3_REGION_NAME_REQUIRED' })
      .describe('Región geográfica asignada al servicio S3 (ej. sa-east-1).'),
  })
  .readonly();

export type IBuildAwsSigV4RequestParameters = z.infer<typeof BuildAwsSigV4RequestParametersSchema>;

/**
 * @interface IAwsSigV4EndpointCoordinates
 * @description Coordenadas HTTP normalizadas preservando el `pathname` base del endpoint S3.
 */
export interface IAwsSigV4EndpointCoordinates {
  readonly isEndpointValidBoolean: boolean;
  readonly targetHostLiteral: string;
  readonly canonicalPathLiteral: string;
  readonly canonicalQueryStringLiteral: string;
  readonly targetRequestUrlLiteral: string;
  readonly diagnosticErrorLiteral?: string;
}

/**
 * @name AwsSigV4RequestDescriptorSchema
 * @description Contrato Zod inmutable para el resultado de construcción y firma SigV4.
 */
export const AwsSigV4RequestDescriptorSchema = z
  .object({
    isEndpointValidBoolean: z
      .boolean()
      .describe('Indica si la URI S3 y los parámetros superaron la validación estructural.'),
    targetRequestUrlLiteral: z
      .string()
      .describe('URL absoluta final incluyendo el pathname base, el bucket y la query ordenada.'),
    signedHeadersSnapshot: z
      .record(z.string(), z.string())
      .readonly()
      .describe('Cabeceras HTTP inmutables autenticadas con AWS4-HMAC-SHA256.'),
    diagnosticErrorLiteral: z
      .string()
      .optional()
      .describe('Código técnico de diagnóstico cuando la validación de entrada o URI falla.'),
  })
  .readonly();

export type IAwsSigV4RequestDescriptor = z.infer<typeof AwsSigV4RequestDescriptorSchema>;
