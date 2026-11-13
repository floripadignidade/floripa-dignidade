/**
 * @section Routing Infrastructure - Global System Constants
 * @description Configuraciones globales inmutables para el motor de enrutamiento y
 * localización. Consume exclusivamente el catálogo único BCP 47 definido en
 * `@floripa-dignidade/contracts` (ADR 0030) garantizando cero duplicidad de idiomas.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & ADR 0030).
 * Normas: BCP 47 (RFC 5646), ISO/IEC 11179 (Nomenclatura Técnica) e ISO/IEC 25010.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import {
  DEFAULT_LOCALE_IDENTIFIER,
  SUPPORTED_LOCALE_CODES_COLLECTION,
  SUPPORTED_LOCALES_REGISTRY,
} from '@floripa-dignidade/contracts';
import type { ISupportedLocale } from '@floripa-dignidade/contracts';

/**
 * Colección oficial inmutable de códigos BCP 47 activos en la plataforma,
 * derivada dinámicamente de `SUPPORTED_LOCALES_REGISTRY` (`isEnabledBoolean: true`).
 */
export const SUPPORTED_LOCALE_COLLECTION: readonly ISupportedLocale[] =
  SUPPORTED_LOCALE_CODES_COLLECTION;

/**
 * Colección inmutable de variantes regionales e idiomas catalogados para futura
 * activación (`isEnabledBoolean: false`). No habilita rutas ni compilación hasta
 * que sus diccionarios existan y se activen en el registro SSOT.
 */
export const PLANNED_LOCALE_CODES_COLLECTION: readonly string[] = Object.freeze(
  SUPPORTED_LOCALES_REGISTRY.filter(
    (localeEntrySnapshot) => !localeEntrySnapshot.isEnabledBoolean,
  ).map((localeEntrySnapshot) => localeEntrySnapshot.localeCodeLiteral),
);

/**
 * Código de idioma canónico por defecto para respaldos y redirecciones de raíz.
 */
export const DEFAULT_SYSTEM_LOCALE_IDENTIFIER: ISupportedLocale = DEFAULT_LOCALE_IDENTIFIER;

/**
 * Tiempo de persistencia de la cabecera de trazabilidad en el Edge, expresado en milisegundos.
 */
export const ROUTING_TRACE_TIME_TO_LIVE_IN_MILLISECONDS_QUANTITY = 60000;

/**
 * @deprecated Utilizar `ROUTING_TRACE_TIME_TO_LIVE_IN_MILLISECONDS_QUANTITY` bajo norma ISO 11179.
 */
export const ROUTING_TRACE_TTL_MILLISECONDS = ROUTING_TRACE_TIME_TO_LIVE_IN_MILLISECONDS_QUANTITY;
