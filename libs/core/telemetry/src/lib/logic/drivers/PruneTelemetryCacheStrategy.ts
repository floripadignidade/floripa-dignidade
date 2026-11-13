/**
 * @section Telemetry Logic - Cache Pruning Strategy Atom
 * @description Átomo de lógica pura encarregado da otimização do volume de dados
 * no cliente. Aplica uma triagem de severidade para eliminar registros de
 * baixa prioridade quando a fila de espera excede os limites de segurança SRE,
 * garantindo a preservação da evidência forense crítica.
 *
 * Protocolo OEDP-V17.0 - Functional Atomicity & Intelligent Retention.
 * SANEADO Zenith: Erradicação de rastro morto (TS6133).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import type { ITelemetrySignal } from '../../schemas/TelemetrySignal.schema';

/**
 * @section Definições de Capacidade Soberana
 */
const MAXIMUM_RETENTION_QUANTITY = 150; // Limite físico de sinais em memória local.

/**
 * Executa a poda seletiva da coleção de sinais baseada na hierarquia de severidade.
 * Implementa uma função pura: (Coleção Bruta) -> Coleção Otimizada.
 *
 * @param telemetrySignalsCollection - Lote de sinais capturadas do hardware.
 * @returns {ITelemetrySignal[]} Coleção purificada e reduzida, ordenada cronologicamente.
 */
export const PruneTelemetryCacheStrategy = (
  telemetrySignalsCollection: ITelemetrySignal[],
): ITelemetrySignal[] => {
  // 1. AVALIAÇÃO DE SATURAÇÃO (Fast-path)
  const currentCollectionSizeQuantity = telemetrySignalsCollection.length;

  if (currentCollectionSizeQuantity <= MAXIMUM_RETENTION_QUANTITY) {
    return telemetrySignalsCollection;
  }

  /**
   * @section Algoritmo de Triagem por Severidade
   * Dividimos a coleção em dois enxames lógicos:
   * A. High Priority: Sinais que exigem intervenção (CRITICAL, ERROR, WARNING).
   * B. Low Priority: Sinais informativos ou de depuração (INFO, DEBUG).
   */
  const highPrioritySignalsCollection = telemetrySignalsCollection.filter((signalSnapshot) =>
    ['CRITICAL', 'ERROR', 'WARNING'].includes(signalSnapshot.severityLevelLiteral),
  );

  const lowPrioritySignalsCollection = telemetrySignalsCollection.filter((signalSnapshot) =>
    ['INFO', 'DEBUG'].includes(signalSnapshot.severityLevelLiteral),
  );

  /**
   * @section Execução de Purga (Retention Logic)
   * Caso o volume de erros exceda o limite total, realizamos um truncamento
   * temporal para preservar apenas o rastro mais recente da cadeia Merkle.
   */
  if (highPrioritySignalsCollection.length > MAXIMUM_RETENTION_QUANTITY) {
    return highPrioritySignalsCollection.slice(-MAXIMUM_RETENTION_QUANTITY);
  }

  /**
   * Cálculo de Cota Remanescente:
   * Determinamos quanto espaço sobra para logs informativos após salvar os erros.
   */
  const remainingAllowanceQuantity =
    MAXIMUM_RETENTION_QUANTITY - highPrioritySignalsCollection.length;

  const prunedLowPriorityCollection = lowPrioritySignalsCollection.slice(
    -remainingAllowanceQuantity,
  );

  /**
   * @section Re-ensamblagem e Ordenação
   * Fusionamos os enxames e restauramos a integridade cronológica para o Sentinel.
   */
  const optimizedCollection = [...highPrioritySignalsCollection, ...prunedLowPriorityCollection];

  return optimizedCollection.sort(
    (firstSignalSnapshot, secondSignalSnapshot) =>
      new Date(firstSignalSnapshot.occurrenceTimestampISO).getTime() -
      new Date(secondSignalSnapshot.occurrenceTimestampISO).getTime(),
  );
};
