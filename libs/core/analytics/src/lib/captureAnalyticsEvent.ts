/**
 * @section Analytics Logic - User Interaction Capture Orchestrator
 * @description Punto de entrada soberano para la captura, purificación Zod y programación
 * asíncrona de eventos de comportamiento y Core Web Vitals. Delega el despacho en CPU
 * ocioso a `ScheduleBackgroundIdleTask`, el transporte de red a `TransmitAnalyticsBeacon`
 * y la trazabilidad SRE a `EmitAnalyticsSignal`, protegiendo los 120 FPS de la interfaz.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Clean Paths).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa) e ISO/IEC 25010 (Rendimiento y Mantenibilidad).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { GenerateCorrelationIdentifier } from '@floripa-dignidade/telemetry';

import { EmitAnalyticsSignal } from './logic/atoms/EmitAnalyticsSignal';
import { ScheduleBackgroundIdleTask } from './logic/atoms/ScheduleBackgroundIdleTask';
import { TransmitAnalyticsBeacon } from './logic/atoms/TransmitAnalyticsBeacon';
import { AnalyticsEventSchema, type IAnalyticsEvent } from './schemas/AnalyticsEvent.schema';

/**
 * Captura un evento de interacción o métrica de rendimiento y programa su despacho no bloqueante.
 *
 * @param rawInteractionPayload - Datos crudos del evento capturados por los sensores de UI o Web Vitals.
 */
export const CaptureAnalyticsEvent = (rawInteractionPayload: unknown): void => {
  const correlationIdentifier = GenerateCorrelationIdentifier();

  // 1. ADUANA DE ADN (Validación perimetral Zod)
  const validationResult = AnalyticsEventSchema.safeParse(rawInteractionPayload);

  if (!validationResult.success) {
    EmitAnalyticsSignal({
      stageLiteral: 'REJECTED',
      correlationIdentifier,
      messageContentLiteral: 'Un evento analítico fue rechazado por fallo de integridad técnica.',
      contextMetadataSnapshot: {
        validationIssuesCollection: validationResult.error.flatten(),
      },
    });
    return;
  }

  const validatedEventSnapshot: IAnalyticsEvent = validationResult.data;

  // 2. PROGRAMACIÓN ASÍNCRONA FUERA DEL MAIN THREAD (Delegación Atómica)
  ScheduleBackgroundIdleTask((): void => {
    try {
      // 3. TRANSPORTE DE BALIZA NO BLOQUEANTE (Delegación Atómica)
      TransmitAnalyticsBeacon(validatedEventSnapshot, correlationIdentifier);

      // 4. REPORTE TELEMÉTRICO NOMINAL SRE
      EmitAnalyticsSignal({
        stageLiteral: 'DISPATCHED',
        correlationIdentifier,
        messageContentLiteral: `Evento capturado exitosamente: ${validatedEventSnapshot.eventName}`,
        contextMetadataSnapshot: {
          eventNameLiteral: validatedEventSnapshot.eventName,
          capturedAtMilliseconds: validatedEventSnapshot.capturedAtMilliseconds,
        },
      });
    } catch (caughtExecutionError: unknown) {
      const errorDescriptionLiteral =
        caughtExecutionError instanceof Error
          ? caughtExecutionError.message
          : String(caughtExecutionError);

      EmitAnalyticsSignal({
        stageLiteral: 'FAILED',
        correlationIdentifier,
        messageContentLiteral: 'Fallo crítico al intentar despachar evento analítico.',
        contextMetadataSnapshot: {
          errorTraceLiteral: errorDescriptionLiteral,
        },
      });
    }
  });
};
