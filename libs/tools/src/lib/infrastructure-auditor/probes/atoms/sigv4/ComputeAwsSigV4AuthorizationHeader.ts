/**
 * @section Infrastructure Auditor - AWS SigV4 Authorization Header Builder (Atom)
 * @description Átomo criptográfico puro encargado exclusivamente de ensamblar la
 * petición canónica (`CanonicalRequest`), calcular su resumen SHA-256, firmar
 * `StringToSign` y retornar la cabecera `Authorization` `AWS4-HMAC-SHA256`.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Clean Paths).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa), ISO/IEC 25010 e ISO/IEC 27001.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { createHash, createHmac } from 'node:crypto';

import { DeriveAwsSigV4SigningKey } from './DeriveAwsSigV4SigningKey';
import {
  AWS_S3_SERVICE_IDENTIFIER_LITERAL,
  EMPTY_PAYLOAD_SHA256_HASH_HEX_LITERAL,
} from './schemas/AwsSigV4StorageRequest.schema';

/**
 * @interface IComputeAwsSigV4AuthorizationParameters
 * @description Coordenadas canónicas y marca temporal UTC para calcular la firma AWS SigV4.
 */
export interface IComputeAwsSigV4AuthorizationParameters {
  readonly accessKeyIdentifierSecret: string;
  readonly secretAccessKeySecret: string;
  readonly regionNameLiteral: string;
  readonly targetHostLiteral: string;
  readonly canonicalPathLiteral: string;
  readonly canonicalQueryStringLiteral: string;
  readonly amzDateTimestampLiteral: string;
  readonly dateStampLiteral: string;
}

/**
 * Calcula el valor completo de la cabecera `Authorization` conforme a AWS Signature v4.
 *
 * @param parametersSnapshot - Parámetros canónicos e inmutables de la petición S3.
 * @returns {string} Cabecera `AWS4-HMAC-SHA256 Credential=..., SignedHeaders=..., Signature=...`.
 */
export const ComputeAwsSigV4AuthorizationHeader = (
  parametersSnapshot: IComputeAwsSigV4AuthorizationParameters,
): string => {
  const {
    accessKeyIdentifierSecret,
    secretAccessKeySecret,
    regionNameLiteral,
    targetHostLiteral,
    canonicalPathLiteral,
    canonicalQueryStringLiteral,
    amzDateTimestampLiteral,
    dateStampLiteral,
  } = parametersSnapshot;

  const signedHeadersLiteral = 'host;x-amz-content-sha256;x-amz-date';
  const canonicalHeadersLiteral = [
    `host:${targetHostLiteral}`,
    `x-amz-content-sha256:${EMPTY_PAYLOAD_SHA256_HASH_HEX_LITERAL}`,
    `x-amz-date:${amzDateTimestampLiteral}`,
    '',
  ].join('\n');

  const canonicalRequestLiteral = [
    'GET',
    canonicalPathLiteral,
    canonicalQueryStringLiteral,
    canonicalHeadersLiteral,
    signedHeadersLiteral,
    EMPTY_PAYLOAD_SHA256_HASH_HEX_LITERAL,
  ].join('\n');

  const canonicalRequestHashLiteral = createHash('sha256')
    .update(canonicalRequestLiteral)
    .digest('hex');

  const credentialScopeLiteral = `${dateStampLiteral}/${regionNameLiteral}/${AWS_S3_SERVICE_IDENTIFIER_LITERAL}/aws4_request`;
  const stringToSignLiteral = [
    'AWS4-HMAC-SHA256',
    amzDateTimestampLiteral,
    credentialScopeLiteral,
    canonicalRequestHashLiteral,
  ].join('\n');

  const signingKeyBuffer = DeriveAwsSigV4SigningKey({
    secretAccessKeySecret,
    dateStampLiteral,
    regionNameLiteral,
    serviceNameLiteral: AWS_S3_SERVICE_IDENTIFIER_LITERAL,
  });

  const calculatedSignatureHexLiteral = createHmac('sha256', signingKeyBuffer)
    .update(stringToSignLiteral)
    .digest('hex');

  return `AWS4-HMAC-SHA256 Credential=${accessKeyIdentifierSecret}/${credentialScopeLiteral}, SignedHeaders=${signedHeadersLiteral}, Signature=${calculatedSignatureHexLiteral}`;
};
