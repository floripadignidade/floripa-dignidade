/**
 * @file apps/floripa-dignidade/src/app/[locale]/identidad/logic/LoadIdentityPageDictionary.ts
 * @section Institutional Identity - Resilient Dictionary Loader (Atom)
 * @description Carga y certifica el diccionario de identidad institucional siguiendo
 * la cascada ADR 0030: unificado compilado -> silo local -> idioma base -> pt-BR -> memoria.
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
  ModuleIdentifierSchema,
  type OperationCode,
  OperationCodeSchema,
  TraceExecutionTime,
} from '@floripa-dignidade/telemetry';

import {
  IdentityPageI18nSchema,
  type IIdentityPageI18n,
} from '../i18n/schemas/IdentityPage.i18n.schema';
import { ResolveIdentityPageInMemoryFallback } from './IdentityPageFallbackDictionaries';

const LOADER_MODULE_IDENTIFIER: ModuleIdentifier = ModuleIdentifierSchema.parse(
  'IDENTITY_PAGE_DICTIONARY_LOADER',
);

const LOAD_DICTIONARY_OPERATION_CODE: OperationCode = OperationCodeSchema.parse(
  'LOAD_IDENTITY_PAGE_DICTIONARY',
);

const FALLBACK_ENGAGED_OPERATION_CODE: OperationCode = OperationCodeSchema.parse(
  'IDENTITY_PAGE_FALLBACK_APPLIED',
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

const extractNestedIdentityEntry = (unifiedSnapshot: TPlainRecord): unknown => {
  const directEntry = asPlainRecord(unifiedSnapshot['apps/floripa-dignidade/identidad']);
  if (directEntry) {
    return directEntry['identity'] ?? directEntry['common'] ?? directEntry;
  }

  const appsNode = asPlainRecord(unifiedSnapshot['apps']);
  const portalNode = asPlainRecord(appsNode?.['floripa-dignidade']);
  const identityNode = asPlainRecord(portalNode?.['identidad']);

  return identityNode?.['identity'] ?? identityNode?.['common'] ?? identityNode;
};

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

const tryResolveFromUnifiedDictionaryAction = async (
  localeCodeLiteral: string,
): Promise<IIdentityPageI18n | null> => {
  try {
    const importedModule = (await import(
      `../../../../i18n/dictionaries/${localeCodeLiteral}.json`
    )) as {
      readonly default?: TPlainRecord;
    };
    if (!importedModule.default) return null;

    const candidatePayload = extractNestedIdentityEntry(importedModule.default);
    const validationResult = IdentityPageI18nSchema.safeParse(candidatePayload);
    return validationResult.success ? validationResult.data : null;
  } catch {
    return null;
  }
};

const tryResolveFromLocalSiloAction = async (
  localeCodeLiteral: string,
): Promise<IIdentityPageI18n | null> => {
  try {
    const importedModule = (await import(`../i18n/${localeCodeLiteral}/identity.json`)) as {
      readonly default?: unknown;
    };
    const validationResult = IdentityPageI18nSchema.safeParse(importedModule.default);
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

/**
 * Carga y valida el diccionario de identidad institucional aplicando cascada resiliente.
 *
 * @param validatedLocaleIdentifier - Código BCP 47 validado por el segmento `[locale]`.
 * @returns {Promise<IIdentityPageI18n>} Diccionario certificado e inmutable.
 * @throws {ValidationException} Si el idioma solicitado no pertenece a `SupportedLocaleSchema`.
 */
export const LoadIdentityPageDictionary = async (
  validatedLocaleIdentifier: string,
): Promise<IIdentityPageI18n> => {
  const localeValidation = SupportedLocaleSchema.safeParse(validatedLocaleIdentifier);
  if (!localeValidation.success) {
    throw new ValidationException('IDENTIFICADOR_IDIOMA_IDENTIDAD_INVALIDO', {
      attemptedLocaleLiteral: validatedLocaleIdentifier,
    });
  }

  const verifiedLocaleLiteral = localeValidation.data;
  const correlationIdentifier = GenerateCorrelationIdentifier();

  return await TraceExecutionTime(
    LOADER_MODULE_IDENTIFIER,
    LOAD_DICTIONARY_OPERATION_CODE,
    correlationIdentifier,
    async (): Promise<IIdentityPageI18n> => {
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
      return ResolveIdentityPageInMemoryFallback(verifiedLocaleLiteral);
    },
  );
};
