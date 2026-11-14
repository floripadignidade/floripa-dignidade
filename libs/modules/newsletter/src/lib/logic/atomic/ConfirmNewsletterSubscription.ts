/**
 * @section Newsletter Logic - Token Format Confirmation Validator (Compatibility)
 * @description Valida estructuralmente el formato del token Double Opt-In y la
 * correlación de trazabilidad, midiendo latencia mediante `TraceExecutionTime` y
 * emitiendo señales SRE conformes a `TelemetrySignalSchema` sin exponer fragmentos
 * del token secreto.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Clean Paths).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa), ISO/IEC 25010 y LGPD (Lei 13.709/2018).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { z } from 'zod';

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

const NEWSLETTER_MODULE_IDENTIFIER: ModuleIdentifier = ModuleIdentifierSchema.parse(
  'NEWSLETTER_SUBSCRIPTION_ENGINE',
);

const CONFIRM_TRACE_OPERATION_CODE: OperationCode = OperationCodeSchema.parse(
  'CONFIRM_SUBSCRIPTION_OPERATION',
);

const INVALID_TOKEN_OPERATION_CODE: OperationCode = OperationCodeSchema.parse(
  'INVALID_CONFIRMATION_TOKEN_ATTEMPT',
);

const CONSOLIDATED_OPERATION_CODE: OperationCode = OperationCodeSchema.parse(
  'SUBSCRIPTION_AUTHORITY_CONSOLIDATED',
);

const CONFIRMATION_TOKEN_FORMAT_REGEX = /^[A-Za-z0-9_-]{32,128}$/;

/**
 * @name ConfirmNewsletterSubscriptionParametersSchema
 * @description Aduana Zod inmutable para validar el token de confirmación y su correlación.
 */
export const ConfirmNewsletterSubscriptionParametersSchema = z
  .object({
    verificationSecurityTokenLiteral: z
      .string()
      .trim()
      .regex(CONFIRMATION_TOKEN_FORMAT_REGEX, {
        message: 'INVALID_CONFIRMATION_TOKEN_FORMAT',
      })
      .describe(
        'Token criptográfico de verificación Double Opt-In (mínimo 32 caracteres válidos).',
      ),
    correlationIdentifier: CorrelationIdentifierSchema,
  })
  .readonly();

/**
 * Valida estructuralmente el token de confirmación ciudadana preservando la firma
 * retrocompatible `Promise<boolean>`.
 *
 * @deprecated Utilizar `ActivateCloudSubscription` para ejecutar la transición transaccional real en Supabase.
 * @param verificationSecurityTokenLiteral - Token secreto recibido desde el enlace de verificación.
 * @param correlationIdentifier - Identificador UUID v4 de correlación distribuida.
 * @returns {Promise<boolean>} Verdadero si el token cumple el formato criptográfico mínimo exigido.
 */
export const ConfirmNewsletterSubscription = async (
  verificationSecurityTokenLiteral: string,
  correlationIdentifier: string,
): Promise<boolean> => {
  const correlationValidationResult = CorrelationIdentifierSchema.safeParse(correlationIdentifier);
  const resolvedCorrelationIdentifier: CorrelationIdentifier = correlationValidationResult.success
    ? correlationValidationResult.data
    : GenerateCorrelationIdentifier();

  return await TraceExecutionTime(
    NEWSLETTER_MODULE_IDENTIFIER,
    CONFIRM_TRACE_OPERATION_CODE,
    resolvedCorrelationIdentifier,
    async (): Promise<boolean> => {
      const validationResultSnapshot = ConfirmNewsletterSubscriptionParametersSchema.safeParse({
        verificationSecurityTokenLiteral,
        correlationIdentifier: resolvedCorrelationIdentifier,
      });

      if (!validationResultSnapshot.success) {
        const sanitizedTokenLengthQuantity =
          typeof verificationSecurityTokenLiteral === 'string'
            ? verificationSecurityTokenLiteral.trim().length
            : 0;

        void EmitTelemetrySignal({
          occurrenceTimestampISO: new Date().toISOString(),
          severityLevelLiteral: 'WARNING',
          moduleIdentifierLiteral: NEWSLETTER_MODULE_IDENTIFIER,
          operationCodeLiteral: INVALID_TOKEN_OPERATION_CODE,
          correlationIdentifier: resolvedCorrelationIdentifier,
          messageContentLiteral: 'Intento de confirmación rechazado: token malformado o ausente.',
          semanticIntentTag: 'SECURITY_TOKEN_VALIDATION_WARNING',
          contextMetadataSnapshot: Object.freeze({
            tokenLengthQuantity: sanitizedTokenLengthQuantity,
          }),
        });

        return false;
      }

      void EmitTelemetrySignal({
        occurrenceTimestampISO: new Date().toISOString(),
        severityLevelLiteral: 'INFO',
        moduleIdentifierLiteral: NEWSLETTER_MODULE_IDENTIFIER,
        operationCodeLiteral: CONSOLIDATED_OPERATION_CODE,
        correlationIdentifier: resolvedCorrelationIdentifier,
        messageContentLiteral:
          'Validación estructural de token de suscripción completada nominalmente.',
        semanticIntentTag: 'NEWSLETTER_TOKEN_FORMAT_VERIFIED',
        contextMetadataSnapshot: Object.freeze({
          confirmationTimestampISO: new Date().toISOString(),
        }),
      });

      return true;
    },
  );
};
