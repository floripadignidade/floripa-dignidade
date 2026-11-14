/**
 * @section AI Providers - Hugging Face Error Diagnostic Extractor (Atom)
 * @description Átomo de lógica pura encargado de leer y normalizar de forma segura
 * el detalle diagnóstico y tiempo estimado de carga (`estimated_time`) desde respuestas
 * HTTP no exitosas de Hugging Face Router sin propagar excepciones de parseo JSON.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Clean Paths).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa) e ISO/IEC 25010 (Confiabilidad).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { HuggingFaceRouterErrorBodySchema } from '../schemas/TriageHuggingFaceResponse.schema';

const MAXIMUM_ERROR_SNIPPET_LENGTH_QUANTITY = 256;

/**
 * @interface IHuggingFaceErrorDiagnosticResult
 * @description Diagnóstico normalizado e inmutable extraído de una respuesta HTTP de error.
 */
export interface IHuggingFaceErrorDiagnosticResult {
  readonly diagnosticDetailLiteral: string | undefined;
  readonly estimatedTimeSecondsNumeric: number | undefined;
}

const buildEmptyDiagnosticResult = (): IHuggingFaceErrorDiagnosticResult =>
  Object.freeze({
    diagnosticDetailLiteral: undefined,
    estimatedTimeSecondsNumeric: undefined,
  });

const parseErrorDiagnosticFromText = (
  rawErrorTextLiteral: string,
): IHuggingFaceErrorDiagnosticResult => {
  const parsedJsonSnapshot: unknown = JSON.parse(rawErrorTextLiteral);
  const errorValidationResult = HuggingFaceRouterErrorBodySchema.safeParse(parsedJsonSnapshot);

  if (!errorValidationResult.success) {
    return Object.freeze({
      diagnosticDetailLiteral: rawErrorTextLiteral.slice(0, MAXIMUM_ERROR_SNIPPET_LENGTH_QUANTITY),
      estimatedTimeSecondsNumeric: undefined,
    });
  }

  const errorBodySnapshot = errorValidationResult.data;
  const errorFieldSnapshot = errorBodySnapshot.error;
  const rawDetailLiteral =
    typeof errorFieldSnapshot === 'string'
      ? errorFieldSnapshot
      : (errorFieldSnapshot?.message ?? errorBodySnapshot.message);

  return Object.freeze({
    diagnosticDetailLiteral: rawDetailLiteral?.slice(0, MAXIMUM_ERROR_SNIPPET_LENGTH_QUANTITY),
    estimatedTimeSecondsNumeric: errorBodySnapshot.estimated_time,
  });
};

/**
 * Extrae de forma segura el detalle diagnóstico de una respuesta HTTP de error.
 *
 * @param incomingNetworkResponse - Respuesta HTTP no exitosa devuelta por Hugging Face Router.
 * @returns {Promise<IHuggingFaceErrorDiagnosticResult>} Diagnóstico acotado e inmutable.
 */
export const ExtractHuggingFaceErrorDiagnostic = async (
  incomingNetworkResponse: Response,
): Promise<IHuggingFaceErrorDiagnosticResult> => {
  try {
    const rawErrorTextLiteral = await incomingNetworkResponse.text();
    if (rawErrorTextLiteral.trim().length === 0) {
      return buildEmptyDiagnosticResult();
    }

    return parseErrorDiagnosticFromText(rawErrorTextLiteral);
  } catch {
    return buildEmptyDiagnosticResult();
  }
};
