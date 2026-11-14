'use client';

/**
 * @section Frontpage Hooks - Feature Card Exposure Telemetry (Atom)
 * @description Hook atómico encargado de registrar la exposición visual de una tarjeta
 * de propuesta de valor en el viewport del ciudadano. Emite señales conformes a
 * `TelemetrySignalSchema` y previene emisiones duplicadas en React 19 Strict Mode.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Clean Paths).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa) e ISO/IEC 25010 (Observabilidad y Rendimiento).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { useEffect, useRef } from 'react';

import {
  EmitTelemetrySignal,
  GenerateCorrelationIdentifier,
  type ModuleIdentifier,
  type OperationCode,
} from '@floripa-dignidade/telemetry';

import type { TFeatureActionVisualVariant } from '../../schemas/FeatureActionCard.schema';

const ATOM_MODULE_IDENTIFIER = 'FEATURE_ACTION_CARD_ATOM' as ModuleIdentifier;

/**
 * @interface IFeatureCardExposureTelemetryParameters
 * @description Contrato inmutable de contexto requerido para auditar la exposición de la tarjeta.
 */
export interface IFeatureCardExposureTelemetryParameters {
  readonly headlineTitleLiteral: string;
  readonly featureIdentifierLiteral: string;
  readonly visualVariantLiteral: TFeatureActionVisualVariant;
}

/**
 * Emite una señal telemétrica validada cuando una tarjeta de funcionalidad se presenta en pantalla.
 *
 * @param parametersSnapshot - Título localizado, identificador técnico y variante cromática activa.
 */
export const useFeatureCardExposureTelemetry = (
  parametersSnapshot: IFeatureCardExposureTelemetryParameters,
): void => {
  const { headlineTitleLiteral, featureIdentifierLiteral, visualVariantLiteral } =
    parametersSnapshot;

  const lastEmittedSignatureReference = useRef<string>('');

  useEffect(() => {
    const exposureSignatureLiteral = `${featureIdentifierLiteral}::${visualVariantLiteral}::${headlineTitleLiteral}`;

    if (lastEmittedSignatureReference.current === exposureSignatureLiteral) {
      return;
    }
    lastEmittedSignatureReference.current = exposureSignatureLiteral;

    const occurrenceTimestampISO = new Date().toISOString();

    void EmitTelemetrySignal({
      occurrenceTimestampISO,
      severityLevelLiteral: 'INFO',
      moduleIdentifierLiteral: ATOM_MODULE_IDENTIFIER,
      operationCodeLiteral: 'FEATURE_CARD_EXPOSED' as OperationCode,
      correlationIdentifier: GenerateCorrelationIdentifier(),
      messageContentLiteral: `Componente visual presentado al ciudadano: [${headlineTitleLiteral}].`,
      semanticIntentTag: 'UI_VISIBILITY_TRACE',
      contextMetadataSnapshot: Object.freeze({
        featureIdentifierLiteral,
        visualVariantLiteral,
        renderTimestampISO: occurrenceTimestampISO,
      }),
    });
  }, [headlineTitleLiteral, featureIdentifierLiteral, visualVariantLiteral]);
};
