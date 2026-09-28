/**
 * @section User Management & Identity - Identity Logic Atoms
 * @description Átomo de lógica pura encargado de transformar el resultado del cálculo
 * de autoridad en un snapshot compatible con el Ledger físico. Realiza la traducción
 * entre tipos nominales de dominio y literales de base de datos.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First).
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

/* 1. ADN ESTRUCTURAL (Consumo desde SSOT Contracts) */
import type {
  IIdentityAuthorityResult,
  IIdentityPhysicalRecord
} from '@floripa-dignidade/contracts';

/**
 * Mapea el rastro de autoridad de dominio al formato de persistencia física.
 *
 * @param authorityResultSnapshot - Resultado purificado del motor de cálculo.
 * @param correlationIdentifier - ID de seguimiento forense para la traza.
 * @returns {IIdentityPhysicalRecord} Registro formateado para el protocolo PostgREST/SQL.
 *
 * @prompt_ia: "Asegura que el mapeo preserve la precisión de 4 decimales en
 * el 'trust_weight_score' para evitar ruidos en la analítica bayesiana."
 */
export const MapIdentityAuthorityToPhysicalRecord = (
  authorityResultSnapshot: IIdentityAuthorityResult,
  correlationIdentifier: string
): IIdentityPhysicalRecord => {

  return {
    trust_weight_score: authorityResultSnapshot.authorityCoefficientNumeric,
    is_verified_human: authorityResultSnapshot.isVerifiedHumanBoolean,
    last_authority_sync_at: new Date().toISOString(),
    sync_correlation_id: correlationIdentifier,
  };
};
