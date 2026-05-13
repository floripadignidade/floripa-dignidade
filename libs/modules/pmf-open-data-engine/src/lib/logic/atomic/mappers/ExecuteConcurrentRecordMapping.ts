/**
 * @section PMF Engine Logic - Concurrent Mapping Swarm
 * @description Átomo encargado de coordinar el procesamiento paralelo de registros
 * gubernamentales. Implementa una estrategia de "Fallo Silencioso Individual"
 * para asegurar que un registro corrupto no detenga la ingesta del lote completo.
 *
 * Protocolo OEDP-V17.0 - High Performance SRE & Fault Tolerance.
 * @author Raz Podestá - MetaShark Tech
 */

import type { IPublicExpenditure } from '../../../schemas/sovereign/PublicExpenditure.schema';
import type { IEPublicaExpenseRaw } from '../../../schemas/protocol/EPublicaExpense.schema';
import { ProcessExpenditureRecord } from './ProcessExpenditureRecord';

interface IConcurrentMappingParameters {
  readonly rawRecordsCollection: readonly IEPublicaExpenseRaw[];
  readonly municipalitySlugLiteral: string;
  readonly correlationIdentifier: string;
}

/**
 * Ejecuta la transformación masiva del lote mediante concurrencia controlada.
 *
 * @param parameters - Snapshot de datos crudos y metadatos de trazabilidad.
 * @returns {Promise<(IPublicExpenditure | null)[]>} Colección de resultados (null para fallidos).
 */
export const ExecuteConcurrentRecordMapping = async (
  parameters: IConcurrentMappingParameters
): Promise<(IPublicExpenditure | null)[]> => {

  /**
   * 🛡️ LEY SRE: Cada registro se envuelve en su propia cápsula de resiliencia.
   */
  const mappingPromisesCollection = parameters.rawRecordsCollection.map(
    async (governmentRecordSnapshot) => {
      try {
        return await ProcessExpenditureRecord(
          governmentRecordSnapshot,
          parameters.municipalitySlugLiteral,
          parameters.correlationIdentifier,
        );
      } catch (_ignoredAuditFault: unknown) {
        /**
         * El fallo se reporta internamente en 'ProcessExpenditureRecord'.
         * Aquí retornamos null para que el calculador de fidelidad tabule el error.
         */
        return null;
      }
    }
  );

  return await Promise.all(mappingPromisesCollection);
};
