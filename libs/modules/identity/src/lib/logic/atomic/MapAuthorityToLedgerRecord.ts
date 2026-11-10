// libs/modules/identity/src/lib/logic/atomic/MapAuthorityToLedgerRecord.ts

/**
 * @section User Management & Identity - Identity Logic Atoms
 * @description Átomo de lógica pura encargado de transformar el resultado del cálculo
 * de autoridad institucional en un registro físico compatible con el Ledger de Supabase
 * (tabla 'citizen_identities_ledger'). Realiza la adaptación determinista de nombres de
 * dominio a columnas SQL bajo el estándar PostgREST.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa) e ISO/IEC 25010 (Mantenibilidad y Eficiencia).
 * SANEADO Zenith: Erradicación del error TS2307 enlazando canónicamente con
 * @floripa-dignidade/contracts y consolidación de inmutabilidad funcional.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

/* 1. Contratos Centralizados de Dominio (Single Source of Truth) */
import type {
  IIdentityAuthorityResult,
  IIdentityPhysicalRecord,
} from '@floripa-dignidade/contracts';

/**
 * @interface IAuthorityLedgerRecord
 * @description Alias institucional de compatibilidad histórica para el registro físico del Ledger.
 * Sincronizado estrictamente con IIdentityPhysicalRecord.
 */
export type IAuthorityLedgerRecord = IIdentityPhysicalRecord;

/**
 * Transforma el resultado de cálculo de autoridad en un snapshot inmutable para persistencia en el Ledger.
 * Implementa una función pura determinista sin efectos secundarios.
 *
 * @param authoritySnapshot - Resultado consolidado emitido por el motor de cálculo bayesiano de autoridad.
 * @param correlationIdentifier - Identificador único de correlación para la trazabilidad forense de la transacción.
 * @returns {IIdentityPhysicalRecord} Registro formateado e inmutable listo para despacho y persistencia cloud.
 */
export const MapAuthorityToLedgerRecord = (
  authoritySnapshot: IIdentityAuthorityResult,
  correlationIdentifier: string,
): IIdentityPhysicalRecord => {
  return Object.freeze({
    trust_weight_score: authoritySnapshot.authorityCoefficientNumeric,
    is_verified_human: authoritySnapshot.isVerifiedHumanBoolean,
    last_authority_sync_at: new Date().toISOString(),
    sync_correlation_id: correlationIdentifier,
  });
};