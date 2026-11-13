/**
 * @section API Route Handler - WhatsApp Webhook Gateway
 * @description Receptor soberano de señales de Meta. Orquesta el handshake
 * institucional y el triaje cognitivo de eventos ciudadanos.
 *
 * Protocolo OEDP-V17.0 - Swarm Intelligence & PascalCase Sync.
 * SANEADO Zenith: Inyección de await para aduana de entorno y seguridad criptográfica.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/* 1. Infraestructura Core (Atmos PascalCase) */
import { ValidateEnvironmentAduana } from '@floripa-dignidade/environment-validator';
import { GlobalBaseException, MapHttpErrorToException } from '@floripa-dignidade/exceptions';
import {
  EmitTelemetrySignal,
  GenerateCorrelationIdentifier,
  ReportForensicException,
  TraceExecutionTime,
} from '@floripa-dignidade/telemetry';

/* 2. Lógica de Dominio (WhatsApp communication bunker) */
import {
  ProcessIncomingWhatsAppEvent,
  ValidateMetaSignature,
} from '@floripa-dignidade/whatsapp-communication-service';

/* 3. Enjambre Atómico Local (Internal Logic Swarm) */
import { ValidateWhatsAppHandshake } from './logic/ValidateWhatsAppHandshake';
import { ExtractWebhookSecurityHeaders } from './logic/ExtractWebhookSecurityHeaders';
import { ParseWhatsAppEventPayload } from './logic/ParseWhatsAppEventPayload';

/**
 * @section Gobernanza de Ejecución
 * Se utiliza el runtime de Node.js para soporte nativo de HMAC SHA256.
 */
export const runtime = 'nodejs';

/** Identificador técnico del sensor de frontera. */
const GATEWAY_IDENTIFIER = 'API_WHATSAPP_WEBHOOK_GATEWAY';

/**
 * Manejador GET: Protocolo de Verificación de Meta.
 */
export const GET = async (incomingRequest: NextRequest): Promise<NextResponse> => {
  const correlationIdentifier = GenerateCorrelationIdentifier();
  const { searchParams } = new URL(incomingRequest.url);

  /**
   * 🛡️ SANEADO Zenith (Fix TS2339):
   * Inyección de await para asegurar que los secretos existan antes del handshake.
   */
  const { WHATSAPP_VERIFY_TOKEN: systemVerifyTokenSecret } = await ValidateEnvironmentAduana();

  // 1. EVALUACIÓN DE HANDSHAKE (Delegación Atómica)
  const { isAuthorizedBoolean, challengeLiteral } = ValidateWhatsAppHandshake(
    searchParams,
    systemVerifyTokenSecret,
  );

  if (isAuthorizedBoolean && challengeLiteral) {
    void EmitTelemetrySignal({
      severityLevel: 'INFO',
      moduleIdentifier: GATEWAY_IDENTIFIER,
      operationCode: 'WEBHOOK_HANDSHAKE_SUCCESS',
      correlationIdentifier,
      message: 'Canal de Meta verificado y nominal.',
    });
    return new NextResponse(challengeLiteral, { status: 200 });
  }

  void EmitTelemetrySignal({
    severityLevel: 'WARNING',
    moduleIdentifier: GATEWAY_IDENTIFIER,
    operationCode: 'WEBHOOK_HANDSHAKE_REJECTED',
    correlationIdentifier,
    message: 'Intento de suscripción de Webhook rechazado por token inválido.',
  });

  return new NextResponse('FORBIDDEN_SIGNAL', { status: 403 });
};

/**
 * Manejador POST: Recepción de Eventos de Derechos Humanos.
 */
export const POST = async (incomingRequest: NextRequest): Promise<NextResponse> => {
  const correlationIdentifier = GenerateCorrelationIdentifier();

  return await TraceExecutionTime(
    GATEWAY_IDENTIFIER,
    'WEBHOOK_RECEIVE_ORCHESTRATION',
    correlationIdentifier,
    async () => {
      try {
        // 1. CAPTURA DE I/O FÍSICO
        const rawRequestBodyLiteral = await incomingRequest.text();
        const xHubSignatureHeaderLiteral = ExtractWebhookSecurityHeaders(incomingRequest.headers);

        /**
         * 2. ADUANA CRIPTOGRÁFICA (Security Enforcement)
         * 🛡️ SANEADO Zenith: Inyección de await para evitar bypass por promesa flotante.
         */
        const isIdentityLegitimateBoolean = await ValidateMetaSignature({
          rawRequestBodyLiteral,
          xHubSignatureHeaderLiteral,
        });

        if (!isIdentityLegitimateBoolean) {
          void EmitTelemetrySignal({
            severityLevel: 'CRITICAL',
            moduleIdentifier: GATEWAY_IDENTIFIER,
            operationCode: 'UNAUTHORIZED_WEBHOOK_ATTEMPT',
            correlationIdentifier,
            message: 'Fallo de firma criptográfica detectado en la frontera de WhatsApp.',
          });
          return new NextResponse('UNAUTHORIZED_SIGNAL', { status: 401 });
        }

        // 3. PARSEO Y DELEGACIÓN (Swarm Ingestion)
        const eventPayloadSnapshot = ParseWhatsAppEventPayload(rawRequestBodyLiteral);

        // Invocación del orquestador de dominio (Triaje de mensajes/estados)
        await ProcessIncomingWhatsAppEvent(eventPayloadSnapshot);

        return new NextResponse('EVENT_ACKNOWLEDGED', { status: 200 });
      } catch (caughtError: unknown) {
        // 4. GESTIÓN FORENSE DE FALLOS (Resilience Layer)

        const normalizedException =
          caughtError instanceof GlobalBaseException
            ? caughtError
            : MapHttpErrorToException(500, 'UNEXPECTED_WEBHOOK_ORCHESTRATION_FAULT', {
                originalErrorLiteral:
                  caughtError instanceof Error ? caughtError.message : String(caughtError),
              });

        // Reporte automático al Neural Sentinel
        ReportForensicException(normalizedException, correlationIdentifier);

        return new NextResponse('INTERNAL_SERVICE_ERROR', { status: 500 });
      }
    },
  );
};
