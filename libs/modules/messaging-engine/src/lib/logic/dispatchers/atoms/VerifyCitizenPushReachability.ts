/**
 * @section Messaging Logic - Push Reachability Sensor
 * @description Átomo de lógica pura encargado de verificar la disponibilidad
 * del canal de comunicación en el hardware del ciudadano.
 *
 * Protocolo OEDP-V17.0 - Functional Atomicity & SRE Resilience.
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { GetCitizenPushToken } from '../../queries/GetCitizenPushToken';

/**
 * @interface IReachabilityResult
 * @description Contrato inmutable sobre la disponibilidad del canal de alertas.
 */
export interface IReachabilityResult {
  /** Indica si el ciudadano posee una suscripción activa. */
  readonly isReachableBoolean: boolean;
  /** Token secreto de hardware (Si existe). */
  readonly pushTokenSecret: string | undefined;
}

/**
 * Consulta el Ledger de presencia para identificar el túnel de despacho.
 *
 * @param citizenIdentifierLiteral - UUID del ciudadano bajo auditoría.
 * @param cloudProviderUrlLiteral - Endpoint del Tier de Datos.
 * @param cloudSecurityKeySecret - Llave maestra de acceso.
 * @returns {Promise<IReachabilityResult>} Resultado del sensor de hardware.
 */
export const VerifyCitizenPushReachability = async (
  citizenIdentifierLiteral: string,
  cloudProviderUrlLiteral: string,
  cloudSecurityKeySecret: string,
): Promise<IReachabilityResult> => {
  const pushTokenSnapshot = await GetCitizenPushToken(
    citizenIdentifierLiteral,
    cloudProviderUrlLiteral,
    cloudSecurityKeySecret,
  );

  /**
   * 🛡️ LEY ZENITH: Cumplimiento de 'exactOptionalPropertyTypes'.
   * Se normaliza el rastro nulo a 'undefined' para mantener la integridad del contrato.
   */
  return {
    isReachableBoolean: !!pushTokenSnapshot,
    pushTokenSecret: pushTokenSnapshot ?? undefined,
  };
};
