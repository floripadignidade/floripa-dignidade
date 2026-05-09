/**
 * @section Utility Logic - Privacy Strategies
 * @description Átomo encargado de la anonimizacion toponímica de identidades.
 *
 * Protocolo OEDP-V17.0 - Functional Atomicity & Pure Logic.
 */

/**
 * Transforma un nombre civil en una firma pública (NOME + INICIAL).
 *
 * @param rawNameLiteral - Nombre completo en mayúsculas.
 * @returns {string} Identidad anonimizada.
 */
export const ApplyCitizenNameMask = (rawNameLiteral: string): string => {
  const nameSegmentsCollection = rawNameLiteral.split(/\s+/);
  const firstNameLiteral = nameSegmentsCollection[0] ?? 'CIDADÃO';

  if (nameSegmentsCollection.length === 1) {
    return firstNameLiteral;
  }

  const lastSegmentIndexNumeric = nameSegmentsCollection.length - 1;
  const lastNamePartLiteral = nameSegmentsCollection[lastSegmentIndexNumeric] || '';
  const lastNameInitialLiteral = lastNamePartLiteral.charAt(0);

  return `${firstNameLiteral} ${lastNameInitialLiteral}.`;
};
