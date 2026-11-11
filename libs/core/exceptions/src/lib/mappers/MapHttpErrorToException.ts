/**
 * @section Exception Logic - HTTP to Domain Mapper (Atom)
 * @description Átomo puro encargado de la traducción de protocolos. Transforma códigos
 * de estado HTTP (RFC 9110) y mensajes de red en instancias de excepciones institucionales
 * tipadas y niveladas. Actúa como el intérprete en las fronteras de los API Gateways y Edge Handlers.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Clean Paths).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa) e ISO/IEC 25010 (Confiabilidad y Portabilidad).
 * SANEADO Zenith: Complejidad ciclomática reducida de 11 a 4 mediante tabla de resolución
 * indexada inmutable, erradicación de switch anidado y cumplimiento estricto de Prosa ISO.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

/* 1. Clases de Excepción y Jerarquía de Dominio (Rutas Limpias - Extensionless) */
import { InternalSystemException } from '../codes/InternalSystemException';
import { ValidationException } from '../codes/ValidationException';
import type { GlobalBaseException } from '../codes/GlobalBaseException';

/**
 * @name TExtendedHttpErrorCategoryLiteral
 * @description Taxonomía forense ampliada para clasificación precisa de incidentes de red.
 */
export type TExtendedHttpErrorCategoryLiteral =
  | 'SECURITY_AUTHORIZATION_FAULT'
  | 'RESOURCE_NOT_FOUND_FAULT'
  | 'RESOURCE_CONFLICT_FAULT'
  | 'RATE_LIMIT_EXCEEDED_FAULT'
  | 'NETWORK_TIMEOUT_FAULT'
  | 'CLIENT_SIDE_VALIDATION_FAULT'
  | 'INFRASTRUCTURE_SERVER_COLLAPSE';

/**
 * @constant HTTP_ERROR_STATUS_TO_CATEGORY_MAPPING
 * @description Tabla de búsqueda determinista que mapea códigos de estado HTTP con su categoría técnica.
 */
const HTTP_ERROR_STATUS_TO_CATEGORY_MAPPING: Readonly<
  Record<number, TExtendedHttpErrorCategoryLiteral>
> = Object.freeze({
  401: 'SECURITY_AUTHORIZATION_FAULT',
  403: 'SECURITY_AUTHORIZATION_FAULT',
  404: 'RESOURCE_NOT_FOUND_FAULT',
  408: 'NETWORK_TIMEOUT_FAULT',
  409: 'RESOURCE_CONFLICT_FAULT',
  410: 'RESOURCE_NOT_FOUND_FAULT',
  429: 'RATE_LIMIT_EXCEEDED_FAULT',
  504: 'NETWORK_TIMEOUT_FAULT',
});

/**
 * Resuelve la categoría taxonómica institucional basada en el código de estado HTTP RFC 9110.
 * Implementa una complejidad ciclomática de 4 mediante búsqueda indexada en tabla inmutable.
 *
 * @param httpStatusCodeNumeric - Código numérico de estado HTTP.
 * @returns {TExtendedHttpErrorCategoryLiteral} Etiqueta semántica de clasificación forense.
 */
const resolveHttpErrorCategoryLiteral = (
  httpStatusCodeNumeric: number,
): TExtendedHttpErrorCategoryLiteral => {
  const mappedCategoryLiteral = HTTP_ERROR_STATUS_TO_CATEGORY_MAPPING[httpStatusCodeNumeric];

  if (mappedCategoryLiteral) {
    return mappedCategoryLiteral;
  }

  const isClientSideRangeBoolean = httpStatusCodeNumeric >= 400 && httpStatusCodeNumeric < 500;

  return isClientSideRangeBoolean
    ? 'CLIENT_SIDE_VALIDATION_FAULT'
    : 'INFRASTRUCTURE_SERVER_COLLAPSE';
};

/**
 * Traduce un fallo de red o código de estado HTTP a una excepción formal del dominio Floripa Dignidade.
 * Proporciona un triaje automático determinista basado en la jerarquía del código de estado RFC 9110,
 * enriqueciendo el snapshot forense con la taxonomía técnica para el Health Monitor.
 *
 * @param httpStatusCodeNumeric - Código numérico de estado HTTP recibido (Familias 4xx o 5xx).
 * @param customMessageLiteral - Descripción semántica del contexto del fallo capturado.
 * @param runtimeContextSnapshotSource - Diccionario opcional de variables de contexto y metadatos forenses.
 * @returns {GlobalBaseException} Instancia especializada de excepción (ValidationException o InternalSystemException).
 */
export const MapHttpErrorToException = (
  httpStatusCodeNumeric: number,
  customMessageLiteral: string,
  runtimeContextSnapshotSource: Record<string, unknown> = {},
): GlobalBaseException => {
  // 1. NORMALIZACIÓN DEFENSIVA Y SANEAMIENTO
  const sanitizedStatusCodeNumeric = Number.isInteger(httpStatusCodeNumeric)
    ? httpStatusCodeNumeric
    : 500;

  const sanitizedMessageLiteral =
    customMessageLiteral?.trim() || 'FALLO_DE_PROTOCOLO_HTTP_DESCONOCIDO';

  // 2. CLASIFICACIÓN TAXONÓMICA FORENSE (RFC 9110)
  const errorCategoryLiteral = resolveHttpErrorCategoryLiteral(sanitizedStatusCodeNumeric);
  const isClientSideFaultBoolean =
    sanitizedStatusCodeNumeric >= 400 && sanitizedStatusCodeNumeric < 500;

  // 3. ENRIQUECIMIENTO DE METADATOS INMUTABLES
  const enrichedContextSnapshot = Object.freeze({
    ...runtimeContextSnapshotSource,
    originalHttpStatusCodeNumeric: sanitizedStatusCodeNumeric,
    errorCategoryLiteral,
    errorFamilyLiteral: isClientSideFaultBoolean ? 'CLIENT_SIDE_FAULT' : 'INFRASTRUCTURE_COLLAPSE',
  });

  // 4. INSTANCIACIÓN DE EXCEPCIÓN DE DOMINIO ESPECIALIZADA
  if (isClientSideFaultBoolean) {
    return new ValidationException(sanitizedMessageLiteral, enrichedContextSnapshot);
  }

  return new InternalSystemException(sanitizedMessageLiteral, enrichedContextSnapshot);
};
