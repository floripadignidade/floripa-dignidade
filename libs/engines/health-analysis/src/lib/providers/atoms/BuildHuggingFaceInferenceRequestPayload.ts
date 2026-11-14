/**
 * @section AI Providers - Hugging Face Request Payload Builder (Atom)
 * @description Átomo de lógica pura encargado de serializar con seguridad cualquier carga
 * útil (`string`, `IInferenceRequest` o diccionario estructurado) en el formato exacto
 * exigido por el protocolo destino (`OPENAI_CHAT_COMPLETIONS` o `HUGGING_FACE_TASK_API`),
 * interceptando referencias circulares o entradas vacías mediante `ValidationException`.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Clean Paths).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa) e ISO/IEC 25010 (Confiabilidad y Seguridad).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { ValidationException } from '@floripa-dignidade/exceptions';

import type { IHuggingFaceResolvedConfiguration } from '../schemas/HuggingFaceInferenceDriver.schema';

const DEFAULT_SYSTEM_INSTRUCTION_PROMPT_LITERAL =
  'You are the Floripa Dignidade algorithmic health and civic integrity analysis engine. Respond concisely with structured technical diagnostics.';

const serializePromptInputLiteral = (
  unvalidatedIntelligencePayloadSnapshot: unknown,
  correlationIdentifier: string,
): string => {
  if (
    unvalidatedIntelligencePayloadSnapshot === undefined ||
    unvalidatedIntelligencePayloadSnapshot === null
  ) {
    throw new ValidationException('HUGGING_FACE_EMPTY_INFERENCE_PAYLOAD', {
      correlationIdentifier,
    });
  }

  if (typeof unvalidatedIntelligencePayloadSnapshot === 'string') {
    const trimmedPromptLiteral = unvalidatedIntelligencePayloadSnapshot.trim();
    if (trimmedPromptLiteral.length === 0) {
      throw new ValidationException('HUGGING_FACE_EMPTY_INFERENCE_PAYLOAD', {
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

    throw new ValidationException('HUGGING_FACE_PAYLOAD_SERIALIZATION_FAILED', {
      originalErrorLiteral: errorDescriptionLiteral,
      correlationIdentifier,
    });
  }
};

/**
 * Construye el cuerpo HTTP JSON serializado conforme al protocolo del enrutador seleccionado.
 *
 * @param unvalidatedIntelligencePayloadSnapshot - Prompt o snapshot de contexto a analizar.
 * @param configurationSnapshot - Configuración certificada con modelo, protocolo y parámetros.
 * @param correlationIdentifier - Identificador UUID v4 de correlación forense.
 * @param systemInstructionPromptLiteral - Directiva del sistema opcional para Chat Completions.
 * @returns {string} Cuerpo JSON serializado listo para `fetch`.
 * @throws {ValidationException} Si el payload está vacío o contiene referencias circulares.
 */
export const BuildHuggingFaceInferenceRequestPayload = (
  unvalidatedIntelligencePayloadSnapshot: unknown,
  configurationSnapshot: IHuggingFaceResolvedConfiguration,
  correlationIdentifier: string,
  systemInstructionPromptLiteral: string = DEFAULT_SYSTEM_INSTRUCTION_PROMPT_LITERAL,
): string => {
  const promptContentLiteral = serializePromptInputLiteral(
    unvalidatedIntelligencePayloadSnapshot,
    correlationIdentifier,
  );

  if (configurationSnapshot.inferenceProtocolLiteral === 'OPENAI_CHAT_COMPLETIONS') {
    return JSON.stringify({
      model: configurationSnapshot.modelIdentifierLiteral,
      messages: [
        { role: 'system', content: systemInstructionPromptLiteral },
        { role: 'user', content: promptContentLiteral },
      ],
      max_tokens: configurationSnapshot.maxOutputTokensQuantity,
      temperature: configurationSnapshot.temperatureNumeric,
    });
  }

  return JSON.stringify({
    inputs: promptContentLiteral,
    parameters: {
      max_new_tokens: configurationSnapshot.maxOutputTokensQuantity,
      temperature: configurationSnapshot.temperatureNumeric,
      return_full_text: false,
    },
  });
};
