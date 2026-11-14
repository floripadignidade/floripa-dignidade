/**
 * @section Newsletter Logic - Pending Subscription Persistence Orchestrator
 * @description Orquesta la validación de contrato de entrada, protección de privacidad
 * LGPD (enmascaramiento de correo en telemetría), resolución segura de credenciales
 * mediante `@floripa-dignidade/environment-validator`, inserción en Supabase PostgREST
 * y emisión de trazas conformes a `TelemetrySignalSchema`.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Clean Paths).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa), ISO/IEC 25010 y LGPD (Lei 13.709/2018).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

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
  TraceExecutionTime,
} from '@floripa-dignidade/telemetry';

import { InsertPendingSubscriberRecord } from './InsertPendingSubscriberRecord';
import {
  type ISavePendingSubscriptionParameters,
  SavePendingSubscriptionParametersSchema,
} from './schemas/SavePendingSubscription.schema';

export type { ISavePendingSubscriptionParameters };

const PERSISTENCE_MODULE_IDENTIFIER: ModuleIdentifier = ModuleIdentifierSchema.parse(
  'NEWSLETTER_CLOUD_PERSISTENCE_ATOM',
);

const INSERTION_TRACE_OPERATION_CODE: OperationCode = OperationCodeSchema.parse(
  'EXECUTE_CLOUD_LEDGER_INSERTION',
);

const INSERTION_SUCCESS_OPERATION_CODE: OperationCode =
  OperationCodeSchema.parse('CLOUD_INSERTION_NOMINAL');

const INSERTION_FAULT_OPERATION_CODE: OperationCode =
  OperationCodeSchema.parse('CLOUD_PERSISTENCE_FAULT');

const VALIDATION_FAILURE_OPERATION_CODE: OperationCode = OperationCodeSchema.parse(
  'PENDING_SUBSCRIPTION_CONTRACT_VIOLATION',
);

/**
 * Valida, protege bajo LGPD y persiste un registro de suscripción en estado `PENDING_VERIFICATION`.
 *
 * @param parametersSnapshot - Correo del ciudadano, token de verificación, idioma BCP 47 y correlación.
 * @returns {Promise<void>} Resuelve cuando el registro ha sido persistido en Supabase.
 * @throws {ValidationException} Si los parámetros incumplen el esquema de entrada.
 * @throws {GlobalBaseException} Si falla la resolución de entorno o la inserción remota.
 */
export const SavePendingSubscriptionToSupabase = async (
  parametersSnapshot: ISavePendingSubscriptionParameters,
): Promise<void> => {
  const parametersValidationResult =
    SavePendingSubscriptionParametersSchema.safeParse(parametersSnapshot);

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
      moduleIdentifierLiteral: PERSISTENCE_MODULE_IDENTIFIER,
      operationCodeLiteral: VALIDATION_FAILURE_OPERATION_CODE,
      correlationIdentifier: safeCorrelationIdentifier,
      messageContentLiteral:
        'Solicitud de persistencia de suscripción rechazada por violación de contrato.',
      semanticIntentTag: 'NEWSLETTER_PERSISTENCE_CONTRACT_VIOLATION',
      contextMetadataSnapshot: Object.freeze({
        validationIssuesCollection: parametersValidationResult.error.flatten(),
      }),
    });

    throw new ValidationException('CONTRATO_PERSISTENCIA_SUSCRIPCION_INVALIDO', {
      validationIssuesCollection: parametersValidationResult.error.flatten(),
      correlationIdentifier: safeCorrelationIdentifier,
    });
  }

  const validatedParameters = parametersValidationResult.data;
  const correlationIdentifier: CorrelationIdentifier = CorrelationIdentifierSchema.parse(
    validatedParameters.correlationIdentifier,
  );

  return await TraceExecutionTime(
    PERSISTENCE_MODULE_IDENTIFIER,
    INSERTION_TRACE_OPERATION_CODE,
    correlationIdentifier,
    async (): Promise<void> => {
      const maskedCitizenIdentityLiteral = await MaskCitizenIdentity({
        rawIdentityLiteral: validatedParameters.emailAddressLiteral,
        maskingStrategyLiteral: 'ELECTRONIC_MAIL',
      });

      try {
        const {
          SUPABASE_URL: supabaseBaseUrlLiteral,
          SUPABASE_SERVICE_ROLE_KEY: serviceRoleKeySecret,
        } = await ValidateEnvironmentContract();

        await InsertPendingSubscriberRecord({
          supabaseBaseUrlLiteral,
          serviceRoleKeySecret,
          emailAddressLiteral: validatedParameters.emailAddressLiteral,
          verificationTokenLiteral: validatedParameters.verificationTokenLiteral,
          localeIdentifierLiteral: validatedParameters.localeIdentifier,
          correlationIdentifier,
        });

        void EmitTelemetrySignal({
          occurrenceTimestampISO: new Date().toISOString(),
          severityLevelLiteral: 'INFO',
          moduleIdentifierLiteral: PERSISTENCE_MODULE_IDENTIFIER,
          operationCodeLiteral: INSERTION_SUCCESS_OPERATION_CODE,
          correlationIdentifier,
          messageContentLiteral: 'TELEMETRY.SIGNALS.END_PROCESS',
          semanticIntentTag: 'NEWSLETTER_PENDING_SUBSCRIPTION_PERSISTED',
          contextMetadataSnapshot: Object.freeze({
            targetTableLiteral: 'newsletter_subscribers',
            localeIdentifierLiteral: validatedParameters.localeIdentifier,
            maskedCitizenIdentityLiteral,
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
          moduleIdentifierLiteral: PERSISTENCE_MODULE_IDENTIFIER,
          operationCodeLiteral: INSERTION_FAULT_OPERATION_CODE,
          correlationIdentifier,
          messageContentLiteral: 'Fallo crítico al persistir suscripción pendiente en Supabase.',
          semanticIntentTag: 'INFRASTRUCTURE_IO_FAULT',
          contextMetadataSnapshot: Object.freeze({
            targetTableLiteral: 'newsletter_subscribers',
            maskedCitizenIdentityLiteral,
            errorTraceLiteral: errorDescriptionLiteral,
          }),
        });

        if (caughtExecutionError instanceof GlobalBaseException) {
          throw caughtExecutionError;
        }

        throw MapHttpErrorToException(500, 'FALLO_FISICO_PERSISTENCIA_NEWSLETTER', {
          originalErrorLiteral: errorDescriptionLiteral,
          correlationIdentifier,
        });
      }
    },
  );
};
