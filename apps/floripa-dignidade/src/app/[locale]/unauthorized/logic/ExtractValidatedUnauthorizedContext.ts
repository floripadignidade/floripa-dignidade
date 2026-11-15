/**
 * @section Security Contingency Logic - Query Context Extractor (Atom)
 * @description Átomo de lógica pura encargado de sanitizar los parámetros opcionales
 * `?trace=` (UUID v4) y `?from=` (ruta relativa interna segura) recibidos en `/unauthorized`,
 * impidiendo inyección de rutas externas o cadenas arbitrarias en el DOM.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Security by Design).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa) e ISO/IEC 25010 (Seguridad).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { z } from 'zod';

const TraceUuidSchema = z.string().trim().uuid();
const SafeInternalOriginRouteSchema = z
  .string()
  .trim()
  .regex(/^\/(?!\/)[a-zA-Z0-9/_-]{1,120}$/);

/**
 * @interface IValidatedUnauthorizedContext
 * @description Metadatos sanitizados e inmutables extraídos de los parámetros de consulta.
 */
export interface IValidatedUnauthorizedContext {
  readonly validatedTraceIdentifier: string | null;
  readonly validatedOriginRouteLiteral: string | null;
}

const pickFirstQueryValue = (rawValue: string | string[] | undefined): string | undefined =>
  Array.isArray(rawValue) ? rawValue[0] : rawValue;

/**
 * Extrae y valida mediante Zod la referencia de traza y la ruta protegida de origen.
 *
 * @param searchParameters - Parámetros de consulta recibidos en Next.js App Router.
 * @returns {IValidatedUnauthorizedContext} Identificador UUID y ruta interna validados o `null`.
 */
export const ExtractValidatedUnauthorizedContext = (searchParameters: {
  readonly trace?: string | string[] | undefined;
  readonly from?: string | string[] | undefined;
}): IValidatedUnauthorizedContext => {
  const rawTraceCandidate = pickFirstQueryValue(searchParameters['trace']);
  const rawOriginRouteCandidate = pickFirstQueryValue(searchParameters['from']);

  const traceValidationResult = rawTraceCandidate
    ? TraceUuidSchema.safeParse(rawTraceCandidate)
    : undefined;
  const routeValidationResult = rawOriginRouteCandidate
    ? SafeInternalOriginRouteSchema.safeParse(rawOriginRouteCandidate)
    : undefined;

  return Object.freeze({
    validatedTraceIdentifier:
      traceValidationResult !== undefined && traceValidationResult.success
        ? traceValidationResult.data
        : null,
    validatedOriginRouteLiteral:
      routeValidationResult !== undefined && routeValidationResult.success
        ? routeValidationResult.data
        : null,
  });
};
