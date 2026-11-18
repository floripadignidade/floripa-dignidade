/**
 * @file apps/floripa-dignidade/src/app/[locale]/identidad/logic/LoadIdentityPageDictionary.ts
 * @section Institutional Identity - Resilient Dictionary Loader (Orchestrator)
 * @description Orquesta la carga y certificación del diccionario de identidad institucional
 * siguiendo la cascada ADR 0030 (`unificado compilado -> silo local -> idioma base -> pt-BR ->
 * respaldo en memoria`), delegando resolución de cascada, lectura de fuentes y telemetría
 * SRE en átomos puros bajo medición de `TraceExecutionTime`.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & ADR 0030).
 * Normas: BCP 47 (RFC 5646), ISO/IEC 11179 e ISO/IEC 25010 (Disponibilidad y Mantenibilidad).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { SupportedLocaleSchema } from '@floripa-dignidade/contracts';
import { ValidationException } from '@floripa-dignidade/exceptions';
import {
  GenerateCorrelationIdentifier,
  type ModuleIdentifier,
  ModuleIdentifierSchema,
  type OperationCode,
  OperationCodeSchema,
  ReportForensicException,
  TraceExecutionTime,
} from '@floripa-dignidade/telemetry';

import type { IIdentityPageI18n } from '../i18n/schemas/IdentityPage.i18n.schema';
import { EmitIdentityDictionaryFallbackTelemetry } from './atoms/EmitIdentityDictionaryFallbackTelemetry';
import { ResolveIdentityDictionarySource } from './atoms/ResolveIdentityDictionarySource';
import { ResolveIdentityLocaleCascade } from './atoms/ResolveIdentityLocaleCascade';
import { ResolveIdentityPageInMemoryFallback } from './IdentityPageFallbackDictionaries';

const LOADER_MODULE_IDENTIFIER: ModuleIdentifier = ModuleIdentifierSchema.parse(
  'IDENTITY_PAGE_DICTIONARY_LOADER',
);

const LOAD_DICTIONARY_OPERATION_CODE: OperationCode = OperationCodeSchema.parse(
  'LOAD_IDENTITY_PAGE_DICTIONARY',
);

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
  const correlationIdentifier = GenerateCorrelationIdentifier();
  const localeValidation = SupportedLocaleSchema.safeParse(validatedLocaleIdentifier);

  if (!localeValidation.success) {
    const validationException = new ValidationException('IDENTIFICADOR_IDIOMA_IDENTIDAD_INVALIDO', {
      attemptedLocaleLiteral: validatedLocaleIdentifier,
      correlationIdentifier,
    });
    ReportForensicException(validationException, correlationIdentifier);
    throw validationException;
  }

  const verifiedLocaleLiteral = localeValidation.data;

  return await TraceExecutionTime(
    LOADER_MODULE_IDENTIFIER,
    LOAD_DICTIONARY_OPERATION_CODE,
    correlationIdentifier,
    async (): Promise<IIdentityPageI18n> => {
      const cascadeLocalesCollection = ResolveIdentityLocaleCascade(verifiedLocaleLiteral);

      for (const candidateLocaleLiteral of cascadeLocalesCollection) {
        const resolvedDictionary = await ResolveIdentityDictionarySource(candidateLocaleLiteral);

        if (resolvedDictionary !== null) {
          if (candidateLocaleLiteral !== verifiedLocaleLiteral) {
            EmitIdentityDictionaryFallbackTelemetry({
              moduleIdentifierLiteral: LOADER_MODULE_IDENTIFIER,
              requestedLocaleLiteral: verifiedLocaleLiteral,
              resolvedSourceLiteral: candidateLocaleLiteral,
              correlationIdentifier,
            });
          }

          return resolvedDictionary;
        }
      }

      EmitIdentityDictionaryFallbackTelemetry({
        moduleIdentifierLiteral: LOADER_MODULE_IDENTIFIER,
        requestedLocaleLiteral: verifiedLocaleLiteral,
        resolvedSourceLiteral: 'IN_MEMORY_INSTITUTIONAL_FALLBACK',
        correlationIdentifier,
      });

      return ResolveIdentityPageInMemoryFallback(verifiedLocaleLiteral);
    },
  );
};
