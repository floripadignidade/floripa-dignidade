/**
 * @section Infrastructure Auditor - PostgreSQL Connection Target Parser (Atom)
 * @description Átomo de lógica pura encargado de parsear y sanear la cadena de conexión
 * DATABASE_URL, extrayendo el host, puerto y determinando si requiere SSL/TLS.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Clean Paths).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa) e ISO/IEC 25010 (Confiabilidad y Seguridad).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { URL } from 'node:url';

const POSTGRESQL_DEFAULT_PORT_NUMBER_QUANTITY = 5432;

/**
 * @interface IParsedPostgresTarget
 * @description Contrato inmutable que estructura las coordenadas de red del destino PostgreSQL.
 */
export interface IParsedPostgresTarget {
  readonly isTargetValidBoolean: boolean;
  readonly targetHostLiteral: string;
  readonly targetPortQuantity: number;
  readonly isSecureSocketsLayerRequiredBoolean: boolean;
  readonly sanitizedEndpointTargetLiteral: string;
  readonly diagnosticErrorLiteral?: string;
}

/**
 * Parsea y valida estructuralmente una URI de conexión a PostgreSQL.
 *
 * @param rawUrlLiteral - Cadena de conexión JDBC o URI postgresql:// cruda.
 * @returns {IParsedPostgresTarget} Snapshot inmutable con las propiedades de red resueltas.
 */
export const ParsePostgresConnectionTarget = (rawUrlLiteral: string): IParsedPostgresTarget => {
  try {
    const parsedUrl = new URL(rawUrlLiteral);
    const targetHostLiteral = parsedUrl.hostname;
    const targetPortQuantity = parsedUrl.port
      ? parseInt(parsedUrl.port, 10)
      : POSTGRESQL_DEFAULT_PORT_NUMBER_QUANTITY;
    const isSecureSocketsLayerRequiredBoolean = parsedUrl.searchParams.get('sslmode') !== 'disable';
    const sanitizedEndpointTargetLiteral = `${parsedUrl.protocol}//${targetHostLiteral}:${targetPortQuantity}${parsedUrl.pathname}`;

    return Object.freeze({
      isTargetValidBoolean: true,
      targetHostLiteral,
      targetPortQuantity,
      isSecureSocketsLayerRequiredBoolean,
      sanitizedEndpointTargetLiteral,
    });
  } catch (caughtUrlParseError: unknown) {
    const diagnosticErrorLiteral =
      caughtUrlParseError instanceof Error
        ? caughtUrlParseError.message
        : String(caughtUrlParseError);

    return Object.freeze({
      isTargetValidBoolean: false,
      targetHostLiteral: 'MALFORMED_URI',
      targetPortQuantity: POSTGRESQL_DEFAULT_PORT_NUMBER_QUANTITY,
      isSecureSocketsLayerRequiredBoolean: false,
      sanitizedEndpointTargetLiteral: 'MALFORMED_URI',
      diagnosticErrorLiteral,
    });
  }
};
