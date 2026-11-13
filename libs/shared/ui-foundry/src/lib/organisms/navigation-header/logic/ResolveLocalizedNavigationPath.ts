/**
 * @section Shared UI Foundry - Localized Navigation Path Resolver (Atom)
 * @description Átomo de lógica pura encargado de resolver rutas internas conservando
 * el prefijo lingüístico BCP 47 activo del ciudadano, validado contra el catálogo SSOT
 * `@floripa-dignidade/contracts` (ADR 0030) y evitando dobles prefijos.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Clean Paths).
 * Normas: BCP 47 (RFC 5646), ISO/IEC 11179 (Nomenclatura Prosa) e ISO/IEC 25010.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import {
  DEFAULT_LOCALE_IDENTIFIER,
  SupportedLocaleSchema,
  type TSupportedLocale,
} from '@floripa-dignidade/contracts';

/**
 * Extrae el código BCP 47 activo del primer segmento de la ruta actual del navegador.
 *
 * @param currentPathnameLiteral - Ruta actual obtenida mediante `usePathname()`.
 * @returns {TSupportedLocale} Código BCP 47 habilitado o idioma por defecto del catálogo SSOT.
 */
export const ResolveActiveLocaleFromPathname = (
  currentPathnameLiteral: string | null | undefined,
): TSupportedLocale => {
  if (!currentPathnameLiteral) {
    return DEFAULT_LOCALE_IDENTIFIER;
  }

  const firstSegmentLiteral = currentPathnameLiteral.split('/').filter(Boolean)[0];
  if (!firstSegmentLiteral) {
    return DEFAULT_LOCALE_IDENTIFIER;
  }

  const validationResult = SupportedLocaleSchema.safeParse(firstSegmentLiteral);
  return validationResult.success ? validationResult.data : DEFAULT_LOCALE_IDENTIFIER;
};

/**
 * Compone una ruta interna localizada garantizando que conserve el idioma activo del usuario.
 *
 * @param targetPathnameLiteral - Ruta destino relativa o absoluta (ej: `/denuncia`).
 * @param currentPathnameLiteral - Ruta actual del navegador capturada por el enrutador.
 * @returns {string} Ruta localizada normalizada (ej: `/pt-BR/denuncia` o `/es-ES/denuncia`).
 */
export const ResolveLocalizedNavigationPath = (
  targetPathnameLiteral: string,
  currentPathnameLiteral: string | null | undefined,
): string => {
  const trimmedTargetLiteral = targetPathnameLiteral.trim();

  if (/^https?:\/\//i.test(trimmedTargetLiteral)) {
    return trimmedTargetLiteral;
  }

  const normalizedPathLiteral = trimmedTargetLiteral.startsWith('/')
    ? trimmedTargetLiteral
    : `/${trimmedTargetLiteral}`;

  const firstTargetSegmentLiteral = normalizedPathLiteral.split('/').filter(Boolean)[0];
  const hasLeadingLocaleBoolean =
    firstTargetSegmentLiteral !== undefined &&
    SupportedLocaleSchema.safeParse(firstTargetSegmentLiteral).success;

  if (hasLeadingLocaleBoolean) {
    return normalizedPathLiteral;
  }

  const activeLocaleIdentifier = ResolveActiveLocaleFromPathname(currentPathnameLiteral);
  return normalizedPathLiteral === '/'
    ? `/${activeLocaleIdentifier}`
    : `/${activeLocaleIdentifier}${normalizedPathLiteral}`;
};
