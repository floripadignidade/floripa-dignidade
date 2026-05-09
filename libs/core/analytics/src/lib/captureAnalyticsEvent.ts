/**
 * @section Analytics Logic - User Interaction Capture
 * @description Captura, purifica y programa el despacho de eventos de comportamiento.
 * Implementa una estrategia de ejecución no bloqueante utilizando 'requestIdleCallback'
 * para proteger los 60/120 FPS de la interfaz ciudadana.
 *
 * Protocolo OEDP-V17.0 - High Performance SRE & ISO Technical Naming.
 * SANEADO Zenith: Corrección de nomenclatura booleana (Fix naming-convention)
 * y normalización de rastro forense.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import {
  EmitTelemetrySignal,
  GenerateCorrelationIdentifier,
} from '@floripa-dignidade/telemetry';

/* 1. ADN Estructural y Esquemas (Verbatim Module Syntax) */
import { AnalyticsEventSchema } from './schemas/AnalyticsEvent.schema';
import type { IAnalyticsEvent } from './schemas/AnalyticsEvent.schema';

/** Identificador técnico del búnker para el Neural Sentinel. */
const ANALYTICS_MODULE_IDENTIFIER = 'CORE_ANALYTICS_SERVICE';

/**
 * Captura un pulso de interacción, valida su integridad estructural y
 * delega su despacho asíncrono al bus de eventos.
 *
 * @param rawInteractionPayload - Datos crudos capturados por los sensores de la UI.
 * @returns {void} Operación de tipo "Fire-and-Forget".
 */
export const CaptureAnalyticsEvent = (rawInteractionPayload: unknown): void => {
  const correlationIdentifier = GenerateCorrelationIdentifier();

  // 1. ADUANA DE ADN (Safe Parsing)
  const validationResult = AnalyticsEventSchema.safeParse(rawInteractionPayload);

  if (!validationResult.success) {
    void EmitTelemetrySignal({
      severityLevelLiteral: 'WARNING',
      moduleIdentifierLiteral: ANALYTICS_MODULE_IDENTIFIER,
      operationCodeLiteral: 'INVALID_ANALYTICS_SCHEMA_DETECTION',
      correlationIdentifier,
      messageContentLiteral: 'Un evento analítico fue rechazado por fallo de integridad técnica.',
      contextMetadataSnapshot: {
        validationIssuesCollection: validationResult.error.flatten(),
      },
    });
    return;
  }

  const validatedEventSnapshot: IAnalyticsEvent = validationResult.data;

  /**
   * @section Lógica de Despacho Asíncrono
   * Encapsula la transmisión física para ser ejecutada en periodos de inactividad del CPU.
   */
  const executeAsynchronousDispatchAction = (): void => {
    try {
      /**
       * 🛡️ SANEADO Zenith: Sufijo 'Boolean' inyectado para cumplimiento de la Constitución Técnica.
       */
      const isBeaconTransportAvailableBoolean =
        typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function';

      if (isBeaconTransportAvailableBoolean) {
        /**
         * @future_implementation
         * Integración con el Gateway de Analítica Forense (Fase 9).
         */
      }

      void EmitTelemetrySignal({
        severityLevelLiteral: 'INFO',
        moduleIdentifierLiteral: ANALYTICS_MODULE_IDENTIFIER,
        operationCodeLiteral: 'ANALYTICS_EVENT_DISPATCHED',
        correlationIdentifier,
        messageContentLiteral: `Evento capturado exitosamente: ${validatedEventSnapshot.eventName}`,
        contextMetadataSnapshot: { eventNameLiteral: validatedEventSnapshot.eventName },
      });

    } catch (caughtError: unknown) {
      const errorDescriptionLiteral =
        caughtError instanceof Error ? caughtError.message : String(caughtError);

      void EmitTelemetrySignal({
        severityLevelLiteral: 'ERROR',
        moduleIdentifierLiteral: ANALYTICS_MODULE_IDENTIFIER,
        operationCodeLiteral: 'ANALYTICS_DISPATCH_FAILURE',
        correlationIdentifier,
        messageContentLiteral: 'Fallo crítico al intentar despachar evento analítico.',
        contextMetadataSnapshot: { errorTraceLiteral: errorDescriptionLiteral },
      });
    }
  };

  /**
   * @section Planificación de Ejecución (SRE Optimization)
   * Priorizamos el uso de requestIdleCallback para no competir con el renderizado de React 19.
   */
  if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
    window.requestIdleCallback(() => executeAsynchronousDispatchAction(), { timeout: 2000 });
  } else {
    // Fallback para entornos sin soporte de Idle o Server-side
    setTimeout(() => executeAsynchronousDispatchAction(), 1);
  }
};
