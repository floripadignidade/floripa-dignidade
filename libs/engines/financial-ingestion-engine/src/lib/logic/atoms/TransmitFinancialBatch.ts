/**
 * @section Financial Ingestion - Cloud Batch Transmitter Atom
 * @description Átomo encargado exclusivamente de la comunicación física I/O
 * con el Tier de Datos. Implementa el protocolo de persistencia asíncrona
 * y garantiza la integridad de la cadena de custodia digital.
 *
 * Protocolo OEDP-V17.0 - High Performance SRE & ISO Technical Naming.
 * SANEADO Zenith: Erradicación de literales hardcoded, inyección de
 * semanticIntentTag y optimización de cabeceras.
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

/* 1. ADN Estructural y Configuración (Verbatim Module Syntax) */
import type { IFinancialLedgerRow } from './MapFinancialRecordsToLedger';
import { FINANCIAL_PERSISTENCE_CONFIG } from '../../constants/FinancialPersistence.config';

/**
 * @interface ITransmissionParameters
 * @description Contrato inmutable para la operación de red masiva.
 */
export interface ITransmissionParameters {
  /** URL absoluta del endpoint REST de la infraestructura cloud. */
  readonly cloudUrlLiteral: string;

  /** Llave de acceso de alta autoridad (Service Role) validada por la aduana. */
  readonly cloudSecurityKeySecret: string;

  /** Lote de registros financieros mapeados para el Ledger. */
  readonly ledgerPayloadCollection: readonly IFinancialLedgerRow[];
}

/**
 * Ejecuta el despacho físico de datos hacia la nube soberana.
 * Implementa el patrón 'Atomic I/O' con protección de timeout SRE.
 *
 * @param parameters - Configuración técnica y carga útil de la transacción.
 * @returns {Promise<void>} Promesa de finalización de la transacción física.
 * @throws {GlobalBaseException} Si la nube rechaza la persistencia o el enlace falla.
 */
export const TransmitFinancialBatch = async (
  parameters: ITransmissionParameters,
): Promise<void> => {
  const { cloudUrlLiteral, cloudSecurityKeySecret, ledgerPayloadCollection } = parameters;

  const correlationIdentifier = GenerateCorrelationIdentifier();

  return await TraceExecutionTime(
    FINANCIAL_PERSISTENCE_CONFIG.MODULE_IDENTIFIER,
    'EXECUTE_CLOUD_LEDGER_TRANSMISSION',
    correlationIdentifier,
    async () => {
      /**
       * @section Construcción de Identidad de Red
       * Apuntamos dinámicamente a la tabla maestra definida en la configuración.
       */
      const targetEndpointLiteral = `${cloudUrlLiteral}/rest/v1/${FINANCIAL_PERSISTENCE_CONFIG.TARGET_DATABASE_TABLE_NAME_LITERAL}`;

      try {
        const networkResponse = await fetch(targetEndpointLiteral, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            apikey: cloudSecurityKeySecret,
            Authorization: `Bearer ${cloudSecurityKeySecret}`,
            /**
             * 🛡️ ESTRATEGIA DE INTEGRIDAD:
             * Upsert por llaves naturales para evitar duplicidad de registros financieros.
             */
            Prefer: 'return=minimal, resolution=merge-duplicates',
          },
          body: JSON.stringify(ledgerPayloadCollection),

          /** SRE: Protección ante bloqueos de hardware por latencia de red. */
          signal: AbortSignal.timeout(
            FINANCIAL_PERSISTENCE_CONFIG.NETWORK_TRANSMISSION_TIMEOUT_MILLISECONDS_QUANTITY,
          ),
        });

        if (!networkResponse.ok) {
          throw MapHttpErrorToException(networkResponse.status, 'LEDGER_PERSISTENCE_REJECTED', {
            httpStatusNumeric: networkResponse.status,
            targetTable: FINANCIAL_PERSISTENCE_CONFIG.TARGET_DATABASE_TABLE_NAME_LITERAL,
          });
        }

        // REPORTE DE ÉXITO (SRE Visibility)
        void EmitTelemetrySignal({
          severityLevelLiteral: 'INFO',
          moduleIdentifierLiteral: FINANCIAL_PERSISTENCE_CONFIG.MODULE_IDENTIFIER,
          operationCodeLiteral: 'CLOUD_BATCH_TRANSMISSION_SUCCESS',
          correlationIdentifier,
          /** Uso de clave soberana para i18n de logs técnicos */
          messageContentLiteral: 'FINANCIAL_INGESTION.LOGS.SYNC_SUCCESS',
          semanticIntentTag: 'DATA_LAKE_INGESTION',
          contextMetadataSnapshot: {
            recordsQuantity: ledgerPayloadCollection.length,
            targetTable: FINANCIAL_PERSISTENCE_CONFIG.TARGET_DATABASE_TABLE_NAME_LITERAL,
          },
        });
      } catch (caughtError: unknown) {
        /**
         * @section Gestión Forense de Fallo
         * Transformamos el colapso de red en una excepción semántica para el Sentinel.
         */
        const errorDescriptionLiteral =
          caughtError instanceof Error ? caughtError.message : String(caughtError);

        void EmitTelemetrySignal({
          severityLevelLiteral: 'CRITICAL',
          moduleIdentifierLiteral: FINANCIAL_PERSISTENCE_CONFIG.MODULE_IDENTIFIER,
          operationCodeLiteral: 'CLOUD_BATCH_TRANSMISSION_FAULT',
          correlationIdentifier,
          messageContentLiteral: 'Fallo crítico en el enlace físico con el Ledger financiero.',
          semanticIntentTag: 'INFRASTRUCTURE_IO_FAULT',
          contextMetadataSnapshot: {
            errorTraceLiteral: errorDescriptionLiteral,
            attemptedRecordsQuantity: ledgerPayloadCollection.length,
          },
        });

        // Re-envolvemos para asegurar que el error sea capturado por el búnker de 'exceptions'.
        if (errorDescriptionLiteral.includes('Exception')) {
          throw caughtError;
        }

        throw MapHttpErrorToException(500, 'FALLO_FISICO_TRANSMISION_LEDGER', {
          originalErrorLiteral: errorDescriptionLiteral,
          correlationIdentifier,
        });
      }
    },
  );
};
