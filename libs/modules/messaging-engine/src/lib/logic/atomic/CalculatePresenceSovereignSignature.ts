/**
 * @section Messaging Logic - Presence Sovereign Signature Atom
 * @description Átomo de lógica pura encargado de generar una huella digital
 * determinística del estado de presencia. Permite al sistema detectar
 * mutaciones reales y evitar ráfagas de red redundantes hacia el Ledger Cloud.
 *
 * Protocolo OEDP-V17.0 - Functional Atomicity & Pure Logic.
 * SANEADO Zenith: Resolución de TS2307 (Shared Fragmentation) y Prosa ISO.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

/* 1. ADN Estructural (Sovereign State Store Boundary) */
import type { TAvailabilityStatus } from '@floripa-dignidade/shared-state-store';

/**
 * @interface IPresenceIdentitySnapshot
 * @description Contrato inmutable para la generación de la firma de estado.
 * Define los componentes críticos que componen la identidad de disponibilidad.
 */
interface IPresenceIdentitySnapshot {
  /** Estado ontológico (ONLINE | AWAY | DO_NOT_DISTURB | OFFLINE). */
  readonly availabilityStatusLiteral: TAvailabilityStatus;

  /** Mensaje de contexto lingüístico definido por el ciudadano. */
  readonly customStatusMessageLiteral: string;

  /** Token secreto de hardware para el túnel de notificaciones. */
  readonly pushSubscriptionTokenSecret?: string;
}

/**
 * Transforma el snapshot de presencia en una firma de integridad textual inalterable.
 * Implementa una serialización determinística para la validación de idempotencia.
 *
 * @param presenceSnapshot - Datos actuales de disponibilidad y hardware.
 * @returns {string} Cadena JSON normalizada para la auditoría de cambios.
 */
export const CalculatePresenceSovereignSignature = (
  presenceSnapshot: IPresenceIdentitySnapshot
): string => {
  /**
   * @section Algoritmo de Identidad (Fingerprinting)
   * Normalizamos el contenido eliminando ruidos espaciales y utilizando
   * llaves comprimidas para optimizar el rastro en la memoria volátil.
   *
   * Mapeo de Firma:
   * s: availabilityStatusLiteral
   * m: customStatusMessageLiteral
   * t: pushSubscriptionTokenSecret
   */
  const signaturePayloadSnapshot = {
    s: presenceSnapshot.availabilityStatusLiteral,
    m: presenceSnapshot.customStatusMessageLiteral.trim(),
    t: presenceSnapshot.pushSubscriptionTokenSecret ?? 'NONE'
  };

  /**
   * Retornamos la representación serializada. Al ser una función pura,
   * garantizamos que ante los mismos datos, la firma sea idéntica.
   */
  return JSON.stringify(signaturePayloadSnapshot);
};
