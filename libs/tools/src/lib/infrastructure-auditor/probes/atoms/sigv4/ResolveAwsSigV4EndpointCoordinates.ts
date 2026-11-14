/**
 * @section Infrastructure Auditor - AWS SigV4 Endpoint Coordinates Resolver (Atom)
 * @description Átomo de lógica pura encargado de parsear la URI del endpoint S3,
 * validar el protocolo HTTP/HTTPS y construir el `canonicalPathLiteral` preservando el
 * `pathname` base (ej. `/storage/v1/s3` en Supabase Storage) junto con el bucket codificado.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Clean Paths).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa), ISO/IEC 25010 (Confiabilidad) e ISO/IEC 27001.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { URL } from 'node:url';

import type { IAwsSigV4EndpointCoordinates } from './schemas/AwsSigV4StorageRequest.schema';

/**
 * @constant LIST_OBJECTS_V2_CANONICAL_QUERY_LITERAL
 * @description Parámetros de consulta ordenados alfabéticamente conforme a AWS SigV4 para ListObjectsV2.
 */
const LIST_OBJECTS_V2_CANONICAL_QUERY_LITERAL = 'list-type=2&max-keys=0';

/**
 * Normaliza la URI del endpoint S3 preservando el prefijo de ruta del proveedor.
 *
 * @param s3EndpointLiteral - URI base configurada en `S3_ENDPOINT`.
 * @param bucketNameLiteral - Nombre del bucket objetivo (ej. `media-vault`).
 * @returns {IAwsSigV4EndpointCoordinates} Coordenadas canónicas inmutables para firma y transporte.
 */
export const ResolveAwsSigV4EndpointCoordinates = (
  s3EndpointLiteral: string,
  bucketNameLiteral: string,
): IAwsSigV4EndpointCoordinates => {
  try {
    const parsedEndpointUrl = new URL(s3EndpointLiteral);
    const isHttpProtocolBoolean =
      parsedEndpointUrl.protocol === 'https:' || parsedEndpointUrl.protocol === 'http:';

    if (!isHttpProtocolBoolean || !parsedEndpointUrl.host) {
      return Object.freeze({
        isEndpointValidBoolean: false,
        targetHostLiteral: '',
        canonicalPathLiteral: '',
        canonicalQueryStringLiteral: LIST_OBJECTS_V2_CANONICAL_QUERY_LITERAL,
        targetRequestUrlLiteral: s3EndpointLiteral,
        diagnosticErrorLiteral: 'UNSUPPORTED_S3_ENDPOINT_PROTOCOL',
      });
    }

    const normalizedBasePathnameLiteral = parsedEndpointUrl.pathname.replace(/\/+$/, '');
    const encodedBucketSegmentLiteral = encodeURIComponent(bucketNameLiteral);
    const canonicalPathLiteral = `${normalizedBasePathnameLiteral}/${encodedBucketSegmentLiteral}`;
    const targetHostLiteral = parsedEndpointUrl.host;
    const targetRequestUrlLiteral = `${parsedEndpointUrl.protocol}//${targetHostLiteral}${canonicalPathLiteral}?${LIST_OBJECTS_V2_CANONICAL_QUERY_LITERAL}`;

    return Object.freeze({
      isEndpointValidBoolean: true,
      targetHostLiteral,
      canonicalPathLiteral,
      canonicalQueryStringLiteral: LIST_OBJECTS_V2_CANONICAL_QUERY_LITERAL,
      targetRequestUrlLiteral,
    });
  } catch {
    return Object.freeze({
      isEndpointValidBoolean: false,
      targetHostLiteral: '',
      canonicalPathLiteral: '',
      canonicalQueryStringLiteral: LIST_OBJECTS_V2_CANONICAL_QUERY_LITERAL,
      targetRequestUrlLiteral: s3EndpointLiteral,
      diagnosticErrorLiteral: 'MALFORMED_S3_ENDPOINT_URI',
    });
  }
};
