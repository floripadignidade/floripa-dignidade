/**
 * @section User Management & Identity - Identity Integrity Contracts
 * @description Define el contrato de integridad para el resultado del cálculo de
 * antigüedad. Garantiza que los metadatos temporales y los bonos aplicados
 * cumplan con el estándar de inmutabilidad institucional.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First).
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { z } from 'zod';

/**
 * @name IdentitySeniorityResultSchema
 * @description Validador estructural para los resultados del motor de antigüedad.
 *
 * @prompt_ia: "Asegura que 'seniorityBonusNumeric' no exceda el límite de 0.2 (20%)
 * y que 'daysSinceActivationQuantity' sea un número entero no negativo."
 */
export const IdentitySeniorityResultSchema = z
  .object({
    /** Cantidad total de días transcurridos desde la activación de la identidad. */
    daysSinceActivationQuantity: z.number().int().nonnegative(),

    /** Coeficiente de bonificación acumulado (Rango: 0.0 a 0.2). */
    seniorityBonusNumeric: z.number().min(0).max(0.2),
  })
  .readonly();

/** 🛡️ ADN Tipado para exportación Verbatim */
export type IIdentitySeniorityResult = z.infer<typeof IdentitySeniorityResultSchema>;
