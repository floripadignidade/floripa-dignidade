/**
 * @section Newsletter Welcome Logic - Resilient Dictionary Loader (Atom)
 * @description Carga y valida el diccionario de la página de bienvenida siguiendo la
 * cascada ADR 0030 (`diccionario unificado compilado → silo local → idioma base → pt-BR →
 * respaldo inmutable en memoria`), soportando claves con barra y árboles anidados sin
 * generar errores 404 ante claves secundarias faltantes.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & ADR 0030).
 * Normas: BCP 47 (RFC 5646), ISO/IEC 11179 e ISO/IEC 25010 (Disponibilidad y Confiabilidad).
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
  type INewsletterWelcomeI18n,
  NewsletterWelcomeI18nSchema,
} from '../schemas/NewsletterWelcomeI18n.schema';
import { ResolveNewsletterWelcomeInMemoryFallback } from './NewsletterWelcomeFallbackDictionaries';

const WELCOME_LOADER_MODULE_IDENTIFIER = 'NEWSLETTER_WELCOME_DICTIONARY_LOADER' as ModuleIdentifier;

type TPlainRecord = Readonly<Record<string, unknown>>;

const findActiveBaseLocaleEntry = (baseLanguageCode: string) => {
  return SUPPORTED_LOCALES_REGISTRY.find(
    (entry) =>
      entry.isEnabledBoolean && entry.iso639LanguageCodeLiteral.toLowerCase() === baseLanguageCode,
  );
};

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

const extractDirectWelcomeEntry = (unifiedSnapshot: TPlainRecord): unknown => {
  const directModuleEntry = unifiedSnapshot['apps/floripa-dignidade/newsletter/welcome'] as
    | TPlainRecord
    | undefined;
  if (!directModuleEntry) return undefined;
  return directModuleEntry['newsletterWelcome'] ?? directModuleEntry['common'] ?? directModuleEntry;
};

const extractNestedWelcomeEntry = (unifiedSnapshot: TPlainRecord): unknown => {
  const appsNode = unifiedSnapshot['apps'] as TPlainRecord | undefined;
  const portalNode = appsNode?.['floripa-dignidade'] as TPlainRecord | undefined;
  if (!portalNode) return undefined;

  const welcomeDirect = portalNode['newsletterWelcome'];
  if (welcomeDirect !== undefined) return welcomeDirect;

  const newsletterNode = portalNode['newsletter'] as TPlainRecord | undefined;
  const nestedWelcome = newsletterNode?.['welcome'] as TPlainRecord | undefined;

  return nestedWelcome?.['newsletterWelcome'] ?? nestedWelcome?.['common'] ?? nestedWelcome;
};

const extractCompiledWelcomeCandidate = (unifiedSnapshot: TPlainRecord): unknown => {
  return extractDirectWelcomeEntry(unifiedSnapshot) ?? extractNestedWelcomeEntry(unifiedSnapshot);
};

const tryResolveFromUnifiedDictionaryAction = async (
  localeCodeLiteral: string,
): Promise<INewsletterWelcomeI18n | null> => {
  try {
    const importedModule = (await import(
      `../../../../i18n/dictionaries/${localeCodeLiteral}.json`
    )) as {
      readonly default?: TPlainRecord;
    };
    if (!importedModule.default) return null;

    const candidatePayload = extractCompiledWelcomeCandidate(importedModule.default);
    const validationResult = NewsletterWelcomeI18nSchema.safeParse(candidatePayload);
    return validationResult.success ? validationResult.data : null;
  } catch {
    return null;
  }
};

const tryResolveFromLocalSiloAction = async (
  localeCodeLiteral: string,
): Promise<INewsletterWelcomeI18n | null> => {
  const candidatePaths = [
    `../i18n/${localeCodeLiteral}/newsletterWelcome.json`,
    `../i18n/${localeCodeLiteral}.json`,
  ];

  for (const relativePath of candidatePaths) {
    try {
      const importedModule = (await import(relativePath)) as { readonly default?: unknown };
      const validationResult = NewsletterWelcomeI18nSchema.safeParse(importedModule.default);
      if (validationResult.success) return validationResult.data;
    } catch {
      continue;
    }
  }

  return null;
};

const emitFallbackWarningTelemetryAction = (
  requestedLocaleLiteral: string,
  resolvedSourceLiteral: string,
  correlationIdentifier: CorrelationIdentifier,
): void => {
  void EmitTelemetrySignal({
    occurrenceTimestampISO: new Date().toISOString(),
    severityLevelLiteral: 'WARNING',
    moduleIdentifierLiteral: WELCOME_LOADER_MODULE_IDENTIFIER,
    operationCodeLiteral: 'WELCOME_DICTIONARY_FALLBACK_APPLIED' as OperationCode,
    correlationIdentifier,
    messageContentLiteral: `Fallback aplicado para bienvenida de newsletter en [${requestedLocaleLiteral}] -> [${resolvedSourceLiteral}].`,
    semanticIntentTag: 'I18N_FALLBACK_ENGAGED',
    contextMetadataSnapshot: { requestedLocaleLiteral, resolvedSourceLiteral },
  });
};

export const LoadNewsletterWelcomeDictionary = async (
  validatedLocaleIdentifier: string,
): Promise<INewsletterWelcomeI18n> => {
  const localeValidation = SupportedLocaleSchema.safeParse(validatedLocaleIdentifier);
  if (!localeValidation.success) {
    throw new ValidationException('IDENTIFICADOR_IDIOMA_WELCOME_INVALIDO', {
      attemptedLocaleLiteral: validatedLocaleIdentifier,
    });
  }

  const verifiedLocaleLiteral = localeValidation.data;
  const correlationIdentifier = GenerateCorrelationIdentifier();

  return await TraceExecutionTime(
    WELCOME_LOADER_MODULE_IDENTIFIER,
    'LOAD_NEWSLETTER_WELCOME_DICTIONARY' as OperationCode,
    correlationIdentifier,
    async (): Promise<INewsletterWelcomeI18n> => {
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
      return ResolveNewsletterWelcomeInMemoryFallback(verifiedLocaleLiteral);
    },
  );
};
