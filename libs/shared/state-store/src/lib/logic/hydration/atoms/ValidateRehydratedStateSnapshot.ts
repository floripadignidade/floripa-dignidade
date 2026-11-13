/**
 * @section Shared State Store - Rehydrated State Snapshot Validator (Atom)
 * @description Átomo de lógica pura encargado de validar estructuralmente el snapshot
 * recuperado del almacenamiento local contra `PersistedStateSnapshotSchema` (ADR 0025),
 * distinguiendo arranque en frío nominal de corrupción estructural sin lanzar excepciones.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Clean Paths).
 * Normas: ISO/IEC 11179 (Nomenclatura Técnica) e ISO/IEC 25010 (Confiabilidad).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import type { IGlobalSovereignStore } from '../../../GlobalInfrastructureStateStore';
import { PersistedStateSnapshotSchema } from '../schemas/PersistedStateSnapshot.schema';

/**
 * @interface IRehydratedStateAuditVerdict
 * @description Resultado inmutable del análisis estructural sobre el estado rehidratado.
 */
export interface IRehydratedStateAuditVerdict {
  readonly isValidationSuccessfulBoolean: boolean;
  readonly hasPersistedSnapshotBoolean: boolean;
  readonly hasActiveMandataryBoolean: boolean;
  readonly isNetworkOnlineBoolean: boolean;
  readonly validationIssuesCollection: Readonly<Record<string, unknown>> | undefined;
}

/**
 * Valida la integridad del estado rehidratado desde disco local sin interrumpir el montaje UI.
 *
 * @param rehydratedStateSnapshot - Referencia recibida desde el middleware de persistencia.
 * @returns {IRehydratedStateAuditVerdict} Veredicto sellado e inmutable para auditoría telemétrica.
 */
export const ValidateRehydratedStateSnapshot = (
  rehydratedStateSnapshot: IGlobalSovereignStore | undefined,
): IRehydratedStateAuditVerdict => {
  if (rehydratedStateSnapshot === undefined) {
    return Object.freeze({
      isValidationSuccessfulBoolean: true,
      hasPersistedSnapshotBoolean: false,
      hasActiveMandataryBoolean: false,
      isNetworkOnlineBoolean: true,
      validationIssuesCollection: undefined,
    });
  }

  const schemaValidationResult = PersistedStateSnapshotSchema.safeParse(rehydratedStateSnapshot);

  if (!schemaValidationResult.success) {
    return Object.freeze({
      isValidationSuccessfulBoolean: false,
      hasPersistedSnapshotBoolean: true,
      hasActiveMandataryBoolean: Boolean(rehydratedStateSnapshot.activeMandataryIdentifier),
      isNetworkOnlineBoolean: Boolean(rehydratedStateSnapshot.isNetworkOnlineBoolean),
      validationIssuesCollection: schemaValidationResult.error.flatten().fieldErrors,
    });
  }

  const validatedSnapshot = schemaValidationResult.data;

  return Object.freeze({
    isValidationSuccessfulBoolean: true,
    hasPersistedSnapshotBoolean: true,
    hasActiveMandataryBoolean: validatedSnapshot.activeMandataryIdentifier !== null,
    isNetworkOnlineBoolean: validatedSnapshot.isNetworkOnlineBoolean,
    validationIssuesCollection: undefined,
  });
};
