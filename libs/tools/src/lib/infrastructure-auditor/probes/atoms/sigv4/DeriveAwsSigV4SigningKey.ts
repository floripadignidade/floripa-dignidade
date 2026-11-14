/**
 * @section Infrastructure Auditor - AWS SigV4 Key Derivation (Atom)
 * @description Átomo criptográfico puro encargado exclusivamente de derivar la clave
 * binaria de firma HMAC-SHA256 siguiendo la cadena jerárquica oficial de AWS Signature v4
 * (`AWS4<secret>` -> `dateStamp` -> `region` -> `service` -> `aws4_request`).
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Clean Paths).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa), ISO/IEC 25010 e ISO/IEC 27001.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { createHmac } from 'node:crypto';

/**
 * @interface IDeriveAwsSigV4SigningKeyParameters
 * @description Parámetros inmutables requeridos para la derivación de clave HMAC SigV4.
 */
export interface IDeriveAwsSigV4SigningKeyParameters {
  readonly secretAccessKeySecret: string;
  readonly dateStampLiteral: string;
  readonly regionNameLiteral: string;
  readonly serviceNameLiteral: string;
}

/**
 * Deriva la clave binaria de firma SigV4 mediante encadenamiento HMAC-SHA256.
 *
 * @param parametersSnapshot - Secreto S3, fecha UTC `YYYYMMDD`, región y nombre de servicio.
 * @returns {Buffer} Clave binaria lista para firmar `StringToSign`.
 */
export const DeriveAwsSigV4SigningKey = (
  parametersSnapshot: IDeriveAwsSigV4SigningKeyParameters,
): Buffer => {
  const { secretAccessKeySecret, dateStampLiteral, regionNameLiteral, serviceNameLiteral } =
    parametersSnapshot;

  const dateKeyBuffer = createHmac('sha256', `AWS4${secretAccessKeySecret}`)
    .update(dateStampLiteral)
    .digest();

  const regionKeyBuffer = createHmac('sha256', dateKeyBuffer).update(regionNameLiteral).digest();

  const serviceKeyBuffer = createHmac('sha256', regionKeyBuffer)
    .update(serviceNameLiteral)
    .digest();

  return createHmac('sha256', serviceKeyBuffer).update('aws4_request').digest();
};
