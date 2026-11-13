/**
 * @section Newsletter Logic - Result Parser Atom
 * @description Átomo encargado de la validación y mapeo del resultado de activación.
 * Transforma el rastro físico del Ledger en un contrato de éxito de suscripción.
 *
 * Protocolo OEDP-V17.0 - Functional Atomicity & Data Purity.
 */

/** 🛡️ RIGOR ESM: Importación con extensión .js */
import type { IActivationResult } from './ActivateCloudSubscription.js';

/**
 * ADN físico del registro en el Ledger (Base de Datos).
 * 🛡️ Blindaje técnico: Define exactamente qué columnas consumimos del PATCH.
 */
interface ISubscriberLedgerRow {
  readonly id: string;
  readonly email_address: string;
  readonly preferred_locale: string;
  readonly is_active_boolean: boolean;
}

/**
 * Analiza los datos devueltos por la infraestructura cloud tras la activación.
 * ⚡ PERFORMANCE: Operación sincrónica pura de alta velocidad.
 *
 * @param updatedDataCollection - Colección de filas afectadas devueltas por PostgREST.
 * @returns {IActivationResult} Resultado inmutable y validado para el orquestador.
 */
export const ParseSubscriberActivationResult = (
  updatedDataCollection: readonly Partial<ISubscriberLedgerRow>[] | null | undefined,
): IActivationResult => {
  // 1. ADUANA DE INTEGRIDAD: Verificación de afectación de filas
  const hasAffectedRowsBoolean =
    Array.isArray(updatedDataCollection) && updatedDataCollection.length > 0;

  if (!hasAffectedRowsBoolean || !updatedDataCollection[0]) {
    return { isActivationSuccessfulBoolean: false };
  }

  /**
   * 🛡️ EXTRACCIÓN SOBERANA:
   * Capturamos el snapshot y validamos la existencia de datos vitales.
   */
  const subscriberSnapshot = updatedDataCollection[0];

  // Si el email no está presente, consideramos la activación como nominalmente fallida.
  if (!subscriberSnapshot.email_address) {
    return { isActivationSuccessfulBoolean: false };
  }

  return {
    isActivationSuccessfulBoolean: true,
    activatedCitizenEmailLiteral: subscriberSnapshot.email_address,
    metadataSnapshot: {
      subscriberIdentifier: subscriberSnapshot.id ?? 'UNKNOWN_ID',
      localeIdentifier: subscriberSnapshot.preferred_locale ?? 'pt-BR',
    },
  };
};
