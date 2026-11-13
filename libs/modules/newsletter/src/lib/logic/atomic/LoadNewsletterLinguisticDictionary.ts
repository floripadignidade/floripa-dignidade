/**
 * @section Newsletter Logic - Resilient Linguistic Loader (Atom)
 * @description Carga y certifica mediante Zod (`NewsletterI18nSchema`) el diccionario
 * de traducciones para el flujo de suscripción y correos transaccionales del módulo.
 * Implementa la cascada de resolución de ADR 0030 consultando `SUPPORTED_LOCALES_REGISTRY`
 * (`@floripa-dignidade/contracts`), con respaldo inmutable en memoria y telemetría SRE.
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
  SupportedLocaleSchema,
  type TSupportedLocale,
} from '@floripa-dignidade/contracts';
import {
  EmitTelemetrySignal,
  GenerateCorrelationIdentifier,
  type ModuleIdentifier,
  type OperationCode,
  TraceExecutionTime,
} from '@floripa-dignidade/telemetry';

import { type INewsletterI18n, NewsletterI18nSchema } from '../../i18n/NewsletterI18n.schema';

const LOADER_MODULE_IDENTIFIER = 'NEWSLETTER_LINGUISTIC_LOADER_ATOM' as ModuleIdentifier;

/**
 * Respaldo institucional inmutable en memoria para garantizar que el despacho de
 * confirmación nunca colapse por ausencia o corrupción de archivos en disco.
 */
const IN_MEMORY_NEWSLETTER_FALLBACK: INewsletterI18n = Object.freeze({
  email: Object.freeze({
    confirmationSubjectLiteral: 'Confirme sua inscrição | Floripa Dignidade',
    greetingLiteral: 'Olá,',
    instructionLiteral:
      'Você solicitou a entrada em nossa rede de transparência. Seu código de verificação é:',
    trackingFooterLiteral: 'ID de Rastreamento Forense:',
  }),
});

const resolveCandidateLocaleTag = (rawLocaleCandidate: string | undefined): TSupportedLocale => {
  if (!rawLocaleCandidate || rawLocaleCandidate.trim() === '') {
    return DEFAULT_LOCALE_IDENTIFIER;
  }

  const normalizedTagLiteral = rawLocaleCandidate.trim().replace(/_/g, '-');
  const exactMatchResult = SupportedLocaleSchema.safeParse(normalizedTagLiteral);
  if (exactMatchResult.success) {
    return exactMatchResult.data;
  }

  const baseLanguageCodeLiteral = normalizedTagLiteral.split('-')[0]?.toLowerCase();
  const baseLanguageActiveEntry = SUPPORTED_LOCALES_REGISTRY.find(
    (entrySnapshot) =>
      entrySnapshot.isEnabledBoolean &&
      entrySnapshot.iso639LanguageCodeLiteral.toLowerCase() === baseLanguageCodeLiteral,
  );

  return baseLanguageActiveEntry !== undefined
    ? SupportedLocaleSchema.parse(baseLanguageActiveEntry.localeCodeLiteral)
    : DEFAULT_LOCALE_IDENTIFIER;
};

const tryLoadSiloPayload = async (localeCodeLiteral: string): Promise<INewsletterI18n | null> => {
  try {
    const rawModuleSnapshot = (await import(`../../i18n/${localeCodeLiteral}.json`)) as {
      readonly default?: unknown;
    };
    const validationResult = NewsletterI18nSchema.safeParse(rawModuleSnapshot.default);

    return validationResult.success ? validationResult.data : null;
  } catch {
    return null;
  }
};

/**
 * Carga y valida el diccionario lingüístico del boletín con inmunidad ante fallos de I/O.
 *
 * @param requestedLocaleIdentifierLiteral - Código BCP 47 recibido en la solicitud.
 * @returns {Promise<INewsletterI18n>} Diccionario validado y sellado para despacho.
 */
export const LoadNewsletterLinguisticDictionary = async (
  requestedLocaleIdentifierLiteral: string,
): Promise<INewsletterI18n> => {
  const correlationIdentifier = GenerateCorrelationIdentifier();
  const targetLocaleLiteral = resolveCandidateLocaleTag(requestedLocaleIdentifierLiteral);

  return await TraceExecutionTime(
    LOADER_MODULE_IDENTIFIER,
    'LOAD_NEWSLETTER_DICTIONARY' as OperationCode,
    correlationIdentifier,
    async (): Promise<INewsletterI18n> => {
      const primaryDictionaryPayload = await tryLoadSiloPayload(targetLocaleLiteral);
      if (primaryDictionaryPayload !== null) {
        return primaryDictionaryPayload;
      }

      if (targetLocaleLiteral !== DEFAULT_LOCALE_IDENTIFIER) {
        const defaultDictionaryPayload = await tryLoadSiloPayload(DEFAULT_LOCALE_IDENTIFIER);
        if (defaultDictionaryPayload !== null) {
          void EmitTelemetrySignal({
            occurrenceTimestampISO: new Date().toISOString(),
            severityLevelLiteral: 'WARNING',
            moduleIdentifierLiteral: LOADER_MODULE_IDENTIFIER,
            operationCodeLiteral: 'NEWSLETTER_LOCALE_FALLBACK_APPLIED' as OperationCode,
            correlationIdentifier,
            messageContentLiteral: `Fallback aplicado para boletín: [${targetLocaleLiteral}] -> [${DEFAULT_LOCALE_IDENTIFIER}].`,
            semanticIntentTag: 'I18N_FALLBACK_ENGAGED',
            contextMetadataSnapshot: {
              requestedLocaleLiteral: targetLocaleLiteral,
              resolvedSourceLiteral: DEFAULT_LOCALE_IDENTIFIER,
            },
          });

          return defaultDictionaryPayload;
        }
      }

      void EmitTelemetrySignal({
        occurrenceTimestampISO: new Date().toISOString(),
        severityLevelLiteral: 'WARNING',
        moduleIdentifierLiteral: LOADER_MODULE_IDENTIFIER,
        operationCodeLiteral: 'NEWSLETTER_IN_MEMORY_FALLBACK_APPLIED' as OperationCode,
        correlationIdentifier,
        messageContentLiteral:
          'Respaldo institucional en memoria aplicado para el diccionario de boletín.',
        semanticIntentTag: 'I18N_FALLBACK_ENGAGED',
        contextMetadataSnapshot: {
          requestedLocaleLiteral: targetLocaleLiteral,
          resolvedSourceLiteral: 'IN_MEMORY_FALLBACK',
        },
      });

      return IN_MEMORY_NEWSLETTER_FALLBACK;
    },
  );
};
