// libs/core/routing/src/lib/logic/GlobalRequestOrchestrator.ts

/**
 * @section Routing Logic - Global Request Perimeter Orchestrator
 * @description Orquestador perimetral de red encargado de coordinar la canalización de
 * sensores de frontera y seguridad en el Edge Runtime de Vercel. Gestiona el ciclo de vida
 * de la solicitud entrante, inyectando trazabilidad forense distribuida, detectando la
 * localización lingüística y aplicando políticas de inspección anti-automatización.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Clean Paths).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa), ISO/IEC 25010 (Confiabilidad y Rendimiento) y ADR 0027.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { type NextRequest, NextResponse } from 'next/server';

/* 1. Infraestructura Core de Excepciones y Telemetría */
import { GlobalBaseException, MapHttpErrorToException } from '@floripa-dignidade/exceptions';
import {
  type CorrelationIdentifier,
  EmitTelemetrySignal,
  GenerateCorrelationIdentifier,
  type ModuleIdentifier,
  ModuleIdentifierSchema,
  type OperationCode,
  OperationCodeSchema,
  ReportForensicException,
  TraceExecutionTime,
} from '@floripa-dignidade/telemetry';

/* 2. Enjambre Atómico Local de Inicialización y Sensores de Frontera */
import { InitializeRoutingContext } from './atomic/InitializeRoutingContext';
import { SWARM_SENSORS_PIPELINE } from './constants/RoutingSensorRegistry';

const ROUTING_ORCHESTRATOR_MODULE_IDENTIFIER: ModuleIdentifier = ModuleIdentifierSchema.parse(
  'ROUTING_EDGE_ORCHESTRATOR',
);

const EDGE_PIPELINE_OPERATION_CODE: OperationCode = OperationCodeSchema.parse(
  'EXECUTE_EDGE_PIPELINE_TRANSACTION',
);

const EDGE_COLLAPSE_OPERATION_CODE: OperationCode = OperationCodeSchema.parse(
  'EDGE_PIPELINE_CRITICAL_FAULT',
);

/**
 * Ejecuta la canalización de inspección perimetral sobre la solicitud entrante en el Edge.
 * Implementa evaluación secuencial con capacidad de interrupción inmediata (Short-circuit).
 *
 * @param incomingRequestSnapshot - Solicitud física entrante capturada por el interceptor de red.
 * @returns {Promise<NextResponse>} Respuesta procesada, redirigida o autorizada con cabeceras forenses.
 */
export const GlobalRequestOrchestrator = async (
  incomingRequestSnapshot: NextRequest,
): Promise<NextResponse> => {
  const correlationIdentifier: CorrelationIdentifier = GenerateCorrelationIdentifier();

  return await TraceExecutionTime(
    ROUTING_ORCHESTRATOR_MODULE_IDENTIFIER,
    EDGE_PIPELINE_OPERATION_CODE,
    correlationIdentifier,
    async (): Promise<NextResponse> => {
      try {
        // --- FASE 1: INICIALIZACIÓN DE CONTEXTO TÉCNICO (Identity & Device Metadata) ---
        const routingContextSnapshot = InitializeRoutingContext(
          incomingRequestSnapshot,
          correlationIdentifier,
        );

        // --- FASE 2: EVALUACIÓN DE SENSORES PERIMETRALES (Security & Redirection Triage) ---
        for (const executeSensorAction of SWARM_SENSORS_PIPELINE) {
          const sensorResponseSignal = await executeSensorAction(
            incomingRequestSnapshot,
            routingContextSnapshot,
          );

          if (sensorResponseSignal) {
            sensorResponseSignal.headers.set('X-Floripa-Correlation-ID', correlationIdentifier);
            return sensorResponseSignal;
          }
        }

        // --- FASE 3: CONTINUACIÓN NOMINAL CON CABECERAS FORENSES ---
        const authorizedResponseSignal = NextResponse.next();

        authorizedResponseSignal.headers.set('X-Floripa-Correlation-ID', correlationIdentifier);
        authorizedResponseSignal.headers.set(
          'X-Floripa-Detected-Locale',
          routingContextSnapshot.detectedLocale,
        );

        return authorizedResponseSignal;
      } catch (caughtExecutionError: unknown) {
        // --- FASE 4: PROTOCOLO DE CONTINGENCIA PERIMETRAL ---
        const normalizedException =
          caughtExecutionError instanceof GlobalBaseException
            ? caughtExecutionError
            : MapHttpErrorToException(500, 'EDGE_ORCHESTRATION_COLLAPSE', {
                originalErrorLiteral:
                  caughtExecutionError instanceof Error
                    ? caughtExecutionError.message
                    : String(caughtExecutionError),
                correlationIdentifier,
              });

        ReportForensicException(normalizedException, correlationIdentifier);

        void EmitTelemetrySignal({
          occurrenceTimestampISO: new Date().toISOString(),
          severityLevelLiteral: 'CRITICAL',
          moduleIdentifierLiteral: ROUTING_ORCHESTRATOR_MODULE_IDENTIFIER,
          operationCodeLiteral: EDGE_COLLAPSE_OPERATION_CODE,
          correlationIdentifier,
          messageContentLiteral:
            'Colapso crítico en el orquestador de enrutamiento perimetral en el Edge.',
          semanticIntentTag: 'EDGE_ROUTING_PIPELINE_COLLAPSE',
          contextMetadataSnapshot: Object.freeze({
            ...normalizedException.runtimeContextSnapshot,
            httpStatusCodeNumeric: normalizedException.httpStatusCodeNumeric,
          }),
        });

        return new NextResponse('INTERNAL_SERVICE_RELIABILITY_FAULT', {
          status: normalizedException.httpStatusCodeNumeric,
          headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'Cache-Control': 'no-store',
            'X-Floripa-Correlation-ID': correlationIdentifier,
          },
        });
      }
    },
  );
};
