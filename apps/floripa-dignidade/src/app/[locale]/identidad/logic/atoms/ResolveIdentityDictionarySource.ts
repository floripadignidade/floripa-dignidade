/**
 * @file apps/floripa-dignidade/src/app/[locale]/identidad/logic/atoms/ResolveIdentityDictionarySource.ts
 * @section Institutional Identity - Dictionary Source Resolver (Atom)
 * @description Átomo encargado de resolver un código BCP 47 individual consultando en orden:
 * 1) el diccionario unificado compilado por el Weaver (`src/app/i18n/dictionaries/`), y
 * 2) el silo local de `identidad/i18n/`. Usa rutas estáticamente analizables por Turbopack.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & ADR 0030).
 * Normas: BCP 47 (RFC 5646), ISO/IEC 11179 e ISO/IEC 25010 (Disponibilidad).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import {
  IdentityPageI18nSchema,
  type IIdentityPageI18n,
} from '../../i18n/schemas/IdentityPage.i18n.schema';
import { ExtractCompiledIdentityPayload } from './ExtractCompiledIdentityPayload';

const tryLoadFromCompiledDictionaryAction = async (
  localeCodeLiteral: string,
): Promise<IIdentityPageI18n | null> => {
  try {
    const importedModule = (await import(
      `../../../../i18n/dictionaries/${localeCodeLiteral}.json`
    )) as {
      readonly default?: unknown;
    };

    return ExtractCompiledIdentityPayload(importedModule.default);
  } catch {
    return null;
  }
};

const tryLoadFromLocalIdentitySiloAction = async (
  localeCodeLiteral: string,
): Promise<IIdentityPageI18n | null> => {
  try {
    const importedModule = (await import(`../../i18n/${localeCodeLiteral}/identity.json`)) as {
      readonly default?: unknown;
    };

    const validationResult = IdentityPageI18nSchema.safeParse(importedModule.default);
    return validationResult.success ? validationResult.data : null;
  } catch {
    return null;
  }
};

/**
 * Intenta resolver y validar contra Zod el diccionario de identidad para un código BCP 47.
 *
 * @param localeCodeLiteral - Código BCP 47 candidato dentro de la cascada de resolución.
 * @returns {Promise<IIdentityPageI18n | null>} Diccionario certificado o `null` si no existe.
 */
export const ResolveIdentityDictionarySource = async (
  localeCodeLiteral: string,
): Promise<IIdentityPageI18n | null> => {
  const compiledDictionary = await tryLoadFromCompiledDictionaryAction(localeCodeLiteral);
  if (compiledDictionary !== null) {
    return compiledDictionary;
  }

  return await tryLoadFromLocalIdentitySiloAction(localeCodeLiteral);
};
