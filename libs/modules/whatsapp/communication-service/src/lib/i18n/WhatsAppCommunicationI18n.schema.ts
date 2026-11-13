/**
 * @section WhatsApp Communication Service - Linguistic Integrity Schema (SSOT)
 * @description Contrato Zod inmutable para validar los diccionarios de traducción del servicio
 * de comunicación y webhooks de Meta WhatsApp (@floripa-dignidade/whatsapp-communication-service).
 * Garantiza consistencia semántica en registros telemétricos y manejo de errores de interfaz.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & ADR 0030).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa), ISO/IEC 25010 (Mantenibilidad y Confiabilidad).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { z } from 'zod';

/**
 * Crea un validador estricto para literales de traducción requeridos sin espacios en blanco residuales.
 *
 * @param semanticDescriptionLiteral - Descripción técnica del propósito semántico del literal.
 * @returns Esquema Zod purificado con longitud mínima de 1 carácter.
 */
const createRequiredTranslationLiteralSchema = (semanticDescriptionLiteral: string) =>
  z
    .string()
    .trim()
    .min(1, { message: 'WHATSAPP_I18N_EMPTY_TRANSLATION_LITERAL' })
    .describe(semanticDescriptionLiteral);

/**
 * @name WhatsAppCommunicationI18nSchema
 * @description Esquema maestro inmutable para la validación de diccionarios del servicio de WhatsApp.
 */
export const WhatsAppCommunicationI18nSchema = z
  .object({
    /** Mensajes de trazabilidad emitidos durante el procesamiento de eventos de Meta. */
    logs: z
      .object({
        TRIAGE_SEQUENCE_STARTED: createRequiredTranslationLiteralSchema(
          'Señal emitida al recibir e iniciar el triaje de un paquete de datos de Meta.',
        ),
        CLASSIFYING_SIGNAL_TYPE: createRequiredTranslationLiteralSchema(
          'Mensaje de trazabilidad durante la identificación del tipo de medio recibido.',
        ),
        UNKNOWN_SIGNAL_TYPE_IGNORED: createRequiredTranslationLiteralSchema(
          'Alerta emitida cuando se recibe un evento no soportado por el ecosistema.',
        ),
      })
      .readonly()
      .describe('Catálogo de mensajes de registro operativo del servicio de WhatsApp.'),

    /** Mensajes descriptivos de errores de procesamiento y validación de webhooks. */
    errors: z
      .object({
        CORRUPT_WEBHOOK_PAYLOAD: createRequiredTranslationLiteralSchema(
          'Error semántico cuando la carga útil JSON de Meta no cumple el contrato de datos.',
        ),
      })
      .readonly()
      .describe('Catálogo de mensajes de error de procesamiento de webhooks de WhatsApp.'),
  })
  .readonly()
  .describe('Contrato lingüístico integral del servicio de comunicación de WhatsApp.');

/**
 * @name IWhatsAppCommunicationI18n
 * @description Tipo inferido inmutable del diccionario validado de WhatsApp.
 */
export type IWhatsAppCommunicationI18n = z.infer<typeof WhatsAppCommunicationI18nSchema>;
