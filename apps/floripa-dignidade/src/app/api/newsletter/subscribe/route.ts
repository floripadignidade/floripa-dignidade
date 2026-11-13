/**
 * @section API Route Handler - Newsletter Subscription Gateway
 * @description Orquestador soberano para la captación de ciudadanos.
 * Actúa como puente entre la UI y los átomos de lógica de dominio.
 *
 * Protocolo OEDP-V17.0 - High Performance Edge & Swarm Orchestration.
 * SANEADO Zenith: Sincronización PascalCase (Fix TS2724) y Atomización SRP.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/* 1. Infraestructura Core (Atmos PascalCase) */
import { GlobalBaseException, MapHttpErrorToException } from '@floripa-dignidade/exceptions';
import {
  EmitTelemetrySignal,
  GenerateCorrelationIdentifier,
  ReportForensicException,
  TraceExecutionTime,
} from '@floripa-dignidade/telemetry';

/* 2. Lógica de Dominio (Modular Lego) */
import { ProcessNewsletterSubscriptionRequest } from '@floripa-dignidade/newsletter';

/* 3. Enjambre Atómico Local (UI/Logic Bridge) */
import { ExtractIncomingSubscriptionPayload } from './logic/ExtractIncomingSubscriptionPayload';
import { BuildSubscriptionSuccessResponse } from './logic/BuildSubscriptionSuccessResponse';

/**
 * @section Gobernanza de Ejecución
 * ADR 0015: Ejecución Stateless en el Edge de Vercel (Latencia < 50ms).
 */
export const runtime = 'edge';

/** Identificador técnico del sensor de frontera. */
const GATEWAY_IDENTIFIER = 'API_NEWSLETTER_SUBSCRIBE_GATEWAY';

/**
 * Manejador POST: Inicio del embudo de suscripción ciudadana.
 */
export const POST = async (incomingRequest: NextRequest): Promise<NextResponse> => {
  const correlationIdentifier = GenerateCorrelationIdentifier();

  return await TraceExecutionTime(
    GATEWAY_IDENTIFIER,
    'GATEWAY_SUBSCRIBE_OPERATION',
    correlationIdentifier,
    async () => {
      try {
        // 1. EXTRACCIÓN DE ADN (Delegación Atómica)
        const requestPayloadSnapshot = await ExtractIncomingSubscriptionPayload(incomingRequest);

        // 2. INVOCACIÓN DE LÓGICA DE NEGOCIO (Domain Orchestrator)
        // Valida esquemas, persiste en Supabase y dispara notificaciones.
        const processResultCorrelationId =
          await ProcessNewsletterSubscriptionRequest(requestPayloadSnapshot);

        // 3. CONSTRUCCIÓN DE SALIDA NOMINAL (Delegación Atómica)
        const successPayload = BuildSubscriptionSuccessResponse(processResultCorrelationId);

        return NextResponse.json(successPayload, {
          status: 202, // Accepted
          headers: { 'X-Floripa-Correlation-ID': correlationIdentifier },
        });
      } catch (caughtExecutionError: unknown) {
        // 4. GESTIÓN FORENSE DE FALLOS (Resilience Layer)

        const normalizedException =
          caughtExecutionError instanceof GlobalBaseException
            ? caughtExecutionError
            : MapHttpErrorToException(500, 'UNEXPECTED_GATEWAY_FAILURE', {
                originalErrorLiteral:
                  caughtExecutionError instanceof Error
                    ? caughtExecutionError.message
                    : String(caughtExecutionError),
              });

        // Reporte automático al Neural Sentinel
        ReportForensicException(normalizedException, correlationIdentifier);

        // Vigilancia de Severidad Crítica
        if (normalizedException.httpStatusCodeNumeric >= 500) {
          void EmitTelemetrySignal({
            severityLevel: 'CRITICAL',
            moduleIdentifier: GATEWAY_IDENTIFIER,
            operationCode: 'GATEWAY_PROCESS_COLAPSE',
            correlationIdentifier,
            message: 'TELEMETRY.SIGNALS.PROCESS_FAULT_DETECTED',
            contextMetadataSnapshot: { ...normalizedException.runtimeContextSnapshot },
          });
        }

        return NextResponse.json(
          {
            isOperationSuccessfulBoolean: false,
            errorIdentifierLiteral: normalizedException.operationalErrorCodeLiteral,
            forensicSnapshot: normalizedException.runtimeContextSnapshot,
          },
          {
            status: normalizedException.httpStatusCodeNumeric,
            headers: { 'X-Floripa-Correlation-ID': correlationIdentifier },
          },
        );
      }
    },
  );
};
