/**
 * @section Storage Logic - Organization Path Segment Sanitizer (Atom)
 * @description Átomo de lógica pura encargado de purificar el identificador
 * organizacional (tenant) utilizado como prefijo raíz en claves S3-Compatible,
 * neutralizando saltos de directorio y caracteres inválidos sin alterar UUIDs ni
 * identificadores alfanuméricos institucionales.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Clean Paths).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa), ISO/IEC 25010 (Seguridad y Mantenibilidad).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

const DEFAULT_ORGANIZATION_SEGMENT_LITERAL = 'GLOBAL_FLORIPA';
const MAXIMUM_ORGANIZATION_SEGMENT_LENGTH_QUANTITY = 64;

/**
 * Sanitiza el segmento de organización para su uso seguro como prefijo de ruta S3.
 *
 * @param rawOrganizationIdentifierLiteral - Identificador crudo de la organización propietaria.
 * @returns {string} Segmento purificado seguro para claves S3 o respaldo institucional.
 */
export const SanitizeOrganizationPathSegment = (
  rawOrganizationIdentifierLiteral: string,
): string => {
  const sanitizedSegmentLiteral = rawOrganizationIdentifierLiteral
    .trim()
    .replace(/\.{2,}/g, '')
    .replace(/[^a-zA-Z0-9_-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^[-_]+|[-_]+$/g, '')
    .slice(0, MAXIMUM_ORGANIZATION_SEGMENT_LENGTH_QUANTITY);

  return sanitizedSegmentLiteral.length > 0
    ? sanitizedSegmentLiteral
    : DEFAULT_ORGANIZATION_SEGMENT_LITERAL;
};
