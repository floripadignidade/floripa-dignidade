/**
 * @section Adversarial Engine DNA - Forensic Audit Report Schema
 * @description Define la estructura del documento final de salida que agrupa
 * todas las vulnerabilidades encontradas durante una sesión de simulación.
 * Este es el objeto que consumirán los adaptadores (Shannon/SARIF).
 *
 * Protocolo OEDP-V17.0 - Sovereign Data & ReadOnly Integrity.
 * @author Raz Podestá - MetaShark Tech
 */

import { z } from 'zod';
import { AdversarialVulnerabilitySchema } from './AdversarialVulnerability.schema';

/**
 * @name ForensicAuditReportSchema
 * @description Contenedor maestro del resultado de la simulación ofensiva.
 */
export const ForensicAuditReportSchema = z
  .object({
    reportIdentifier: z
      .string()
      .uuid()
      .describe('Identificador soberano de la sesión de ejecución del Red Team.'),

    totalSimulationsExecutedQuantity: z
      .number()
      .int()
      .nonnegative()
      .describe('Volumen total de inyecciones intentadas contra el ecosistema.'),

    executionDurationInMillisecondsNumeric: z
      .number()
      .nonnegative()
      .describe('Costo de latencia total de la auditoría.'),

    /** Colección de fallas exitosas. Si está vacío, el sistema es nominalmente seguro. */
    detectedVulnerabilitiesCollection: z
      .array(AdversarialVulnerabilitySchema)
      .describe('Listado integral de brechas de seguridad confirmadas.'),

    auditStartTimestampISO: z.string().datetime(),
    auditEndTimestampISO: z.string().datetime(),
  })
  .readonly();

/** 🛡️ ADN Tipado */
export type IForensicAuditReport = z.infer<typeof ForensicAuditReportSchema>;
