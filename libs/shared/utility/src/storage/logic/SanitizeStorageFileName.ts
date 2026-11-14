/**
 * @section Storage Logic - Storage File Name Sanitizer (Atom)
 * @description Átomo de lógica pura encargado de normalizar nombres de archivos
 * multimedia mediante descomposición Unicode NFD (eliminando diacríticos sin destruir
 * letras base), conversión a minúsculas, neutralización de Path Traversal y acotado
 * determinista de longitud preservando la extensión original cuando existe.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Clean Paths).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa), ISO/IEC 25010 (Seguridad y Portabilidad).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

const DEFAULT_FALLBACK_FILE_NAME_LITERAL = 'unnamed-artifact';
const MAXIMUM_STORAGE_FILE_NAME_LENGTH_QUANTITY = 120;

/**
 * Purifica un nombre de archivo crudo para garantizar compatibilidad con claves de objetos S3.
 *
 * @param rawFileNameLiteral - Nombre original del archivo capturado en el envío.
 * @returns {string} Nombre de archivo seguro, ASCII, en minúsculas y acotado en longitud.
 */
export const SanitizeStorageFileName = (rawFileNameLiteral: string): string => {
  const asciiSanitizedLiteral = rawFileNameLiteral
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9.]/g, '-')
    .replace(/\.{2,}/g, '.')
    .replace(/-+/g, '-')
    .replace(/^[-.]+|[-.]+$/g, '');

  if (asciiSanitizedLiteral.length === 0) {
    return DEFAULT_FALLBACK_FILE_NAME_LITERAL;
  }

  if (asciiSanitizedLiteral.length <= MAXIMUM_STORAGE_FILE_NAME_LENGTH_QUANTITY) {
    return asciiSanitizedLiteral;
  }

  const lastDotIndexNumeric = asciiSanitizedLiteral.lastIndexOf('.');
  const hasUsableExtensionBoolean =
    lastDotIndexNumeric > 0 && asciiSanitizedLiteral.length - lastDotIndexNumeric <= 12;

  if (!hasUsableExtensionBoolean) {
    return asciiSanitizedLiteral.slice(0, MAXIMUM_STORAGE_FILE_NAME_LENGTH_QUANTITY);
  }

  const extensionLiteral = asciiSanitizedLiteral.slice(lastDotIndexNumeric);
  const maximumBaseLengthQuantity =
    MAXIMUM_STORAGE_FILE_NAME_LENGTH_QUANTITY - extensionLiteral.length;
  const truncatedBaseLiteral = asciiSanitizedLiteral
    .slice(0, maximumBaseLengthQuantity)
    .replace(/[-.]+$/g, '');

  return `${truncatedBaseLiteral || DEFAULT_FALLBACK_FILE_NAME_LITERAL}${extensionLiteral}`;
};
