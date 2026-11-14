/**
 * @section WhatsApp Contracts - Message Classification Schema (Atom)
 * @description Define la taxonomía ontológica inmutable para la clasificación de
 * mensajes entrantes de Meta WhatsApp Cloud API hacia los subsistemas del ecosistema.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Clean Paths).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa) e ISO/IEC 25010 (Mantenibilidad).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { z } from 'zod';

export const WhatsAppMessageTargetSubsystemSchema = z
  .enum([
    'HUMAN_RIGHTS_TEXT_EVALUATION',
    'FORENSIC_MULTIMEDIA_EVIDENCE',
    'TERRITORIAL_VULNERABILITY_POINT',
    'CIVIC_INTERACTION_PULSE',
    'UNHANDLED_SIGNAL_TYPE',
  ])
  .describe('Subsistema o dominio receptor de la señal ciudadana entrante.');

export type TWhatsAppMessageTargetSubsystem = z.infer<typeof WhatsAppMessageTargetSubsystemSchema>;

/**
 * @name WhatsAppMessageClassificationSchema
 * @description Contrato Zod inmutable que estructura la clasificación y metadatos de un mensaje.
 */
export const WhatsAppMessageClassificationSchema = z
  .object({
    metaMessageIdentifier: z.string().min(1),
    messageTypeLiteral: z.string().min(1),
    targetSubsystemLiteral: WhatsAppMessageTargetSubsystemSchema,
    hasExtractableContentBoolean: z.boolean(),
    summaryDescriptionLiteral: z.string().min(1),
    classificationMetadata: z.record(z.string(), z.unknown()).readonly(),
  })
  .readonly();

export type IWhatsAppMessageClassification = z.infer<typeof WhatsAppMessageClassificationSchema>;
