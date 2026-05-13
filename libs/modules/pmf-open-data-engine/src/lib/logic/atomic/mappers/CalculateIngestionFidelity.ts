/**
 * @section PMF Engine Logic - Ingestion Fidelity Calculator
 * @description Átomo de lógica pura encargado de tabular el éxito del enjambre.
 * Protocolo OEDP-V17.0 - ISO Technical Naming.
 */

export interface IIngestionFidelityMetrics {
  readonly totalAttemptedQuantity: number;
  readonly successfulIngestionsQuantity: number;
  readonly failedIngestionsQuantity: number;
  readonly fidelityPercentageNumeric: number;
}

/**
 * Calcula el ratio de éxito de un lote de ingesta.
 */
export const CalculateIngestionFidelity = (
  resultsCollection: boolean[]
): IIngestionFidelityMetrics => {
  const totalAttemptedQuantity = resultsCollection.length;
  const successfulIngestionsQuantity = resultsCollection.filter(result => result).length;
  const failedIngestionsQuantity = totalAttemptedQuantity - successfulIngestionsQuantity;

  const fidelityPercentageNumeric = totalAttemptedQuantity > 0
    ? (successfulIngestionsQuantity / totalAttemptedQuantity) * 100
    : 0;

  return {
    totalAttemptedQuantity,
    successfulIngestionsQuantity,
    failedIngestionsQuantity,
    fidelityPercentageNumeric: Number(fidelityPercentageNumeric.toFixed(2))
  };
};
