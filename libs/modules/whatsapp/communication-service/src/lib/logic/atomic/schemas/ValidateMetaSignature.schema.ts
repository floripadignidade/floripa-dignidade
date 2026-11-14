/**
 * @section Meta Webhook Contracts - Cryptographic Signature Validation Schema (Atom)
 * @description Contrato Zod inmutable para la validación de firmas `X-Hub-Signature-256`
 * en webhooks de Meta (WhatsApp Cloud API, Facebook, Instagram y Threads). Soporta
 * payload en texto plano o binario crudo (`ArrayBuffer` / `Uint8Array`), secreto
 * opcional para arquitecturas multi-app/multi-tenant y propagación de correlación.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Isomorphic).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa) e ISO/IEC 25010 (Seguridad y Portabilidad).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { z } from 'zod';

const RawBinaryPayloadSchema = z.union([z.instanceof(Uint8Array), z.instanceof(ArrayBuffer)]);

/**
 * @name ValidateMetaSignatureBaseSchema
 * @description Esquema base de campos inmutables para el validador de firmas de Meta.
 */
export const ValidateMetaSignatureBaseSchema = z
  .object({
    /** Cuerpo crudo de la petición en cadena UTF-8 (previo a `JSON.parse`). */
    rawRequestBodyLiteral: z
      .string()
      .min(1, { message: 'EMPTY_RAW_REQUEST_BODY_LITERAL' })
      .optional(),

    /** Bytes crudos exactos de la petición HTTP (por ejemplo desde `request.arrayBuffer()`). */
    rawRequestBodyBytes: RawBinaryPayloadSchema.optional(),

    /** Cabecera `X-Hub-Signature-256` enviada por Meta con prefijo `sha256=`. */
    xHubSignatureHeaderLiteral: z
      .string()
      .trim()
      .startsWith('sha256=', { message: 'INVALID_META_SIGNATURE_HEADER_PREFIX' }),

    /** Secreto opcional de aplicación Meta para escenarios multi-tenant, otras apps o pruebas. */
    appSecretOverride: z
      .string()
      .min(16, { message: 'META_APP_SECRET_INSUFFICIENT_ENTROPY' })
      .optional(),

    /** Identificador de correlación UUID v4 opcional para enlazar la traza del gateway. */
    correlationIdentifier: z
      .string()
      .trim()
      .uuid({ message: 'INVALID_CORRELATION_IDENTIFIER_UUID' })
      .optional(),
  })
  .readonly();

/**
 * @name ValidateMetaSignatureSchema
 * @description Esquema refinado que exige que al menos una representación del cuerpo (texto o bytes) esté presente.
 */
export const ValidateMetaSignatureSchema = ValidateMetaSignatureBaseSchema.refine(
  (payloadSnapshot): boolean => {
    if (payloadSnapshot.rawRequestBodyBytes !== undefined) {
      return payloadSnapshot.rawRequestBodyBytes.byteLength > 0;
    }

    return (
      payloadSnapshot.rawRequestBodyLiteral !== undefined &&
      payloadSnapshot.rawRequestBodyLiteral.length > 0
    );
  },
  {
    message: 'RAW_REQUEST_BODY_REQUIRED_FOR_HMAC_VERIFICATION',
    path: ['rawRequestBodyLiteral'],
  },
);

export type IValidateMetaSignatureParameters = z.input<typeof ValidateMetaSignatureBaseSchema>;

export type IValidatedMetaSignatureData = z.output<typeof ValidateMetaSignatureBaseSchema>;
