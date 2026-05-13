/**
 * @section UI Atom - AI Audit Status Badge
 * @description Indicador visual de la salud de un gasto analizado por el Neural Sentinel.
 * Proporciona feedback inmediato sobre la integridad del registro gubernamental.
 *
 * Protocolo OEDP-V17.0 - High Performance UI & Atomic Visual DNA.
 * SANEADO Zenith: Resolución de TS2307 (Shared Utility), erradicación de React
 * fantasma y cumplimiento estricto de Prosa ISO (ADR 0002).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

/* 1. Infraestructura de Utilidades (Sovereign Boundaries) */
import { GlobalStyleClassMerger } from '@floripa-dignidade/shared-utility';

/**
 * @interface IAiAuditBadgeProperties
 * @description Contrato inmutable para la parametrización del indicador visual.
 * Sigue la norma ISO de Objeto + Propiedad + Representación.
 */
interface IAiAuditBadgeProperties {
  /** Coeficiente de anomalía detectado por la IA (0.0 a 1.0). */
  readonly anomalyScoreNumeric: number;
}

/**
 * Aparato encargado de la señalética de salud algorítmica.
 *
 * @param propertiesSnapshot - Snapshot inmutable con el coeficiente de anomalía.
 * @returns {React.JSX.Element} Insignia visual auditada.
 */
export const AiAuditBadge = (
  propertiesSnapshot: IAiAuditBadgeProperties
): React.JSX.Element => {
  const { anomalyScoreNumeric } = propertiesSnapshot;

  /**
   * @section Lógica de Triaje Visual
   * 🛡️ LEY SRE: Un score menor a 0.3 se considera nominal.
   * Valores superiores indican fricción o anomalía detectada por el Sentinel.
   */
  const isHealthyBoolean = anomalyScoreNumeric < 0.3;

  const containerStylesLiteral = GlobalStyleClassMerger(
    'inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase',
    isHealthyBoolean ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700',
  );

  const indicatorDotStylesLiteral = GlobalStyleClassMerger(
    'w-2 h-2 rounded-full',
    isHealthyBoolean ? 'bg-green-500' : 'bg-red-500 animate-pulse',
  );

  return (
    <div className={containerStylesLiteral} aria-live="polite">
      <div className={indicatorDotStylesLiteral} aria-hidden="true" />
      <span>{isHealthyBoolean ? 'Nominal' : 'Audit Required'}</span>
    </div>
  );
};
