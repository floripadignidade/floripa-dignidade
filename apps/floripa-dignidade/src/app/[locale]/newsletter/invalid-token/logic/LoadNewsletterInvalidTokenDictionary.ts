/**
 * @section Newsletter Invalid Token Logic - Resilient Dictionary Loader (Atom)
 * @description Carga y valida contra `NewsletterInvalidTokenI18nSchema` el diccionario
 * de la vista de token inválido aplicando la cascada ADR 0030 (`diccionario unificado
 * compilado → silo local por carpeta de idioma → idioma base → pt-BR → respaldo en memoria`),
 * con rutas estáticamente analizables por Next.js 16 Turbopack y complejidad ciclomática <= 5.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & ADR 0030).
 * Normas: BCP 47 (RFC 5646), ISO/IEC 11179 e ISO/IEC 25010 (Disponibilidad y Mantenibilidad).
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
  type INewsletterInvalidTokenI18n,
  NewsletterInvalidTokenI18nSchema,
} from '../i18n/schemas/InvalidToken.i18n.schema';
import { ResolveNewsletterInvalidTokenInMemoryFallback } from './NewsletterInvalidTokenFallbackDictionaries';

const LOADER_MODULE_IDENTIFIER = 'NEWSLETTER_INVALID_TOKEN_DICTIONARY_LOADER' as ModuleIdentifier;

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

  return entryNode['invalidToken'] ?? entryNode['common'] ?? entryNode;
};

const extractNestedInvalidTokenEntry = (unifiedSnapshot: TPlainRecord): unknown => {
  const appsNode = asPlainRecord(unifiedSnapshot['apps']);
  const portalNode = asPlainRecord(appsNode?.['floripa-dignidade']);
  const newsletterNode = asPlainRecord(portalNode?.['newsletter']);
  const nestedInvalidToken = asPlainRecord(newsletterNode?.['invalid-token']);

  return unwrapNamespaceEntry(nestedInvalidToken);
};

const extractCompiledInvalidTokenCandidate = (unifiedSnapshot: TPlainRecord): unknown => {
  const directModuleEntry = asPlainRecord(
    unifiedSnapshot['apps/floripa-dignidade/newsletter/invalid-token'],
  );

  return unwrapNamespaceEntry(directModuleEntry) ?? extractNestedInvalidTokenEntry(unifiedSnapshot);
};

const findActiveBaseLocaleEntry = (baseLanguageCode: string) =>
  SUPPORTED_LOCALES_REGISTRY.find(
    (entry) =>
      entry.isEnabledBoolean && entry.iso639LanguageCodeLiteral.toLowerCase() === baseLanguageCode,
  );

const buildLocaleCascadeCollection = (requestedLocaleLiteral: string): readonly string[] => {
  const baseLanguageCode = requestedLocaleLiteral.split('-')[0]?.toLowerCase() ?? '';
  const baseEntry = findActiveBaseLocaleEntry(baseLanguageCode);

  const rawCandidatesCollection = [
    requestedLocaleLiteral,
    baseEntry?.localeCodeLiteral,
    DEFAULT_LOCALE_IDENTIFIER,
  ].filter((candidate): candidate is string => Boolean(candidate));

  return Object.freeze(Array.from(new Set(rawCandidatesCollection)));
};

const tryResolveFromUnifiedDictionaryAction = async (
  localeCodeLiteral: string,
): Promise<INewsletterInvalidTokenI18n | null> => {
  try {
    const importedModule = (await import(
      `../../../../i18n/dictionaries/${localeCodeLiteral}.json`
    )) as {
      readonly default?: TPlainRecord;
    };
    if (!importedModule.default) return null;

    const candidatePayload = extractCompiledInvalidTokenCandidate(importedModule.default);
    const validationResult = NewsletterInvalidTokenI18nSchema.safeParse(candidatePayload);
    return validationResult.success ? validationResult.data : null;
  } catch {
    return null;
  }
};

const tryResolveFromLocalSiloAction = async (
  localeCodeLiteral: string,
): Promise<INewsletterInvalidTokenI18n | null> => {
  try {
    const importedModule = (await import(`../i18n/${localeCodeLiteral}/invalidToken.json`)) as {
      readonly default?: unknown;
    };
    const validationResult = NewsletterInvalidTokenI18nSchema.safeParse(importedModule.default);
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
    operationCodeLiteral: 'INVALID_TOKEN_DICTIONARY_FALLBACK_APPLIED' as OperationCode,
    correlationIdentifier,
    messageContentLiteral: `Fallback aplicado para vista de token inválido en [${requestedLocaleLiteral}] -> [${resolvedSourceLiteral}].`,
    semanticIntentTag: 'I18N_FALLBACK_ENGAGED',
    contextMetadataSnapshot: Object.freeze({
      requestedLocaleLiteral,
      resolvedSourceLiteral,
    }),
  });
};

/**
 * Carga y valida el diccionario de la vista de token inválido con cascada resiliente.
 *
 * @param validatedLocaleIdentifier - Código BCP 47 validado por el segmento `[locale]`.
 * @returns {Promise<INewsletterInvalidTokenI18n>} Diccionario validado y sellado.
 * @throws {ValidationException} Si el identificador de idioma incumple `SupportedLocaleSchema`.
 */
export const LoadNewsletterInvalidTokenDictionary = async (
  validatedLocaleIdentifier: string,
): Promise<INewsletterInvalidTokenI18n> => {
  const localeValidation = SupportedLocaleSchema.safeParse(validatedLocaleIdentifier);
  if (!localeValidation.success) {
    throw new ValidationException('IDENTIFICADOR_IDIOMA_INVALID_TOKEN_INVALIDO', {
      attemptedLocaleLiteral: validatedLocaleIdentifier,
    });
  }

  const verifiedLocaleLiteral = localeValidation.data;
  const correlationIdentifier = GenerateCorrelationIdentifier();

  return await TraceExecutionTime(
    LOADER_MODULE_IDENTIFIER,
    'LOAD_NEWSLETTER_INVALID_TOKEN_DICTIONARY' as OperationCode,
    correlationIdentifier,
    async (): Promise<INewsletterInvalidTokenI18n> => {
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
      return ResolveNewsletterInvalidTokenInMemoryFallback(verifiedLocaleLiteral);
    },
  );
};
