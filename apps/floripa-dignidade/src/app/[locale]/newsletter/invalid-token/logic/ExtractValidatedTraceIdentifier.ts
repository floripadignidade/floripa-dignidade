/**
 * @section Newsletter Invalid Token Logic - Trace Identifier Extractor (Atom)
 * @description Átomo de lógica pura encargado de sanitizar y validar mediante Zod
 * el parámetro de consulta opcional `?trace=` enviado por el gateway de confirmación,
 * evitando renderizar cadenas arbitrarias o inyectadas en el DOM.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Security by Design).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa) e ISO/IEC 25010 (Seguridad).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { z } from 'zod';

const TraceUuidSchema = z.string().trim().uuid();

/**
 * Extrae un UUID v4 válido de `searchParams.trace` o retorna `null` si está ausente o alterado.
 *
 * @param rawTraceParameter - Valor crudo del parámetro `trace` recibido en Next.js App Router.
 * @returns {string | null} Identificador UUID purificado o `null`.
 */
export const ExtractValidatedTraceIdentifier = (
  rawTraceParameter: string | string[] | undefined,
): string | null => {
  const candidateLiteral = Array.isArray(rawTraceParameter)
    ? rawTraceParameter[0]
    : rawTraceParameter;

  if (!candidateLiteral) {
    return null;
  }

  const validationResult = TraceUuidSchema.safeParse(candidateLiteral);
  return validationResult.success ? validationResult.data : null;
};
