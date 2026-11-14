/**
 * @section API Route Handler - WhatsApp Webhook Gateway
 * @description Puerta de enlace perimetral para la integración con Meta WhatsApp Business.
 * Orquesta exclusivamente el trazado SRE (`TraceExecutionTime`) y la delegación hacia los
 * átomos de verificación (`GET`), recepción autenticada (`POST`) y contención de errores.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Node.js Runtime).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa), ISO/IEC 25010 e ISO/IEC 27001.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import type { NextRequest, NextResponse } from 'next/server';

/* 1. Infraestructura Core de Telemetría */
import {
  GenerateCorrelationIdentifier,
  type ModuleIdentifier,
  type OperationCode,
  TraceExecutionTime,
} from '@floripa-dignidade/telemetry';

/* 2. Enjambre Atómico Local (Clean Paths) */
import { ExecuteWhatsAppVerificationRequest } from './logic/ExecuteWhatsAppVerificationRequest';
import { HandleWhatsAppWebhookError } from './logic/HandleWhatsAppWebhookError';
import { ProcessWhatsAppWebhookPostRequest } from './logic/ProcessWhatsAppWebhookPostRequest';

/** Runtime Node.js requerido para comparación HMAC-SHA256 en tiempo constante (`node:crypto`). */
export const runtime = 'nodejs';

const GATEWAY_MODULE_IDENTIFIER = 'API_WHATSAPP_WEBHOOK_GATEWAY' as ModuleIdentifier;

/**
 * Manejador GET: Verificación inicial de suscripción del Webhook con Meta Developers.
 *
 * @param incomingRequest - Solicitud HTTP GET entrante con parámetros `hub.*`.
 * @returns {Promise<NextResponse>} Desafío `200`, rechazo `403` o error normalizado.
 */
export const GET = async (incomingRequest: NextRequest): Promise<NextResponse> => {
  const correlationIdentifier = GenerateCorrelationIdentifier();
  const { searchParams } = new URL(incomingRequest.url);

  return await TraceExecutionTime(
    GATEWAY_MODULE_IDENTIFIER,
    'WEBHOOK_VERIFICATION_ORCHESTRATION' as OperationCode,
    correlationIdentifier,
    async (): Promise<NextResponse> => {
      try {
        return await ExecuteWhatsAppVerificationRequest({
          searchParameters: searchParams,
          gatewayModuleIdentifier: GATEWAY_MODULE_IDENTIFIER,
          correlationIdentifier,
        });
      } catch (caughtExecutionError: unknown) {
        return HandleWhatsAppWebhookError({
          caughtExecutionError,
          gatewayModuleIdentifier: GATEWAY_MODULE_IDENTIFIER,
          correlationIdentifier,
        });
      }
    },
  );
};

/**
 * Manejador POST: Recepción autenticada de eventos ciudadanos desde Meta WhatsApp.
 *
 * @param incomingRequest - Solicitud HTTP POST firmada con `X-Hub-Signature-256`.
 * @returns {Promise<NextResponse>} Confirmación `200`, rechazo `400`/`401` o error normalizado.
 */
export const POST = async (incomingRequest: NextRequest): Promise<NextResponse> => {
  const correlationIdentifier = GenerateCorrelationIdentifier();

  return await TraceExecutionTime(
    GATEWAY_MODULE_IDENTIFIER,
    'WEBHOOK_RECEIVE_ORCHESTRATION' as OperationCode,
    correlationIdentifier,
    async (): Promise<NextResponse> => {
      try {
        return await ProcessWhatsAppWebhookPostRequest({
          incomingRequest,
          gatewayModuleIdentifier: GATEWAY_MODULE_IDENTIFIER,
          correlationIdentifier,
        });
      } catch (caughtExecutionError: unknown) {
        return HandleWhatsAppWebhookError({
          caughtExecutionError,
          gatewayModuleIdentifier: GATEWAY_MODULE_IDENTIFIER,
          correlationIdentifier,
        });
      }
    },
  );
};
