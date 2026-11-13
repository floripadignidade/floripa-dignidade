/**
 * @section Observatory Logic - Resilient Dictionary Loader (Atom)
 * @description Carga y valida contra `ObservatoryI18nSchema` el diccionario localizado del
 * Observatorio de Gastos Públicos aplicando la cascada resiliente de ADR 0030:
 * `diccionario unificado compilado → silo local estático → idioma base → idioma fuente →
 * respaldo inmutable en memoria`, eliminando importaciones opacas para compatibilidad estricta
 * con Turbopack y Next.js 16 sin generar errores 404 por claves secundarias.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & ADR 0030).
 * Normas: BCP 47 (RFC 5646), ISO/IEC 11179 e ISO/IEC 25010 (Disponibilidad y Rendimiento).
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

import { type IObservatoryI18n, ObservatoryI18nSchema } from '../../i18n/ObservatoryI18n.schema';
import { ResolveObservatoryInMemoryFallback } from './ObservatoryFallbackDictionaries';

const OBSERVATORY_LOADER_MODULE_IDENTIFIER = 'OBSERVATORY_DICTIONARY_LOADER' as ModuleIdentifier;

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

const extractCompiledObservatoryCandidate = (unifiedSnapshot: TPlainRecord): unknown => {
  const slashModuleEntry = unifiedSnapshot['apps/floripa-dignidade/observatorio'] as
    | TPlainRecord
    | undefined;
  if (slashModuleEntry) {
    return slashModuleEntry['observatorio'] ?? slashModuleEntry['common'] ?? slashModuleEntry;
  }

  const portalNode = (unifiedSnapshot['apps'] as TPlainRecord | undefined)?.[
    'floripa-dignidade'
  ] as TPlainRecord | undefined;
  const observatoryNode = portalNode?.['observatorio'] as TPlainRecord | undefined;

  return observatoryNode?.['observatorio'] ?? observatoryNode?.['common'] ?? observatoryNode;
};

const tryResolveFromUnifiedDictionaryAction = async (
  localeCodeLiteral: string,
): Promise<IObservatoryI18n | null> => {
  try {
    const importedModule = (await import(
      `../../../../i18n/dictionaries/${localeCodeLiteral}.json`
    )) as {
      readonly default?: TPlainRecord;
    };
    if (!importedModule.default) return null;

    const candidatePayload = extractCompiledObservatoryCandidate(importedModule.default);
    const validationResult = ObservatoryI18nSchema.safeParse(candidatePayload);
    return validationResult.success ? validationResult.data : null;
  } catch {
    return null;
  }
};

/**
 * Resuelve el silo local mediante importación estáticamente analizable por Turbopack/Webpack.
 */
const tryResolveFromLocalSiloAction = async (
  localeCodeLiteral: string,
): Promise<IObservatoryI18n | null> => {
  try {
    const importedModule = (await import(`../../i18n/${localeCodeLiteral}.json`)) as {
      readonly default?: unknown;
    };
    const validationResult = ObservatoryI18nSchema.safeParse(importedModule.default);
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
    moduleIdentifierLiteral: OBSERVATORY_LOADER_MODULE_IDENTIFIER,
    operationCodeLiteral: 'OBSERVATORY_DICTIONARY_FALLBACK_APPLIED' as OperationCode,
    correlationIdentifier,
    messageContentLiteral: `Fallback aplicado para observatorio en [${requestedLocaleLiteral}] -> [${resolvedSourceLiteral}].`,
    semanticIntentTag: 'I18N_FALLBACK_ENGAGED',
    contextMetadataSnapshot: { requestedLocaleLiteral, resolvedSourceLiteral },
  });
};

export const LoadObservatoryDictionary = async (
  validatedLocaleIdentifier: string,
): Promise<IObservatoryI18n> => {
  const localeValidation = SupportedLocaleSchema.safeParse(validatedLocaleIdentifier);
  if (!localeValidation.success) {
    throw new ValidationException('IDENTIFICADOR_IDIOMA_OBSERVATORIO_INVALIDO', {
      attemptedLocaleLiteral: validatedLocaleIdentifier,
    });
  }

  const verifiedLocaleLiteral = localeValidation.data;
  const correlationIdentifier = GenerateCorrelationIdentifier();

  return await TraceExecutionTime(
    OBSERVATORY_LOADER_MODULE_IDENTIFIER,
    'LOAD_OBSERVATORY_DICTIONARY' as OperationCode,
    correlationIdentifier,
    async (): Promise<IObservatoryI18n> => {
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
      return ResolveObservatoryInMemoryFallback(verifiedLocaleLiteral);
    },
  );
};
