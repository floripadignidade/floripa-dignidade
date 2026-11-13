/**
 * @section Impact Analytics Engine - Package Entry Point
 * @description Centraliza y exporta las capacidades de inteligencia estadística,
 * mapas de calor de confianza territorial y orquestación de métricas de impacto
 * social. Actúa como el puente de datos para la transparencia institucional.
 *
 * Protocolo OEDP-V16.0 - Single Source Resolution & ISO Technical Naming.
 * Vision: Data-Driven Social Reliability & Public Trust Governance.
 *
 * @author Raz Podestá - MetaShark Tech
 */

/**
 * @section ADN Estructural (Schemas & Interfaces)
 * @description Exportación de contratos inmutables para la validación de
 * indicadores y reportes de impacto.
 */
export {
  PopularAcceptanceIndicatorSchema,
  IndicatorIdentifierSchema,
  AcceptanceTrendSchema,
} from './lib/schemas/PopularAcceptanceIndicator.schema';

export type {
  IPopularAcceptanceIndicator,
  ImpactIndicatorIdentifier,
} from './lib/schemas/PopularAcceptanceIndicator.schema';

export {
  TerritorialImpactReportSchema,
  TerritorialClusterSchema,
} from './lib/schemas/TerritorialImpactReport.schema';

export type { ITerritorialImpactReport } from './lib/schemas/TerritorialImpactReport.schema';

/**
 * @section Almas Lingüísticas (Internationalization)
 * @description Esquema de traducción técnica para la divulgación de
 * resultados estadísticos al ciudadano.
 */
export { ImpactAnalyticsI18nSchema } from './lib/i18n/ImpactAnalyticsI18n.schema';
export type { IImpactAnalyticsI18n } from './lib/i18n/ImpactAnalyticsI18n.schema';

/**
 * @section Motores de Lógica (Orquestadores de Élite)
 * @description Funciones puras y orquestadores para la generación de
 * evidencia sociográfica.
 */
export { GenerateImpactAnalyticsReport } from './lib/logic/GenerateImpactAnalyticsReport';

/**
 * @version 1.2.0
 * Identificador de versión sincronizado tras la atomización territorial.
 */
export const IMPACT_ANALYTICS_ENGINE_VERSION = '1.2.0';
