/**
 * @section Routing Logic - Global Request Swarm Orchestrator
 * @description Orquestador superior de frontera encargado de coordinar el enjambre
 * de sensores cognitivos en el Edge Runtime de Vercel. Gestiona el ciclo de vida
 * de la solicitud entrante, inyectando trazabilidad forense, detectando la
 * soberania lingüística y aplicando políticas de seguridad perimetral.
 *
 * Protocolo OEDP-V17.0 - High Performance SRE & Swarm Intelligence.
 * SANEADO Zenith: Sincronización PascalCase (Fix TS2724) e Integridad Forense.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/* 1. Infraestructura Core: Telemetría y Excepciones (Atmos PascalCase) */
import { InternalSystemException, MapHttpErrorToException } from '@floripa-dignidade/exceptions';

import {
  EmitTelemetrySignal,
  GenerateCorrelationIdentifier,
  ReportForensicException,
  TraceExecutionTime,
} from '@floripa-dignidade/telemetry';

/* 2. Enjambre de Soporte y Registro de Sensores (PascalCase Atoms) */
import { InitializeRoutingContext } from './atomic/InitializeRoutingContext';
import { SWARM_SENSORS_PIPELINE } from './constants/RoutingSensorRegistry';

/** Identificador técnico del orquestador para el Neural Sentinel. */
const ROUTING_ORCHESTRATOR_IDENTIFIER = 'ROUTING_EDGE_ORCHESTRATOR';

/**
 * Ejecuta el enjambre de sensores sobre la petición entrante en el Edge de Vercel.
 * Implementa un patrón de ejecución serial con capacidad de interrupción inmediata (Short-circuit).
 *
 * @param requestSnapshot - Objeto de solicitud nativa capturado por el Middleware.
 * @returns {Promise<NextResponse>} Respuesta procesada, redirigida o autorizada para continuar.
 */
export const GlobalRequestOrchestrator = async (
  requestSnapshot: NextRequest,
): Promise<NextResponse> => {
  /**
   * Generamos la "Traza de Sangre Digital" (Correlation ID) que vinculará
   * toda la vida de esta solicitud a través de los microservicios.
   */
  const correlationIdentifier = GenerateCorrelationIdentifier();

  return await TraceExecutionTime(
    ROUTING_ORCHESTRATOR_IDENTIFIER,
    'EXECUTE_EDGE_PIPELINE_TRANSACTION',
    correlationIdentifier,
    async () => {
      try {
        /**
         * FASE 1: INICIALIZACIÓN DE CONTEXTO (Identity & Metadata)
         * Generamos el ADN inicial de la solicitud (IP, User Agent, Locale).
         */
        const routingContext = InitializeRoutingContext(requestSnapshot, correlationIdentifier);

        /**
         * FASE 2: EJECUCIÓN DEL ENJAMBRE (Cognitive Sensor Triage)
         * Recorremos el pipeline de sensores (Anti-bot, Redirección, Auth).
         * Si un sensor decide que la solicitud debe morir o desviarse, retorna un NextResponse.
         */
        for (const executeSensorAction of SWARM_SENSORS_PIPELINE) {
          const sensorResponseSignal = await executeSensorAction(requestSnapshot, routingContext);

          if (sensorResponseSignal) {
            /**
             * @section Inyección de Trazabilidad en Salidas Prematuras
             * Garantizamos que incluso los bloqueos de seguridad o redirecciones
             * lleven el ID de rastreo para auditoría.
             */
            sensorResponseSignal.headers.set('X-Floripa-Correlation-ID', correlationIdentifier);
            return sensorResponseSignal;
          }
        }

        /**
         * FASE 3: CIERRE DE CICLO NOMINAL
         * La solicitud ha superado todas las aduanas de frontera.
         */
        const responseSignal = NextResponse.next();

        // Inyección de Identidad Técnica para el App Router y el Ciudadano.
        responseSignal.headers.set('X-Floripa-Correlation-ID', correlationIdentifier);
        responseSignal.headers.set('X-Floripa-Detected-Locale', routingContext.detectedLocale);

        return responseSignal;
      } catch (caughtExecutionError: unknown) {
        /**
         * @section Gestión de Resiliencia Perimetral (Panic Mode)
         * Si el orquestador falla, capturamos el rastro forense antes de que
         * el Edge Runtime emita un error 500 no controlado.
         */
        const normalizedException =
          caughtExecutionError instanceof InternalSystemException
            ? caughtExecutionError
            : MapHttpErrorToException(500, 'EDGE_ORCHESTRATION_COLLAPSE', {
                originalErrorLiteral:
                  caughtExecutionError instanceof Error
                    ? caughtExecutionError.message
                    : String(caughtExecutionError),
              });

        // Reporte automático al Neural Sentinel via Telemetry Core.
        ReportForensicException(normalizedException, correlationIdentifier);

        /**
         * Emitimos una señal de prioridad máxima. El colapso del ruteo
         * es una amenaza a la disponibilidad del sistema.
         */
        void EmitTelemetrySignal({
          severityLevel: 'CRITICAL',
          moduleIdentifier: ROUTING_ORCHESTRATOR_IDENTIFIER,
          operationCode: 'EDGE_PIPELINE_CRITICAL_FAULT',
          correlationIdentifier,
          message: 'Colapso catastrófico en el orquestador de ruteo perimetral.',
          contextMetadataSnapshot: { ...normalizedException.runtimeContextSnapshot },
        });

        /**
         * Retornamos una respuesta de error estandarizada.
         * Se inyecta el Correlation ID para que el ciudadano pueda reportar el fallo.
         */
        return new NextResponse('INTERNAL_SERVICE_RELIABILITY_FAULT', {
          status: 500,
          headers: { 'X-Floripa-Correlation-ID': correlationIdentifier },
        });
      }
    },
  );
};
