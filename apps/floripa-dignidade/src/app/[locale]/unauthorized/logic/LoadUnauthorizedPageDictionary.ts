/**
 * @section Security Contingency Logic - Resilient Dictionary Loader (Atom)
 * @description Carga y valida contra `UnauthorizedPageI18nSchema` el diccionario de la vista
 * `/unauthorized` aplicando la cascada ADR 0030 (`diccionario unificado compilado → silo
 * local por carpeta de idioma → idioma base → pt-BR → respaldo en memoria`) con rutas
 * estáticamente analizables por Turbopack.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & ADR 0030).
 * Normas: BCP 47 (RFC 5646), ISO/IEC 11179 e ISO/IEC 25010 (Disponibilidad).
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
  type OperationCode,
  TraceExecutionTime,
} from '@floripa-dignidade/telemetry';

import {
  type IUnauthorizedPageI18n,
  UnauthorizedPageI18nSchema,
} from '../i18n/schemas/UnauthorizedPage.i18n.schema';
import { ResolveUnauthorizedPageInMemoryFallback } from './UnauthorizedPageFallbackDictionaries';

const LOADER_MODULE_IDENTIFIER = 'UNAUTHORIZED_PAGE_DICTIONARY_LOADER' as ModuleIdentifier;

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

const unwrapNamespaceEntry = (entryNode: TPlainRecord | undefined): unknown => {
  if (!entryNode) {
    return undefined;
  }

  return entryNode['unauthorized'] ?? entryNode['common'] ?? entryNode;
};

const extractCompiledUnauthorizedCandidate = (unifiedSnapshot: TPlainRecord): unknown => {
  const directModuleEntry = asPlainRecord(unifiedSnapshot['apps/floripa-dignidade/unauthorized']);
  if (directModuleEntry) {
    return unwrapNamespaceEntry(directModuleEntry);
  }

  const appsNode = asPlainRecord(unifiedSnapshot['apps']);
  const portalNode = asPlainRecord(appsNode?.['floripa-dignidade']);
  return unwrapNamespaceEntry(asPlainRecord(portalNode?.['unauthorized']));
};

const buildLocaleCascadeCollection = (requestedLocaleLiteral: string): readonly string[] => {
  const baseLanguageCode = requestedLocaleLiteral.split('-')[0]?.toLowerCase() ?? '';
  const baseEntry = SUPPORTED_LOCALES_REGISTRY.find(
    (entry) =>
      entry.isEnabledBoolean && entry.iso639LanguageCodeLiteral.toLowerCase() === baseLanguageCode,
  );

  const rawCandidatesCollection = [
    requestedLocaleLiteral,
    baseEntry?.localeCodeLiteral,
    DEFAULT_LOCALE_IDENTIFIER,
  ].filter((candidate): candidate is string => Boolean(candidate));

  return Object.freeze(Array.from(new Set(rawCandidatesCollection)));
};

const tryResolveFromUnifiedDictionaryAction = async (
  localeCodeLiteral: string,
): Promise<IUnauthorizedPageI18n | null> => {
  try {
    const importedModule = (await import(
      `../../../i18n/dictionaries/${localeCodeLiteral}.json`
    )) as {
      readonly default?: TPlainRecord;
    };
    if (!importedModule.default) return null;

    const candidatePayload = extractCompiledUnauthorizedCandidate(importedModule.default);
    const validationResult = UnauthorizedPageI18nSchema.safeParse(candidatePayload);
    return validationResult.success ? validationResult.data : null;
  } catch {
    return null;
  }
};

const tryResolveFromLocalSiloAction = async (
  localeCodeLiteral: string,
): Promise<IUnauthorizedPageI18n | null> => {
  try {
    const importedModule = (await import(`../i18n/${localeCodeLiteral}/unauthorized.json`)) as {
      readonly default?: unknown;
    };
    const validationResult = UnauthorizedPageI18nSchema.safeParse(importedModule.default);
    return validationResult.success ? validationResult.data : null;
  } catch {
    return null;
  }
};

const emitFallbackWarningTelemetryAction = (
  requestedLocaleLiteral: string,
  resolvedSourceLiteral: string,
  correlationIdentifier: CorrelationIdentifier,
): void => {
  void EmitTelemetrySignal({
    occurrenceTimestampISO: new Date().toISOString(),
    severityLevelLiteral: 'WARNING',
    moduleIdentifierLiteral: LOADER_MODULE_IDENTIFIER,
    operationCodeLiteral: 'UNAUTHORIZED_PAGE_DICTIONARY_FALLBACK_APPLIED' as OperationCode,
    correlationIdentifier,
    messageContentLiteral: `Fallback aplicado para vista de acceso restringido en [${requestedLocaleLiteral}] -> [${resolvedSourceLiteral}].`,
    semanticIntentTag: 'I18N_FALLBACK_ENGAGED',
    contextMetadataSnapshot: Object.freeze({
      requestedLocaleLiteral,
      resolvedSourceLiteral,
    }),
  });
};

/**
 * Carga y valida el diccionario de la página de acceso no autorizado con cascada resiliente.
 *
 * @param validatedLocaleIdentifier - Código BCP 47 validado por el segmento `[locale]`.
 * @returns {Promise<IUnauthorizedPageI18n>} Diccionario validado y sellado.
 * @throws {ValidationException} Si el identificador de idioma incumple `SupportedLocaleSchema`.
 */
export const LoadUnauthorizedPageDictionary = async (
  validatedLocaleIdentifier: string,
): Promise<IUnauthorizedPageI18n> => {
  const localeValidation = SupportedLocaleSchema.safeParse(validatedLocaleIdentifier);
  if (!localeValidation.success) {
    throw new ValidationException('IDENTIFICADOR_IDIOMA_UNAUTHORIZED_INVALIDO', {
      attemptedLocaleLiteral: validatedLocaleIdentifier,
    });
  }

  const verifiedLocaleLiteral = localeValidation.data;
  const correlationIdentifier = GenerateCorrelationIdentifier();

  return await TraceExecutionTime(
    LOADER_MODULE_IDENTIFIER,
    'LOAD_UNAUTHORIZED_PAGE_DICTIONARY' as OperationCode,
    correlationIdentifier,
    async (): Promise<IUnauthorizedPageI18n> => {
      const cascadeLocales = buildLocaleCascadeCollection(verifiedLocaleLiteral);

      for (const candidateLocale of cascadeLocales) {
        const resolvedDictionary =
          (await tryResolveFromUnifiedDictionaryAction(candidateLocale)) ??
          (await tryResolveFromLocalSiloAction(candidateLocale));

        if (resolvedDictionary !== null) {
          if (candidateLocale !== verifiedLocaleLiteral) {
            emitFallbackWarningTelemetryAction(
              verifiedLocaleLiteral,
              candidateLocale,
              correlationIdentifier,
            );
          }
          return resolvedDictionary;
        }
      }

      emitFallbackWarningTelemetryAction(
        verifiedLocaleLiteral,
        'IN_MEMORY_INSTITUTIONAL_FALLBACK',
        correlationIdentifier,
      );
      return ResolveUnauthorizedPageInMemoryFallback(verifiedLocaleLiteral);
    },
  );
};
