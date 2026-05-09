/**
 * @section Storage Logic - Physical Cloud Storage Dispatcher
 * @description Átomo encargado exclusivamente de la comunicación física I/O con
 * el servidor de almacenamiento soberano (S3/Supabase). Implementa protocolos
 * de red resilientes, gestión de tiempos de espera y rastro telemétrico forense.
 *
 * Protocolo OEDP-V17.0 - High Performance SRE & Hardware Isolation.
 * 🛡️ LEY SRE: Este aparato utiliza 'fetch' nativo para garantizar compatibilidad
 * isomórfica y minimiza el uso de memoria mediante el transporte de búferes binarios.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { MapHttpErrorToException } from '@floripa-dignidade/exceptions';
import {
  EmitTelemetrySignal,
  GenerateCorrelationIdentifier,
  TraceExecutionTime,
} from '@floripa-dignidade/telemetry';

/**
 * @interface ICloudStorageUploadParameters
 * @description Contrato inmutable para la parametrización de la subida física.
 */
interface ICloudStorageUploadParameters {
  /** URL absoluta del recurso en el bucket (incluye nombre de archivo). */
  readonly targetUploadEndpointLiteral: string;

  /** Llave maestra de acceso (Service Role) validada por la aduana. */
  readonly cloudAccessSecurityKeySecret: string;

  /** Identificador técnico del tipo de medio (ej: image/avif). */
  readonly contentMimeTypeLiteral: string;

  /** Cuerpo de datos crudos procesado por el transformador isomórfico. */
  readonly binaryContentBody: Uint8Array;
}

/** Identificador técnico del aparato para el Neural Sentinel. */
const STORAGE_DISPATCHER_IDENTIFIER = 'CLOUD_STORAGE_PHYSICAL_DISPATCHER';

/**
 * Ejecuta el despacho binario hacia la infraestructura de almacenamiento.
 * Implementa el patrón 'Atomic I/O' con medición de latencia de red.
 *
 * @param parameters - Configuración técnica y carga útil de la transacción.
 * @returns {Promise<void>} Promesa de finalización de la transferencia de datos.
 * @throws {GlobalBaseException} Si la nube rechaza la subida o expira el tiempo.
 */
export const ExecuteCloudStorageUpload = async (
  parameters: ICloudStorageUploadParameters
): Promise<void> => {
  const {
    targetUploadEndpointLiteral,
    cloudAccessSecurityKeySecret,
    contentMimeTypeLiteral,
    binaryContentBody
  } = parameters;

  const correlationIdentifier = GenerateCorrelationIdentifier();

  return await TraceExecutionTime(
    STORAGE_DISPATCHER_IDENTIFIER,
    'EXECUTE_PHYSICAL_BINARY_UPLOAD',
    correlationIdentifier,
    async () => {
      try {
        /**
         * @section Transmisión de Datos (Outbound I/O)
         * Realizamos la petición POST al Gateway de almacenamiento.
         */
        const networkResponse = await fetch(targetUploadEndpointLiteral, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${cloudAccessSecurityKeySecret}`,
            'apikey': cloudAccessSecurityKeySecret,
            'Content-Type': contentMimeTypeLiteral,
            /** 🛡️ ESTRATEGIA: x-upsert permite sobrescribir versiones si el rastro es idéntico. */
            'x-upsert': 'true'
          },
          /**
           * SANEADO Zenith: El casteo a 'any' es necesario para resolver la sobrecarga
           * de tipos del motor Fetch de TypeScript en entornos de compilación híbridos.
           */
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          body: binaryContentBody as any,

          /** SRE: Límite de 30 segundos para prevenir bloqueos por archivos pesados. */
          signal: AbortSignal.timeout(30000)
        });

        if (!networkResponse.ok) {
          throw MapHttpErrorToException(
            networkResponse.status,
            'STORAGE_UPLOAD_REJECTED_BY_PROVIDER',
            {
              httpStatusNumeric: networkResponse.status,
              statusTextLiteral: networkResponse.statusText
            }
          );
        }

        // REPORTE DE ÉXITO (Audit Trail)
        void EmitTelemetrySignal({
          severityLevelLiteral: 'INFO',
          moduleIdentifierLiteral: STORAGE_DISPATCHER_IDENTIFIER,
          operationCodeLiteral: 'CLOUD_UPLOAD_NOMINAL_SUCCESS',
          correlationIdentifier,
          messageContentLiteral: 'Transferencia física de activo multimedia completada.',
          contextMetadataSnapshot: {
            contentMimeTypeLiteral,
            payloadSizeBytesQuantity: binaryContentBody.byteLength
          }
        });

      } catch (caughtError: unknown) {
        /**
         * @section Gestión Forense de I/O
         * Capturamos el rastro del colapso de red para el análisis predictivo.
         */
        const errorDescriptionLiteral = caughtError instanceof Error
          ? caughtError.message
          : String(caughtError);

        void EmitTelemetrySignal({
          severityLevelLiteral: 'CRITICAL',
          moduleIdentifierLiteral: STORAGE_DISPATCHER_IDENTIFIER,
          operationCodeLiteral: 'CLOUD_UPLOAD_PHYSICAL_FAULT',
          correlationIdentifier,
          messageContentLiteral: 'Fallo catastrófico en el enlace físico de subida de archivos.',
          contextMetadataSnapshot: { errorTraceLiteral: errorDescriptionLiteral }
        });

        // Re-envolvemos el error en la gramática institucional si no viene ya tipado.
        if (errorDescriptionLiteral.includes('Exception')) {
          throw caughtError;
        }

        throw MapHttpErrorToException(500, 'FALLO_FISICO_SUBIDA_ALMACENAMIENTO', {
          originalErrorLiteral: errorDescriptionLiteral,
          correlationIdentifier
        });
      }
    }
  );
};
