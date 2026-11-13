/**
 * @section Telemetry DNA - Sovereign Signal Schema (Zenith Edition)
 * @description Define el contrato de integridad absoluto para las señales del
 * sistema nervioso central. Implementa soporte para encadenamiento Merkle,
 * blindaje de privacidad AES-GCM y etiquetado ontológico para la IA.
 *
 * Protocolo OEDP-V17.0 - Sovereign Data & Cryptographic Integrity.
 * SANEADO Zenith: Inyección de soporte para IV de cifrado e inmutabilidad total.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { z } from 'zod';

/**
 * @section ADN Criptográfico (Branded Types)
 * @description Sellos de marca nominal para evitar colisiones de identidad.
 */
export const CorrelationIdentifierSchema = z.string().uuid().brand<'CorrelationIdentifier'>();
export type CorrelationIdentifier = z.infer<typeof CorrelationIdentifierSchema>;

export const ModuleIdentifierSchema = z.string().min(3).brand<'ModuleIdentifier'>();
export type ModuleIdentifier = z.infer<typeof ModuleIdentifierSchema>;

export const OperationCodeSchema = z.string().min(3).brand<'OperationCode'>();
export type OperationCode = z.infer<typeof OperationCodeSchema>;

export const ContentFingerprintSchema = z.string().length(64).brand<'ContentFingerprint'>();
export type ContentFingerprint = z.infer<typeof ContentFingerprintSchema>;

/**
 * @section Taxonomía de Severidad
 */
export const SeverityLevelSchema = z
  .enum(['DEBUG', 'INFO', 'WARNING', 'ERROR', 'CRITICAL'])
  .describe('Niveles de prioridad para el triaje y escalado en el Neural Sentinel.');

export type SeverityLevel = z.infer<typeof SeverityLevelSchema>;

/**
 * @name TelemetrySignalSchema
 * @description Contrato maestro de un pulso telemétrico de alta fidelidad.
 * Diseñado para ser inmutable y resistente a la manipulación de evidencia.
 */
export const TelemetrySignalSchema = z
  .object({
    /** Marca temporal inmutable del evento (ISO 8601). */
    occurrenceTimestampISO: z
      .string()
      .datetime()
      .describe('Marca de tiempo exacta de la interacción física capturada por el hardware.'),

    /** Prioridad técnica de la señal. */
    severityLevelLiteral: SeverityLevelSchema,

    /** Identificador nominal del búnker emisor (ISO: Objeto). */
    moduleIdentifierLiteral: ModuleIdentifierSchema,

    /** Código semántico de la acción realizada (ISO: Propiedad). */
    operationCodeLiteral: OperationCodeSchema,

    /** Rastro forense cross-module que vincula toda la transacción digital. */
    correlationIdentifier: CorrelationIdentifierSchema,

    /** Mensaje descriptivo o clave de diccionario i18n para auditoría humana. */
    messageContentLiteral: z
      .string()
      .describe('Representación textual o semántica del evento capturado.'),

    /**
     * @section Capa Merkle (Cadena de Custodia)
     */
    previousEventHashFingerprint: ContentFingerprintSchema.optional().describe(
      'Huella digital del log cronológicamente anterior en el Ledger.',
    ),

    contentHashFingerprint: ContentFingerprintSchema.optional().describe(
      'Firma SHA-256 del contenido actual para garantizar la inalterabilidad.',
    ),

    /**
     * @section Capa de Privacidad y Blindaje PII
     */
    isEncryptedPayloadBoolean: z
      .boolean()
      .default(false)
      .describe('Indica si el snapshot de metadatos ha sido cifrado mediante AES-256-GCM.'),

    /** 🛡️ SANEADO Zenith: Requerido para el descifrado de datos sensibles. */
    encryptionInitializationVectorLiteral: z
      .string()
      .optional()
      .describe('Token Base64 del IV utilizado en el algoritmo de cifrado simétrico.'),

    /** Etiqueta ontológica para el diagnóstico de la IA (Ej: "AUTH_BYPASS_ATTEMPT"). */
    semanticIntentTag: z
      .string()
      .optional()
      .describe('Clasificación lógica para el motor de análisis de salud algorítmica.'),

    /** Métrica de rendimiento capturada en microsegundos. */
    executionLatencyInMillisecondsQuantity: z
      .number()
      .nonnegative()
      .optional()
      .describe('Tiempo de procesamiento medido físicamente por el runtime.'),

    /** Captura inmutable de estado adicional (Contextual Snapshot). */
    contextMetadataSnapshot: z
      .record(z.string(), z.unknown())
      .optional()
      .describe('Diccionario de variables de entorno y estados del búnker emisor.'),
  })
  .readonly(); // Inmutabilidad forzada en el ADN de datos.

/** 🛡️ ADN Tipado para el Enjambre de Telemetría Zenith */
export type ITelemetrySignal = z.infer<typeof TelemetrySignalSchema>;
