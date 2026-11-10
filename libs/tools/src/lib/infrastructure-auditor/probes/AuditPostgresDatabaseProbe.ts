/**
 * @section Tools & Infrastructure - PostgreSQL Database Network Probe (Atom)
 * @description Sonda de conectividad de red encargada de verificar físicamente la
 * disponibilidad, resolución DNS, apretón de manos TLS/SSL y latencia del motor
 * relacional PostgreSQL configurado en 'DATABASE_URL'.
 * Opera sin dependencias de drivers de terceros mediante el protocolo de paquetes de inicio de Postgres.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa) e ISO/IEC 25010 (Confiabilidad y Rendimiento).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import * as networkModule from 'node:net';
import * as transportLayerSecurityModule from 'node:tls';
import { URL } from 'node:url';

/* 1. Infraestructura Core de Entorno y Telemetría */
import { GatherEnvironmentMetadata } from '@floripa-dignidade/environment-validator';
import {
  EmitTelemetrySignal,
  GenerateCorrelationIdentifier,
  type ModuleIdentifier,
  type OperationCode,
} from '@floripa-dignidade/telemetry';

/* 2. Contratos Centralizados de Auditoría */
import type { IIndividualProviderAuditSnapshot } from '../schemas/CloudInfrastructureAuditReport.schema.js';

/** Identificador técnico del aparato para el monitor de salud y telemetría forense. */
const PROBE_MODULE_IDENTIFIER =
  'POSTGRES_DATABASE_NETWORK_PROBE_ATOM' as ModuleIdentifier;

/**
 * @constant MAXIMUM_NETWORK_HANDSHAKE_TIMEOUT_IN_MILLISECONDS_QUANTITY
 * Tiempo límite para abortar la conexión y evitar procesos zombis en el runner.
 */
const MAXIMUM_NETWORK_HANDSHAKE_TIMEOUT_IN_MILLISECONDS_QUANTITY = 5000;

/**
 * @constant POSTGRESQL_DEFAULT_PORT_NUMBER_QUANTITY
 * Puerto estándar para conexiones a bases de datos relacionales PostgreSQL.
 */
const POSTGRESQL_DEFAULT_PORT_NUMBER_QUANTITY = 5432;

/**
 * @constant POSTGRESQL_SSL_REQUEST_HEADER_PACKET_BUFFER
 * Paquete de 8 bytes oficial del protocolo PostgreSQL Frontend/Backend.
 * Longitud: 8 bytes (Int32), Código de Solicitud SSL: 80877103 (1234.5679 en formato Int32).
 */
const POSTGRESQL_SSL_REQUEST_HEADER_PACKET_BUFFER = Buffer.from([
  0x00, 0x00, 0x00, 0x08, 0x04, 0xd2, 0x16, 0x2f,
]);

/**
 * Ejecuta una sonda de conexión socket de bajo nivel contra el host y puerto de PostgreSQL.
 * Envía el paquete SSLRequest y valida la respuesta del servidor para medir la latencia física real.
 *
 * @param targetHostLiteral - Dirección de red o nombre de dominio del servidor de base de datos.
 * @param targetPortQuantity - Puerto TCP del servicio de base de datos.
 * @param isSecureSocketsLayerRequiredBoolean - Indica si la conexión exige cifrado TLS.
 * @returns {Promise<{ isReachableBoolean: boolean; latencyInMillisecondsQuantity: number; diagnosticMessageLiteral: string }>}
 */
const ExecuteLowLevelPostgreSqlHandshake = async (
  targetHostLiteral: string,
  targetPortQuantity: number,
  isSecureSocketsLayerRequiredBoolean: boolean,
): Promise<{
  readonly isReachableBoolean: boolean;
  readonly latencyInMillisecondsQuantity: number;
  readonly diagnosticMessageLiteral: string;
}> => {
  const executionStartTimestampNumeric = performance.now();

  return new Promise((resolve) => {
    let hasResolvedBoolean = false;

    const tcpSocketInstance = new networkModule.Socket();

    const concludeProbeAction = (
      isSuccessfulBoolean: boolean,
      diagnosticMessageLiteral: string,
    ): void => {
      if (hasResolvedBoolean) {
        return;
      }
      hasResolvedBoolean = true;

      const latencyInMillisecondsQuantity =
        performance.now() - executionStartTimestampNumeric;

      tcpSocketInstance.removeAllListeners();
      tcpSocketInstance.destroy();

      resolve({
        isReachableBoolean: isSuccessfulBoolean,
        latencyInMillisecondsQuantity,
        diagnosticMessageLiteral,
      });
    };

    tcpSocketInstance.setTimeout(
      MAXIMUM_NETWORK_HANDSHAKE_TIMEOUT_IN_MILLISECONDS_QUANTITY,
    );

    tcpSocketInstance.on('timeout', () => {
      concludeProbeAction(
        false,
        `Tiempo de espera de conexión agotado (${MAXIMUM_NETWORK_HANDSHAKE_TIMEOUT_IN_MILLISECONDS_QUANTITY}ms).`,
      );
    });

    tcpSocketInstance.on('error', (caughtSocketError: Error) => {
      concludeProbeAction(false, caughtSocketError.message);
    });

    tcpSocketInstance.connect(
      targetPortQuantity,
      targetHostLiteral,
      () => {
        if (!isSecureSocketsLayerRequiredBoolean) {
          concludeProbeAction(
            true,
            'Conexión TCP establecida con éxito con el servicio PostgreSQL.',
          );
          return;
        }

        // Envío del paquete SSLRequest de PostgreSQL
        tcpSocketInstance.write(POSTGRESQL_SSL_REQUEST_HEADER_PACKET_BUFFER);

        tcpSocketInstance.once('data', (incomingDataBuffer: Buffer) => {
          const serverResponseByteLiteral = String.fromCharCode(
            incomingDataBuffer[0] ?? 0,
          );

          // 'S' confirma que PostgreSQL acepta SSL. 'N' indica rechazo de SSL.
          if (serverResponseByteLiteral === 'S') {
            const secureTlsSocketInstance =
              transportLayerSecurityModule.connect({
                socket: tcpSocketInstance,
                servername: targetHostLiteral,
                rejectUnauthorized: false, // Permite certificados autofirmados en capas de pooling
              });

            secureTlsSocketInstance.on('secureConnect', () => {
              secureTlsSocketInstance.destroy();
              concludeProbeAction(
                true,
                'Handshake SSL/TLS completado exitosamente con PostgreSQL.',
              );
            });

            secureTlsSocketInstance.on('error', (caughtTlsError: Error) => {
              concludeProbeAction(
                false,
                `Fallo en negociación TLS con PostgreSQL: ${caughtTlsError.message}`,
              );
            });
          } else if (serverResponseByteLiteral === 'N') {
            concludeProbeAction(
              true,
              'PostgreSQL activo (Servidor no configurado para SSL).',
            );
          } else {
            concludeProbeAction(
              false,
              'Respuesta no identificada del servicio de base de datos.',
            );
          }
        });
      },
    );
  });
};

/**
 * Audita activamente la disponibilidad y conectividad del motor relacional PostgreSQL.
 * Extrae la variable 'DATABASE_URL', analiza su estructura semántica y ejecuta el sondeo físico.
 *
 * @param correlationIdentifierFallback - Identificador único de correlación opcional para trazabilidad forense.
 * @returns {Promise<IIndividualProviderAuditSnapshot>} Snapshot inmutable con el diagnóstico técnico de la base de datos.
 */
export const AuditPostgresDatabaseProbe = async (
  correlationIdentifierFallback: string = GenerateCorrelationIdentifier(),
): Promise<IIndividualProviderAuditSnapshot> => {
  const correlationIdentifier = correlationIdentifierFallback;
  const environmentMetadataSnapshot = GatherEnvironmentMetadata();
  const rawDatabaseUrlLiteral = environmentMetadataSnapshot['DATABASE_URL'];

  // 1. VERIFICACIÓN DE EXISTENCIA FÍSICA DEL SECRETO
  if (!rawDatabaseUrlLiteral || rawDatabaseUrlLiteral.trim() === '') {
    void EmitTelemetrySignal({
      occurrenceTimestampISO: new Date().toISOString(),
      severityLevelLiteral: 'WARNING',
      moduleIdentifierLiteral: PROBE_MODULE_IDENTIFIER,
      operationCodeLiteral:
        'POSTGRES_PROBE_CREDENTIALS_MISSING' as OperationCode,
      correlationIdentifier,
      messageContentLiteral:
        'Sonda de base de datos omitida: Variable DATABASE_URL ausente en el entorno.',
      semanticIntentTag: 'INFRASTRUCTURE_PROBE_SKIPPED',
    });

    return Object.freeze({
      providerIdentifier: 'DATABASE_POSTGRES_RELATIONAL',
      probeStatusLiteral: 'UNCONFIGURED_CREDENTIALS',
      executionLatencyInMillisecondsQuantity: 0,
      statusDescriptionLiteral:
        'La variable de entorno DATABASE_URL no está configurada.',
      endpointTargetLiteral: 'UNKNOWN_HOST',
      hasValidSecretFormatBoolean: false,
      diagnosticErrorLiteral: 'DATABASE_URL_NOT_DEFINED',
    });
  }

  // 2. PARSEO Y SANITIZACIÓN SEMÁNTICA DE LA URL
  let parsedDatabaseUrl: URL;
  try {
    parsedDatabaseUrl = new URL(rawDatabaseUrlLiteral);
  } catch (caughtUrlParseError: unknown) {
    const errorDescriptionLiteral =
      caughtUrlParseError instanceof Error
        ? caughtUrlParseError.message
      : String(caughtUrlParseError);

    return Object.freeze({
      providerIdentifier: 'DATABASE_POSTGRES_RELATIONAL',
      probeStatusLiteral: 'UNCONFIGURED_CREDENTIALS',
      executionLatencyInMillisecondsQuantity: 0,
      statusDescriptionLiteral:
        'La cadena DATABASE_URL posee un formato de URI inválido.',
      endpointTargetLiteral: 'MALFORMED_URI',
      hasValidSecretFormatBoolean: false,
      diagnosticErrorLiteral: errorDescriptionLiteral,
    });
  }

  const targetHostLiteral = parsedDatabaseUrl.hostname;
  const targetPortQuantity = parsedDatabaseUrl.port
    ? parseInt(parsedDatabaseUrl.port, 10)
    : POSTGRESQL_DEFAULT_PORT_NUMBER_QUANTITY;

  const isSecureSocketsLayerRequiredBoolean =
    parsedDatabaseUrl.searchParams.get('sslmode') !== 'disable';

  const sanitizedEndpointTargetLiteral = `${parsedDatabaseUrl.protocol}//${targetHostLiteral}:${targetPortQuantity}${parsedDatabaseUrl.pathname}`;

  // 3. EJECUCIÓN DE LA SONDA DE CONECTIVIDAD
  const {
    isReachableBoolean,
    latencyInMillisecondsQuantity,
    diagnosticMessageLiteral,
  } = await ExecuteLowLevelPostgreSqlHandshake(
    targetHostLiteral,
    targetPortQuantity,
    isSecureSocketsLayerRequiredBoolean,
  );

  // 4. CLASIFICACIÓN DEL VEREDICTO SRE
  const isLatencyDegradedBoolean = latencyInMillisecondsQuantity > 1000;

  const finalProbeStatusLiteral = !isReachableBoolean
    ? 'UNREACHABLE_FAILURE'
    : isLatencyDegradedBoolean
      ? 'DEGRADED_LATENCY'
      : 'NOMINAL_OPERATIONAL';

  // 5. EMISIÓN DE TELEMETRÍA FORENSE
  void EmitTelemetrySignal({
    occurrenceTimestampISO: new Date().toISOString(),
    severityLevelLiteral: isReachableBoolean ? 'INFO' : 'CRITICAL',
    moduleIdentifierLiteral: PROBE_MODULE_IDENTIFIER,
    operationCodeLiteral:
      'POSTGRES_PROBE_EXECUTION_COMPLETED' as OperationCode,
    correlationIdentifier,
    messageContentLiteral: `Sonda de PostgreSQL completada: [${finalProbeStatusLiteral}]. ${diagnosticMessageLiteral}`,
    executionLatencyInMillisecondsQuantity: latencyInMillisecondsQuantity,
    semanticIntentTag: 'INFRASTRUCTURE_PROBE_RESULT',
    contextMetadataSnapshot: {
      targetHostLiteral,
      targetPortQuantity,
      finalProbeStatusLiteral,
    },
  });

  return Object.freeze({
    providerIdentifier: 'DATABASE_POSTGRES_RELATIONAL',
    probeStatusLiteral: finalProbeStatusLiteral,
    executionLatencyInMillisecondsQuantity: Math.round(
      latencyInMillisecondsQuantity,
    ),
    statusDescriptionLiteral: diagnosticMessageLiteral,
    endpointTargetLiteral: sanitizedEndpointTargetLiteral,
    hasValidSecretFormatBoolean: true,
    ...(!isReachableBoolean && {
      diagnosticErrorLiteral: diagnosticMessageLiteral,
    }),
  });
};