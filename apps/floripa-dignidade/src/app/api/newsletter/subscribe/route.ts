/**
 * @section API Route Handler - Newsletter Subscription Gateway
 * @description Orquestador Edge para el inicio del flujo Double Opt-In de suscripción
 * ciudadana. Resuelve la correlación distribuida desde las cabeceras entrantes, extrae
 * el payload JSON, delega el procesamiento de dominio en `@floripa-dignidade/newsletter`,
 * mide latencia mediante `TraceExecutionTime` y contiene fallos sin filtrar detalles `5xx`.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Edge Runtime).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa) e ISO/IEC 25010 (Confiabilidad y Seguridad).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { type NextRequest, NextResponse } from 'next/server';

/* 1. Infraestructura Core de Telemetría */
import {
  EmitTelemetrySignal,
  type ModuleIdentifier,
  ModuleIdentifierSchema,
  type OperationCode,
  OperationCodeSchema,
  TraceExecutionTime,
} from '@floripa-dignidade/telemetry';

/* 2. Lógica de Dominio */
import { ProcessNewsletterSubscriptionRequest } from '@floripa-dignidade/newsletter';

/* 3. Enjambre Atómico Local (Clean Paths) */
import { BuildSubscriptionSuccessResponse } from './logic/BuildSubscriptionSuccessResponse';
import { ExtractIncomingSubscriptionPayload } from './logic/ExtractIncomingSubscriptionPayload';
import { HandleSubscriptionGatewayError } from './logic/HandleSubscriptionGatewayError';
import { ResolveSubscribeCorrelationIdentifier } from './logic/ResolveSubscribeCorrelationIdentifier';

/** Ejecución Stateless en el Edge Runtime de Vercel para latencia mínima. */
export const runtime = 'edge';

const GATEWAY_MODULE_IDENTIFIER: ModuleIdentifier = ModuleIdentifierSchema.parse(
  'API_NEWSLETTER_SUBSCRIBE_GATEWAY',
);

const GATEWAY_ORCHESTRATION_OPERATION_CODE: OperationCode = OperationCodeSchema.parse(
  'GATEWAY_SUBSCRIBE_OPERATION',
);

const GATEWAY_ACCEPTED_OPERATION_CODE: OperationCode = OperationCodeSchema.parse(
  'NEWSLETTER_SUBSCRIPTION_ACCEPTED',
);

/**
 * Manejador POST: Valida la petición entrante, dispara la verificación de suscripción
 * y retorna `202 Accepted` con trazabilidad distribuida unificada.
 *
 * @param incomingRequestSnapshot - Solicitud HTTP POST entrante desde el formulario ciudadano.
 * @returns {Promise<NextResponse>} Respuesta JSON `202` o error normalizado con `X-Floripa-Correlation-ID`.
 */
export const POST = async (incomingRequestSnapshot: NextRequest): Promise<NextResponse> => {
  const correlationIdentifier = ResolveSubscribeCorrelationIdentifier(
    incomingRequestSnapshot.headers,
  );

  return await TraceExecutionTime(
    GATEWAY_MODULE_IDENTIFIER,
    GATEWAY_ORCHESTRATION_OPERATION_CODE,
    correlationIdentifier,
    async (): Promise<NextResponse> => {
      try {
        const requestPayloadSnapshot =
          await ExtractIncomingSubscriptionPayload(incomingRequestSnapshot);

        const domainTransactionIdentifier =
          await ProcessNewsletterSubscriptionRequest(requestPayloadSnapshot);

        const successResponsePayload = BuildSubscriptionSuccessResponse(correlationIdentifier);

        void EmitTelemetrySignal({
          occurrenceTimestampISO: new Date().toISOString(),
          severityLevelLiteral: 'INFO',
          moduleIdentifierLiteral: GATEWAY_MODULE_IDENTIFIER,
          operationCodeLiteral: GATEWAY_ACCEPTED_OPERATION_CODE,
          correlationIdentifier,
          messageContentLiteral:
            'Solicitud de suscripción al boletín aceptada y enviada al flujo de verificación.',
          semanticIntentTag: 'NEWSLETTER_GATEWAY_ACCEPTED',
          contextMetadataSnapshot: Object.freeze({
            domainTransactionIdentifier,
            httpStatusCodeNumeric: 202,
          }),
        });

        return NextResponse.json(successResponsePayload, {
          status: 202,
          headers: {
            'Cache-Control': 'no-store',
            'X-Floripa-Correlation-ID': correlationIdentifier,
          },
        });
      } catch (caughtExecutionError: unknown) {
        return HandleSubscriptionGatewayError({
          caughtExecutionError,
          gatewayModuleIdentifier: GATEWAY_MODULE_IDENTIFIER,
          correlationIdentifier,
        });
      }
    },
  );
};
