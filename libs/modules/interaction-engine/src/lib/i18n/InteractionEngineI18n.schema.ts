/**
 * @section Interaction Engine Contracts - Linguistic Integrity Schema (SSOT)
 * @description Contrato Zod inmutable para validar los diccionarios de traducción del módulo
 * de interacciones y sentimiento cívico (`@floripa-dignidade/interaction-engine`). Garantiza
 * cobertura completa para los registros operativos emitidos en tiempo real y offline, así
 * como para las respuestas de error hacia el usuario, con validación no vacía e inmutabilidad.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & ADR 0030).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa), ISO/IEC 25010 (Mantenibilidad y Confiabilidad).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { z } from 'zod';

/**
 * Crea un validador estricto para literales lingüísticos obligatorios sin espacios residuales.
 *
 * @param semanticDescriptionLiteral - Descripción técnica para inspección automatizada de contratos.
 * @returns Esquema Zod de cadena purificada con longitud mínima de 1 carácter.
 */
const createRequiredTranslationLiteralSchema = (semanticDescriptionLiteral: string) =>
  z
    .string()
    .trim()
    .min(1, { message: 'INTERACTION_ENGINE_I18N_EMPTY_TRANSLATION_LITERAL' })
    .describe(semanticDescriptionLiteral);

/**
 * @name InteractionEngineI18nSchema
 * @description Esquema maestro inmutable para la validación de diccionarios de interacción social.
 */
export const InteractionEngineI18nSchema = z
  .object({
    /** Mensajes de trazabilidad operativa emitidos durante el procesamiento de reacciones. */
    logs: z
      .object({
        REACTION_RECEIVED: createRequiredTranslationLiteralSchema(
          'Confirmación operativa de captura y validación de una interacción ciudadana.',
        ),
        ANONYMOUS_REACTION_PONDERED: createRequiredTranslationLiteralSchema(
          'Registro informativo de ponderación estadística reducida para interacción anónima.',
        ),
        OFFLINE_DEFERRAL: createRequiredTranslationLiteralSchema(
          'Aviso operativo de encolamiento local de la interacción por ausencia de conectividad.',
        ),
      })
      .readonly()
      .describe('Catálogo de mensajes de registro operativo del motor de interacciones.'),

    /** Mensajes de error estructurado ante fallos de validación, duplicidad o transporte. */
    errors: z
      .object({
        REACTION_CONTRACT_VIOLATION: createRequiredTranslationLiteralSchema(
          'Mensaje emitido cuando la estructura de la reacción incumple el contrato Zod.',
        ),
        DUPLICATE_REACTION_BLOCKED: createRequiredTranslationLiteralSchema(
          'Mensaje de prevención cuando se detecta envío repetitivo automatizado de reacciones.',
        ),
        CLOUD_TRANSMISSION_FAILED: createRequiredTranslationLiteralSchema(
          'Mensaje de contingencia cuando falla el despacho físico hacia el repositorio remoto.',
        ),
      })
      .readonly()
      .describe('Catálogo de mensajes de error y validación del motor de interacciones.'),
  })
  .readonly()
  .describe('Contrato lingüístico integral del módulo de interacciones ciudadanas.');

/**
 * @name IInteractionEngineI18n
 * @description Tipo inmutable inferido del diccionario validado del módulo de interacciones.
 */
export type IInteractionEngineI18n = z.infer<typeof InteractionEngineI18nSchema>;
