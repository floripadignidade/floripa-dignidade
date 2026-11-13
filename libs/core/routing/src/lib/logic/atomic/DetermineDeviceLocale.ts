/**
 * @section Routing Logic - Device Locale Inference Orchestrator
 * @description Analiza la cabecera HTTP `Accept-Language` para determinar el idioma
 * óptimo del ciudadano consultando dinámicamente el catálogo único SSOT (ADR 0030).
 * Orquesta los átomos de parseo RFC 9110 y resolución en cascada, emitiendo trazas
 * telemétricas conformes a `TelemetrySignalSchema`.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & ADR 0030).
 * Normas: BCP 47 (RFC 5646), RFC 9110, ISO/IEC 11179 e ISO/IEC 25010.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { DEFAULT_LOCALE_IDENTIFIER } from '@floripa-dignidade/contracts';
import type { ISupportedLocale } from '@floripa-dignidade/contracts';
import {
  EmitTelemetrySignal,
  GenerateCorrelationIdentifier,
  type ModuleIdentifier,
  type OperationCode,
} from '@floripa-dignidade/telemetry';

import { ParseAcceptLanguageHeader } from './ParseAcceptLanguageHeader';
import { ResolveSupportedLocaleFromRegistry } from './ResolveSupportedLocaleFromRegistry';

const ROUTING_LOCALE_SENSOR_IDENTIFIER = 'CORE_ROUTING_LOCALE_SENSOR' as ModuleIdentifier;

/**
 * Determina el identificador BCP 47 activo óptimo procesando la cabecera `Accept-Language`.
 * Soporta coincidencia exacta, mapeo de variantes regionales catalogadas y coincidencia por
 * idioma base ISO 639 sin listas fijas de idiomas.
 *
 * @param acceptLanguageHeaderLiteral - Valor crudo de la cabecera `accept-language` HTTP.
 * @param fallbackLocaleIdentifier - Idioma de respaldo (por defecto `DEFAULT_LOCALE_IDENTIFIER`).
 * @returns {ISupportedLocale} Código BCP 47 activo, validado y sellado nominalmente.
 */
export const DetermineDeviceLocale = (
  acceptLanguageHeaderLiteral: string | null,
  fallbackLocaleIdentifier: ISupportedLocale = DEFAULT_LOCALE_IDENTIFIER,
): ISupportedLocale => {
  const correlationIdentifier = GenerateCorrelationIdentifier();

  if (!acceptLanguageHeaderLiteral || acceptLanguageHeaderLiteral.trim() === '') {
    return fallbackLocaleIdentifier;
  }

  try {
    const orderedCandidatesCollection = ParseAcceptLanguageHeader(acceptLanguageHeaderLiteral);
    const resolutionSnapshot = ResolveSupportedLocaleFromRegistry(
      orderedCandidatesCollection,
      fallbackLocaleIdentifier,
    );

    void EmitTelemetrySignal({
      occurrenceTimestampISO: new Date().toISOString(),
      severityLevelLiteral: 'INFO',
      moduleIdentifierLiteral: ROUTING_LOCALE_SENSOR_IDENTIFIER,
      operationCodeLiteral: 'LOCALE_INFERENCE_RESOLVED' as OperationCode,
      correlationIdentifier,
      messageContentLiteral: `Localización resuelta: [${resolutionSnapshot.resolvedLocaleIdentifier}] vía [${resolutionSnapshot.resolutionStrategyLiteral}].`,
      semanticIntentTag: 'ROUTING_LOCALE_DETECTION',
      contextMetadataSnapshot: {
        resolvedLocaleIdentifier: resolutionSnapshot.resolvedLocaleIdentifier,
        resolutionStrategyLiteral: resolutionSnapshot.resolutionStrategyLiteral,
        matchedCandidateLiteral: resolutionSnapshot.matchedCandidateLiteral,
      },
    });

    return resolutionSnapshot.resolvedLocaleIdentifier;
  } catch (caughtError: unknown) {
    const errorDescriptionLiteral =
      caughtError instanceof Error ? caughtError.message : String(caughtError);

    void EmitTelemetrySignal({
      occurrenceTimestampISO: new Date().toISOString(),
      severityLevelLiteral: 'WARNING',
      moduleIdentifierLiteral: ROUTING_LOCALE_SENSOR_IDENTIFIER,
      operationCodeLiteral: 'LOCALE_PARSING_ANOMALY' as OperationCode,
      correlationIdentifier,
      messageContentLiteral:
        'Se detectó una irregularidad al procesar la cabecera Accept-Language.',
      semanticIntentTag: 'ROUTING_LOCALE_ANOMALY',
      contextMetadataSnapshot: {
        errorTraceLiteral: errorDescriptionLiteral,
      },
    });

    return fallbackLocaleIdentifier;
  }
};
