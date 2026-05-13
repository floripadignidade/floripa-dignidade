/**
 * @section Reputation Engine - Public Evaluation Pulse DNA
 * @description Define el contrato inmutable para los eventos de evaluación ciudadana.
 * Implementa el estándar ISO 20488 para la integridad de reseñas y juicios de valor.
 * Actúa como la Única Fuente de Verdad (SSOT) para la ingesta de credibilidad popular.
 *
 * Protocolo OEDP-V17.0 - Sovereign Data & Branded Type Integrity.
 * SANEADO Zenith: Inyección de Branding para identificadores, cumplimiento de
 * Prosa ISO y descriptores técnicos para auditoría por IA.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { z } from 'zod';

/**
 * @section ADN Criptográfico - Tipificación Nominal (Branding)
 * @description Sellos de marca que impiden la confusión de identificadores en el
 * motor de tipos, asegurando que un ID de transacción no sea usado como ID de usuario.
 */

export const EvaluationTransactionIdentifierSchema = z.string()
  .uuid()
  .brand<'EvaluationTransactionIdentifier'>();
export type TEvaluationTransactionIdentifier = z.infer<typeof EvaluationTransactionIdentifierSchema>;

export const EvaluatedEntityIdentifierSchema = z.string()
  .uuid()
  .brand<'EvaluatedEntityIdentifier'>();
export type TEvaluatedEntityIdentifier = z.infer<typeof EvaluatedEntityIdentifierSchema>;

export const EvaluatorIdentityIdentifierSchema = z.string()
  .uuid()
  .brand<'EvaluatorIdentityIdentifier'>();
export type TEvaluatorIdentityIdentifier = z.infer<typeof EvaluatorIdentityIdentifierSchema>;

/**
 * Categorías oficiales sujetas a evaluación por la comunidad.
 * Define el radio de acción del motor de reputación.
 */
export const EvaluatedEntityTypeSchema = z.enum([
  'CITIZEN_IDENTITY',           // Evaluación de conducta/credibilidad de un usuario.
  'INSTITUTIONAL_ORGANIZATION', // Evaluación de transparencia de una ONG o Ente.
  'NEWS_ARTICLE_CONTENT',       // Validación de veracidad de una noticia.
  'HUMAN_RIGHTS_REPORT'         // Validación de la existencia de un hecho denunciado.
]).describe('Categoría técnica de la entidad que recibe la evaluación pública.');

export type TEvaluatedEntityType = z.infer<typeof EvaluatedEntityTypeSchema>;

/**
 * @name PublicEvaluationPulseSchema
 * @description Contrato maestro de una interacción de auditoría popular.
 * Implementa inmutabilidad forzada para proteger el flujo sanguíneo digital.
 */
export const PublicEvaluationPulseSchema = z.object({
  /** Identificador único inalterable de la transacción de evaluación. */
  evaluationTransactionIdentifier: EvaluationTransactionIdentifierSchema,

  /** Referencia física a la entidad que recibe la calificación. */
  targetEntityIdentifier: EvaluatedEntityIdentifierSchema,

  /** Clasificación ontológica del objetivo para triaje estadístico. */
  targetEntityType: EvaluatedEntityTypeSchema,

  /** Identificador nominal del ciudadano que emite el juicio. */
  evaluatorIdentityIdentifier: EvaluatorIdentityIdentifierSchema,

  /**
   * EVALUACIÓN CUANTITATIVA (Puntuación de Confianza)
   * Rango: 0.0 (Falsedad/Desconfianza) a 1.0 (Verdad/Confianza Absoluta).
   */
  quantitativeTrustScoreNumeric: z.number()
    .min(0)
    .max(1)
    .describe('Grado de credibilidad otorgado: 0 (Nulo) a 1 (Total).'),

  /**
   * EVALUACIÓN CUALITATIVA (Testimonio de Soporte)
   * Aporta el rastro semántico para la auditoría de veracidad.
   */
  qualitativeCommentaryLiteral: z.string()
    .min(10, { message: 'REPUTATION.ERRORS.COMMENTARY_TOO_SHORT' })
    .max(1000, { message: 'REPUTATION.ERRORS.COMMENTARY_EXCEEDS_MAXIMUM_LENGTH' })
    .transform((value) => value.trim())
    .describe('Argumentación textual que fundamenta la puntuación numérica.'),

  /** Determina si el pulso incluye rastro documental o multimedia adjunto. */
  hasSupportingEvidenceBoolean: z.boolean()
    .default(false)
    .describe('Indica si el ciudadano ha vinculado pruebas físicas a su juicio.'),

  /**
   * Contexto Territorial (Jurisdicción Geográfica).
   * Vital para el motor de impacto por barrios de Florianópolis.
   */
  territorialContextLiteral: z.string()
    .optional()
    .describe('Ubicación física vinculada a la evaluación (ej: "TAPERA").'),

  /**
   * Bóveda de Metadatos (Forensic Metadata).
   * Almacena pesos de ponderación bayesiana o firmas de hardware.
   */
  metadataSnapshot: z.record(z.string(), z.unknown())
    .optional()
    .describe('Captura de variables de entorno y estados del sensor emisor.'),

}).readonly();

/** 🛡️ ADN Tipado para exportación Verbatim */
export type IPublicEvaluationPulse = z.infer<typeof PublicEvaluationPulseSchema>;
