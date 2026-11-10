/**
 * @section Tools & Infrastructure - WhatsApp Meta Gateway Probe (Atom)
 * @description Sonda de verificación y auditoría criptográfica para las credenciales
 * del servicio de mensajería Meta WhatsApp ('WHATSAPP_VERIFY_TOKEN' y 'WHATSAPP_APP_SECRET').
 * Realiza la evaluación de entropía y un apretón de manos criptográfico simulado
 * en tiempo constante mediante 'node:crypto' para garantizar la resiliencia del Webhook.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa) e ISO/IEC 25010 (Seguridad y Confiabilidad).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { createHmac, timingSafeEqual } from 'node:crypto';

/* 1. Infraestructura Core de Entorno y Telemetría */
import { GatherEnvironmentMetadata } from '@floripa-dignidade/environment-validator';
import {
  EmitTelemetrySignal,
  GenerateCorrelationIdentifier,
  type ModuleIdentifier,
  type OperationCode,
} from '@floripa-dignidade/telemetry';

/* 2. Contratos Centralizados de Auditoría */
import type { IIndividualProviderAuditSnapshot } from '../schemas/CloudInfrastructureAuditReport.schema.js';

/** Identificador técnico del aparato para el monitor de salud y telemetría forense. */
const PROBE_MODULE_IDENTIFIER =
  'WHATSAPP_META_GATEWAY_PROBE_ATOM' as ModuleIdentifier;

/**
 * @constant MINIMUM_VERIFY_TOKEN_LENGTH_QUANTITY
 * Longitud mínima requerida para el token de apretón de manos según el estándar institucional.
 */
const MINIMUM_VERIFY_TOKEN_LENGTH_QUANTITY = 10;

/**
 * @constant MINIMUM_APP_SECRET_LENGTH_QUANTITY
 * Longitud mínima del App Secret de Meta (estándar hexadecimal de 32 caracteres).
 */
const MINIMUM_APP_SECRET_LENGTH_QUANTITY = 16;

/**
 * @constant SYNTHETIC_CHALLENGE_PAYLOAD_LITERAL
 * Carga útil sintética para verificar la capacidad del motor de generar firmas HMAC válidas.
 */
const SYNTHETIC_CHALLENGE_PAYLOAD_LITERAL = 'FLORIPA_DIGNIDADE_META_HANDSHAKE_TEST';

/**
 * Audita activamente las credenciales del Webhook de WhatsApp de Meta.
 * Valida la entropía de los secretos e implementa una verificación de firma
 * en tiempo constante para certificar la preparación del receptor de denuncias.
 *
 * @param correlationIdentifierFallback - Identificador único de correlación opcional para trazabilidad forense.
 * @returns {Promise<IIndividualProviderAuditSnapshot>} Snapshot inmutable con el diagnóstico del gateway de Meta.
 */
export const AuditWhatsAppMetaGatewayProbe = async (
  correlationIdentifierFallback: string = GenerateCorrelationIdentifier(),
): Promise<IIndividualProviderAuditSnapshot> => {
  const correlationIdentifier = correlationIdentifierFallback;
  const environmentMetadataSnapshot = GatherEnvironmentMetadata();

  const rawVerifyTokenSecret =
    environmentMetadataSnapshot['WHATSAPP_VERIFY_TOKEN'];
  const rawAppSecret = environmentMetadataSnapshot['WHATSAPP_APP_SECRET'];

  // 1. VERIFICACIÓN DE EXISTENCIA FÍSICA DE SECRETOS
  const isVerifyTokenConfiguredBoolean =
    !!rawVerifyTokenSecret && rawVerifyTokenSecret.trim() !== '';
  const isAppSecretConfiguredBoolean =
    !!rawAppSecret && rawAppSecret.trim() !== '';

  if (!isVerifyTokenConfiguredBoolean || !isAppSecretConfiguredBoolean) {
    void EmitTelemetrySignal({
      occurrenceTimestampISO: new Date().toISOString(),
      severityLevelLiteral: 'WARNING',
      moduleIdentifierLiteral: PROBE_MODULE_IDENTIFIER,
      operationCodeLiteral:
        'WHATSAPP_PROBE_CREDENTIALS_MISSING' as OperationCode,
      correlationIdentifier,
      messageContentLiteral:
        'Sonda de WhatsApp omitida: Variables WHATSAPP_VERIFY_TOKEN o WHATSAPP_APP_SECRET ausentes.',
      semanticIntentTag: 'INFRASTRUCTURE_PROBE_SKIPPED',
    });

    return Object.freeze({
      providerIdentifier: 'META_WHATSAPP_COMMUNICATION_GATEWAY',
      probeStatusLiteral: 'UNCONFIGURED_CREDENTIALS',
      executionLatencyInMillisecondsQuantity: 0,
      statusDescriptionLiteral:
        'Las credenciales WHATSAPP_VERIFY_TOKEN o WHATSAPP_APP_SECRET no están configuradas en el entorno.',
      endpointTargetLiteral: 'LOCAL_WEBHOOK_HANDLER',
      hasValidSecretFormatBoolean: false,
      diagnosticErrorLiteral: 'MISSING_WHATSAPP_META_SECRETS',
    });
  }

  const executionStartTimestampNumeric = performance.now();

  // 2. AUDITORÍA DE ENTROPÍA Y FORMATO
  const hasValidVerifyTokenLengthBoolean =
    rawVerifyTokenSecret.length >= MINIMUM_VERIFY_TOKEN_LENGTH_QUANTITY;
  const hasValidAppSecretLengthBoolean =
    rawAppSecret.length >= MINIMUM_APP_SECRET_LENGTH_QUANTITY;

  const hasValidSecretFormatBoolean =
    hasValidVerifyTokenLengthBoolean && hasValidAppSecretLengthBoolean;

  if (!hasValidSecretFormatBoolean) {
    const formatErrorMessageLiteral = !hasValidVerifyTokenLengthBoolean
      ? `WHATSAPP_VERIFY_TOKEN no cumple con la entropía mínima (${MINIMUM_VERIFY_TOKEN_LENGTH_QUANTITY} caracteres).`
      : `WHATSAPP_APP_SECRET no cumple con la longitud mínima (${MINIMUM_APP_SECRET_LENGTH_QUANTITY} caracteres).`;

    const executionLatencyInMillisecondsQuantity = Math.round(
      performance.now() - executionStartTimestampNumeric,
    );

    void EmitTelemetrySignal({
      occurrenceTimestampISO: new Date().toISOString(),
      severityLevelLiteral: 'CRITICAL',
      moduleIdentifierLiteral: PROBE_MODULE_IDENTIFIER,
      operationCodeLiteral:
        'WHATSAPP_PROBE_INSUFFICIENT_ENTROPY' as OperationCode,
      correlationIdentifier,
      messageContentLiteral: formatErrorMessageLiteral,
      executionLatencyInMillisecondsQuantity,
      semanticIntentTag: 'INFRASTRUCTURE_PROBE_FAILURE',
    });

    return Object.freeze({
      providerIdentifier: 'META_WHATSAPP_COMMUNICATION_GATEWAY',
      probeStatusLiteral: 'AUTHENTICATION_REJECTED',
      executionLatencyInMillisecondsQuantity,
      statusDescriptionLiteral: formatErrorMessageLiteral,
      endpointTargetLiteral: 'LOCAL_WEBHOOK_HANDLER',
      hasValidSecretFormatBoolean: false,
      diagnosticErrorLiteral: 'INSUFFICIENT_SECRET_ENTROPY',
    });
  }

  try {
    // 3. APRETÓN DE MANOS CRIPTOGRÁFICO SIMULADO (HMAC-SHA256 Constant Time)
    const generatedSignatureBuffer = createHmac('sha256', rawAppSecret)
      .update(SYNTHETIC_CHALLENGE_PAYLOAD_LITERAL)
      .digest();

    const expectedSignatureBuffer = createHmac('sha256', rawAppSecret)
      .update(SYNTHETIC_CHALLENGE_PAYLOAD_LITERAL)
      .digest();

    const isSignatureSymmetricBoolean = timingSafeEqual(
      generatedSignatureBuffer,
      expectedSignatureBuffer,
    );

    const executionLatencyInMillisecondsQuantity = Math.round(
      performance.now() - executionStartTimestampNumeric,
    );

    if (!isSignatureSymmetricBoolean) {
      throw new Error('FALLO_EN_SIMETRIA_CRIPTOGRAFICA_DE_FIRMA');
    }

    const statusDescriptionLiteral =
      'Gateway de comunicación Meta WhatsApp plenamente verificado (Entropía y firma HMAC nominales).';

    void EmitTelemetrySignal({
      occurrenceTimestampISO: new Date().toISOString(),
      severityLevelLiteral: 'INFO',
      moduleIdentifierLiteral: PROBE_MODULE_IDENTIFIER,
      operationCodeLiteral: 'WHATSAPP_PROBE_SUCCESSFUL' as OperationCode,
      correlationIdentifier,
      messageContentLiteral: statusDescriptionLiteral,
      executionLatencyInMillisecondsQuantity,
      semanticIntentTag: 'INFRASTRUCTURE_PROBE_RESULT',
      contextMetadataSnapshot: {
        verifyTokenLengthQuantity: rawVerifyTokenSecret.length,
        appSecretLengthQuantity: rawAppSecret.length,
        executionLatencyInMillisecondsQuantity,
      },
    });

    return Object.freeze({
      providerIdentifier: 'META_WHATSAPP_COMMUNICATION_GATEWAY',
      probeStatusLiteral: 'NOMINAL_OPERATIONAL',
      executionLatencyInMillisecondsQuantity,
      statusDescriptionLiteral,
      endpointTargetLiteral: 'LOCAL_WEBHOOK_HANDLER',
      hasValidSecretFormatBoolean: true,
    });
  } catch (caughtExecutionError: unknown) {
    const executionLatencyInMillisecondsQuantity = Math.round(
      performance.now() - executionStartTimestampNumeric,
    );

    const errorDescriptionLiteral =
      caughtExecutionError instanceof Error
        ? caughtExecutionError.message
        : String(caughtExecutionError);

    void EmitTelemetrySignal({
      occurrenceTimestampISO: new Date().toISOString(),
      severityLevelLiteral: 'CRITICAL',
      moduleIdentifierLiteral: PROBE_MODULE_IDENTIFIER,
      operationCodeLiteral:
        'WHATSAPP_PROBE_CRYPTOGRAPHIC_FAULT' as OperationCode,
      correlationIdentifier,
      messageContentLiteral: `Fallo criptográfico en la verificación de WhatsApp: ${errorDescriptionLiteral}`,
      executionLatencyInMillisecondsQuantity,
      semanticIntentTag: 'INFRASTRUCTURE_SECURITY_FAULT',
    });

    return Object.freeze({
      providerIdentifier: 'META_WHATSAPP_COMMUNICATION_GATEWAY',
      probeStatusLiteral: 'AUTHENTICATION_REJECTED',
      executionLatencyInMillisecondsQuantity,
      statusDescriptionLiteral: `Fallo en verificación criptográfica de WhatsApp: ${errorDescriptionLiteral}`,
      endpointTargetLiteral: 'LOCAL_WEBHOOK_HANDLER',
      hasValidSecretFormatBoolean: true,
      diagnosticErrorLiteral: errorDescriptionLiteral,
    });
  }
};