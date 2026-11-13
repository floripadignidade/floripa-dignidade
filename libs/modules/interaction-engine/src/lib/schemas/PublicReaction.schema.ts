/**
 * @section Interaction DNA - Public Reaction Schema
 * @description Define el contrato para interacciones sociales (Likes, Reacciones).
 * Permite tanto el apoyo anónimo (emoticones) como el respaldo identificado,
 * inyectando los metadatos necesarios para el motor de estadísticas.
 *
 * Protocolo OEDP-V16.0 - High Performance & Responsible Weighting.
 * Vision: Semantic Sentiment Capture for Social Impact.
 *
 * @author Raz Podestá - MetaShark Tech
 */

import { z } from 'zod';

/**
 * @section Catálogo de Emociones Técnicas (Emoticones ISO)
 * Define las reacciones permitidas para evitar el lenguaje de odio y
 * promover la objetividad popular.
 */
export const EmoticonIntentionSchema = z
  .enum([
    'RESPECT', // 🤝 Respeto / Acuerdo institucional
    'SOLIDARITY', // ❤️ Solidaridad con la causa
    'SKEPTICISM', // 🧐 Escepticismo / Requiere más pruebas
    'INDIGNATION', // 😡 Indignación por violación de derechos
    'TRANSPARENCY', // 💎 Valoración de claridad de datos
  ])
  .describe('Intención semántica del emoticón seleccionado.');

/**
 * @name PublicReactionSchema
 * @description Contrato maestro para un pulso de interacción social.
 */
export const PublicReactionSchema = z
  .object({
    /** Identificador único de la interacción para rastro forense. */
    interactionIdentifier: z.string().uuid(),

    /** Referencia física a la entidad que recibe la reacción (Noticia, Denuncia, etc). */
    targetEntityIdentifier: z
      .string()
      .uuid()
      .describe('Referencia unívoca al objeto de interés social.'),

    /**
     * Identidad del Actor.
     * Si es NULL, el motor de impacto lo clasifica como 'Ruido Popular' (Peso 0.1).
     */
    evaluatorIdentityIdentifier: z
      .string()
      .uuid()
      .nullable()
      .describe('ID del ciudadano logueado. Null representa interacción anónima.'),

    /** Tipo de reacción cuantitativa (Like/Unlike). */
    interactionPolarityNumeric: z
      .number()
      .min(-1)
      .max(1)
      .describe('Valor de polaridad: 1 (Apoyo), -1 (Rechazo), 0 (Neutral).'),

    /** Reacción cualitativa visual. */
    semanticEmoticonIntention: EmoticonIntentionSchema.optional(),

    /**
     * Snapshot de Privacidad.
     * Almacena el nombre anonimizado (ANAluiza S.) en el momento de la reacción
     * para evitar consultas pesadas al búnker de identidad.
     */
    evaluatorPublicAliasLiteral: z.string().default('Cidadão Anônimo'),

    /** URL del avatar para transparencia visual (solo si está logueado). */
    evaluatorAvatarSourceUrl: z.string().url().nullable().optional(),

    /**
     * Geolocalización Técnica (PII Masked).
     * Almacena el barrio, no la coordenada exacta, para el Mapa de Calor Popular.
     */
    territorialContextLiteral: z.string().default('FLORIANÓPOLIS_GLOBAL'),

    /** Marca temporal inmutable. */
    occurrenceTimestampISO: z.string().datetime(),
  })
  .readonly();

/** 🛡️ ADN Tipado para exportación Verbatim */
export type IPublicReaction = z.infer<typeof PublicReactionSchema>;
