/**
 * @section Infrastructure Auditor - PostgreSQL Socket Handshake Engine (Atom)
 * @description Átomo de red de bajo nivel encargado exclusivamente de establecer
 * la conexión TCP/TLS contra el puerto de PostgreSQL, enviar el paquete 'SSLRequest'
 * nativo y medir con precisión de microsegundos la latencia física del socket.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Clean Paths).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa) e ISO/IEC 25010 (Confiabilidad y Rendimiento).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import * as networkModule from 'node:net';
import * as transportLayerSecurityModule from 'node:tls';

/**
 * @constant MAXIMUM_NETWORK_HANDSHAKE_TIMEOUT_IN_MILLISECONDS_QUANTITY
 * Límite estricto de espera de red (SRE) para abortar la conexión del socket.
 */
const MAXIMUM_NETWORK_HANDSHAKE_TIMEOUT_IN_MILLISECONDS_QUANTITY = 5000;

/**
 * @constant POSTGRESQL_SSL_REQUEST_HEADER_PACKET_BUFFER
 * Paquete de 8 bytes oficial del protocolo PostgreSQL Frontend/Backend.
 * Longitud: 8 bytes (Int32), Código de Solicitud SSL: 80877103 (1234.5679 en formato Int32).
 */
const POSTGRESQL_SSL_REQUEST_HEADER_PACKET_BUFFER = Buffer.from([
  0x00, 0x00, 0x00, 0x08, 0x04, 0xd2, 0x16, 0x2f,
]);

/**
 * @interface IPostgresHandshakeResult
 * @description Contrato inmutable que estructura el diagnóstico físico de la conexión TCP/TLS.
 */
export interface IPostgresHandshakeResult {
  readonly isReachableBoolean: boolean;
  readonly latencyInMillisecondsQuantity: number;
  readonly diagnosticMessageLiteral: string;
}

/**
 * Ejecuta una sonda socket TCP de bajo nivel y apretón de manos SSL contra el host de PostgreSQL.
 *
 * @param targetHostLiteral - Dirección de red o dominio del servidor de base de datos.
 * @param targetPortQuantity - Puerto TCP del servicio de base de datos.
 * @param isSecureSocketsLayerRequiredBoolean - Indica si la conexión exige cifrado TLS.
 * @returns {Promise<IPostgresHandshakeResult>} Snapshot inmutable con el veredicto del socket.
 */
export const ExecutePostgresSocketHandshake = async (
  targetHostLiteral: string,
  targetPortQuantity: number,
  isSecureSocketsLayerRequiredBoolean: boolean,
): Promise<IPostgresHandshakeResult> => {
  const executionStartTimestampNumeric = performance.now();

  return new Promise((resolve) => {
    let hasResolvedBoolean = false;
    const tcpSocketInstance = new networkModule.Socket();

    const concludeProbeAction = (
      isSuccessfulBoolean: boolean,
      diagnosticMessageLiteral: string,
    ): void => {
      if (hasResolvedBoolean) return;
      hasResolvedBoolean = true;

      const latencyInMillisecondsQuantity = performance.now() - executionStartTimestampNumeric;

      tcpSocketInstance.removeAllListeners();
      tcpSocketInstance.destroy();

      resolve({
        isReachableBoolean: isSuccessfulBoolean,
        latencyInMillisecondsQuantity,
        diagnosticMessageLiteral,
      });
    };

    tcpSocketInstance.setTimeout(MAXIMUM_NETWORK_HANDSHAKE_TIMEOUT_IN_MILLISECONDS_QUANTITY);

    tcpSocketInstance.on('timeout', () => {
      concludeProbeAction(
        false,
        `Tiempo de espera de conexión agotado (${MAXIMUM_NETWORK_HANDSHAKE_TIMEOUT_IN_MILLISECONDS_QUANTITY}ms).`,
      );
    });

    tcpSocketInstance.on('error', (caughtSocketError: Error) => {
      concludeProbeAction(false, caughtSocketError.message);
    });

    tcpSocketInstance.connect(targetPortQuantity, targetHostLiteral, () => {
      if (!isSecureSocketsLayerRequiredBoolean) {
        concludeProbeAction(true, 'Conexión TCP establecida con éxito con el servicio PostgreSQL.');
        return;
      }

      tcpSocketInstance.write(POSTGRESQL_SSL_REQUEST_HEADER_PACKET_BUFFER);

      tcpSocketInstance.once('data', (incomingDataBuffer: Buffer) => {
        const serverResponseByteLiteral = String.fromCharCode(incomingDataBuffer[0] ?? 0);

        if (serverResponseByteLiteral === 'S') {
          const secureTlsSocketInstance = transportLayerSecurityModule.connect({
            socket: tcpSocketInstance,
            servername: targetHostLiteral,
            rejectUnauthorized: false,
          });

          secureTlsSocketInstance.on('secureConnect', () => {
            secureTlsSocketInstance.destroy();
            concludeProbeAction(true, 'Handshake SSL/TLS completado exitosamente con PostgreSQL.');
          });

          secureTlsSocketInstance.on('error', (caughtTlsError: Error) => {
            concludeProbeAction(
              false,
              `Fallo en negociación TLS con PostgreSQL: ${caughtTlsError.message}`,
            );
          });
        } else if (serverResponseByteLiteral === 'N') {
          concludeProbeAction(true, 'PostgreSQL activo (Servidor no configurado para SSL).');
        } else {
          concludeProbeAction(false, 'Respuesta no identificada del servicio de base de datos.');
        }
      });
    });
  });
};
