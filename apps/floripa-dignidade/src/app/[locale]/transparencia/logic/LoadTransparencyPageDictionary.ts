/**
 * @file apps/floripa-dignidade/src/app/[locale]/transparencia/logic/LoadTransparencyPageDictionary.ts
 * @section Transparency Gazette Logic - Resilient Dictionary Loader (Atom)
 * @description Carga y certifica el diccionario del Periódico de Transparencia Activa
 * aplicando la cascada resiliente de ADR 0030 (diccionario unificado compilado ->
 * silo local por idioma -> idioma base -> pt-BR -> respaldo inmutable en memoria),
 * con rutas estáticamente analizables por Turbopack y complejidad ciclomática <= 5.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & ADR 0030).
 * Normas: BCP 47 (RFC 5646), ISO/IEC 11179 (Nomenclatura Prosa) e ISO/IEC 25010.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import {
  DEFAULT_LOCALE_IDENTIFIER,
  SUPPORTED_LOCALES_REGISTRY,
  SupportedLocaleSchema,
} from '@floripa-dignidade/contracts';
import { ValidationException } from '@floripa-dignidade/exceptions';
import {
  type CorrelationIdentifier,
  EmitTelemetrySignal,
  GenerateCorrelationIdentifier,
  type ModuleIdentifier,
  ModuleIdentifierSchema,
  type OperationCode,
  OperationCodeSchema,
  TraceExecutionTime,
} from '@floripa-dignidade/telemetry';

import {
  type ITransparencyPageI18n,
  TransparencyPageI18nSchema,
} from '../i18n/schemas/TransparencyPage.i18n.schema';
import { ResolveTransparencyPageInMemoryFallback } from './TransparencyPageFallbackDictionaries';

const LOADER_MODULE_IDENTIFIER: ModuleIdentifier = ModuleIdentifierSchema.parse(
  'TRANSPARENCY_PAGE_DICTIONARY_LOADER',
);
const LOAD_OPERATION_CODE: OperationCode = OperationCodeSchema.parse(
  'LOAD_TRANSPARENCY_PAGE_DICTIONARY',
);
const FALLBACK_OPERATION_CODE: OperationCode = OperationCodeSchema.parse(
  'TRANSPARENCY_PAGE_FALLBACK_APPLIED',
);

type TPlainRecord = Readonly<Record<string, unknown>>;

const asPlainRecord = (candidateValue: unknown): TPlainRecord | undefined => {
  if (
    typeof candidateValue === 'object' &&
    candidateValue !== null &&
    !Array.isArray(candidateValue)
  ) {
    return candidateValue as TPlainRecord;
  }
  return undefined;
};

const extractCompiledTransparencyEntry = (unifiedSnapshot: TPlainRecord): unknown => {
  const directEntry = asPlainRecord(unifiedSnapshot['apps/floripa-dignidade/transparencia']);
  if (directEntry) {
    return directEntry['transparency'] ?? directEntry['common'] ?? directEntry;
  }

  const appsNode = asPlainRecord(unifiedSnapshot['apps']);
  const portalNode = asPlainRecord(appsNode?.['floripa-dignidade']);
  const transparencyNode = asPlainRecord(portalNode?.['transparencia']);

  return transparencyNode?.['transparency'] ?? transparencyNode?.['common'] ?? transparencyNode;
};

const buildLocaleCascadeCollection = (requestedLocaleLiteral: string): readonly string[] => {
  const baseLanguageCode = requestedLocaleLiteral.split('-')[0]?.toLowerCase() ?? '';
  const baseEntry = SUPPORTED_LOCALES_REGISTRY.find(
    (entry) =>
      entry.isEnabledBoolean && entry.iso639LanguageCodeLiteral.toLowerCase() === baseLanguageCode,
  );

  const candidatesCollection = [
    requestedLocaleLiteral,
    baseEntry?.localeCodeLiteral,
    DEFAULT_LOCALE_IDENTIFIER,
  ].filter((candidate): candidate is string => Boolean(candidate));

  return Object.freeze(Array.from(new Set(candidatesCollection)));
};

const tryResolveFromUnifiedDictionaryAction = async (
  localeCodeLiteral: string,
): Promise<ITransparencyPageI18n | null> => {
  try {
    const importedModule = (await import(
      `../../../i18n/dictionaries/${localeCodeLiteral}.json`
    )) as {
      readonly default?: TPlainRecord;
    };
    if (!importedModule.default) return null;

    const candidatePayload = extractCompiledTransparencyEntry(importedModule.default);
    const validationResult = TransparencyPageI18nSchema.safeParse(candidatePayload);
    return validationResult.success ? validationResult.data : null;
  } catch {
    return null;
  }
};

const tryResolveFromLocalSiloAction = async (
  localeCodeLiteral: string,
): Promise<ITransparencyPageI18n | null> => {
  try {
    const importedModule = (await import(`../i18n/${localeCodeLiteral}/transparency.json`)) as {
      readonly default?: unknown;
    };
    const validationResult = TransparencyPageI18nSchema.safeParse(importedModule.default);
    return validationResult.success ? validationResult.data : null;
  } catch {
    return null;
  }
};

const emitFallbackTelemetryAction = (
  requestedLocaleLiteral: string,
  resolvedSourceLiteral: string,
  correlationIdentifier: CorrelationIdentifier,
): void => {
  void EmitTelemetrySignal({
    occurrenceTimestampISO: new Date().toISOString(),
    severityLevelLiteral: 'WARNING',
    moduleIdentifierLiteral: LOADER_MODULE_IDENTIFIER,
    operationCodeLiteral: FALLBACK_OPERATION_CODE,
    correlationIdentifier,
    messageContentLiteral: `Fallback aplicado en diccionario de transparencia: [${requestedLocaleLiteral}] -> [${resolvedSourceLiteral}].`,
    semanticIntentTag: 'I18N_FALLBACK_ENGAGED',
    contextMetadataSnapshot: Object.freeze({
      requestedLocaleLiteral,
      resolvedSourceLiteral,
    }),
  });
};

/**
 * Carga y valida el diccionario localizado de `/[locale]/transparencia` con cascada resiliente.
 *
 * @param validatedLocaleIdentifier - Código BCP 47 validado por el segmento `[locale]`.
 * @returns {Promise<ITransparencyPageI18n>} Diccionario certificado e inmutable.
 * @throws {ValidationException} Si el idioma solicitado incumple `SupportedLocaleSchema`.
 */
export const LoadTransparencyPageDictionary = async (
  validatedLocaleIdentifier: string,
): Promise<ITransparencyPageI18n> => {
  const localeValidation = SupportedLocaleSchema.safeParse(validatedLocaleIdentifier);
  if (!localeValidation.success) {
    throw new ValidationException('IDENTIFICADOR_IDIOMA_TRANSPARENCIA_INVALIDO', {
      attemptedLocaleLiteral: validatedLocaleIdentifier,
    });
  }

  const verifiedLocaleLiteral = localeValidation.data;
  const correlationIdentifier = GenerateCorrelationIdentifier();

  return await TraceExecutionTime(
    LOADER_MODULE_IDENTIFIER,
    LOAD_OPERATION_CODE,
    correlationIdentifier,
    async (): Promise<ITransparencyPageI18n> => {
      const cascadeLocales = buildLocaleCascadeCollection(verifiedLocaleLiteral);

      for (const candidateLocale of cascadeLocales) {
        const resolvedDictionary =
          (await tryResolveFromUnifiedDictionaryAction(candidateLocale)) ??
          (await tryResolveFromLocalSiloAction(candidateLocale));

        if (resolvedDictionary !== null) {
          if (candidateLocale !== verifiedLocaleLiteral) {
            emitFallbackTelemetryAction(
              verifiedLocaleLiteral,
              candidateLocale,
              correlationIdentifier,
            );
          }
          return resolvedDictionary;
        }
      }

      emitFallbackTelemetryAction(
        verifiedLocaleLiteral,
        'IN_MEMORY_INSTITUTIONAL_FALLBACK',
        correlationIdentifier,
      );
      return ResolveTransparencyPageInMemoryFallback(verifiedLocaleLiteral);
    },
  );
};
