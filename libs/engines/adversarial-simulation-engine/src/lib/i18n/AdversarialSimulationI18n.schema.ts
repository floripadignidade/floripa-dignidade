/**
 * @section Adversarial Engine DNA - Linguistic Integrity Schema
 * @description Define el contrato soberano para los diccionarios de seguridad
 * ofensiva. Garantiza que las brechas detectadas y los estados de auditoría
 * posean una descripción humana y técnica validada por Zod.
 *
 * Protocolo OEDP-V17.0 - Sovereign Data & ReadOnly Integrity.
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { z } from 'zod';

/**
 * @name AdversarialSimulationI18nSchema
 * @description Aduana de validación para las almas lingüísticas del Red Team.
 */
export const AdversarialSimulationI18nSchema = z
  .object({
    logs: z.object({
      SIMULATION_STARTED: z.string().describe('Mensaje de inicio de ráfaga de ataques.'),
      SIMULATION_COMPLETED: z.string().describe('Mensaje de finalización nominal.'),
      BREACH_DETECTED: z.string().describe('Alerta crítica de vulnerabilidad confirmada.'),
      DEFENSES_HELD: z.string().describe('Confirmación de integridad ante ataques.'),
    }),

    threatLevels: z.object({
      CRITICAL_COLLAPSE: z.string().describe('Definición de riesgo máximo (Fugas/Inyecciones).'),
      HIGH_RISK: z.string().describe('Definición de riesgo alto (Bypass/Auth).'),
      MODERATE_FLAW: z.string().describe('Definición de debilidad estructural.'),
      LOW_FRICTION: z.string().describe('Definición de hallazgo menor.'),
    }),

    audit: z.object({
      reportHeadlineLiteral: z.string().describe('Título del reporte para Shannon/GitHub.'),
      remediationPreambleLiteral: z.string().describe('Texto introductorio para las soluciones.'),
      noVulnerabilitiesFoundLiteral: z
        .string()
        .describe('Mensaje de felicitación por código seguro.'),
    }),
  })
  .readonly();

/** 🛡️ ADN Tipado para exportación Verbatim */
export type IAdversarialSimulationI18n = z.infer<typeof AdversarialSimulationI18nSchema>;
