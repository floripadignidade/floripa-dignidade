/**
 * @section Frontpage Logic - Resilient Dictionary Ingestion Orchestrator
 * @description Carga y valida contra Zod los diccionarios de la Frontpage y del
 * formulario de suscripción desde los artefactos compilados por el Weaver, aplicando
 * la cascada resiliente de ADR 0030 (`locale → idioma base → pt-BR → fallback en memoria`)
 * con medición `TraceExecutionTime` y telemetría de advertencia en contingencias.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & ADR 0030).
 * Normas: BCP 47 (RFC 5646), ISO/IEC 11179 e ISO/IEC 25010 (Disponibilidad y Confiabilidad).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import type { ZodType } from 'zod';

import {
  DEFAULT_LOCALE_IDENTIFIER,
  SUPPORTED_LOCALES_REGISTRY,
  SupportedLocaleSchema,
} from '@floripa-dignidade/contracts';
import { ValidationException } from '@floripa-dignidade/exceptions';
import {
  type INewsletterSubscriptionFormI18n,
  NewsletterSubscriptionFormI18nSchema,
} from '@floripa-dignidade/shared-ui-contracts';
import {
  type CorrelationIdentifier,
  EmitTelemetrySignal,
  GenerateCorrelationIdentifier,
  type ModuleIdentifier,
  type OperationCode,
  TraceExecutionTime,
} from '@floripa-dignidade/telemetry';

import { FrontpageI18nSchema, type IFrontpageI18n } from '../schemas/FrontpageI18n.schema';
import { ResolveFrontpageInMemoryFallback } from './FrontpageFallbackDictionaries';

const FRONTPAGE_LOADER_MODULE_IDENTIFIER =
  'FRONTPAGE_DICTIONARY_LOADER_ORCHESTRATOR' as ModuleIdentifier;

export interface IFrontpageDictionariesSnapshot {
  readonly localizedContent: IFrontpageI18n;
  readonly newsletterUi: INewsletterSubscriptionFormI18n;
}

const buildLocaleCascadeCollection = (requestedLocaleLiteral: string): readonly string[] => {
  const baseLanguageCode = requestedLocaleLiteral.split('-')[0]?.toLowerCase() ?? '';
  const baseEntry = SUPPORTED_LOCALES_REGISTRY.find(
    (entry) =>
      entry.isEnabledBoolean && entry.iso639LanguageCodeLiteral.toLowerCase() === baseLanguageCode,
  );

  return Object.freeze(
    Array.from(
      new Set(
        [requestedLocaleLiteral, baseEntry?.localeCodeLiteral, DEFAULT_LOCALE_IDENTIFIER].filter(
          Boolean,
        ),
      ),
    ) as string[],
  );
};

const extractSectionCandidate = (
  snapshot: Readonly<Record<string, unknown>>,
  primaryKey: string,
  namespaceKey: string,
  legacyAliasKey: string,
): unknown => {
  const primaryEntry = snapshot[primaryKey];
  if (typeof primaryEntry === 'object' && primaryEntry !== null && !Array.isArray(primaryEntry)) {
    return (primaryEntry as Record<string, unknown>)[namespaceKey] ?? primaryEntry;
  }
  return snapshot[legacyAliasKey];
};

const tryLoadUnifiedDictionaryAction = async (
  localeCodeLiteral: string,
): Promise<Readonly<Record<string, unknown>> | null> => {
  try {
    const importedModule = (await import(`../../i18n/dictionaries/${localeCodeLiteral}.json`)) as {
      readonly default?: Readonly<Record<string, unknown>>;
    };
    return importedModule.default ?? null;
  } catch {
    return null;
  }
};

const resolveSectionWithCascadeAction = <TSection>(
  requestedLocaleLiteral: string,
  dictionariesMap: ReadonlyMap<string, Readonly<Record<string, unknown>>>,
  cascadeCollection: readonly string[],
  sectionSchema: ZodType<TSection>,
  extractCandidateAction: (snapshot: Readonly<Record<string, unknown>>) => unknown,
  fallbackSnapshot: TSection,
  sectionTagLiteral: string,
  correlationIdentifier: CorrelationIdentifier,
): TSection => {
  for (const candidateLocale of cascadeCollection) {
    const snapshot = dictionariesMap.get(candidateLocale);
    if (!snapshot) continue;

    const validationResult = sectionSchema.safeParse(extractCandidateAction(snapshot));
    if (validationResult.success) {
      if (candidateLocale !== requestedLocaleLiteral) {
        void EmitTelemetrySignal({
          occurrenceTimestampISO: new Date().toISOString(),
          severityLevelLiteral: 'WARNING',
          moduleIdentifierLiteral: FRONTPAGE_LOADER_MODULE_IDENTIFIER,
          operationCodeLiteral: 'FRONTPAGE_DICTIONARY_FALLBACK_APPLIED' as OperationCode,
          correlationIdentifier,
          messageContentLiteral: `Fallback para [${sectionTagLiteral}]: [${requestedLocaleLiteral}] -> [${candidateLocale}].`,
          semanticIntentTag: 'I18N_FALLBACK_ENGAGED',
          contextMetadataSnapshot: {
            sectionTagLiteral,
            requestedLocaleLiteral,
            resolvedSourceLiteral: candidateLocale,
          },
        });
      }
      return validationResult.data;
    }
  }

  void EmitTelemetrySignal({
    occurrenceTimestampISO: new Date().toISOString(),
    severityLevelLiteral: 'WARNING',
    moduleIdentifierLiteral: FRONTPAGE_LOADER_MODULE_IDENTIFIER,
    operationCodeLiteral: 'FRONTPAGE_IN_MEMORY_FALLBACK_APPLIED' as OperationCode,
    correlationIdentifier,
    messageContentLiteral: `Respaldo en memoria para [${sectionTagLiteral}] en [${requestedLocaleLiteral}].`,
    semanticIntentTag: 'I18N_FALLBACK_ENGAGED',
    contextMetadataSnapshot: {
      sectionTagLiteral,
      requestedLocaleLiteral,
      resolvedSourceLiteral: 'IN_MEMORY_FALLBACK',
    },
  });

  return fallbackSnapshot;
};

export const LoadFrontpageDictionaries = async (
  validatedLocaleIdentifier: string,
): Promise<IFrontpageDictionariesSnapshot> => {
  const localeValidation = SupportedLocaleSchema.safeParse(validatedLocaleIdentifier);
  if (!localeValidation.success) {
    throw new ValidationException('IDENTIFICADOR_IDIOMA_FRONTPAGE_INVALIDO', {
      attemptedLocaleLiteral: validatedLocaleIdentifier,
    });
  }

  const verifiedLocaleLiteral = localeValidation.data;
  const correlationIdentifier = GenerateCorrelationIdentifier();

  return await TraceExecutionTime(
    FRONTPAGE_LOADER_MODULE_IDENTIFIER,
    'LOAD_FRONTPAGE_DICTIONARIES' as OperationCode,
    correlationIdentifier,
    async (): Promise<IFrontpageDictionariesSnapshot> => {
      const cascadeCollection = buildLocaleCascadeCollection(verifiedLocaleLiteral);
      const loadedEntries = await Promise.all(
        cascadeCollection.map(
          async (locale) => [locale, await tryLoadUnifiedDictionaryAction(locale)] as const,
        ),
      );

      const dictionariesMap = new Map<string, Readonly<Record<string, unknown>>>();
      for (const [locale, snapshot] of loadedEntries) {
        if (snapshot !== null) dictionariesMap.set(locale, snapshot);
      }

      const inMemoryFallback = ResolveFrontpageInMemoryFallback(verifiedLocaleLiteral);

      const localizedContent = resolveSectionWithCascadeAction(
        verifiedLocaleLiteral,
        dictionariesMap,
        cascadeCollection,
        FrontpageI18nSchema,
        (s) => extractSectionCandidate(s, 'apps/floripa-dignidade', 'frontpage', 'apps/frontpage'),
        inMemoryFallback.localizedContent,
        'FRONTPAGE_CONTENT',
        correlationIdentifier,
      );

      const newsletterUi = resolveSectionWithCascadeAction(
        verifiedLocaleLiteral,
        dictionariesMap,
        cascadeCollection,
        NewsletterSubscriptionFormI18nSchema,
        (s) =>
          extractSectionCandidate(
            s,
            'shared/ui-contracts',
            'newsletterForm',
            'shared/ui-primitives',
          ),
        inMemoryFallback.newsletterUi,
        'NEWSLETTER_UI',
        correlationIdentifier,
      );

      return Object.freeze({ localizedContent, newsletterUi });
    },
  );
};
