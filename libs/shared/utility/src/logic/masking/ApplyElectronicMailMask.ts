/**
 * @section Utility Logic - Privacy Strategies
 * @description Átomo encargado de la protección de buzones electrónicos.
 *
 * Protocolo OEDP-V17.0 - Functional Atomicity & Pure Logic.
 */

/**
 * Oculta el núcleo de una dirección de correo preservando el dominio.
 *
 * @param rawEmailLiteral - Dirección de correo cruda.
 * @returns {string} Correo enmascarado.
 */
export const ApplyElectronicMailMask = (rawEmailLiteral: string): string => {
  const emailPartsCollection = rawEmailLiteral.split('@');

  if (emailPartsCollection.length !== 2) {
    return '***@***.***';
  }

  const localPartLiteral = emailPartsCollection[0] || '';
  const domainPartLiteral = emailPartsCollection[1] || '';

  if (localPartLiteral.length <= 2) {
    return `***@${domainPartLiteral}`;
  }

  const firstCharacterLiteral = localPartLiteral.charAt(0);
  const lastCharacterLiteral = localPartLiteral.charAt(localPartLiteral.length - 1);

  return `${firstCharacterLiteral}***${lastCharacterLiteral}@${domainPartLiteral}`;
};
