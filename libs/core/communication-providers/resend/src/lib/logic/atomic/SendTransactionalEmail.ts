/**
 * @section Resend Provider - Atomic Email Transmission (Atom)
 * @description Ejecuta el despacho físico de correos electrónicos transaccionales
 * utilizando el SDK oficial de Resend. Valida las credenciales y el payload con Zod,
 * preserva la privacidad ciudadana bajo la LGPD ofuscando la dirección destino en telemetría
 * y garantiza la trazabilidad forense mediante `TelemetrySignalSchema`.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Clean Paths).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa), ISO/IEC 25010 (Confiabilidad) y LGPD (Lei 13.709/2018).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { Resend } from 'resend';

/* 1. Infraestructura Core de Excepciones y Telemetría */
import { InternalSystemException, ValidationException } from '@floripa-dignidade/exceptions';
import {
  type CorrelationIdentifier,
  EmitTelemetrySignal,
  GenerateCorrelationIdentifier,
  type ModuleIdentifier,
  ModuleIdentifierSchema,
  type OperationCode,
  TraceExecutionTime,
} from '@floripa-dignidade/telemetry';

/* 2. Contratos Centralizados de Resend */
import {
  type IResendConfiguration,
  type ITransactionalEmailPayload,
  ResendConfigurationSchema,
  TransactionalEmailPayloadSchema,
} from '../../schemas/ResendEmail.schema';

const RESEND_PROVIDER_MODULE_IDENTIFIER = ModuleIdentifierSchema.parse(
  'RESEND_COMMUNICATION_PROVIDER',
) as ModuleIdentifier;

/**
 * Ofusca una dirección de correo electrónico para auditoría sin exponer PII (LGPD).
 *
 * @param emailAddressLiteral - Correo electrónico de destino original.
 * @returns {string} Dirección ofuscada segura para telemetría (ej: j***o@dominio.com).
 */
const maskEmailAddressLiteral = (emailAddressLiteral: string): string => {
  const emailSegmentsCollection = emailAddressLiteral.split('@');
  if (emailSegmentsCollection.length !== 2) {
    return '***@***.***';
  }

  const localPartLiteral = emailSegmentsCollection[0] ?? '';
  const domainPartLiteral = emailSegmentsCollection[1] ?? '';

  if (localPartLiteral.length <= 2) {
    return `***@${domainPartLiteral}`;
  }

  const firstCharacterLiteral = localPartLiteral.charAt(0);
  const lastCharacterLiteral = localPartLiteral.charAt(localPartLiteral.length - 1);

  return `${firstCharacterLiteral}***${lastCharacterLiteral}@${domainPartLiteral}`;
};

/**
 * Ejecuta el envío de un correo transaccional enlazando la traza digital institucional.
 *
 * @param providerConfigurationSnapshot - Configuración técnica del proveedor con clave de API y remitente.
 * @param unvalidatedEmailPayloadSnapshot - Datos crudos del correo (destinatario, asunto, contenido HTML).
 * @param correlationIdentifierFallback - Identificador de correlación opcional para trazabilidad forense.
 * @returns {Promise<string>} Identificador único de mensaje generado por Resend o señal de éxito.
 * @throws {ValidationException} Si la configuración o el payload no cumplen los esquemas Zod.
 * @throws {InternalSystemException} Si el servicio externo Resend rechaza la transmisión.
 */
export const SendTransactionalEmail = async (
  providerConfigurationSnapshot: IResendConfiguration,
  unvalidatedEmailPayloadSnapshot: unknown,
  correlationIdentifierFallback: CorrelationIdentifier = GenerateCorrelationIdentifier(),
): Promise<string> => {
  const correlationIdentifier = correlationIdentifierFallback;
  const validatedConfiguration = ResendConfigurationSchema.parse(providerConfigurationSnapshot);

  return await TraceExecutionTime(
    RESEND_PROVIDER_MODULE_IDENTIFIER,
    'EMAIL_TRANSMISSION_OPERATION' as OperationCode,
    correlationIdentifier,
    async (): Promise<string> => {
      // 1. ADUANA DE ADN DEL CORREO (Validación Zod)
      const payloadValidationResult = TransactionalEmailPayloadSchema.safeParse(
        unvalidatedEmailPayloadSnapshot,
      );

      if (!payloadValidationResult.success) {
        throw new ValidationException('CONTRATO_CARGA_UTIL_CORREO_INVALIDO', {
          validationIssuesCollection: payloadValidationResult.error.flatten(),
          correlationIdentifier,
        });
      }

      const validatedPayload: ITransactionalEmailPayload = payloadValidationResult.data;
      const maskedRecipientLiteral = maskEmailAddressLiteral(
        validatedPayload.targetRecipientAddressLiteral,
      );
      const resendClientInstance = new Resend(validatedConfiguration.securityApiKeySecret);

      try {
        // 2. TRANSMISIÓN FÍSICA HACIA RESEND API
        const { data: transmissionDataSnapshot, error: transmissionErrorSignalSnapshot } =
          await resendClientInstance.emails.send({
            from: validatedConfiguration.defaultFromAddressLiteral,
            to: validatedPayload.targetRecipientAddressLiteral,
            subject: validatedPayload.emailSubjectLiteral,
            html: validatedPayload.emailHtmlContentLiteral,
            tags: [
              { name: 'correlation_identifier', value: correlationIdentifier },
              { name: 'tracking_category', value: validatedPayload.trackingCategoryIdentifier },
            ],
          });

        if (transmissionErrorSignalSnapshot) {
          throw new Error(transmissionErrorSignalSnapshot.message);
        }

        const generatedMessageIdentifier = transmissionDataSnapshot?.id || 'SUCCESS_SIGNAL';

        // 3. REPORTE TELEMÉTRICO NOMINAL SIN PII
        void EmitTelemetrySignal({
          occurrenceTimestampISO: new Date().toISOString(),
          severityLevelLiteral: 'INFO',
          moduleIdentifierLiteral: RESEND_PROVIDER_MODULE_IDENTIFIER,
          operationCodeLiteral: 'EMAIL_DISPATCH_SUCCESS' as OperationCode,
          correlationIdentifier,
          messageContentLiteral:
            'Correo transaccional despachado exitosamente hacia el destinatario.',
          semanticIntentTag: 'EMAIL_TRANSMISSION_SUCCESS',
          contextMetadataSnapshot: Object.freeze({
            resendMessageIdentifier: generatedMessageIdentifier,
            recipientMaskLiteral: maskedRecipientLiteral,
            trackingCategoryIdentifier: validatedPayload.trackingCategoryIdentifier,
          }),
        });

        return generatedMessageIdentifier;
      } catch (caughtExecutionError: unknown) {
        const errorDescriptionLiteral =
          caughtExecutionError instanceof Error
            ? caughtExecutionError.message
            : String(caughtExecutionError);

        void EmitTelemetrySignal({
          occurrenceTimestampISO: new Date().toISOString(),
          severityLevelLiteral: 'CRITICAL',
          moduleIdentifierLiteral: RESEND_PROVIDER_MODULE_IDENTIFIER,
          operationCodeLiteral: 'RESEND_API_COMMUNICATION_FAILURE' as OperationCode,
          correlationIdentifier,
          messageContentLiteral: `Fallo crítico en el enlace con el proveedor Resend: ${errorDescriptionLiteral}`,
          semanticIntentTag: 'EMAIL_TRANSMISSION_FAILURE',
          contextMetadataSnapshot: Object.freeze({
            recipientMaskLiteral: maskedRecipientLiteral,
            errorTraceLiteral: errorDescriptionLiteral,
          }),
        });

        throw new InternalSystemException('FALLO_DE_TRANSMISION_EXTERNA', {
          originalProviderErrorLiteral: errorDescriptionLiteral,
          correlationIdentifier,
        });
      }
    },
  );
};
