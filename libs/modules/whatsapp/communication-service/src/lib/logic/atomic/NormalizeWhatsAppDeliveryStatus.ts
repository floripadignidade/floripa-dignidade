// libs/modules/whatsapp/communication-service/src/lib/logic/atomic/NormalizeWhatsAppDeliveryStatus.ts

/**
 * @section WhatsApp Logic - Delivery Status Normalizer (Atom)
 * @description Átomo de lógica pura encargado de validar mediante Zod el payload de
 * actualización de estado (`statuses[]`) de Meta WhatsApp Cloud API, convertir la
 * marca temporal Unix a ISO 8601, mapear deterministamente la severidad SRE y emitir
 * un snapshot inmutable para telemetría y auditoría forense.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Isomorphic).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa) e ISO/IEC 25010 (Confiabilidad y Mantenibilidad).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { ValidationException } from '@floripa-dignidade/exceptions';
import {
  EmitTelemetrySignal,
  GenerateCorrelationIdentifier,
  type ModuleIdentifier,
  ModuleIdentifierSchema,
  type OperationCode,
  OperationCodeSchema,
  ReportForensicException,
  type SeverityLevel,
} from '@floripa-dignidade/telemetry';

import {
  type IWhatsAppStatusUpdate,
  type TMetaDeliveryStatusLiteral,
  WhatsAppStatusUpdateSchema,
} from './schemas/WhatsAppStatusUpdate.schema';

const NORMALIZER_MODULE_IDENTIFIER: ModuleIdentifier = ModuleIdentifierSchema.parse(
  'WHATSAPP_STATUS_NORMALIZER_ATOM',
);

const STATUS_CONTRACT_VIOLATION_OPERATION_CODE: OperationCode = OperationCodeSchema.parse(
  'WHATSAPP_STATUS_CONTRACT_VIOLATION',
);

const DELIVERY_STATUS_TO_SEVERITY_MAPPING: Readonly<
  Record<TMetaDeliveryStatusLiteral, SeverityLevel>
> = Object.freeze({
  sent: 'INFO',
  delivered: 'INFO',
  read: 'INFO',
  deleted: 'WARNING',
  failed: 'ERROR',
});

/**
 * @interface INormalizedDeliveryStatusSnapshot
 * @description Snapshot inmutable y normalizado para consumo de telemetría y auditoría.
 */
export interface INormalizedDeliveryStatusSnapshot {
  readonly metaMessageIdentifier: string;
  readonly deliveryStatusLiteral: TMetaDeliveryStatusLiteral;
  readonly rawRecipientIdentifierLiteral: string;
  readonly occurrenceTimestampISO: string;
  readonly isDeliveryFailureBoolean: boolean;
  readonly errorCodeNumeric?: number;
  readonly errorDetailsLiteral?: string;
  readonly conversationCategoryLiteral?: string;
  readonly suggestedSeverityLevelLiteral: SeverityLevel;
}

const convertUnixTimestampToIso8601Literal = (rawUnixTimestampLiteral: string): string => {
  const parsedSecondsQuantity = Number.parseInt(rawUnixTimestampLiteral.trim(), 10);
  if (Number.isNaN(parsedSecondsQuantity) || parsedSecondsQuantity <= 0) {
    return new Date().toISOString();
  }

  return new Date(parsedSecondsQuantity * 1000).toISOString();
};

const resolveRecipientIdentifierLiteral = (validatedStatus: IWhatsAppStatusUpdate): string => {
  return validatedStatus.recipient_id ?? validatedStatus.recipient_user_id ?? 'ANONYMOUS_RECIPIENT';
};

const extractErrorDetailsLiteral = (
  firstErrorSnapshot: NonNullable<IWhatsAppStatusUpdate['errors']>[number],
): string | undefined => {
  return firstErrorSnapshot.error_data ? firstErrorSnapshot.error_data.details : undefined;
};

const extractFirstErrorMetadata = (
  errorsCollection: IWhatsAppStatusUpdate['errors'],
): Readonly<
  Pick<INormalizedDeliveryStatusSnapshot, 'errorCodeNumeric' | 'errorDetailsLiteral'>
> => {
  const firstErrorSnapshot = errorsCollection?.[0];
  if (!firstErrorSnapshot) {
    return {};
  }

  const errorDetailsLiteral = extractErrorDetailsLiteral(firstErrorSnapshot);

  return {
    ...(firstErrorSnapshot.code !== undefined && {
      errorCodeNumeric: firstErrorSnapshot.code,
    }),
    ...(errorDetailsLiteral !== undefined && {
      errorDetailsLiteral,
    }),
  };
};

const extractConversationCategoryMetadata = (
  conversationSnapshot: IWhatsAppStatusUpdate['conversation'],
): Readonly<Pick<INormalizedDeliveryStatusSnapshot, 'conversationCategoryLiteral'>> => {
  const categoryLiteral = conversationSnapshot?.category;

  return categoryLiteral !== undefined ? { conversationCategoryLiteral: categoryLiteral } : {};
};

/**
 * Normaliza, valida perimetralmente y sella una actualización de estado de entrega de WhatsApp.
 *
 * @param rawStatusCandidate - Objeto crudo del estado recibido desde el webhook de Meta.
 * @returns {INormalizedDeliveryStatusSnapshot} Datos normalizados y congelados inmutablemente.
 * @throws {ValidationException} Si el evento de estado incumple `WhatsAppStatusUpdateSchema`.
 */
export const NormalizeWhatsAppDeliveryStatus = (
  rawStatusCandidate: unknown,
): INormalizedDeliveryStatusSnapshot => {
  const validationResult = WhatsAppStatusUpdateSchema.safeParse(rawStatusCandidate);

  if (!validationResult.success) {
    const correlationIdentifier = GenerateCorrelationIdentifier();
    const validationIssuesCollection = validationResult.error.flatten();

    void EmitTelemetrySignal({
      occurrenceTimestampISO: new Date().toISOString(),
      severityLevelLiteral: 'WARNING',
      moduleIdentifierLiteral: NORMALIZER_MODULE_IDENTIFIER,
      operationCodeLiteral: STATUS_CONTRACT_VIOLATION_OPERATION_CODE,
      correlationIdentifier,
      messageContentLiteral:
        'Actualización de estado de Meta WhatsApp rechazada por violación de contrato.',
      semanticIntentTag: 'WHATSAPP_STATUS_VALIDATION_WARNING',
      contextMetadataSnapshot: Object.freeze({ validationIssuesCollection }),
    });

    const validationException = new ValidationException(
      'WHATSAPP_STATUS_UPDATE_CONTRACT_VIOLATION',
      {
        validationIssuesCollection,
        correlationIdentifier,
      },
    );

    ReportForensicException(validationException, correlationIdentifier);
    throw validationException;
  }

  const validatedStatus = validationResult.data;
  const isDeliveryFailureBoolean = validatedStatus.status === 'failed';
  const suggestedSeverityLevelLiteral = DELIVERY_STATUS_TO_SEVERITY_MAPPING[validatedStatus.status];

  return Object.freeze({
    metaMessageIdentifier: validatedStatus.id,
    deliveryStatusLiteral: validatedStatus.status,
    rawRecipientIdentifierLiteral: resolveRecipientIdentifierLiteral(validatedStatus),
    occurrenceTimestampISO: convertUnixTimestampToIso8601Literal(validatedStatus.timestamp),
    isDeliveryFailureBoolean,
    suggestedSeverityLevelLiteral,
    ...extractFirstErrorMetadata(validatedStatus.errors),
    ...extractConversationCategoryMetadata(validatedStatus.conversation),
  });
};
