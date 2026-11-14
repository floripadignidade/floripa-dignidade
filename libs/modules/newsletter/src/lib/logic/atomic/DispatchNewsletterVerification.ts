/**
 * @section Newsletter Logic - Verification Notification Dispatcher
 * @description Átomo encargado de validar el canal de verificación, ensamblar el
 * contenido HTML Double Opt-In y despachar la notificación transaccional propagando
 * el `correlationIdentifier` hacia `@floripa-dignidade/resend-provider` bajo
 * cumplimiento LGPD y telemetría conforme a `TelemetrySignalSchema`.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Clean Paths).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa), ISO/IEC 25010 y LGPD (Lei 13.709/2018).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { z } from 'zod';

import {
  GlobalBaseException,
  MapHttpErrorToException,
  ValidationException,
} from '@floripa-dignidade/exceptions';
import { SendTransactionalEmail } from '@floripa-dignidade/resend-provider';
import { MaskCitizenIdentity } from '@floripa-dignidade/shared-utility';
import {
  type CorrelationIdentifier,
  CorrelationIdentifierSchema,
  EmitTelemetrySignal,
  GenerateCorrelationIdentifier,
  type ModuleIdentifier,
  ModuleIdentifierSchema,
  type OperationCode,
  OperationCodeSchema,
  TraceExecutionTime,
} from '@floripa-dignidade/telemetry';

import { GenerateDoubleOptInEmailHtml } from './GenerateDoubleOptInEmailHtml';
import {
  DispatchVerificationParametersSchema,
  type IDispatchVerificationParameters,
} from './schemas/DispatchNewsletterVerification.schema';

export type { IDispatchVerificationParameters };

const DISPATCH_MODULE_IDENTIFIER: ModuleIdentifier = ModuleIdentifierSchema.parse(
  'NEWSLETTER_DISPATCH_ATOM',
);

const DISPATCH_TRACE_OPERATION_CODE: OperationCode = OperationCodeSchema.parse(
  'DISPATCH_NEWSLETTER_VERIFICATION',
);

const VERIFICATION_EMAIL_SENT_OPERATION_CODE: OperationCode =
  OperationCodeSchema.parse('VERIFICATION_EMAIL_SENT');

const DISPATCH_CONTRACT_VIOLATION_OPERATION_CODE: OperationCode = OperationCodeSchema.parse(
  'VERIFICATION_DISPATCH_CONTRACT_VIOLATION',
);

const DISPATCH_FAILURE_OPERATION_CODE: OperationCode = OperationCodeSchema.parse(
  'VERIFICATION_DISPATCH_FAILURE',
);

const ElectronicMailTargetSchema = z
  .string()
  .trim()
  .email({ message: 'INVALID_RECIPIENT_EMAIL_FORMAT' })
  .transform((emailInputLiteral: string) => emailInputLiteral.toLowerCase());

/**
 * Despacha la notificación de verificación Double Opt-In por el canal autorizado.
 *
 * @param parametersSnapshot - Destinatario, canal, token, diccionario localizado, correlación y secretos.
 * @returns {Promise<void>} Resuelve cuando el proveedor transaccional acepta el envío.
 * @throws {ValidationException} Si los parámetros o el correo destino son inválidos o el canal no está soportado.
 * @throws {GlobalBaseException} Si falla el envío físico en el proveedor externo.
 */
export const DispatchNewsletterVerification = async (
  parametersSnapshot: IDispatchVerificationParameters,
): Promise<void> => {
  const parametersValidationResult =
    DispatchVerificationParametersSchema.safeParse(parametersSnapshot);

  if (!parametersValidationResult.success) {
    const fallbackCorrelationResult = CorrelationIdentifierSchema.safeParse(
      parametersSnapshot?.correlationIdentifier,
    );
    const safeCorrelationIdentifier: CorrelationIdentifier = fallbackCorrelationResult.success
      ? fallbackCorrelationResult.data
      : GenerateCorrelationIdentifier();

    void EmitTelemetrySignal({
      occurrenceTimestampISO: new Date().toISOString(),
      severityLevelLiteral: 'WARNING',
      moduleIdentifierLiteral: DISPATCH_MODULE_IDENTIFIER,
      operationCodeLiteral: DISPATCH_CONTRACT_VIOLATION_OPERATION_CODE,
      correlationIdentifier: safeCorrelationIdentifier,
      messageContentLiteral:
        'Parámetros de despacho de verificación rechazados por violación de contrato.',
      semanticIntentTag: 'NEWSLETTER_DISPATCH_CONTRACT_VIOLATION',
      contextMetadataSnapshot: Object.freeze({
        validationIssuesCollection: parametersValidationResult.error.flatten(),
      }),
    });

    throw new ValidationException('CONTRATO_DESPACHO_VERIFICACION_INVALIDO', {
      validationIssuesCollection: parametersValidationResult.error.flatten(),
      correlationIdentifier: safeCorrelationIdentifier,
    });
  }

  const validatedParameters = parametersValidationResult.data;
  const correlationIdentifier: CorrelationIdentifier = CorrelationIdentifierSchema.parse(
    validatedParameters.correlationIdentifier,
  );

  if (validatedParameters.targetChannelLiteral !== 'ELECTRONIC_MAIL') {
    void EmitTelemetrySignal({
      occurrenceTimestampISO: new Date().toISOString(),
      severityLevelLiteral: 'WARNING',
      moduleIdentifierLiteral: DISPATCH_MODULE_IDENTIFIER,
      operationCodeLiteral: DISPATCH_CONTRACT_VIOLATION_OPERATION_CODE,
      correlationIdentifier,
      messageContentLiteral: `Canal de verificación aún no habilitado: [${validatedParameters.targetChannelLiteral}].`,
      semanticIntentTag: 'NEWSLETTER_UNSUPPORTED_CHANNEL',
      contextMetadataSnapshot: Object.freeze({
        targetChannelLiteral: validatedParameters.targetChannelLiteral,
      }),
    });

    throw new ValidationException('NEWSLETTER_VERIFICATION_CHANNEL_NOT_SUPPORTED', {
      targetChannelLiteral: validatedParameters.targetChannelLiteral,
      correlationIdentifier,
    });
  }

  const emailValidationResult = ElectronicMailTargetSchema.safeParse(
    validatedParameters.targetIdentifierLiteral,
  );

  if (!emailValidationResult.success) {
    throw new ValidationException('NEWSLETTER.ERRORS.INVALID_EMAIL_FORMAT', {
      validationIssuesCollection: emailValidationResult.error.flatten(),
      correlationIdentifier,
    });
  }

  const normalizedRecipientEmailLiteral = emailValidationResult.data;

  return await TraceExecutionTime(
    DISPATCH_MODULE_IDENTIFIER,
    DISPATCH_TRACE_OPERATION_CODE,
    correlationIdentifier,
    async (): Promise<void> => {
      const maskedRecipientLiteral = await MaskCitizenIdentity({
        rawIdentityLiteral: normalizedRecipientEmailLiteral,
        maskingStrategyLiteral: 'ELECTRONIC_MAIL',
      });

      try {
        const emailHtmlContentLiteral = GenerateDoubleOptInEmailHtml(
          validatedParameters.linguisticDictionary,
          validatedParameters.securityTokenLiteral,
          correlationIdentifier,
        );

        const resendMessageIdentifier = await SendTransactionalEmail(
          {
            securityApiKeySecret: validatedParameters.infrastructureSecrets.resendApiKeySecret,
            defaultFromAddressLiteral:
              validatedParameters.infrastructureSecrets.resendFromEmailLiteral,
          },
          {
            targetRecipientAddressLiteral: normalizedRecipientEmailLiteral,
            emailSubjectLiteral:
              validatedParameters.linguisticDictionary.email.confirmationSubjectLiteral,
            emailHtmlContentLiteral,
            trackingCategoryIdentifier: 'NEWSLETTER_VERIFICATION',
          },
          correlationIdentifier,
        );

        void EmitTelemetrySignal({
          occurrenceTimestampISO: new Date().toISOString(),
          severityLevelLiteral: 'INFO',
          moduleIdentifierLiteral: DISPATCH_MODULE_IDENTIFIER,
          operationCodeLiteral: VERIFICATION_EMAIL_SENT_OPERATION_CODE,
          correlationIdentifier,
          messageContentLiteral: 'Correo de verificación Double Opt-In despachado exitosamente.',
          semanticIntentTag: 'NEWSLETTER_VERIFICATION_DISPATCHED',
          contextMetadataSnapshot: Object.freeze({
            targetChannelLiteral: validatedParameters.targetChannelLiteral,
            maskedRecipientLiteral,
            resendMessageIdentifier,
          }),
        });
      } catch (caughtExecutionError: unknown) {
        const errorDescriptionLiteral =
          caughtExecutionError instanceof Error
            ? caughtExecutionError.message
            : String(caughtExecutionError);

        void EmitTelemetrySignal({
          occurrenceTimestampISO: new Date().toISOString(),
          severityLevelLiteral: 'CRITICAL',
          moduleIdentifierLiteral: DISPATCH_MODULE_IDENTIFIER,
          operationCodeLiteral: DISPATCH_FAILURE_OPERATION_CODE,
          correlationIdentifier,
          messageContentLiteral:
            'Fallo crítico al despachar correo de verificación del boletín ciudadano.',
          semanticIntentTag: 'EMAIL_TRANSMISSION_FAILURE',
          contextMetadataSnapshot: Object.freeze({
            maskedRecipientLiteral,
            errorTraceLiteral: errorDescriptionLiteral,
          }),
        });

        if (caughtExecutionError instanceof GlobalBaseException) {
          throw caughtExecutionError;
        }

        throw MapHttpErrorToException(500, 'FALLO_DESPACHO_VERIFICACION_BOLETIN', {
          originalErrorLiteral: errorDescriptionLiteral,
          correlationIdentifier,
        });
      }
    },
  );
};
