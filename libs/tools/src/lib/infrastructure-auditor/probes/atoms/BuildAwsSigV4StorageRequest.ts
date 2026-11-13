/**
 * @section Infrastructure Auditor - AWS SigV4 Storage Request Builder (Atom)
 * @description Átomo de lógica pura encargado de validar la URI del endpoint S3,
 * derivar la clave criptográfica AWS Signature Version 4 (SigV4) mediante 'node:crypto'
 * y ensamblar las cabeceras autenticadas para la sonda de Supabase Storage.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Clean Paths).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa), ISO/IEC 25010 (Mantenibilidad) e ISO/IEC 27001.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { createHash, createHmac } from 'node:crypto';
import { URL } from 'node:url';

/**
 * @constant EMPTY_PAYLOAD_SHA256_HASH_HEX_LITERAL
 * Hash SHA-256 de un cuerpo vacío, constante canónica exigida por AWS SigV4.
 */
const EMPTY_PAYLOAD_SHA256_HASH_HEX_LITERAL =
  'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';

/**
 * @interface IBuildAwsSigV4RequestParameters
 * @description Contrato inmutable con las credenciales y coordenadas requeridas para firmar.
 */
export interface IBuildAwsSigV4RequestParameters {
  readonly s3EndpointLiteral: string;
  readonly accessKeyIdentifierSecret: string;
  readonly secretAccessKeySecret: string;
  readonly bucketNameLiteral: string;
  readonly regionNameLiteral: string;
}

/**
 * @interface IAwsSigV4RequestDescriptor
 * @description Snapshot inmutable con el resultado de validación de URI y cabeceras firmadas.
 */
export interface IAwsSigV4RequestDescriptor {
  readonly isEndpointValidBoolean: boolean;
  readonly targetRequestUrlLiteral: string;
  readonly signedHeadersSnapshot: Readonly<Record<string, string>>;
  readonly diagnosticErrorLiteral?: string;
}

/**
 * Deriva la clave binaria de firma siguiendo la jerarquía HMAC-SHA256 de AWS SigV4.
 */
const deriveAwsSignatureKeyBuffer = (
  secretAccessKeySecret: string,
  dateStampLiteral: string,
  regionNameLiteral: string,
  serviceNameLiteral: string,
): Buffer => {
  const initialKeyBuffer = createHmac('sha256', `AWS4${secretAccessKeySecret}`)
    .update(dateStampLiteral)
    .digest();

  const regionKeyBuffer = createHmac('sha256', initialKeyBuffer).update(regionNameLiteral).digest();

  const serviceKeyBuffer = createHmac('sha256', regionKeyBuffer)
    .update(serviceNameLiteral)
    .digest();

  return createHmac('sha256', serviceKeyBuffer).update('aws4_request').digest();
};

/**
 * Construye una petición GET autenticada mediante AWS SigV4 para verificar el bucket S3.
 *
 * @param parametersSnapshot - Credenciales S3 normalizadas y coordenadas de bucket/región.
 * @returns {IAwsSigV4RequestDescriptor} Descriptor sellado con URL objetivo y cabeceras HMAC.
 */
export const BuildAwsSigV4StorageRequest = (
  parametersSnapshot: IBuildAwsSigV4RequestParameters,
): IAwsSigV4RequestDescriptor => {
  let parsedEndpointUrl: URL;

  try {
    parsedEndpointUrl = new URL(parametersSnapshot.s3EndpointLiteral);
  } catch {
    return Object.freeze({
      isEndpointValidBoolean: false,
      targetRequestUrlLiteral: parametersSnapshot.s3EndpointLiteral,
      signedHeadersSnapshot: Object.freeze({}),
      diagnosticErrorLiteral: 'MALFORMED_S3_ENDPOINT_URI',
    });
  }

  const amzDateTimestampLiteral = new Date().toISOString().replace(/[:-]|\.\d{3}/g, '');
  const dateStampLiteral = amzDateTimestampLiteral.substring(0, 8);
  const canonicalPathLiteral = `/${parametersSnapshot.bucketNameLiteral}`;
  const canonicalQueryStringLiteral = 'max-keys=0';
  const targetHostLiteral = parsedEndpointUrl.host;
  const targetRequestUrlLiteral = `${parsedEndpointUrl.protocol}//${targetHostLiteral}${canonicalPathLiteral}?${canonicalQueryStringLiteral}`;

  const canonicalHeadersLiteral = `host:${targetHostLiteral}\nx-amz-content-sha256:${EMPTY_PAYLOAD_SHA256_HASH_HEX_LITERAL}\nx-amz-date:${amzDateTimestampLiteral}\n`;
  const signedHeadersLiteral = 'host;x-amz-content-sha256;x-amz-date';

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

  const credentialScopeLiteral = `${dateStampLiteral}/${parametersSnapshot.regionNameLiteral}/s3/aws4_request`;
  const stringToSignLiteral = [
    'AWS4-HMAC-SHA256',
    amzDateTimestampLiteral,
    credentialScopeLiteral,
    canonicalRequestHashLiteral,
  ].join('\n');

  const signingKeyBuffer = deriveAwsSignatureKeyBuffer(
    parametersSnapshot.secretAccessKeySecret,
    dateStampLiteral,
    parametersSnapshot.regionNameLiteral,
    's3',
  );

  const calculatedSignatureHexLiteral = createHmac('sha256', signingKeyBuffer)
    .update(stringToSignLiteral)
    .digest('hex');

  const authorizationHeaderLiteral = `AWS4-HMAC-SHA256 Credential=${parametersSnapshot.accessKeyIdentifierSecret}/${credentialScopeLiteral}, SignedHeaders=${signedHeadersLiteral}, Signature=${calculatedSignatureHexLiteral}`;

  return Object.freeze({
    isEndpointValidBoolean: true,
    targetRequestUrlLiteral,
    signedHeadersSnapshot: Object.freeze({
      Host: targetHostLiteral,
      'x-amz-date': amzDateTimestampLiteral,
      'x-amz-content-sha256': EMPTY_PAYLOAD_SHA256_HASH_HEX_LITERAL,
      Authorization: authorizationHeaderLiteral,
    }),
  });
};
