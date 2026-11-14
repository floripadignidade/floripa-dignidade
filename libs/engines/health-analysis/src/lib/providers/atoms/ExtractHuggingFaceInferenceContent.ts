/**
 * @section AI Providers - Hugging Face Inference Content Extractor (Atom)
 * @description Átomo encargado de leer de forma segura el cuerpo JSON de una respuesta
 * exitosa de Hugging Face Router y extraer el texto generado en protocolos OpenAI Chat
 * Completions y Task API, manteniendo complejidad ciclomática mínima y sellado inmutable.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Clean Paths).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa) e ISO/IEC 25010 (Confiabilidad).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import {
  HuggingFaceTaskApiResponseSchema,
  OpenAiChatCompletionResponseSchema,
} from '../schemas/TriageHuggingFaceResponse.schema';

export { ExtractHuggingFaceErrorDiagnostic } from './ExtractHuggingFaceErrorDiagnostic';

/**
 * @interface IExtractedHuggingFaceContent
 * @description Resultado inmutable de la extracción de texto y metadatos de una respuesta exitosa.
 */
export interface IExtractedHuggingFaceContent {
  readonly isJsonValidBoolean: boolean;
  readonly hasExtractedTextBoolean: boolean;
  readonly extractedObservationLiteral: string;
  readonly resolvedModelIdentifierLiteral: string | undefined;
  readonly finishReasonLiteral: string | undefined;
  readonly tokenUsageSnapshot: Readonly<Record<string, unknown>> | undefined;
  readonly rawResponseSnapshot: unknown;
}

const readResponseJsonSafely = async (
  incomingNetworkResponse: Response,
): Promise<{
  readonly isJsonValidBoolean: boolean;
  readonly rawPayloadSnapshot: unknown;
}> => {
  try {
    const rawPayloadSnapshot: unknown = await incomingNetworkResponse.json();
    return { isJsonValidBoolean: true, rawPayloadSnapshot };
  } catch {
    return { isJsonValidBoolean: false, rawPayloadSnapshot: undefined };
  }
};

const extractTextFromChatChoice = (firstChoiceSnapshot: {
  readonly message?: { readonly content?: string | null | undefined } | undefined;
  readonly text?: string | undefined;
}): string | undefined => {
  const candidateTextLiteral = firstChoiceSnapshot.message?.content ?? firstChoiceSnapshot.text;
  const trimmedTextLiteral = candidateTextLiteral?.trim();

  return trimmedTextLiteral && trimmedTextLiteral.length > 0 ? trimmedTextLiteral : undefined;
};

const extractChatCompletionContent = (
  rawResponseSnapshot: unknown,
  fallbackObservationLiteral: string,
): IExtractedHuggingFaceContent | null => {
  const chatValidationResult = OpenAiChatCompletionResponseSchema.safeParse(rawResponseSnapshot);
  if (!chatValidationResult.success) {
    return null;
  }

  const firstChoiceSnapshot = chatValidationResult.data.choices[0];
  const extractedTextLiteral = firstChoiceSnapshot
    ? extractTextFromChatChoice(firstChoiceSnapshot)
    : undefined;
  const hasExtractedTextBoolean = extractedTextLiteral !== undefined;

  return Object.freeze({
    isJsonValidBoolean: true,
    hasExtractedTextBoolean,
    extractedObservationLiteral: extractedTextLiteral ?? fallbackObservationLiteral,
    resolvedModelIdentifierLiteral: chatValidationResult.data.model,
    finishReasonLiteral: firstChoiceSnapshot?.finish_reason ?? undefined,
    tokenUsageSnapshot: chatValidationResult.data.usage,
    rawResponseSnapshot,
  });
};

const extractTextFromTaskApiPayload = (rawPayloadSnapshot: unknown): string | undefined => {
  const taskValidationResult = HuggingFaceTaskApiResponseSchema.safeParse(rawPayloadSnapshot);
  if (!taskValidationResult.success) {
    return undefined;
  }

  const firstItemSnapshot = Array.isArray(taskValidationResult.data)
    ? taskValidationResult.data[0]
    : taskValidationResult.data;

  const candidateTextLiteral =
    firstItemSnapshot?.generated_text ??
    firstItemSnapshot?.summary_text ??
    firstItemSnapshot?.translation_text;

  return candidateTextLiteral && candidateTextLiteral.trim().length > 0
    ? candidateTextLiteral.trim()
    : undefined;
};

/**
 * Lee y extrae contenido textual, modelo real y uso de tokens de una respuesta HTTP `ok`.
 *
 * @param incomingNetworkResponse - Respuesta HTTP exitosa capturada desde Hugging Face Router.
 * @param fallbackObservationLiteral - Texto localizado de respaldo si no hay texto generado.
 * @returns {Promise<IExtractedHuggingFaceContent>} Snapshot sellado e inmutable de la extracción.
 */
export const ExtractHuggingFaceInferenceContent = async (
  incomingNetworkResponse: Response,
  fallbackObservationLiteral: string,
): Promise<IExtractedHuggingFaceContent> => {
  const { isJsonValidBoolean, rawPayloadSnapshot } =
    await readResponseJsonSafely(incomingNetworkResponse);

  if (!isJsonValidBoolean) {
    return Object.freeze({
      isJsonValidBoolean: false,
      hasExtractedTextBoolean: false,
      extractedObservationLiteral: fallbackObservationLiteral,
      resolvedModelIdentifierLiteral: undefined,
      finishReasonLiteral: undefined,
      tokenUsageSnapshot: undefined,
      rawResponseSnapshot: undefined,
    });
  }

  const chatCompletionContentSnapshot = extractChatCompletionContent(
    rawPayloadSnapshot,
    fallbackObservationLiteral,
  );
  if (chatCompletionContentSnapshot !== null) {
    return chatCompletionContentSnapshot;
  }

  const taskExtractedTextLiteral = extractTextFromTaskApiPayload(rawPayloadSnapshot);

  return Object.freeze({
    isJsonValidBoolean: true,
    hasExtractedTextBoolean: taskExtractedTextLiteral !== undefined,
    extractedObservationLiteral: taskExtractedTextLiteral ?? fallbackObservationLiteral,
    resolvedModelIdentifierLiteral: undefined,
    finishReasonLiteral: undefined,
    tokenUsageSnapshot: undefined,
    rawResponseSnapshot: rawPayloadSnapshot,
  });
};
