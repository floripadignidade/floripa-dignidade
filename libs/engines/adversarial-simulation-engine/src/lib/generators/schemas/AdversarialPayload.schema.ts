/**
 * @section Adversarial DNA - Malicious Payload Schema
 * @description Define el contrato estructural de un vector de ataque.
 * Garantiza que cada "arma" del simulador incluya la metadata táctica necesaria
 * para que la IA (Shannon) pueda generar reportes explicativos detallados.
 *
 * Protocolo OEDP-V17.0 - Sovereign Data & Forensic Transparency.
 * @author Raz Podestá - MetaShark Tech
 */

import { z } from 'zod';
import { ThreatSeverityLevelSchema } from '../../schemas/AdversarialVulnerability.schema';

/**
 * @name AdversarialPayloadSchema
 * @description Estructura inmutable de un vector de inyección simulado.
 */
export const AdversarialPayloadSchema = z
  .object({
    /** Identificador técnico del arma. */
    payloadIdentifier: z.string().uuid(),

    /** El dato corrupto real que será inyectado en el sistema (String o JSON). */
    maliciousPayloadContentSnapshot: z
      .unknown()
      .describe('El contenido del ataque que se enviará a la aduana Zod o función.'),

    /** Descripción de la técnica de hacking utilizada. */
    attackTechniqueDescriptionLiteral: z
      .string()
      .describe('Explicación técnica de la evasión (Ej: "Mutación de prototipo JSON").'),

    /** Severidad inherente al payload si lograse ejecutarse. */
    intrinsicThreatSeverityLevel: ThreatSeverityLevelSchema,
  })
  .readonly();

/** 🛡️ ADN Tipado para exportación Verbatim */
export type IAdversarialPayload = z.infer<typeof AdversarialPayloadSchema>;
