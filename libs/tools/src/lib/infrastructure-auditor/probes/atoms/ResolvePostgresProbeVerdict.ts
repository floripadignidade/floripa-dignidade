/**
 * @section Infrastructure Auditor - PostgreSQL Probe Verdict Resolver (Atom)
 * @description Átomo de lógica pura encargado de evaluar el veredicto operacional
 * y la severidad telemétrica de la sonda PostgreSQL a partir de la alcanzabilidad física y la latencia.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Clean Paths).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa) e ISO/IEC 25010 (Confiabilidad y Rendimiento).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import type { TProbeExecutionStatus } from '../../schemas/CloudInfrastructureAuditReport.schema';

/**
 * @interface IPostgresProbeVerdict
 * @description Contrato inmutable que estructura el veredicto técnico y severidad.
 */
export interface IPostgresProbeVerdict {
  readonly finalProbeStatusLiteral: TProbeExecutionStatus;
  readonly severityLevelLiteral: 'INFO' | 'CRITICAL' | 'WARNING';
}

/**
 * Resuelve el estatus operacional y la severidad de telemetría para PostgreSQL.
 *
 * @param isReachableBoolean - Indica si el socket TCP/TLS completó el handshake.
 * @param latencyInMillisecondsQuantity - Latencia medida en milisegundos.
 * @returns {IPostgresProbeVerdict} Veredicto técnico sellado.
 */
export const ResolvePostgresProbeVerdict = (
  isReachableBoolean: boolean,
  latencyInMillisecondsQuantity: number,
): IPostgresProbeVerdict => {
  if (!isReachableBoolean) {
    return Object.freeze({
      finalProbeStatusLiteral: 'UNREACHABLE_FAILURE',
      severityLevelLiteral: 'CRITICAL',
    });
  }

  if (latencyInMillisecondsQuantity > 1000) {
    return Object.freeze({
      finalProbeStatusLiteral: 'DEGRADED_LATENCY',
      severityLevelLiteral: 'WARNING',
    });
  }

  return Object.freeze({
    finalProbeStatusLiteral: 'NOMINAL_OPERATIONAL',
    severityLevelLiteral: 'INFO',
  });
};
