/**
 * @section User Management & Identity - Identity Logic Atoms
 * @description Átomo de lógica pura encargado de tabular los coeficientes de mérito
 * institucional. Asigna valores numéricos adicionales basados en la procedencia
 * de la identidad (Proveedores Federados) y el estatus de validación legal humana.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First).
 * Calidad: ISO/IEC 25010 (Modularidad y Simplicidad).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

/* 1. ADN ESTRUCTURAL (Consumo desde SSOT Contracts) */
import type { SocialIdentityProvider } from '@floripa-dignidade/contracts';

/* 2. INFRAESTRUCTURA DE REFERENCIA (Ground Truth) */
import { AUTHORITY_WEIGHT_GROUND_TRUTH } from '../../constants/AuthorityWeightGroundTruth';

/**
 * @interface IMapIdentityAuthorityBonusesParameters
 * @description Contrato de entrada inmutable para la evaluación de mérito institucional.
 */
interface IMapIdentityAuthorityBonusesParameters {
  /** Identificador técnico del proveedor de identidad (OAuth2 vs Local). */
  readonly socialProviderIdentifier: SocialIdentityProvider;

  /** Bandera de estado que confirma la auditoría de documentos físicos. */
  readonly isIdentityLegallyVerifiedBoolean: boolean;
}

/**
 * Calcula la sumatoria de bonificaciones aplicables al peso de autoridad.
 * Implementa una función pura, determinística y libre de efectos secundarios.
 *
 * @param parametersSnapshot - Snapshot de condiciones de la identidad.
 * @returns {number} Coeficiente total de bonificación (Float).
 *
 * @prompt_ia: "Verifica que el valor retornado sumado al peso base nunca
 * exceda el límite técnico de 1.0 (100% de autoridad)."
 */
export const MapIdentityAuthorityBonuses = (
  parametersSnapshot: IMapIdentityAuthorityBonusesParameters,
): number => {
  let accumulatedBonusesNumeric = 0;

  /**
   * @section Evaluación A: Confianza en Proveedor Federado
   * Las identidades validadas por entidades externas de alta reputación (Google, Apple)
   * inician con un beneficio por poseer rastro digital pre-existente.
   */
  const isFederatedIdentityBoolean =
    parametersSnapshot.socialProviderIdentifier !== 'INTERNAL_INFRASTRUCTURE';

  if (isFederatedIdentityBoolean) {
    accumulatedBonusesNumeric += AUTHORITY_WEIGHT_GROUND_TRUTH.SOCIAL_FEDERATION_BONUS_NUMERIC;
  }

  /**
   * @section Evaluación B: Mérito por Validación Humana
   * El mayor incremento de autoridad se otorga mediante la verificación legal
   * realizada por los auditores de la institución.
   */
  if (parametersSnapshot.isIdentityLegallyVerifiedBoolean) {
    accumulatedBonusesNumeric += AUTHORITY_WEIGHT_GROUND_TRUTH.LEGAL_VERIFICATION_BONUS_NUMERIC;
  }

  return accumulatedBonusesNumeric;
};
