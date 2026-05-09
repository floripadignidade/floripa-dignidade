/**
 * @section Utility Logic - Privacy Strategies
 * @description Átomo encargado del enmascaramiento de documentos fiscales brasileños.
 *
 * Protocolo OEDP-V17.0 - Functional Atomicity & Pure Logic.
 * @author Raz Podestá - MetaShark Tech
 */

/**
 * Transforma un CPF o CNPJ en su representación de sigilo.
 *
 * @param rawDocumentLiteral - El rastro numérico original.
 * @returns {string} Documento enmascarado según su longitud ISO.
 */
export const ApplyBrazilianDocumentMask = (rawDocumentLiteral: string): string => {
  const numbersOnlyLiteral = rawDocumentLiteral.replace(/\D/g, '');

  // Caso CPF (11 dígitos)
  if (numbersOnlyLiteral.length === 11) {
    return `***.${numbersOnlyLiteral.substring(3, 6)}.${numbersOnlyLiteral.substring(6, 9)}-**`;
  }

  // Caso CNPJ (14 dígitos)
  if (numbersOnlyLiteral.length === 14) {
    return `**.${numbersOnlyLiteral.substring(2, 5)}.${numbersOnlyLiteral.substring(5, 8)}/${numbersOnlyLiteral.substring(8, 12)}-**`;
  }

  return 'DOCUMENTO_PROTEGIDO';
};
