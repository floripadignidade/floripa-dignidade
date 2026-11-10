/**
 * @section Messaging Logic - Presence State Signature Generator (Atom)
 * @description Átomo de lógica pura encargado de generar una huella digital determinista
 * y sellada nominalmente a partir del estado de presencia ciudadana. Proporciona una barrera
 * de idempotencia para interceptar mutaciones redundantes y optimizar el consumo de red
 * hacia el Ledger Cloud de persistencia.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa), ISO/IEC 25010 (Eficiencia y Mantenibilidad).
 * SANEADO: Purga definitiva de metáforas informales ("Sovereign"), inyección de Branded Types
 * y cumplimiento de exactOptionalPropertyTypes.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { z } from 'zod';

/* 1. Contratos de Estado y Tipos Centralizados (Boundary Safe) */
import type { TAvailabilityStatus } from '@floripa-dignidade/shared-state-store';

/**
 * @name PresenceStateSignatureSchema
 * @description Contrato Zod con sellado de marca nominal para firmas de presencia.
 */
export const PresenceStateSignatureSchema = z
  .string()
  .min(1, { message: 'LA_FIRMA_DE_PRESENCIA_NO_PUEDE_ESTAR_VACIA' })
  .brand<'PresenceStateSignature'>();

/** Tipo nominal inmutable para la huella digital de disponibilidad ciudadana. */
export type TPresenceStateSignature = z.infer<typeof PresenceStateSignatureSchema>;

/**
 * @name PresenceIdentitySnapshotSchema
 * @description Contrato estructural de los datos requeridos para la generación de la firma.
 */
export const PresenceIdentitySnapshotSchema = z
  .object({
    /** Estado ontológico de disponibilidad (ONLINE, AWAY, DO_NOT_DISTURB, OFFLINE). */
    availabilityStatusLiteral: z.enum([
      'ONLINE',
      'AWAY',
      'DO_NOT_DISTURB',
      'OFFLINE',
    ]),

    /** Mensaje de contexto o estado personalizado definido por el usuario. */
    customStatusMessageLiteral: z.string(),

    /** Token secreto de hardware para notificaciones Web Push PWA (opcional). */
    pushSubscriptionTokenSecret: z.string().optional(),
  })
  .readonly();

/**
 * @interface IPresenceIdentitySnapshot
 * @description Contrato inmutable que refleja los componentes de disponibilidad.
 * Sigue la regla 'exactOptionalPropertyTypes: true' mediante la unión explícita con undefined.
 */
export interface IPresenceIdentitySnapshot {
  readonly availabilityStatusLiteral: TAvailabilityStatus;
  readonly customStatusMessageLiteral: string;
  readonly pushSubscriptionTokenSecret?: string | undefined;
}

/**
 * Genera una huella digital inalterable y determinista del estado de presencia.
 * Implementa una función matemática pura sin efectos secundarios ni accesos a hardware.
 *
 * @param presenceSnapshot - Snapshot inmutable con el estado ontológico, mensaje y token de hardware.
 * @returns {TPresenceStateSignature} Firma serializada determinista con tipado nominal sellado.
 */
export const CalculatePresenceStateSignature = (
  presenceSnapshot: IPresenceIdentitySnapshot,
): TPresenceStateSignature => {
  const sanitizedStatusLiteral = presenceSnapshot.availabilityStatusLiteral;
  const sanitizedMessageLiteral = presenceSnapshot.customStatusMessageLiteral.trim();
  const sanitizedTokenLiteral = presenceSnapshot.pushSubscriptionTokenSecret ?? 'NONE';

  /**
   * @section Serialización Determinista Normalizada
   * Se utiliza una estructura fija de claves para asegurar que campos idénticos
   * produzcan exactamente la misma firma en memoria volátil.
   */
  const deterministicPayloadSnapshot = {
    status: sanitizedStatusLiteral,
    message: sanitizedMessageLiteral,
    token: sanitizedTokenLiteral,
  };

  const serializedSignatureLiteral = JSON.stringify(deterministicPayloadSnapshot);

  return serializedSignatureLiteral as TPresenceStateSignature;
};

/**
 * @name CalculatePresenceSovereignSignature
 * @description Alias institucional de compatibilidad histórica para prevenir roturas en el enjambre.
 * @deprecated Utilizar canónicamente 'CalculatePresenceStateSignature' bajo el estándar OEDP-V18.1.
 */
export const CalculatePresenceSovereignSignature = CalculatePresenceStateSignature;