/**
 * @section Contingency Logic - Error Query Context Extractor (Atom)
 * @description Átomo de lógica pura encargado de sanitizar los parámetros opcionales
 * `?code=` y `?trace=` recibidos en la URL de contingencia, previniendo reflexión de
 * cadenas arbitrarias en el DOM y resolviendo mensajes localizados seguros.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Security by Design).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa) e ISO/IEC 25010 (Seguridad).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { z } from 'zod';

import type { IErrorPageI18n } from '../i18n/schemas/ErrorPage.i18n.schema';

const TraceUuidSchema = z.string().trim().uuid();

const ErrorCodeQuerySchema = z
  .string()
  .trim()
  .regex(/^[A-Za-z0-9_]{3,64}$/)
  .transform((rawCodeLiteral: string) => rawCodeLiteral.toUpperCase());

type TKnownErrorKey = keyof IErrorPageI18n['errors'];

const KNOWN_ERROR_KEYS_SET: ReadonlySet<string> = new Set<TKnownErrorKey>([
  'CONFIRMATION_FAULT',
  'GATEWAY_FAULT',
  'UNKNOWN_FAULT',
]);

/**
 * @interface IValidatedErrorContext
 * @description Parámetros purificados de diagnóstico extraídos de `searchParams`.
 */
export interface IValidatedErrorContext {
  readonly validatedErrorCodeLiteral: string;
  readonly validatedTraceIdentifier: string | null;
}

const pickFirstQueryValue = (rawValue: string | string[] | undefined): string | undefined =>
  Array.isArray(rawValue) ? rawValue[0] : rawValue;

/**
 * Extrae y valida mediante Zod los parámetros de diagnóstico de la ruta `/error`.
 *
 * @param searchParameters - Parámetros de consulta recibidos en Next.js App Router.
 * @returns {IValidatedErrorContext} Código normalizado y UUID de traza o `null`.
 */
export const ExtractValidatedErrorContext = (searchParameters: {
  readonly code?: string | string[] | undefined;
  readonly trace?: string | string[] | undefined;
}): IValidatedErrorContext => {
  const rawCodeCandidate = pickFirstQueryValue(searchParameters['code']);
  const rawTraceCandidate = pickFirstQueryValue(searchParameters['trace']);

  const codeValidationResult = rawCodeCandidate
    ? ErrorCodeQuerySchema.safeParse(rawCodeCandidate)
    : undefined;
  const traceValidationResult = rawTraceCandidate
    ? TraceUuidSchema.safeParse(rawTraceCandidate)
    : undefined;

  return Object.freeze({
    validatedErrorCodeLiteral:
      codeValidationResult !== undefined && codeValidationResult.success
        ? codeValidationResult.data
        : 'UNKNOWN_FAULT',
    validatedTraceIdentifier:
      traceValidationResult !== undefined && traceValidationResult.success
        ? traceValidationResult.data
        : null,
  });
};

/**
 * Resuelve la descripción localizada segura correspondiente al código de incidente sanitizado.
 *
 * @param validatedErrorCodeLiteral - Código sanitizado en mayúsculas.
 * @param dictionarySnapshot - Diccionario validado de la página de error.
 * @returns {string} Descripción legible para el ciudadano.
 */
export const ResolveLocalizedErrorDescription = (
  validatedErrorCodeLiteral: string,
  dictionarySnapshot: IErrorPageI18n,
): string => {
  if (KNOWN_ERROR_KEYS_SET.has(validatedErrorCodeLiteral)) {
    return dictionarySnapshot.errors[validatedErrorCodeLiteral as TKnownErrorKey];
  }

  return dictionarySnapshot.hero.defaultDescriptionLiteral;
};
