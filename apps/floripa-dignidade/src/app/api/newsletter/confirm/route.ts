/**
 * @section API Route Handler - Newsletter Confirmation Gateway
 * @description Orquestador Edge para la confirmación Double Opt-In y transición de
 * suscripciones ciudadanas de estado pendiente a activo. Extrae el token, ejecuta la
 * activación en la nube mediante `@floripa-dignidade/newsletter`, resuelve la ruta de
 * destino localizada y emite señales SRE conformes a `TelemetrySignalSchema`.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Edge Runtime).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa) e ISO/IEC 25010 (Confiabilidad y Rendimiento).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { type NextRequest, NextResponse } from 'next/server';

/* 1. Infraestructura Core de Telemetría */
import {
  EmitTelemetrySignal,
  GenerateCorrelationIdentifier,
  type ModuleIdentifier,
  type OperationCode,
  TraceExecutionTime,
} from '@floripa-dignidade/telemetry';

/* 2. Lógica de Dominio */
import { ActivateCloudSubscription } from '@floripa-dignidade/newsletter';

/* 3. Enjambre Atómico Local (Clean Paths) */
import { CalculateConfirmationRedirect } from './logic/CalculateConfirmationRedirect';
import { ExtractConfirmationToken } from './logic/ExtractConfirmationToken';
import { HandleConfirmationGatewayError } from './logic/HandleConfirmationGatewayError';
import { ResolveConfirmationLocale } from './logic/ResolveConfirmationLocale';

/** Ejecución Stateless en el Edge Runtime de Vercel para latencia mínima. */
export const runtime = 'edge';

const GATEWAY_MODULE_IDENTIFIER = 'API_NEWSLETTER_CONFIRM_GATEWAY' as ModuleIdentifier;

/**
 * Manejador GET: Valida el token de confirmación, activa la suscripción y redirige al ciudadano.
 *
 * @param incomingRequest - Solicitud HTTP GET entrante desde el enlace de verificación.
 * @returns {Promise<NextResponse>} Redirección localizada con cabecera de correlación forense.
 */
export const GET = async (incomingRequest: NextRequest): Promise<NextResponse> => {
  const correlationIdentifier = GenerateCorrelationIdentifier();
  const { searchParams } = new URL(incomingRequest.url);
  const resolvedLocaleIdentifier = ResolveConfirmationLocale(searchParams, incomingRequest.headers);

  return await TraceExecutionTime(
    GATEWAY_MODULE_IDENTIFIER,
    'GATEWAY_CONFIRMATION_ORCHESTRATION' as OperationCode,
    correlationIdentifier,
    async (): Promise<NextResponse> => {
      try {
        const verificationTokenLiteral = ExtractConfirmationToken(searchParams);
        const activationResult = await ActivateCloudSubscription(verificationTokenLiteral);

        const targetRedirectUrl = CalculateConfirmationRedirect(
          activationResult,
          resolvedLocaleIdentifier,
          incomingRequest.url,
        );

        const isActivationSuccessfulBoolean = activationResult.isActivationSuccessfulBoolean;

        void EmitTelemetrySignal({
          occurrenceTimestampISO: new Date().toISOString(),
          severityLevelLiteral: isActivationSuccessfulBoolean ? 'INFO' : 'WARNING',
          moduleIdentifierLiteral: GATEWAY_MODULE_IDENTIFIER,
          operationCodeLiteral: (isActivationSuccessfulBoolean
            ? 'ACTIVATION_SUCCESS'
            : 'ACTIVATION_FAILED') as OperationCode,
          correlationIdentifier,
          messageContentLiteral: `Resultado de activación procesado para [${resolvedLocaleIdentifier}].`,
          semanticIntentTag: isActivationSuccessfulBoolean
            ? 'NEWSLETTER_ACTIVATION_CONFIRMED'
            : 'NEWSLETTER_ACTIVATION_REJECTED',
          contextMetadataSnapshot: Object.freeze({
            resolvedLocaleIdentifier,
            isActivationSuccessfulBoolean,
          }),
        });

        const redirectResponse = NextResponse.redirect(targetRedirectUrl);
        redirectResponse.headers.set('X-Floripa-Correlation-ID', correlationIdentifier);

        return redirectResponse;
      } catch (caughtExecutionError: unknown) {
        return HandleConfirmationGatewayError({
          caughtExecutionError,
          resolvedLocaleIdentifier,
          requestUrlLiteral: incomingRequest.url,
          gatewayModuleIdentifier: GATEWAY_MODULE_IDENTIFIER,
          correlationIdentifier,
        });
      }
    },
  );
};
