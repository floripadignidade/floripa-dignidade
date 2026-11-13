/**
 * @section API Route Handler - Newsletter Confirmation Gateway
 * @description Orquestador soberano para la transición de ciudadanos de estado
 * PENDING a ACTIVE. Implementa el patrón Swarm Orchestration.
 *
 * Protocolo OEDP-V17.0 - High Performance Edge & PascalCase Sync.
 * SANEADO Zenith: Sincronización de Identidad (Fix TS2724) y Atomización SRP.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/* 1. Infraestructura Core (Atmos PascalCase) */
import { MapHttpErrorToException, ValidationException } from '@floripa-dignidade/exceptions';
import { DetermineDeviceLocale } from '@floripa-dignidade/routing';
import {
  EmitTelemetrySignal,
  GenerateCorrelationIdentifier,
  ReportForensicException,
  TraceExecutionTime,
} from '@floripa-dignidade/telemetry';

/* 2. Lógica de Dominio (Modular Lego) */
import { ActivateCloudSubscription } from '@floripa-dignidade/newsletter';

/* 3. Enjambre Atómico Local (UI/Logic Bridge) */
import { ExtractConfirmationToken } from './logic/ExtractConfirmationToken';
import { CalculateConfirmationRedirect } from './logic/CalculateConfirmationRedirect';

/**
 * @section Gobernanza de Ejecución
 * ADR 0015: Ejecución Stateless en el Edge de Vercel (Latencia < 50ms).
 */
export const runtime = 'edge';

/** Identificador técnico del sensor de frontera. */
const GATEWAY_IDENTIFIER = 'API_NEWSLETTER_CONFIRM_GATEWAY';

/**
 * Manejador GET: Consolidación de Identidad Ciudadana.
 */
export const GET = async (incomingRequest: NextRequest): Promise<NextResponse> => {
  const correlationIdentifier = GenerateCorrelationIdentifier();

  // 1. INFERENCIA SENSORIAL (UX Detection)
  const acceptLanguageHeaderLiteral = incomingRequest.headers.get('accept-language');
  const detectedLocaleIdentifier = DetermineDeviceLocale(acceptLanguageHeaderLiteral);

  return await TraceExecutionTime(
    GATEWAY_IDENTIFIER,
    'GATEWAY_CONFIRMATION_ORCHESTRATION',
    correlationIdentifier,
    async () => {
      try {
        // 2. EXTRACCIÓN DE ADN (Delegación Atómica)
        const { searchParams } = new URL(incomingRequest.url);
        const verificationTokenLiteral = ExtractConfirmationToken(searchParams);

        // 3. ACTIVACIÓN SOBERANA (Cloud Domain)
        const activationResult = await ActivateCloudSubscription(verificationTokenLiteral);

        // 4. CÁLCULO DE NAVEGACIÓN (Delegación Atómica)
        const targetUrl = CalculateConfirmationRedirect(
          activationResult,
          detectedLocaleIdentifier,
          incomingRequest.url,
        );

        // 5. REPORTE SRE (Visibility)
        void EmitTelemetrySignal({
          severityLevel: activationResult.isActivationSuccessfulBoolean ? 'INFO' : 'WARNING',
          moduleIdentifier: GATEWAY_IDENTIFIER,
          operationCode: activationResult.isActivationSuccessfulBoolean
            ? 'ACTIVATION_SUCCESS'
            : 'ACTIVATION_FAILED',
          correlationIdentifier,
          message: `Resultado de activación procesado para [${detectedLocaleIdentifier}].`,
        });

        return NextResponse.redirect(targetUrl);
      } catch (caughtError: unknown) {
        // 6. GESTIÓN FORENSE DE FALLO (Resilience Layer)

        const normalizedException =
          caughtError instanceof ValidationException
            ? caughtError
            : MapHttpErrorToException(500, 'UNEXPECTED_CONFIRMATION_FAULT', {
                originalErrorLiteral:
                  caughtError instanceof Error ? caughtError.message : String(caughtError),
              });

        // Alerta automática al Neural Sentinel
        ReportForensicException(normalizedException, correlationIdentifier);

        // Redirección de seguridad a página de fallo localizada
        const targetErrorUrl = new URL(
          `/${detectedLocaleIdentifier}/error?code=CONFIRMATION_FAULT&trace=${correlationIdentifier}`,
          incomingRequest.url,
        );

        return NextResponse.redirect(targetErrorUrl);
      }
    },
  );
};
