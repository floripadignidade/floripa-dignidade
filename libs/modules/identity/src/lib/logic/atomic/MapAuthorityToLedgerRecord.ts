/**
 * @section Identity Logic - Authority Sync Mapper
 * @description Átomo de lógica pura encargado de transformar el resultado del cálculo
 * de autoridad en un registro compatible con el Ledger de Supabase.
 *
 * Protocolo OEDP-V17.0 - Functional Atomicity & Pure Logic.
 */

import type { IIdentityAuthorityResult } from './schemas/CalculateIdentityAuthority.schema';

/**
 * @interface IAuthorityLedgerRecord
 * @description Reflejo físico de las columnas en 'citizen_identities_ledger'.
 */
export interface IAuthorityLedgerRecord {
  readonly trust_weight_score: number;
  readonly is_verified_human: boolean;
  readonly last_authority_sync_at: string;
  readonly sync_correlation_id: string;
}

/**
 * Transforma el ADN de dominio en un snapshot para persistencia.
 *
 * @param authoritySnapshot - Resultado del cálculo bayesiano.
 * @param correlationIdentifier - ID de trazabilidad forense.
 * @returns {IAuthorityLedgerRecord} Registro listo para el volcado cloud.
 */
export const MapAuthorityToLedgerRecord = (
  authoritySnapshot: IIdentityAuthorityResult,
  correlationIdentifier: string
): IAuthorityLedgerRecord => {
  return {
    trust_weight_score: authoritySnapshot.authorityCoefficientNumeric,
    is_verified_human: authoritySnapshot.isVerifiedHumanBoolean,
    last_authority_sync_at: new Date().toISOString(),
    sync_correlation_id: correlationIdentifier,
  };
};
