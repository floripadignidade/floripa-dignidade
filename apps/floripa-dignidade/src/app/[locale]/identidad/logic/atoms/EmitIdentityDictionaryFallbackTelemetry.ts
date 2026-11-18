/**
 * @file apps/floripa-dignidade/src/app/[locale]/identidad/logic/atoms/EmitIdentityDictionaryFallbackTelemetry.ts
 * @section Institutional Identity - Fallback Telemetry Dispatcher (Atom)
 * @description Átomo encargado exclusivamente de emitir señales SRE conformes a
 * `TelemetrySignalSchema` cuando la carga de diccionario de identidad conmuta hacia
 * un idioma de respaldo o al catálogo inmutable en memoria.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & ADR 0030).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa) e ISO/IEC 25010 (Observabilidad).
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
} from '@floripa-dignidade/telemetry';

const FALLBACK_ENGAGED_OPERATION_CODE: OperationCode = OperationCodeSchema.parse(
  'IDENTITY_PAGE_FALLBACK_APPLIED',
);

/**
 * @interface IEmitIdentityFallbackTelemetryParameters
 * @description Contrato inmutable de entrada para auditar la activación de respaldo lingüístico.
 */
export interface IEmitIdentityFallbackTelemetryParameters {
  readonly moduleIdentifierLiteral: ModuleIdentifier;
  readonly requestedLocaleLiteral: string;
  readonly resolvedSourceLiteral: string;
  readonly correlationIdentifier: CorrelationIdentifier;
}

/**
 * Emite de forma no bloqueante una señal de advertencia cuando se aplica respaldo i18n.
 *
 * @param parametersSnapshot - Módulo emisor, idioma solicitado, fuente aplicada y correlación.
 */
export const EmitIdentityDictionaryFallbackTelemetry = (
  parametersSnapshot: IEmitIdentityFallbackTelemetryParameters,
): void => {
  const {
    moduleIdentifierLiteral,
    requestedLocaleLiteral,
    resolvedSourceLiteral,
    correlationIdentifier,
  } = parametersSnapshot;

  void EmitTelemetrySignal({
    occurrenceTimestampISO: new Date().toISOString(),
    severityLevelLiteral: 'WARNING',
    moduleIdentifierLiteral,
    operationCodeLiteral: FALLBACK_ENGAGED_OPERATION_CODE,
    correlationIdentifier,
    messageContentLiteral: `Fallback aplicado en diccionario de identidad: [${requestedLocaleLiteral}] -> [${resolvedSourceLiteral}].`,
    semanticIntentTag: 'I18N_FALLBACK_ENGAGED',
    contextMetadataSnapshot: Object.freeze({
      requestedLocaleLiteral,
      resolvedSourceLiteral,
    }),
  });
};
