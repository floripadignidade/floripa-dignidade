/**
 * @file apps/floripa-dignidade/src/app/[locale]/identidad/logic/atoms/ExtractCompiledIdentityPayload.ts
 * @section Institutional Identity - Compiled Dictionary Extractor (Atom)
 * @description Átomo de lógica pura encargado de localizar y validar contra
 * `IdentityPageI18nSchema` la rama correspondiente a `identidad` dentro de los
 * diccionarios consolidados por el compilador Weaver.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & ADR 0030).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa) e ISO/IEC 25010 (Confiabilidad).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import {
  IdentityPageI18nSchema,
  type IIdentityPageI18n,
} from '../../i18n/schemas/IdentityPage.i18n.schema';

type TPlainDictionaryRecord = Readonly<Record<string, unknown>>;

const asPlainDictionaryRecord = (candidateValue: unknown): TPlainDictionaryRecord | undefined => {
  if (
    typeof candidateValue === 'object' &&
    candidateValue !== null &&
    !Array.isArray(candidateValue)
  ) {
    return candidateValue as TPlainDictionaryRecord;
  }

  return undefined;
};

const selectIdentityNamespaceCandidate = (
  identityModuleRecord: TPlainDictionaryRecord | undefined,
): unknown => {
  if (!identityModuleRecord) {
    return undefined;
  }

  return identityModuleRecord['identity'] ?? identityModuleRecord['common'] ?? identityModuleRecord;
};

/**
 * Extrae y valida mediante Zod el diccionario de identidad desde un diccionario unificado del Weaver.
 *
 * @param unifiedDictionarySnapshot - Objeto raíz del archivo `<locale>.json` compilado.
 * @returns {IIdentityPageI18n | null} Diccionario certificado o `null` si está ausente o corrupto.
 */
export const ExtractCompiledIdentityPayload = (
  unifiedDictionarySnapshot: unknown,
): IIdentityPageI18n | null => {
  const rootRecord = asPlainDictionaryRecord(unifiedDictionarySnapshot);
  if (!rootRecord) {
    return null;
  }

  const directModuleRecord = asPlainDictionaryRecord(
    rootRecord['apps/floripa-dignidade/identidad'],
  );

  const nestedAppsRecord = asPlainDictionaryRecord(rootRecord['apps']);
  const nestedPortalRecord = asPlainDictionaryRecord(nestedAppsRecord?.['floripa-dignidade']);
  const nestedIdentityRecord = asPlainDictionaryRecord(nestedPortalRecord?.['identidad']);

  const candidatePayload =
    selectIdentityNamespaceCandidate(directModuleRecord) ??
    selectIdentityNamespaceCandidate(nestedIdentityRecord);

  const validationResult = IdentityPageI18nSchema.safeParse(candidatePayload);

  return validationResult.success ? validationResult.data : null;
};
