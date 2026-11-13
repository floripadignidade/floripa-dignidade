/**
 * @section Localized Layout Logic - Navigation Header Dictionary Loader (Atom)
 * @description Átomo encargado de cargar y validar contra `MainNavigationHeaderI18nSchema`
 * el diccionario de navegación institucional siguiendo la cascada resiliente de ADR 0030:
 * `locale solicitado → idioma base sin región → idioma fuente (pt-BR) → fallback en memoria`,
 * garantizando inmunidad total frente a pantallas en blanco o 404 por falta de traducciones
 * y eliminando cualquier aserción no nula para cumplimiento de linting estricto.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & ADR 0030).
 * Normas: BCP 47 (RFC 5646), ISO/IEC 11179 e ISO/IEC 25010 (Confiabilidad y Disponibilidad).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import {
  DEFAULT_LOCALE_IDENTIFIER,
  SUPPORTED_LOCALES_REGISTRY,
} from '@floripa-dignidade/contracts';
import {
  type IMainNavigationHeaderI18n,
  MainNavigationHeaderI18nSchema,
} from '@floripa-dignidade/shared-ui-contracts';
import {
  type CorrelationIdentifier,
  EmitTelemetrySignal,
  GenerateCorrelationIdentifier,
  type ModuleIdentifier,
  type OperationCode,
  TraceExecutionTime,
} from '@floripa-dignidade/telemetry';

const HEADER_LOADER_MODULE_IDENTIFIER =
  'LOCALIZED_LAYOUT_HEADER_DICTIONARY_LOADER' as ModuleIdentifier;

/**
 * Respaldo canónico institucional en memoria para idioma portugués (Fuente de Verdad).
 */
const CANONICAL_PORTUGUESE_HEADER_FALLBACK: IMainNavigationHeaderI18n = Object.freeze({
  navigationPaths: Object.freeze({
    identity: 'Identidade',
    transparency: 'Transparência',
    press: 'Imprensa & Voz',
    complaint: 'Denúncia Cívica',
  }),
  actions: Object.freeze({
    donateCallToAction: 'Apoiar Causa',
    searchPlaceholder: 'Buscar no observatório...',
    mobileMenuToggle: 'Alternar menu',
    reportEmergencyLabel: 'Denúncia Urgente',
  }),
});

/**
 * Catálogo inmutable de diccionarios de respaldo indexados por código de idioma base ISO 639-1.
 */
const IN_MEMORY_HEADER_FALLBACKS: Readonly<Record<string, IMainNavigationHeaderI18n>> =
  Object.freeze({
    pt: CANONICAL_PORTUGUESE_HEADER_FALLBACK,
    es: Object.freeze({
      navigationPaths: Object.freeze({
        identity: 'Identidad',
        transparency: 'Transparencia',
        press: 'Prensa y Voz',
        complaint: 'Denuncia Cívica',
      }),
      actions: Object.freeze({
        donateCallToAction: 'Apoyar Causa',
        searchPlaceholder: 'Buscar en el observatorio...',
        mobileMenuToggle: 'Alternar menú',
        reportEmergencyLabel: 'Denuncia Urgente',
      }),
    }),
    en: Object.freeze({
      navigationPaths: Object.freeze({
        identity: 'Identity',
        transparency: 'Transparency',
        press: 'Press & Voice',
        complaint: 'Citizen Report',
      }),
      actions: Object.freeze({
        donateCallToAction: 'Support Cause',
        searchPlaceholder: 'Search observatory...',
        mobileMenuToggle: 'Toggle menu',
        reportEmergencyLabel: 'Urgent Report',
      }),
    }),
  });

const extractHeaderCandidate = (snapshot: Readonly<Record<string, unknown>>): unknown => {
  const entry = snapshot['shared/ui-contracts'];
  if (typeof entry === 'object' && entry !== null && !Array.isArray(entry)) {
    return (entry as Record<string, unknown>)['header'] ?? entry;
  }
  return snapshot['shared/composite-ui'];
};

const buildLocaleCascadeCandidatesCollection = (
  requestedLocaleLiteral: string,
): readonly string[] => {
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

const tryReadValidatedHeaderForLocaleAction = async (
  candidateLocaleLiteral: string,
): Promise<IMainNavigationHeaderI18n | null> => {
  try {
    const importedModule = (await import(
      `../../i18n/dictionaries/${candidateLocaleLiteral}.json`
    )) as {
      readonly default?: Readonly<Record<string, unknown>>;
    };
    if (!importedModule.default) return null;

    const candidatePayload = extractHeaderCandidate(importedModule.default);
    const validationResult = MainNavigationHeaderI18nSchema.safeParse(candidatePayload);
    return validationResult.success ? validationResult.data : null;
  } catch {
    return null;
  }
};

const resolveInMemoryHeaderFallback = (
  requestedLocaleLiteral: string,
): IMainNavigationHeaderI18n => {
  const baseLanguageCode = requestedLocaleLiteral.split('-')[0]?.toLowerCase() ?? 'pt';
  const matchingFallback = IN_MEMORY_HEADER_FALLBACKS[baseLanguageCode];

  return matchingFallback ?? CANONICAL_PORTUGUESE_HEADER_FALLBACK;
};

const emitFallbackWarningTelemetryAction = (
  requestedLocaleLiteral: string,
  resolvedSourceLiteral: string,
  correlationIdentifier: CorrelationIdentifier,
): void => {
  void EmitTelemetrySignal({
    occurrenceTimestampISO: new Date().toISOString(),
    severityLevelLiteral: 'WARNING',
    moduleIdentifierLiteral: HEADER_LOADER_MODULE_IDENTIFIER,
    operationCodeLiteral: 'HEADER_DICTIONARY_FALLBACK_APPLIED' as OperationCode,
    correlationIdentifier,
    messageContentLiteral: `Cascada de fallback para encabezado: [${requestedLocaleLiteral}] -> [${resolvedSourceLiteral}].`,
    semanticIntentTag: 'I18N_FALLBACK_ENGAGED',
    contextMetadataSnapshot: { requestedLocaleLiteral, resolvedSourceLiteral },
  });
};

export const LoadNavigationHeaderDictionary = async (
  validatedLocaleLiteral: string,
): Promise<IMainNavigationHeaderI18n> => {
  const correlationIdentifier = GenerateCorrelationIdentifier();

  return await TraceExecutionTime(
    HEADER_LOADER_MODULE_IDENTIFIER,
    'LOAD_NAVIGATION_HEADER_DICTIONARY' as OperationCode,
    correlationIdentifier,
    async (): Promise<IMainNavigationHeaderI18n> => {
      const cascadeCandidates = buildLocaleCascadeCandidatesCollection(validatedLocaleLiteral);

      for (const candidateLocale of cascadeCandidates) {
        const validatedHeaderSnapshot =
          await tryReadValidatedHeaderForLocaleAction(candidateLocale);
        if (validatedHeaderSnapshot !== null) {
          if (candidateLocale !== validatedLocaleLiteral) {
            emitFallbackWarningTelemetryAction(
              validatedLocaleLiteral,
              candidateLocale,
              correlationIdentifier,
            );
          }
          return validatedHeaderSnapshot;
        }
      }

      emitFallbackWarningTelemetryAction(
        validatedLocaleLiteral,
        'IN_MEMORY_INSTITUTIONAL_FALLBACK',
        correlationIdentifier,
      );
      return resolveInMemoryHeaderFallback(validatedLocaleLiteral);
    },
  );
};
