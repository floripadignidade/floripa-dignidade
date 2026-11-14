/**
 * @section AI Providers - Google Gemini Request Payload Builder (Atom)
 * @description Átomo de lógica pura encargado de serializar con seguridad cualquier carga
 * útil hacia el contrato `generateContent` de Google Gemini API, interceptando entradas
 * vacías o referencias circulares mediante `ValidationException`.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Clean Paths).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa) e ISO/IEC 25010 (Confiabilidad y Seguridad).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { ValidationException } from '@floripa-dignidade/exceptions';

import type { IGoogleGeminiResolvedConfiguration } from '../schemas/GoogleGeminiInferenceDriver.schema';

const serializePromptTextLiteral = (
  unvalidatedIntelligencePayloadSnapshot: unknown,
  correlationIdentifier: string,
): string => {
  if (
    unvalidatedIntelligencePayloadSnapshot === undefined ||
    unvalidatedIntelligencePayloadSnapshot === null
  ) {
    throw new ValidationException('GEMINI_EMPTY_INFERENCE_PAYLOAD', {
      correlationIdentifier,
    });
  }

  if (typeof unvalidatedIntelligencePayloadSnapshot === 'string') {
    const trimmedPromptLiteral = unvalidatedIntelligencePayloadSnapshot.trim();
    if (trimmedPromptLiteral.length === 0) {
      throw new ValidationException('GEMINI_EMPTY_INFERENCE_PAYLOAD', {
        correlationIdentifier,
      });
    }
    return trimmedPromptLiteral;
  }

  try {
    return JSON.stringify(unvalidatedIntelligencePayloadSnapshot);
  } catch (caughtSerializationError: unknown) {
    const errorDescriptionLiteral =
      caughtSerializationError instanceof Error
        ? caughtSerializationError.message
        : String(caughtSerializationError);

    throw new ValidationException('GEMINI_PAYLOAD_SERIALIZATION_FAILED', {
      originalErrorLiteral: errorDescriptionLiteral,
      correlationIdentifier,
    });
  }
};

/**
 * Construye el cuerpo JSON serializado para `models/{model}:generateContent`.
 *
 * @param unvalidatedIntelligencePayloadSnapshot - Prompt o snapshot de contexto a analizar.
 * @param configurationSnapshot - Configuración certificada de generación.
 * @param correlationIdentifier - Identificador UUID v4 de correlación forense.
 * @param systemInstructionPromptLiteral - Instrucción de sistema opcional.
 * @returns {{ readonly serializedBodyLiteral: string; readonly promptLengthQuantity: number }}
 * @throws {ValidationException} Si el payload está vacío o no es serializable.
 */
export const BuildGeminiInferenceRequestPayload = (
  unvalidatedIntelligencePayloadSnapshot: unknown,
  configurationSnapshot: IGoogleGeminiResolvedConfiguration,
  correlationIdentifier: string,
  systemInstructionPromptLiteral?: string,
): { readonly serializedBodyLiteral: string; readonly promptLengthQuantity: number } => {
  const promptTextLiteral = serializePromptTextLiteral(
    unvalidatedIntelligencePayloadSnapshot,
    correlationIdentifier,
  );

  const requestBodySnapshot = {
    ...(systemInstructionPromptLiteral !== undefined && {
      systemInstruction: { parts: [{ text: systemInstructionPromptLiteral }] },
    }),
    contents: [{ parts: [{ text: promptTextLiteral }] }],
    generationConfig: {
      temperature: configurationSnapshot.temperatureNumeric,
      maxOutputTokens: configurationSnapshot.maxOutputTokensQuantity,
    },
  };

  return Object.freeze({
    serializedBodyLiteral: JSON.stringify(requestBodySnapshot),
    promptLengthQuantity: promptTextLiteral.length,
  });
};
