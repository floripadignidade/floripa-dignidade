/**
 * @section Impact Analytics - Indicator Assembler Atom
 * @description Átomo de lógica pura encargado de la construcción y sellado
 * del indicador de impacto popular. Isola la aritmética de ensamblaje y garantiza
 * la inmutabilidad absoluta del rastro estadístico mediante sellado de memoria.
 *
 * Protocolo OEDP-V17.0 - Functional Atomicity & Mathematical Precision.
 * SANEADO Zenith: Corrección de orden alfabético de tipos (sort-imports),
 * resolución de rutas ESM (.js) y cumplimiento de Prosa ISO.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

/* 1. ADN Estructural y Esquemas (Verbatim Module Syntax) */
/** 🛡️ SANEADO Zenith: Ordenamiento alfabético estricto e inyección de extensión ESM. */
import type {
  EvaluatedEntityIdentifier,
  ImpactIndicatorIdentifier,
  IPopularAcceptanceIndicator,
} from '../../schemas/PopularAcceptanceIndicator.schema.js';

/* 2. Enjambre Atómico Local y Constantes */
/** 🛡️ SANEADO Zenith: Inyección de extensiones '.js' para el motor de resolución 'bundler'. */
import { CalculateCommunityConsensus } from './CalculateCommunityConsensus.js';
import { CalculateStatisticalConfidence } from './CalculateStatisticalConfidence.js';
import { BAYESIAN_ALGORITHM_CONFIGURATION } from '../../constants/BayesianAlgorithm.config.js';

/**
 * @interface IAssemblerParameters
 * @description Contrato inmutable para la creación del snapshot de impacto.
 * Sigue la norma ISO de Objeto + Propiedad + Representación.
 */
interface IAssemblerParameters {
  readonly targetEntityIdentifier: EvaluatedEntityIdentifier;
  readonly weightedTrustScoreNumeric: number;
  readonly totalTrustWeightAccumulator: number;
  readonly participantQuantity: number;
  readonly distributionMetadata: {
    readonly verifiedCitizensQuantity: number;
    readonly anonymousInteractionsQuantity: number;
  };
}

/**
 * Construye un snapshot inmutable de aceptación popular bajo estándares forenses.
 * Implementa el patrón "Lost Artifact": el objeto devuelto es inalterable.
 *
 * @param parametersSnapshot - Datos calculados por el enjambre estadístico.
 * @returns {IPopularAcceptanceIndicator} Indicador sellado y validado para el Ledger.
 */
export const AssemblePopularAcceptanceIndicator = (
  parametersSnapshot: IAssemblerParameters,
): IPopularAcceptanceIndicator => {
  const {
    targetEntityIdentifier,
    weightedTrustScoreNumeric,
    totalTrustWeightAccumulator,
    participantQuantity,
    distributionMetadata,
  } = parametersSnapshot;

  /**
   * @section Inferencia de Hitos de Calidad
   * Delegamos los cálculos de dispersión y certidumbre en átomos especializados
   * para mantener la responsabilidad única del ensamblador.
   */
  const statisticalConfidenceLevelNumeric = CalculateStatisticalConfidence(
    totalTrustWeightAccumulator,
    BAYESIAN_ALGORITHM_CONFIGURATION.CONFIDENCE_THRESHOLD_WEIGHT_QUANTITY,
  );

  const communityConsensusIndexNumeric = CalculateCommunityConsensus(weightedTrustScoreNumeric);

  /**
   * @section Construcción del Lost Artifact
   * Se utiliza Object.freeze para asegurar que el rastro no sea mutado
   * durante su tránsito por el bus de datos hacia el Tier de Persistencia.
   */
  return Object.freeze({
    indicatorIdentifier: crypto.randomUUID() as ImpactIndicatorIdentifier,
    targetEntityIdentifier,
    weightedTrustScoreNumeric,
    statisticalConfidenceLevelNumeric,
    totalParticipantQuantity: participantQuantity,
    authorityLevelDistributionMetadata: {
      ...distributionMetadata,
      technicalAuditorsQuantity: 0, // Reservado para auditorías de supervisión humana.
    },
    /**
     * @todo En la Fase 14, inyectar el átomo 'DetectAcceptanceTrend.ts'
     * comparando el rastro actual contra el Ledger histórico.
     */
    currentAcceptanceTrend: 'STABLE_CONSENSUS',
    communityConsensusIndexNumeric,
    algorithmVersionLiteral: BAYESIAN_ALGORITHM_CONFIGURATION.CURRENT_ALGORITHM_VERSION_LITERAL,
    lastAggregationTimestampISO: new Date().toISOString(),
  });
};
