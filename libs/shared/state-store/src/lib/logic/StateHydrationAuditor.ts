/**
 * @section State Store Logic - Hydration Auditor
 * @description Átomo encargado de la vigilancia forense durante la recuperación
 * del estado desde el almacenamiento físico. Emite señales al Neural Sentinel
 * confirmando el éxito o el colapso del proceso de rehidratación (ADR 0025).
 *
 * Protocolo OEDP-V17.0 - High Performance SRE & ISO Technical Naming.
 * SANEADO Zenith: Inyección de firma explícita (Fix Implicit Return) y
 * sincronización de parámetros de telemetría a la norma inmutable.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import {
  EmitTelemetrySignal,
  GenerateCorrelationIdentifier
} from '@floripa-dignidade/telemetry';
import type { IGlobalSovereignStore } from '../GlobalInfrastructureStateStore';

/**
 * @name THydrationAuditorCallback
 * @description Contrato técnico para el retorno de la función interceptora de Zustand.
 * Garantiza la legibilidad del compilador y acelera el Typecheck.
 */
type THydrationAuditorCallback = (
  rehydratedState: IGlobalSovereignStore | undefined,
  caughtError: unknown
) => void;

/** Identificador técnico del aparato para el Neural Sentinel. */
const HYDRATION_SENTRY_IDENTIFIER = 'GLOBAL_STATE_ORCHESTRATOR';

/**
 * Genera el callback de auditoría para el middleware de persistencia.
 *
 * @param _ignoredInitialState - Estado antes de la hidratación (Ignorado por diseño).
 * @returns {THydrationAuditorCallback} Función que procesa el resultado de la hidratación.
 */
export const StateHydrationAuditor = (
  _ignoredInitialState: unknown
): THydrationAuditorCallback => {
  const correlationIdentifier = GenerateCorrelationIdentifier();

  return (
    rehydratedState: IGlobalSovereignStore | undefined,
    caughtError: unknown
  ): void => {

    /**
     * @section Gestión Forense de Fallo (Resilience Layer)
     */
    if (caughtError) {
      const errorDescriptionLiteral = caughtError instanceof Error
        ? caughtError.message
        : String(caughtError);

      void EmitTelemetrySignal({
        severityLevelLiteral: 'ERROR',
        moduleIdentifierLiteral: HYDRATION_SENTRY_IDENTIFIER,
        operationCodeLiteral: 'STATE_HYDRATION_FAULT',
        correlationIdentifier,
        messageContentLiteral: 'Fallo crítico al intentar recuperar la soberanía del disco local.',
        contextMetadataSnapshot: { errorTraceLiteral: errorDescriptionLiteral }
      });
      return;
    }

    /**
     * @section Reporte de Éxito Operacional
     */
    void EmitTelemetrySignal({
      severityLevelLiteral: 'INFO',
      moduleIdentifierLiteral: HYDRATION_SENTRY_IDENTIFIER,
      operationCodeLiteral: 'STATE_HYDRATION_NOMINAL',
      correlationIdentifier,
      messageContentLiteral: 'Soberanía recuperada: Memoria institucional sincronizada con el hardware local.',
      contextMetadataSnapshot: {
        hasActiveMandataryBoolean: !!rehydratedState?.activeMandataryIdentifier,
        isNetworkOnlineBoolean: !!rehydratedState?.isNetworkOnlineBoolean
      }
    });
  };
};
