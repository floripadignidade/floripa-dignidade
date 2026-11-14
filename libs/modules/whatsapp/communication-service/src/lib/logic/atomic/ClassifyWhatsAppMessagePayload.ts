/**
 * @section WhatsApp Logic - Message Payload Classifier (Atom)
 * @description Átomo de lógica pura encargado de inspeccionar y clasificar el tipo de
 * mensaje entrante conforme a la especificación de Meta WhatsApp Cloud API
 * (text, image, video, audio, voice, location, document, reaction, interactive, button).
 * Implementa despacho por mapa inmutable de estrategias para mantener complejidad ciclomática
 * mínima, validar la frontera de entrada y garantizar salidas certificadas con Zod.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Isomorphic).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa) e ISO/IEC 25010 (Modularidad y Confiabilidad).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { ValidationException } from '@floripa-dignidade/exceptions';

import type { IWhatsAppMessage } from '../../schemas/WhatsAppWebhook.schema';
import {
  type IWhatsAppMessageClassification,
  WhatsAppMessageClassificationSchema,
} from './schemas/WhatsAppMessageClassification.schema';

type TMessageClassifierStrategy = (
  messageSnapshot: IWhatsAppMessage,
) => IWhatsAppMessageClassification;

const extractMediaPayloadSnapshot = (messageSnapshot: IWhatsAppMessage) => {
  return (
    messageSnapshot.image ??
    messageSnapshot.video ??
    messageSnapshot.audio ??
    messageSnapshot.voice ??
    messageSnapshot.document
  );
};

const classifyTextMessageStrategy: TMessageClassifierStrategy = (messageSnapshot) => {
  const rawTextBodyLiteral = messageSnapshot.text?.body ?? '';
  const sanitizedTextBodyLiteral = rawTextBodyLiteral.trim();
  const hasBodyContentBoolean = sanitizedTextBodyLiteral.length > 0;

  return WhatsAppMessageClassificationSchema.parse({
    metaMessageIdentifier: messageSnapshot.id,
    messageTypeLiteral: messageSnapshot.type,
    targetSubsystemLiteral: 'HUMAN_RIGHTS_TEXT_EVALUATION',
    hasExtractableContentBoolean: hasBodyContentBoolean,
    summaryDescriptionLiteral: 'Mensaje de texto ciudadano para triaje de derechos humanos.',
    classificationMetadata: Object.freeze({
      characterCountQuantity: sanitizedTextBodyLiteral.length,
      hasBodyContentBoolean,
    }),
  });
};

const classifyMediaMessageStrategy: TMessageClassifierStrategy = (messageSnapshot) => {
  const mediaPayloadSnapshot = extractMediaPayloadSnapshot(messageSnapshot);
  const mediaAssetIdentifier = mediaPayloadSnapshot ? mediaPayloadSnapshot.id : 'UNKNOWN_MEDIA_ID';
  const mimeTypeLiteral = mediaPayloadSnapshot
    ? mediaPayloadSnapshot.mime_type
    : 'application/octet-stream';
  const hasExtractableContentBoolean = Boolean(mediaPayloadSnapshot?.id);
  const hasIntegrityHashBoolean = Boolean(mediaPayloadSnapshot?.sha256);

  return WhatsAppMessageClassificationSchema.parse({
    metaMessageIdentifier: messageSnapshot.id,
    messageTypeLiteral: messageSnapshot.type,
    targetSubsystemLiteral: 'FORENSIC_MULTIMEDIA_EVIDENCE',
    hasExtractableContentBoolean,
    summaryDescriptionLiteral: `Evidencia multimedia ciudadana (${messageSnapshot.type}) para custodia en la bóveda.`,
    classificationMetadata: Object.freeze({
      mediaAssetIdentifier,
      mimeTypeLiteral,
      hasIntegrityHashBoolean,
    }),
  });
};

const classifyLocationMessageStrategy: TMessageClassifierStrategy = (messageSnapshot) => {
  const locationPayloadSnapshot = messageSnapshot.location;

  if (!locationPayloadSnapshot) {
    return WhatsAppMessageClassificationSchema.parse({
      metaMessageIdentifier: messageSnapshot.id,
      messageTypeLiteral: messageSnapshot.type,
      targetSubsystemLiteral: 'TERRITORIAL_VULNERABILITY_POINT',
      hasExtractableContentBoolean: false,
      summaryDescriptionLiteral:
        'Coordenada geográfica ciudadana para mapeo de vulnerabilidad territorial.',
      classificationMetadata: Object.freeze({
        latitudeNumeric: 0,
        longitudeNumeric: 0,
        hasPlaceNameBoolean: false,
      }),
    });
  }

  const hasValidCoordinatesBoolean =
    typeof locationPayloadSnapshot.latitude === 'number' &&
    typeof locationPayloadSnapshot.longitude === 'number';
  const hasPlaceNameBoolean = Boolean(locationPayloadSnapshot.name);

  return WhatsAppMessageClassificationSchema.parse({
    metaMessageIdentifier: messageSnapshot.id,
    messageTypeLiteral: messageSnapshot.type,
    targetSubsystemLiteral: 'TERRITORIAL_VULNERABILITY_POINT',
    hasExtractableContentBoolean: hasValidCoordinatesBoolean,
    summaryDescriptionLiteral:
      'Coordenada geográfica ciudadana para mapeo de vulnerabilidad territorial.',
    classificationMetadata: Object.freeze({
      latitudeNumeric: locationPayloadSnapshot.latitude,
      longitudeNumeric: locationPayloadSnapshot.longitude,
      hasPlaceNameBoolean,
    }),
  });
};

const classifyInteractionPulseStrategy: TMessageClassifierStrategy = (messageSnapshot) => {
  return WhatsAppMessageClassificationSchema.parse({
    metaMessageIdentifier: messageSnapshot.id,
    messageTypeLiteral: messageSnapshot.type,
    targetSubsystemLiteral: 'CIVIC_INTERACTION_PULSE',
    hasExtractableContentBoolean: true,
    summaryDescriptionLiteral: `Interacción interactiva o reacción ciudadana (${messageSnapshot.type}).`,
    classificationMetadata: Object.freeze({
      interactionTypeLiteral: messageSnapshot.type,
    }),
  });
};

const classifyUnhandledSignalStrategy: TMessageClassifierStrategy = (messageSnapshot) => {
  return WhatsAppMessageClassificationSchema.parse({
    metaMessageIdentifier: messageSnapshot.id,
    messageTypeLiteral: messageSnapshot.type,
    targetSubsystemLiteral: 'UNHANDLED_SIGNAL_TYPE',
    hasExtractableContentBoolean: false,
    summaryDescriptionLiteral: `Señal no clasificada recibida de Meta WhatsApp: [${messageSnapshot.type}].`,
    classificationMetadata: Object.freeze({
      unhandledTypeLiteral: messageSnapshot.type,
    }),
  });
};

const MESSAGE_CLASSIFIER_STRATEGIES_REGISTRY: ReadonlyMap<string, TMessageClassifierStrategy> =
  new Map<string, TMessageClassifierStrategy>([
    ['text', classifyTextMessageStrategy],
    ['image', classifyMediaMessageStrategy],
    ['video', classifyMediaMessageStrategy],
    ['audio', classifyMediaMessageStrategy],
    ['voice', classifyMediaMessageStrategy],
    ['document', classifyMediaMessageStrategy],
    ['location', classifyLocationMessageStrategy],
    ['reaction', classifyInteractionPulseStrategy],
    ['interactive', classifyInteractionPulseStrategy],
    ['button', classifyInteractionPulseStrategy],
  ]);

/**
 * Clasifica de forma determinista el mensaje recibido según su medio y propósito funcional.
 *
 * @param messageSnapshot - Mensaje individual extraído del payload del webhook de Meta.
 * @returns {IWhatsAppMessageClassification} Descriptor clasificado, validado e inmutable.
 * @throws {ValidationException} Si el mensaje carece de identificador o tipo estructural.
 */
export const ClassifyWhatsAppMessagePayload = (
  messageSnapshot: IWhatsAppMessage,
): IWhatsAppMessageClassification => {
  if (!messageSnapshot || !messageSnapshot.id || !messageSnapshot.type) {
    throw new ValidationException('WHATSAPP_MESSAGE_CLASSIFICATION_INPUT_INVALID', {
      hasMessageIdBoolean: Boolean(messageSnapshot?.id),
      hasMessageTypeBoolean: Boolean(messageSnapshot?.type),
    });
  }

  const classifierStrategyAction =
    MESSAGE_CLASSIFIER_STRATEGIES_REGISTRY.get(messageSnapshot.type) ??
    classifyUnhandledSignalStrategy;

  return classifierStrategyAction(messageSnapshot);
};
