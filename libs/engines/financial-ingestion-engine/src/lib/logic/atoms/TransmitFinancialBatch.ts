/**
 * @section Financial Ingestion - Cloud Batch Transmitter Atom
 * @description Átomo encargado exclusivamente de la comunicación física I/O
 * con el Tier de Datos (Supabase). Implementa el protocolo de persistencia
 * asíncrona mediante fetch nativo y garantiza la integridad del rastro forense.
 *
 * Protocolo OEDP-V17.0 - Hardware Isolation & High Performance SRE.
 * SANEADO Zenith: Resolución de TS4104 (Inmutabilidad), rastro telemétrico y Prosa ISO.
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

/* 1. ADN Estructural de Persistencia (Verbatim Module Syntax) */
import type { IFinancialLedgerRow } from './MapFinancialRecordsToLedger';

/**
 * @interface ITransmissionParameters
 * @description Contrato inmutable para la operación de red masiva.
 */
interface ITransmissionParameters {
  /** URL absoluta de la API REST de la base de datos institucional. */
  readonly cloudUrlLiteral: string;
  /** Llave maestra de acceso (Service Role) validada por la aduana. */
  readonly cloudSecurityKeySecret: string;
  /**
   * Lote de registros mapeados bajo el esquema físico del Ledger.
   * 🛡️ SANEADO Zenith: Se marca como 'readonly' para sanar el error TS4104.
   */
  readonly ledgerPayloadCollection: readonly IFinancialLedgerRow[];
}

/** Identificador técnico del aparato para el Neural Sentinel. */
const TRANSMITTER_ATOM_IDENTIFIER = 'FINANCIAL_BATCH_TRANSMITTER_ATOM';

/**
 * Ejecuta el despacho físico de datos hacia la infraestructura de Supabase.
 * Implementa el patrón 'Stateless Fetch' con medición de latencia de red.
 *
 * @param parameters - Configuración técnica y carga útil de la transacción.
 * @returns {Promise<void>} Promesa de finalización de la transacción física.
 * @throws {GlobalBaseException} Si la nube rechaza la persistencia o expira el tiempo.
 */
export const TransmitFinancialBatch = async (
  parameters: ITransmissionParameters
): Promise<void> => {
  const {
    cloudUrlLiteral,
    cloudSecurityKeySecret,
    ledgerPayloadCollection
  } = parameters;

  const correlationIdentifier = GenerateCorrelationIdentifier();

  return await TraceExecutionTime(
    TRANSMITTER_ATOM_IDENTIFIER,
    'EXECUTE_CLOUD_LEDGER_TRANSMISSION',
    correlationIdentifier,
    async () => {
      /**
       * @section Punto de Enlace Soberano
       * Apuntamos a la tabla maestra definida en 'migration_master_schema.sql'.
       */
      const targetEndpointLiteral = `${cloudUrlLiteral}/rest/v1/project_financial_ledger`;

      try {
        const networkResponse = await fetch(targetEndpointLiteral, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': cloudSecurityKeySecret,
            'Authorization': `Bearer ${cloudSecurityKeySecret}`,
            /** 🛡️ ESTRATEGIA: Upsert por llaves naturales para evitar duplicidad. */
            'Prefer': 'return=minimal, resolution=merge-duplicates'
          },
          body: JSON.stringify(ledgerPayloadCollection),

          /** SRE: Límite de 30 segundos para ingestas masivas. */
          signal: AbortSignal.timeout(30000)
        });

        if (!networkResponse.ok) {
          throw MapHttpErrorToException(
            networkResponse.status,
            'LEDGER_PERSISTENCE_REJECTED',
            { httpStatusNumeric: networkResponse.status, endpoint: targetEndpointLiteral }
          );
        }

        // REPORTE DE ÉXITO (SRE Visibility)
        void EmitTelemetrySignal({
          severityLevelLiteral: 'INFO',
          moduleIdentifierLiteral: TRANSMITTER_ATOM_IDENTIFIER,
          operationCodeLiteral: 'CLOUD_BATCH_TRANSMISSION_SUCCESS',
          correlationIdentifier,
          messageContentLiteral: 'Transmisión física de lote financiero completada exitosamente.',
          contextMetadataSnapshot: {
            recordsQuantity: ledgerPayloadCollection.length,
            targetTable: 'project_financial_ledger'
          }
        });

      } catch (caughtError: unknown) {
        /**
         * @section Gestión Forense de I/O
         * Transformamos el fallo de red en una excepción semántica para el Sentinel.
         */
        const errorDescriptionLiteral = caughtError instanceof Error
          ? caughtError.message
          : String(caughtError);

        void EmitTelemetrySignal({
          severityLevelLiteral: 'CRITICAL',
          moduleIdentifierLiteral: TRANSMITTER_ATOM_IDENTIFIER,
          operationCodeLiteral: 'CLOUD_BATCH_TRANSMISSION_FAULT',
          correlationIdentifier,
          messageContentLiteral: 'Fallo crítico en el enlace físico con el Ledger de datos.',
          contextMetadataSnapshot: { errorTraceLiteral: errorDescriptionLiteral }
        });

        throw MapHttpErrorToException(500, 'FALLO_FISICO_TRANSMISION_LEDGER', {
          originalErrorLiteral: errorDescriptionLiteral,
          targetEndpointLiteral,
          totalRecordsAttemptedQuantity: ledgerPayloadCollection.length
        });
      }
    }
  );
};
