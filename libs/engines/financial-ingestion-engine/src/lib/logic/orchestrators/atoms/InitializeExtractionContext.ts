/**
 * @section Financial Ingestion - Context Initialization Atom
 * @description Átomo de lógica pura encargado de estructurar la memoria volátil
 * para el proceso de ingesta.
 *
 * Protocolo OEDP-V17.0 - Functional Atomicity & ISO Standards.
 */

import type { IExtractionContext } from '../../../schemas/ExtractionContext.schema';

/**
 * Genera una instancia inicial del contexto de extracción sincronizada.
 *
 * @param monthHeadersMapping - Mapa de coordenadas temporales [Columna]: Mes.
 * @param correlationIdentifier - ID de trazabilidad forense.
 * @returns {IExtractionContext} Contexto inmutable de proceso.
 */
export const InitializeExtractionContext = (
  monthHeadersMapping: Record<number, string>,
  correlationIdentifier: string
): IExtractionContext => {
  return {
    activeCategorySpecificationLiteral: '',
    monthHeadersMapping,
    recordsCollection: [],
    correlationIdentifier,
  };
};
