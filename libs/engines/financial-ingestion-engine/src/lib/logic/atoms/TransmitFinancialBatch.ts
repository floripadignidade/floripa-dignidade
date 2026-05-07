/**
 * @section Financial Ingestion - Cloud Batch Transmitter
 * @description Átomo encargado exclusivamente de la comunicación física I/O
 * con el Tier de Datos (Supabase). Implementa el protocolo de persistencia
 * asíncrona mediante fetch nativo y garantiza la idempotencia de los datos
 * mediante políticas de resolución de duplicados.
 *
 * Protocolo OEDP-V17.0 - Hardware Isolation & Cloud Sovereign.
 * SANEADO Zenith: Implementación de Upsert Idempotente y SRE Timeout.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { InternalSystemException } from '@floripa-dignidade/exceptions';

/* 1. ADN Estructural de Persistencia */
import type { IFinancialLedgerRow } from './MapFinancialRecordsToLedger';

/**
 * @interface ITransmissionParameters
 * @description Contrato inmutable para la operación de red masiva.
 */
interface ITransmissionParameters {
  /** URL absoluta de la API REST de la base de datos. */
  readonly cloudUrlLiteral: string;
  /** Llave maestra de acceso (Service Role) validada por la aduana. */
  readonly cloudSecurityKeySecret: string;
  /** Lote de registros mapeados bajo el esquema físico del Ledger. */
  readonly ledgerPayloadCollection: IFinancialLedgerRow[];
}

/**
 * Ejecuta el despacho físico de datos hacia la infraestructura de Supabase.
 * Implementa el patrón 'Stateless Fetch' compatible con Vercel Edge Runtime.
 *
 * @param parameters - Configuración técnica y carga útil de la transacción.
 * @returns {Promise<void>} Promesa de finalización de la transacción física.
 * @throws {InternalSystemException} Si la nube rechaza la persistencia o expira el tiempo.
 */
export const TransmitFinancialBatch = async (
  parameters: ITransmissionParameters
): Promise<void> => {
  const {
    cloudUrlLiteral,
    cloudSecurityKeySecret,
    ledgerPayloadCollection
  } = parameters;

  /**
   * @section Ejecución de Red (Hardware Native)
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
        /**
         * 🛡️ ESTRATEGIA DE ÉLITE: Upsert Idempotente.
         * 'resolution=merge-duplicates' evita registros duplicados si las llaves
         * naturales (categoría + mes + proyecto) ya existen en el Ledger.
         */
        'Prefer': 'return=minimal, resolution=merge-duplicates'
      },
      body: JSON.stringify(ledgerPayloadCollection),

      /**
       * SRE: Límite de 20 segundos para ingestas masivas.
       * Previene procesos 'zombie' que consuman créditos de ejecución en Vercel.
       */
      signal: AbortSignal.timeout(20000)
    });

    if (!networkResponse.ok) {
      throw new Error(`CLOUD_LEDGER_REJECTION_HTTP_${networkResponse.status}`);
    }

  } catch (caughtError: unknown) {
    /**
     * @section Gestión Forense de I/O
     * Transformamos el fallo de red en una excepción semántica para el Sentinel.
     */
    const errorDescriptionLiteral = caughtError instanceof Error
      ? caughtError.message
      : String(caughtError);

    throw new InternalSystemException('FALLO_FISICO_TRANSMISION_LEDGER', {
      originalErrorLiteral: errorDescriptionLiteral,
      targetEndpointLiteral,
      totalRecordsAttemptedQuantity: ledgerPayloadCollection.length
    });
  }
};
