/**
 * @section Tools & Infrastructure - WhatsApp Meta Gateway Probe (Orchestrator)
 * @description Sonda de verificación y auditoría criptográfica para las credenciales
 * del servicio de mensajería Meta WhatsApp ('WHATSAPP_VERIFY_TOKEN' y 'WHATSAPP_APP_SECRET').
 * Delega la evaluación de entropía y verificación HMAC en tiempo constante
 * en un átomo especializado bajo la doctrina Source-First (OEDP-V18.1).
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Clean Paths).
 * Normas: ISO/IEC 11179 (Nomenclatura Técnica) e ISO/IEC 25010 (Seguridad y Confiabilidad).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { z } from 'zod';

/* 1. Infraestructura Core de Entorno y Telemetría */
import { GatherEnvironmentMetadata } from '@floripa-dignidade/environment-validator';
import {
  EmitTelemetrySignal,
  GenerateCorrelationIdentifier,
  type ModuleIdentifier,
  type OperationCode,
} from '@floripa-dignidade/telemetry';

/* 2. Contratos Centralizados de Auditoría (Clean Paths - Extensionless) */
import type { IIndividualProviderAuditSnapshot } from '../schemas/CloudInfrastructureAuditReport.schema';

/* 3. Átomo Local de Verificación Criptográfica (Clean Paths - Extensionless) */
import { ExecuteWhatsAppCryptographicHandshake } from './atoms/ExecuteWhatsAppCryptographicHandshake';

const PROBE_MODULE_IDENTIFIER = 'WHATSAPP_META_GATEWAY_PROBE_ATOM' as ModuleIdentifier;

const WhatsAppGatewayCredentialsSchema = z
  .object({
    verifyTokenSecret: z.string().trim().min(1),
    appSecret: z.string().trim().min(1),
  })
  .readonly();

/**
 * Audita activamente las credenciales del Webhook de WhatsApp de Meta.
 *
 * @param correlationIdentifierFallback - Identificador único de correlación opcional para trazabilidad forense.
 * @returns {Promise<IIndividualProviderAuditSnapshot>} Snapshot inmutable con el diagnóstico del gateway de Meta.
 */
export const AuditWhatsAppMetaGatewayProbe = async (
  correlationIdentifierFallback: string = GenerateCorrelationIdentifier(),
): Promise<IIndividualProviderAuditSnapshot> => {
  const correlationIdentifier = correlationIdentifierFallback;
  const environmentMetadataSnapshot = GatherEnvironmentMetadata();

  // 1. VERIFICACIÓN PRE-VUELO DE CONFIGURACIÓN (Contrato Zod)
  const credentialsValidationResult = WhatsAppGatewayCredentialsSchema.safeParse({
    verifyTokenSecret: environmentMetadataSnapshot['WHATSAPP_VERIFY_TOKEN'],
    appSecret: environmentMetadataSnapshot['WHATSAPP_APP_SECRET'],
  });

  if (!credentialsValidationResult.success) {
    void EmitTelemetrySignal({
      occurrenceTimestampISO: new Date().toISOString(),
      severityLevelLiteral: 'WARNING',
      moduleIdentifierLiteral: PROBE_MODULE_IDENTIFIER,
      operationCodeLiteral: 'WHATSAPP_PROBE_CREDENTIALS_MISSING' as OperationCode,
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

  const { verifyTokenSecret, appSecret } = credentialsValidationResult.data;
  const executionStartTimestampNumeric = performance.now();

  // 2. VERIFICACIÓN CRIPTOGRÁFICA Y DE ENTROPÍA EN TIEMPO CONSTANTE (Delegación Atómica)
  const verificationResultSnapshot = ExecuteWhatsAppCryptographicHandshake(
    verifyTokenSecret,
    appSecret,
  );

  const executionLatencyInMillisecondsQuantity = Math.round(
    performance.now() - executionStartTimestampNumeric,
  );

  // 3. EVALUACIÓN Y REPORTE DE TELEMETRÍA FORENSE
  if (!verificationResultSnapshot.isValidBoolean) {
    void EmitTelemetrySignal({
      occurrenceTimestampISO: new Date().toISOString(),
      severityLevelLiteral: 'CRITICAL',
      moduleIdentifierLiteral: PROBE_MODULE_IDENTIFIER,
      operationCodeLiteral: 'WHATSAPP_PROBE_VERIFICATION_REJECTED' as OperationCode,
      correlationIdentifier,
      messageContentLiteral: verificationResultSnapshot.statusDescriptionLiteral,
      executionLatencyInMillisecondsQuantity,
      semanticIntentTag: 'INFRASTRUCTURE_PROBE_FAILURE',
    });

    return Object.freeze({
      providerIdentifier: 'META_WHATSAPP_COMMUNICATION_GATEWAY',
      probeStatusLiteral: 'AUTHENTICATION_REJECTED',
      executionLatencyInMillisecondsQuantity,
      statusDescriptionLiteral: verificationResultSnapshot.statusDescriptionLiteral,
      endpointTargetLiteral: 'LOCAL_WEBHOOK_HANDLER',
      hasValidSecretFormatBoolean: verificationResultSnapshot.hasValidSecretFormatBoolean,
      ...(verificationResultSnapshot.diagnosticErrorLiteral !== undefined && {
        diagnosticErrorLiteral: verificationResultSnapshot.diagnosticErrorLiteral,
      }),
    });
  }

  void EmitTelemetrySignal({
    occurrenceTimestampISO: new Date().toISOString(),
    severityLevelLiteral: 'INFO',
    moduleIdentifierLiteral: PROBE_MODULE_IDENTIFIER,
    operationCodeLiteral: 'WHATSAPP_PROBE_SUCCESSFUL' as OperationCode,
    correlationIdentifier,
    messageContentLiteral: verificationResultSnapshot.statusDescriptionLiteral,
    executionLatencyInMillisecondsQuantity,
    semanticIntentTag: 'INFRASTRUCTURE_PROBE_RESULT',
    contextMetadataSnapshot: {
      verifyTokenLengthQuantity: verifyTokenSecret.length,
      appSecretLengthQuantity: appSecret.length,
      executionLatencyInMillisecondsQuantity,
    },
  });

  return Object.freeze({
    providerIdentifier: 'META_WHATSAPP_COMMUNICATION_GATEWAY',
    probeStatusLiteral: 'NOMINAL_OPERATIONAL',
    executionLatencyInMillisecondsQuantity,
    statusDescriptionLiteral: verificationResultSnapshot.statusDescriptionLiteral,
    endpointTargetLiteral: 'LOCAL_WEBHOOK_HANDLER',
    hasValidSecretFormatBoolean: true,
  });
};
