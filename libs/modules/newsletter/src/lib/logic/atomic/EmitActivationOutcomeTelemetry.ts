// libs/modules/newsletter/src/lib/logic/atomic/EmitActivationOutcomeTelemetry.ts

/**
 * @section Newsletter Logic - Activation Outcome Telemetry Dispatcher (Atom)
 * @description Átomo encargado exclusivamente de emitir la señal telemétrica SRE
 * conforme a `TelemetrySignalSchema` para los resultados nominales o tokens no
 * coincidentes durante la activación Double Opt-In.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Clean Paths).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa) e ISO/IEC 25010 (Observabilidad y Mantenibilidad).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import {
  type CorrelationIdentifier,
  EmitTelemetrySignal,
  type ModuleIdentifier,
  type OperationCode,
  OperationCodeSchema,
  type SeverityLevel,
} from '@floripa-dignidade/telemetry';

type TActivationOutcomeKey = 'SUCCESS' | 'UNMATCHED_TOKEN';

interface IActivationOutcomeSpecification {
  readonly severityLevelLiteral: SeverityLevel;
  readonly operationCodeLiteral: OperationCode;
  readonly messageContentLiteral: string;
  readonly semanticIntentTag: string;
}

const ACTIVATION_OUTCOME_SPECIFICATIONS: Readonly<
  Record<TActivationOutcomeKey, IActivationOutcomeSpecification>
> = Object.freeze({
  SUCCESS: {
    severityLevelLiteral: 'INFO',
    operationCodeLiteral: OperationCodeSchema.parse('CONVERSION_SUCCESS'),
    messageContentLiteral: 'Suscripción ciudadana activada nominalmente en Supabase.',
    semanticIntentTag: 'NEWSLETTER_ACTIVATION_CONFIRMED',
  },
  UNMATCHED_TOKEN: {
    severityLevelLiteral: 'WARNING',
    operationCodeLiteral: OperationCodeSchema.parse('INVALID_TOKEN'),
    messageContentLiteral: 'Activación rechazada: token inexistente o ya consumido previamente.',
    semanticIntentTag: 'NEWSLETTER_ACTIVATION_TOKEN_UNMATCHED',
  },
});

/**
 * @interface IEmitActivationOutcomeTelemetryParameters
 * @description Contrato inmutable de entrada para reportar el desenlace de activación.
 */
export interface IEmitActivationOutcomeTelemetryParameters {
  readonly moduleIdentifierLiteral: ModuleIdentifier;
  readonly isActivationSuccessfulBoolean: boolean;
  readonly correlationIdentifier: CorrelationIdentifier;
  readonly metadataSnapshot: Readonly<Record<string, unknown>> | undefined;
}

/**
 * Emite de forma no bloqueante la señal telemétrica de activación o rechazo de token.
 *
 * @param parametersSnapshot - Módulo emisor, éxito de activación, correlación y metadatos opacos.
 */
export const EmitActivationOutcomeTelemetry = (
  parametersSnapshot: IEmitActivationOutcomeTelemetryParameters,
): void => {
  const {
    moduleIdentifierLiteral,
    isActivationSuccessfulBoolean,
    correlationIdentifier,
    metadataSnapshot,
  } = parametersSnapshot;

  const outcomeKeyLiteral: TActivationOutcomeKey = isActivationSuccessfulBoolean
    ? 'SUCCESS'
    : 'UNMATCHED_TOKEN';
  const outcomeSpecification = ACTIVATION_OUTCOME_SPECIFICATIONS[outcomeKeyLiteral];

  void EmitTelemetrySignal({
    occurrenceTimestampISO: new Date().toISOString(),
    severityLevelLiteral: outcomeSpecification.severityLevelLiteral,
    moduleIdentifierLiteral,
    operationCodeLiteral: outcomeSpecification.operationCodeLiteral,
    correlationIdentifier,
    messageContentLiteral: outcomeSpecification.messageContentLiteral,
    semanticIntentTag: outcomeSpecification.semanticIntentTag,
    contextMetadataSnapshot: Object.freeze({
      ...metadataSnapshot,
      isActivationSuccessfulBoolean,
    }),
  });
};
