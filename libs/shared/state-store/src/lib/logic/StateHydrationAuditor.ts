/**
 * @section Shared State Store - Hydration Auditor Orchestrator
 * @description Orquestador de observabilidad encargado de auditar la recuperación del
 * estado persistido desde almacenamiento local (ADR 0025). Coordina la validación Zod
 * del snapshot rehidratado, mide latencia física y despacha telemetría estructurada
 * sin bloquear el hilo principal ni interrumpir el montaje de la interfaz.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Clean Paths).
 * Normas: ISO/IEC 11179 (Nomenclatura Técnica) e ISO/IEC 25010 (Confiabilidad y Rendimiento).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { GenerateCorrelationIdentifier } from '@floripa-dignidade/telemetry';

import type { IGlobalSovereignStore } from '../GlobalInfrastructureStateStore';
import { EmitHydrationAuditSignal } from './hydration/atoms/EmitHydrationAuditSignal';
import { ValidateRehydratedStateSnapshot } from './hydration/atoms/ValidateRehydratedStateSnapshot';

/**
 * @name THydrationAuditorCallback
 * @description Contrato de firma para el callback `onRehydrateStorage` del middleware de Zustand.
 */
export type THydrationAuditorCallback = (
  rehydratedState: IGlobalSovereignStore | undefined,
  caughtError: unknown,
) => void;

/**
 * Genera el interceptor síncrono de auditoría para la rehidratación del almacén global.
 *
 * @param _ignoredInitialState - Estado base previo a la hidratación (no utilizado por diseño).
 * @returns {THydrationAuditorCallback} Callback auditado y libre de excepciones no contenidas.
 */
export const StateHydrationAuditor = (_ignoredInitialState: unknown): THydrationAuditorCallback => {
  const correlationIdentifier = GenerateCorrelationIdentifier();

  return (rehydratedState: IGlobalSovereignStore | undefined, caughtError: unknown): void => {
    const executionStartTimestampNumeric = globalThis.performance.now();

    const auditVerdictSnapshot = caughtError
      ? undefined
      : ValidateRehydratedStateSnapshot(rehydratedState);

    const executionLatencyInMillisecondsQuantity = Math.max(
      0,
      globalThis.performance.now() - executionStartTimestampNumeric,
    );

    EmitHydrationAuditSignal({
      correlationIdentifier,
      executionLatencyInMillisecondsQuantity,
      caughtError,
      auditVerdictSnapshot,
    });
  };
};
