/**
 * @section User Management & Identity - Identity Logic Atoms
 * @description Átomo de lógica pura encargado de computar el beneficio por antigüedad
 * institucional. Calcula el delta temporal entre la activación y el momento actual,
 * proyectando un bono lineal hasta alcanzar el teto de madurez definido por el negocio.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First).
 * Calidad: ISO/IEC 25010 (Mantenibilidad y Precisión Matemática).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

/* 1. ADN ESTRUCTURAL (Consumo desde SSOT Contracts) */
import { IdentitySeniorityResultSchema } from '@floripa-dignidade/contracts';
import type { IIdentitySeniorityResult } from '@floripa-dignidade/contracts';

/**
 * @section Definiciones de Madurez Institucional (Ground Truth)
 */
const SENIORITY_MAXIMUM_BONUS_NUMERIC = 0.2;
const FULL_TRUST_CYCLE_DAYS_QUANTITY = 365;

/**
 * Calcula el beneficio de autoridad basado en el tiempo de permanencia ética en la red.
 * Implementa una progresión lineal hasta alcanzar un año de antigüedad.
 *
 * @param activationTimestampISO - Marca temporal inmutable de nacimiento de la identidad.
 * @returns {IIdentitySeniorityResult} Resultado validado y sellado del cálculo.
 *
 * @prompt_ia: "Verifica que el diferencial de tiempo sea calculado en UTC para
 * evitar discrepancias horarias entre nodos del enjambre."
 */
export const CalculateIdentitySeniorityBonus = (
  activationTimestampISO: string
): IIdentitySeniorityResult => {
  const activationMomentDate = new Date(activationTimestampISO);
  const currentComparisonMomentDate = new Date();

  // 1. CÁLCULO DE DIFERENCIAL TEMPORAL (Hardware Agnostic)
  const timeDifferenceInMillisecondsQuantity =
    currentComparisonMomentDate.getTime() - activationMomentDate.getTime();

  /**
   * 🛡️ PROTECCIÓN DE HARDWARE:
   * Si el diferencial es negativo (Clock Skew), normalizamos a cero para
   * evitar bonificaciones corruptas.
   */
  const daysSinceActivationQuantity = Math.max(
    0,
    Math.floor(timeDifferenceInMillisecondsQuantity / (1000 * 3600 * 24))
  );

  /**
   * 2. ALGORITMO DE PROGRESIÓN (Linear Scalability)
   * El multiplicador crece linealmente hasta el teto de 365 días.
   */
  const seniorityProgressMultiplierNumeric = Math.min(
    daysSinceActivationQuantity / FULL_TRUST_CYCLE_DAYS_QUANTITY,
    1
  );

  const seniorityBonusNumeric = seniorityProgressMultiplierNumeric * SENIORITY_MAXIMUM_BONUS_NUMERIC;

  // 3. ADUANA DE ADN Y SELLADO (Integrity Check)
  return IdentitySeniorityResultSchema.parse({
    daysSinceActivationQuantity,
    seniorityBonusNumeric
  });
};
