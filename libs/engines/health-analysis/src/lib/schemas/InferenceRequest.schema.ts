/**
 * @section Health Analysis DNA - Inference Request Schema
 * @description Define el contrato de integridad para las solicitudes de análisis
 * cognitivo. Garantiza que el snapshot de salud sea procesable por la IA.
 *
 * Protocolo OEDP-V17.0 - Sovereign Data & ReadOnly Integrity.
 * @author Raz Podestá - MetaShark Tech
 */

import { z } from 'zod';

/**
 * @name InferenceRequestSchema
 * @description Aduana de ADN para los datos que alimentan al Neural Sentinel.
 */
export const InferenceRequestSchema = z.object({
  /** Colección de señales de telemetría o estados de salud capturados. */
  healthContextSnapshot: z.record(z.string(), z.unknown())
    .describe('Snapshot inmutable del estado del sistema bajo auditoría.'),

  /** Etiquetas semánticas para orientar el razonamiento de la IA. */
  analysisScopeTagsCollection: z.array(z.string())
    .min(1, { message: 'AT_LEAST_ONE_SCOPE_TAG_REQUIRED' })
    .describe('Identificadores de los dominios a auditar (ej: SRE, SECURITY, UI).'),

  /** Prioridad de procesamiento para el motor de inferencia. */
  inferencePriorityLevel: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'])
    .default('MEDIUM'),

}).readonly();

/** 🛡️ ADN Tipado para exportación Verbatim */
export type IInferenceRequest = z.infer<typeof InferenceRequestSchema>;
