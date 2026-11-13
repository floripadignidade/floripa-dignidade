/**
 * @section Telemetry Logic - Background Worker Processor
 * @description Motor de procesamiento asíncrono en segundo plano. Ejecuta ráfagas
 * criptográficas y cálculos de integridad fuera del hilo principal para
 * optimizar el rendimiento del portal (SRE Optimization).
 *
 * Protocolo OEDP-V17.0 - Shadow Threading & High Performance.
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { GenerateForensicHash } from '../atomic/GenerateForensicHash';
import { EncryptTelemetryMetadataSnapshot } from '../atomic/EncryptTelemetryMetadataSnapshot';

/**
 * @section Contrato de Comunicación del Enjambre
 */
type TTelemetryWorkerCommand = 'PERFORM_FORENSIC_HASH' | 'PERFORM_METADATA_ENCRYPTION';

interface IWorkerIncomingMessage {
  readonly commandLiteral: TTelemetryWorkerCommand;
  readonly transactionIdentifier: string;
  readonly dataPayload: Record<string, unknown>;
}

/**
 * Escuchador soberano de mensajes.
 * Orquesta el triaje de tareas y devuelve los resultados al hilo principal.
 */
addEventListener('message', async (incomingMessageEvent: MessageEvent<IWorkerIncomingMessage>) => {
  const { commandLiteral, transactionIdentifier, dataPayload } = incomingMessageEvent.data;

  try {
    switch (commandLiteral) {
      /**
       * @task: Generación de Huella Digital
       */
      case 'PERFORM_FORENSIC_HASH': {
        const hashResult = await GenerateForensicHash(dataPayload);

        postMessage({
          transactionIdentifier,
          isOperationSuccessfulBoolean: true,
          resultData: hashResult,
        });
        break;
      }

      /**
       * @task: Cifrado AES-GCM
       */
      case 'PERFORM_METADATA_ENCRYPTION': {
        const encryptionResult = await EncryptTelemetryMetadataSnapshot(dataPayload);

        postMessage({
          transactionIdentifier,
          isOperationSuccessfulBoolean: true,
          resultData: encryptionResult,
        });
        break;
      }

      default:
        throw new Error(`UNKNOWN_WORKER_COMMAND: ${commandLiteral}`);
    }
  } catch (caughtError: unknown) {
    /**
     * @section Reporte de Colapso en Segundo Plano
     * El error se devuelve al hilo principal para que el ReportForensicException
     * lo procese formalmente.
     */
    postMessage({
      transactionIdentifier,
      isOperationSuccessfulBoolean: false,
      errorDescriptionLiteral:
        caughtError instanceof Error ? caughtError.message : String(caughtError),
    });
  }
});
