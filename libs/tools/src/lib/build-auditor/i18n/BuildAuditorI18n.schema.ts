/**
 * @section Tools Infrastructure - Build Auditor Linguistic Contract (SSOT)
 * @description Contrato Zod inmutable para validar los diccionarios de traducción del auditor
 * de artefactos de compilación (@floripa-dignidade/tools). Garantiza consistencia en las salidas
 * de terminal y mensajes de excepción técnica durante la inspección de binarios.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & ADR 0030).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa), ISO/IEC 25010 (Mantenibilidad y Confiabilidad).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { z } from 'zod';

/**
 * Crea un validador estricto para literales de terminal y registro técnico no vacíos.
 *
 * @param semanticDescriptionLiteral - Propósito descriptivo del literal para inspección estática.
 * @returns Esquema Zod purificado con longitud mínima de 1 carácter.
 */
const createRequiredLiteralSchema = (semanticDescriptionLiteral: string) =>
  z
    .string()
    .trim()
    .min(1, { message: 'BUILD_AUDITOR_I18N_EMPTY_LITERAL_DETECTED' })
    .describe(semanticDescriptionLiteral);

/**
 * @name BuildAuditorI18nSchema
 * @description Esquema maestro inmutable para los mensajes del auditor de artefactos de construcción.
 */
export const BuildAuditorI18nSchema = z
  .object({
    /** Mensajes informativos y de diagnóstico emitidos en la consola del auditor. */
    terminal: z
      .object({
        auditStartedLiteral: createRequiredLiteralSchema(
          'Mensaje de inicio de la secuencia de auditoría física de artefactos.',
        ),
        checkingPathLiteral: createRequiredLiteralSchema(
          'Indicador de ruta física de salida que está siendo inspeccionada.',
        ),
        emptyDirectoryWarning: createRequiredLiteralSchema(
          'Advertencia emitida cuando un directorio de compilación no contiene artefactos.',
        ),
        ioErrorLiteral: createRequiredLiteralSchema(
          'Mensaje de error cuando ocurre una falla de acceso o lectura en el sistema de archivos.',
        ),
        reportGeneratedLiteral: createRequiredLiteralSchema(
          'Mensaje de confirmación tras generar y persistir el reporte JSON de auditoría.',
        ),
      })
      .readonly()
      .describe('Literales para la interfaz de línea de comandos del auditor de compilación.'),

    /** Mensajes de excepción estructurada ante fallos de persistencia o sistema. */
    errors: z
      .object({
        persistenceFault: createRequiredLiteralSchema(
          'Mensaje de error cuando falla la escritura del reporte de auditoría en disco.',
        ),
      })
      .readonly()
      .describe('Literales para excepciones institucionales del auditor de construcción.'),
  })
  .readonly()
  .describe('Contrato lingüístico integral del auditor de artefactos de construcción.');

/**
 * @name IBuildAuditorI18n
 * @description Tipo inferido inmutable del diccionario validado del auditor de construcción.
 */
export type IBuildAuditorI18n = z.infer<typeof BuildAuditorI18nSchema>;
