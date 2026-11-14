// libs/modules/whatsapp/communication-service/src/lib/logic/atomic/ValidateMetaSignature.ts

/**
 * @section WhatsApp Logic - Meta Cryptographic Signature Orchestrator
 * @description Orquestador isomórfico encargado de autenticar la cabecera
 * `X-Hub-Signature-256` de Meta mediante validación Zod, parseo estricto de
 * digest SHA-256 y verificación criptográfica HMAC-SHA256 sobre bytes crudos con
 * Web Crypto API, emitiendo trazabilidad SRE conforme a `TelemetrySignalSchema`.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Isomorphic).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa), ISO/IEC 25010 e ISO/IEC 27001.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { ValidateEnvironmentContract } from '@floripa-dignidade/environment-validator';
import { MapHttpErrorToException, ValidationException } from '@floripa-dignidade/exceptions';
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
  type SeverityLevel,
  TraceExecutionTime,
} from '@floripa-dignidade/telemetry';

import { ParseMetaSignatureHeader } from './ParseMetaSignatureHeader';
import {
  type IValidatedMetaSignatureData,
  type IValidateMetaSignatureParameters,
  ValidateMetaSignatureSchema,
} from './schemas/ValidateMetaSignature.schema';
import { type TRawHmacPayloadSource, VerifyHmacSha256Signature } from './VerifyHmacSha256Signature';

const SECURITY_MODULE_IDENTIFIER: ModuleIdentifier = ModuleIdentifierSchema.parse(
  'WHATSAPP_SIGNATURE_VALIDATOR',
);

const VALIDATION_TRACE_OPERATION_CODE: OperationCode = OperationCodeSchema.parse(
  'EXECUTE_META_SIGNATURE_VALIDATION',
);

type TSignatureAuditEventKey = 'MALFORMED' | 'MISMATCH' | 'VERIFIED' | 'FAULT';

interface ISignatureAuditSpecification {
  readonly severityLevelLiteral: SeverityLevel;
  readonly operationCodeLiteral: OperationCode;
  readonly messageContentLiteral: string;
  readonly semanticIntentTag: string;
}

const SIGNATURE_AUDIT_SPECIFICATIONS: Readonly<
  Record<TSignatureAuditEventKey, ISignatureAuditSpecification>
> = Object.freeze({
  MALFORMED: {
    severityLevelLiteral: 'WARNING',
    operationCodeLiteral: OperationCodeSchema.parse('META_SIGNATURE_HEADER_MALFORMED'),
    messageContentLiteral:
      'Cabecera X-Hub-Signature-256 rechazada por formato hexadecimal SHA-256 inválido.',
    semanticIntentTag: 'SECURITY_CRYPTOGRAPHIC_HEADER_MALFORMED',
  },
  MISMATCH: {
    severityLevelLiteral: 'CRITICAL',
    operationCodeLiteral: OperationCodeSchema.parse('META_SIGNATURE_MISMATCH_DETECTED'),
    messageContentLiteral:
      'ALERTA DE SEGURIDAD: Discrepancia criptográfica detectada en Webhook de Meta.',
    semanticIntentTag: 'SECURITY_CRYPTOGRAPHIC_SIGNATURE_MISMATCH',
  },
  VERIFIED: {
    severityLevelLiteral: 'DEBUG',
    operationCodeLiteral: OperationCodeSchema.parse('META_SIGNATURE_VERIFIED'),
    messageContentLiteral: 'Firma HMAC-SHA256 de webhook Meta verificada nominalmente.',
    semanticIntentTag: 'SECURITY_CRYPTOGRAPHIC_SIGNATURE_VERIFIED',
  },
  FAULT: {
    severityLevelLiteral: 'ERROR',
    operationCodeLiteral: OperationCodeSchema.parse('SIGNATURE_VERIFICATION_FAULT'),
    messageContentLiteral:
      'Fallo técnico inesperado al verificar la integridad criptográfica del webhook.',
    semanticIntentTag: 'SECURITY_CRYPTOGRAPHIC_PROCESS_FAULT',
  },
});

const resolveSafeCorrelationIdentifier = (
  candidateParameters: IValidateMetaSignatureParameters | undefined,
): CorrelationIdentifier => {
  if (
    candidateParameters &&
    'correlationIdentifier' in candidateParameters &&
    typeof candidateParameters.correlationIdentifier === 'string'
  ) {
    const validationResult = CorrelationIdentifierSchema.safeParse(
      candidateParameters.correlationIdentifier,
    );
    if (validationResult.success) {
      return validationResult.data;
    }
  }

  return GenerateCorrelationIdentifier();
};

const emitSignatureAuditSignalAction = (
  eventKeyLiteral: TSignatureAuditEventKey,
  correlationIdentifier: CorrelationIdentifier,
  contextMetadataSnapshot?: Readonly<Record<string, unknown>>,
): void => {
  const auditSpecification = SIGNATURE_AUDIT_SPECIFICATIONS[eventKeyLiteral];

  void EmitTelemetrySignal({
    occurrenceTimestampISO: new Date().toISOString(),
    severityLevelLiteral: auditSpecification.severityLevelLiteral,
    moduleIdentifierLiteral: SECURITY_MODULE_IDENTIFIER,
    operationCodeLiteral: auditSpecification.operationCodeLiteral,
    correlationIdentifier,
    messageContentLiteral: auditSpecification.messageContentLiteral,
    semanticIntentTag: auditSpecification.semanticIntentTag,
    ...(contextMetadataSnapshot !== undefined && {
      contextMetadataSnapshot: Object.freeze({ ...contextMetadataSnapshot }),
    }),
  });
};

const resolveRawPayloadSource = (
  validatedData: IValidatedMetaSignatureData,
): TRawHmacPayloadSource => {
  return validatedData.rawRequestBodyBytes !== undefined
    ? validatedData.rawRequestBodyBytes
    : (validatedData.rawRequestBodyLiteral as string);
};

const verifySignatureAgainstSecretAction = async (
  validatedData: IValidatedMetaSignatureData,
  digestBytes: Uint8Array,
  correlationIdentifier: CorrelationIdentifier,
): Promise<boolean> => {
  const rawPayloadSource = resolveRawPayloadSource(validatedData);
  const resolvedAppSecretLiteral =
    validatedData.appSecretOverride ?? (await ValidateEnvironmentContract()).WHATSAPP_APP_SECRET;

  const isIdentityMatchBoolean = await VerifyHmacSha256Signature(
    rawPayloadSource,
    resolvedAppSecretLiteral,
    digestBytes,
  );

  if (!isIdentityMatchBoolean) {
    emitSignatureAuditSignalAction('MISMATCH', correlationIdentifier, {
      threatLevelLiteral: 'HIGH',
      isUsingSecretOverrideBoolean: validatedData.appSecretOverride !== undefined,
    });
    return false;
  }

  emitSignatureAuditSignalAction('VERIFIED', correlationIdentifier);
  return true;
};

/**
 * Verifica la autenticidad criptográfica de un webhook entrante de Meta (`X-Hub-Signature-256`).
 * Compatible con WhatsApp Business, Facebook, Instagram y Threads en Edge y Node.js.
 *
 * @param parametersSnapshot - Payload crudo (texto o binario), cabecera de firma y opciones multi-app.
 * @returns {Promise<boolean>} Verdadero si la firma HMAC-SHA256 coincide en tiempo constante.
 * @throws {ValidationException} Si el payload o el formato base de los parámetros son inválidos.
 */
export const ValidateMetaSignature = async (
  parametersSnapshot: IValidateMetaSignatureParameters,
): Promise<boolean> => {
  const correlationIdentifier = resolveSafeCorrelationIdentifier(parametersSnapshot);

  return await TraceExecutionTime(
    SECURITY_MODULE_IDENTIFIER,
    VALIDATION_TRACE_OPERATION_CODE,
    correlationIdentifier,
    async (): Promise<boolean> => {
      const validationResult = ValidateMetaSignatureSchema.safeParse(parametersSnapshot);

      if (!validationResult.success) {
        const validationException = new ValidationException('CONTRATO_DE_FIRMA_WHATSAPP_VIOLADO', {
          issuesCollection: validationResult.error.flatten(),
          correlationIdentifier,
        });
        ReportForensicException(validationException, correlationIdentifier);
        throw validationException;
      }

      const validatedData: IValidatedMetaSignatureData = validationResult.data;
      const parsedHeaderSnapshot = ParseMetaSignatureHeader(
        validatedData.xHubSignatureHeaderLiteral,
      );

      if (!parsedHeaderSnapshot.isHeaderFormatValidBoolean || !parsedHeaderSnapshot.digestBytes) {
        emitSignatureAuditSignalAction('MALFORMED', correlationIdentifier, {
          headerLengthQuantity: validatedData.xHubSignatureHeaderLiteral.length,
        });
        return false;
      }

      try {
        return await verifySignatureAgainstSecretAction(
          validatedData,
          parsedHeaderSnapshot.digestBytes,
          correlationIdentifier,
        );
      } catch (caughtExecutionError: unknown) {
        const errorDescriptionLiteral =
          caughtExecutionError instanceof Error
            ? caughtExecutionError.message
            : String(caughtExecutionError);

        const normalizedException = MapHttpErrorToException(
          500,
          'META_SIGNATURE_VERIFICATION_FAULT',
          {
            originalErrorLiteral: errorDescriptionLiteral,
            correlationIdentifier,
          },
        );

        ReportForensicException(normalizedException, correlationIdentifier);
        emitSignatureAuditSignalAction('FAULT', correlationIdentifier, {
          errorTraceLiteral: errorDescriptionLiteral,
        });

        return false;
      }
    },
  );
};
