/**
 * @file libs/shared/ui-foundry/src/lib/atoms/global-action-button/logic/EmitActionButtonTelemetry.ts
 * @section Shared UI Foundry - Action Button Telemetry Dispatcher (Atom)
 * @description Átomo encargado exclusivamente de emitir señales telemétricas SRE
 * conformes a `TelemetrySignalSchema` ante interacciones físicas sobre `GlobalActionButton`.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Clean Paths).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa) e ISO/IEC 25010 (Observabilidad y Mantenibilidad).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import {
  EmitTelemetrySignal,
  GenerateCorrelationIdentifier,
  type ModuleIdentifier,
  ModuleIdentifierSchema,
  type OperationCode,
  OperationCodeSchema,
} from '@floripa-dignidade/telemetry';

import type { TVisualIntentConfigurationLiteral } from '../constants/ActionButtonStyles.mapping';

const BUTTON_MODULE_IDENTIFIER: ModuleIdentifier = ModuleIdentifierSchema.parse(
  'GLOBAL_ACTION_BUTTON_ATOM',
);

const ACTION_TRIGGERED_OPERATION_CODE: OperationCode = OperationCodeSchema.parse(
  'UI_INTERACTION_TRIGGERED',
);

/**
 * @interface IEmitActionButtonTelemetryParameters
 * @description Contrato inmutable con los metadatos de interacción capturados por el botón.
 */
export interface IEmitActionButtonTelemetryParameters {
  readonly actionIdentifierLiteral: string;
  readonly visualIntentConfigurationLiteral: TVisualIntentConfigurationLiteral;
  readonly isPolymorphicBoolean: boolean;
}

/**
 * Emite de forma no bloqueante una señal telemétrica auditada al bus de observabilidad.
 *
 * @param parametersSnapshot - Identificador técnico de acción, variante visual y modo polimórfico.
 */
export const EmitActionButtonTelemetry = (
  parametersSnapshot: IEmitActionButtonTelemetryParameters,
): void => {
  const { actionIdentifierLiteral, visualIntentConfigurationLiteral, isPolymorphicBoolean } =
    parametersSnapshot;

  void EmitTelemetrySignal({
    occurrenceTimestampISO: new Date().toISOString(),
    severityLevelLiteral: 'INFO',
    moduleIdentifierLiteral: BUTTON_MODULE_IDENTIFIER,
    operationCodeLiteral: ACTION_TRIGGERED_OPERATION_CODE,
    correlationIdentifier: GenerateCorrelationIdentifier(),
    messageContentLiteral: `Interacción física detectada en: [${actionIdentifierLiteral}]`,
    semanticIntentTag: 'UI_ACTION_TRIGGER',
    contextMetadataSnapshot: Object.freeze({
      actionIdentifierLiteral,
      visualIntentConfigurationLiteral,
      isPolymorphicBoolean,
    }),
  });
};
