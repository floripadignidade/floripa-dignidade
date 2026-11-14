/**
 * @section Newsletter Logic - Subscription Request Orchestrator
 * @description Orquestador de negocio encargado de procesar una solicitud de
 * suscripción ciudadana al boletín. Valida el payload entrante y el canal soportado,
 * enmascara la identidad para cumplir la LGPD, persiste la suscripción pendiente en
 * Supabase, carga el diccionario localizado (ADR 0030) y despacha el desafío Double Opt-In.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Clean Paths).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa), ISO/IEC 25010 y LGPD (Lei 13.709/2018).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { z } from 'zod';

import { ValidateEnvironmentContract } from '@floripa-dignidade/environment-validator';
import {
  GlobalBaseException,
  MapHttpErrorToException,
  ValidationException,
} from '@floripa-dignidade/exceptions';
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
  ReportForensicException,
  TraceExecutionTime,
} from '@floripa-dignidade/telemetry';

import {
  type INewsletterSubscriptionRequest,
  NewsletterSubscriptionRequestSchema,
} from '../../schemas/NewsletterSubscriptionRequest.schema';
import { DispatchNewsletterVerification } from './DispatchNewsletterVerification';
import { LoadNewsletterLinguisticDictionary } from './LoadNewsletterLinguisticDictionary';
import { SavePendingSubscriptionToSupabase } from './SavePendingSubscriptionToSupabase';

const ORCHESTRATOR_MODULE_IDENTIFIER: ModuleIdentifier = ModuleIdentifierSchema.parse(
  'NEWSLETTER_SUBSCRIPTION_ORCHESTRATOR',
);

const ORCHESTRATION_TRACE_OPERATION_CODE: OperationCode = OperationCodeSchema.parse(
  'EXECUTE_SUBSCRIPTION_FLOW',
);

const SUBSCRIPTION_REQUESTED_OPERATION_CODE: OperationCode = OperationCodeSchema.parse(
  'CITIZEN_SUBSCRIPTION_REQUESTED',
);

const SUBSCRIPTION_FAULT_OPERATION_CODE: OperationCode = OperationCodeSchema.parse(
  'NEWSLETTER_SUBSCRIPTION_ORCHESTRATION_FAULT',
);

const ElectronicMailAddressSchema = z
  .string()
  .trim()
  .email({ message: 'INVALID_ELECTRONIC_MAIL_FORMAT' })
  .transform((emailInputLiteral: string) => emailInputLiteral.toLowerCase());

/**
 * Valida, persiste en estado pendiente y despacha la verificación de una suscripción ciudadana.
 *
 * @param rawSubscriptionPayloadSnapshot - Carga útil cruda recibida desde el gateway o interfaz.
 * @param correlationIdentifierFallback - Identificador UUID v4 opcional para propagar trazabilidad.
 * @returns {Promise<CorrelationIdentifier>} Identificador nominal de correlación de la transacción.
 * @throws {ValidationException} Si el payload incumple el contrato o el canal no es soportado.
 * @throws {GlobalBaseException} Si ocurre un fallo en infraestructura de persistencia o correo.
 */
export const ProcessNewsletterSubscriptionRequest = async (
  rawSubscriptionPayloadSnapshot: unknown,
  correlationIdentifierFallback?: string,
): Promise<CorrelationIdentifier> => {
  const correlationValidationResult = CorrelationIdentifierSchema.safeParse(
    correlationIdentifierFallback,
  );
  const correlationIdentifier: CorrelationIdentifier = correlationValidationResult.success
    ? correlationValidationResult.data
    : GenerateCorrelationIdentifier();

  return await TraceExecutionTime(
    ORCHESTRATOR_MODULE_IDENTIFIER,
    ORCHESTRATION_TRACE_OPERATION_CODE,
    correlationIdentifier,
    async (): Promise<CorrelationIdentifier> => {
      let maskedCommunicationIdentifierLiteral = '***@***.***';

      try {
        const validationResultSnapshot = NewsletterSubscriptionRequestSchema.safeParse(
          rawSubscriptionPayloadSnapshot,
        );

        if (!validationResultSnapshot.success) {
          throw new ValidationException('NEWSLETTER.ERRORS.ADN_CORRUPTED', {
            validationIssuesCollection: validationResultSnapshot.error.flatten(),
            correlationIdentifier,
          });
        }

        const validatedRequest: INewsletterSubscriptionRequest = validationResultSnapshot.data;

        if (validatedRequest.verificationChannelPreference !== 'ELECTRONIC_MAIL') {
          throw new ValidationException('NEWSLETTER_VERIFICATION_CHANNEL_NOT_SUPPORTED', {
            attemptedChannelLiteral: validatedRequest.verificationChannelPreference,
            correlationIdentifier,
          });
        }

        const emailValidationResult = ElectronicMailAddressSchema.safeParse(
          validatedRequest.communicationIdentifierLiteral,
        );

        if (!emailValidationResult.success) {
          throw new ValidationException('NEWSLETTER.ERRORS.INVALID_EMAIL_FORMAT', {
            validationIssuesCollection: emailValidationResult.error.flatten(),
            correlationIdentifier,
          });
        }

        const normalizedEmailAddressLiteral = emailValidationResult.data;
        const securityVerificationTokenLiteral = crypto.randomUUID();

        const [infrastructureSnapshot, resolvedMaskedIdentityLiteral] = await Promise.all([
          ValidateEnvironmentContract(),
          MaskCitizenIdentity({
            rawIdentityLiteral: normalizedEmailAddressLiteral,
            maskingStrategyLiteral: 'ELECTRONIC_MAIL',
          }),
        ]);

        maskedCommunicationIdentifierLiteral = resolvedMaskedIdentityLiteral;

        await SavePendingSubscriptionToSupabase({
          emailAddressLiteral: normalizedEmailAddressLiteral,
          verificationTokenLiteral: securityVerificationTokenLiteral,
          localeIdentifier: validatedRequest.preferredLinguisticLocaleIdentifier,
          correlationIdentifier,
        });

        const linguisticDictionarySnapshot = await LoadNewsletterLinguisticDictionary(
          validatedRequest.preferredLinguisticLocaleIdentifier,
        );

        await DispatchNewsletterVerification({
          targetIdentifierLiteral: normalizedEmailAddressLiteral,
          targetChannelLiteral: validatedRequest.verificationChannelPreference,
          securityTokenLiteral: securityVerificationTokenLiteral,
          linguisticDictionary: linguisticDictionarySnapshot,
          correlationIdentifier,
          infrastructureSecrets: {
            resendApiKeySecret: infrastructureSnapshot.RESEND_API_KEY,
            resendFromEmailLiteral: infrastructureSnapshot.RESEND_FROM_EMAIL,
          },
        });

        void EmitTelemetrySignal({
          occurrenceTimestampISO: new Date().toISOString(),
          severityLevelLiteral: 'INFO',
          moduleIdentifierLiteral: ORCHESTRATOR_MODULE_IDENTIFIER,
          operationCodeLiteral: SUBSCRIPTION_REQUESTED_OPERATION_CODE,
          correlationIdentifier,
          messageContentLiteral: 'NEWSLETTER.LOGS.SUBSCRIPTION_REQUESTED',
          semanticIntentTag: 'NEWSLETTER_CONVERSION_START',
          contextMetadataSnapshot: Object.freeze({
            preferredLocaleIdentifier: validatedRequest.preferredLinguisticLocaleIdentifier,
            citizenMaskLiteral: maskedCommunicationIdentifierLiteral,
          }),
        });

        return correlationIdentifier;
      } catch (caughtExecutionError: unknown) {
        const normalizedException =
          caughtExecutionError instanceof GlobalBaseException
            ? caughtExecutionError
            : MapHttpErrorToException(500, 'NEWSLETTER.ERRORS.ORCHESTRATION_FAULT', {
                originalErrorLiteral:
                  caughtExecutionError instanceof Error
                    ? caughtExecutionError.message
                    : String(caughtExecutionError),
                correlationIdentifier,
              });

        const isClientFaultBoolean = normalizedException.httpStatusCodeNumeric < 500;

        void EmitTelemetrySignal({
          occurrenceTimestampISO: new Date().toISOString(),
          severityLevelLiteral: isClientFaultBoolean ? 'WARNING' : 'CRITICAL',
          moduleIdentifierLiteral: ORCHESTRATOR_MODULE_IDENTIFIER,
          operationCodeLiteral: SUBSCRIPTION_FAULT_OPERATION_CODE,
          correlationIdentifier,
          messageContentLiteral: 'Fallo durante el procesamiento de suscripción al boletín.',
          semanticIntentTag: isClientFaultBoolean
            ? 'NEWSLETTER_VALIDATION_WARNING'
            : 'NEWSLETTER_ORCHESTRATION_FAILURE',
          contextMetadataSnapshot: Object.freeze({
            httpStatusCodeNumeric: normalizedException.httpStatusCodeNumeric,
            operationalErrorCodeLiteral: normalizedException.operationalErrorCodeLiteral,
            citizenMaskLiteral: maskedCommunicationIdentifierLiteral,
          }),
        });

        ReportForensicException(normalizedException, correlationIdentifier);

        throw normalizedException;
      }
    },
  );
};
