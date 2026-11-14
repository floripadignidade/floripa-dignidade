/**
 * @section Messaging Logic - Presence State Signature Generator (Atom)
 * @description Átomo de lógica pura encargado de generar una huella digital determinista
 * y sellada nominalmente a partir del estado de presencia y disponibilidad ciudadana.
 * Provee un mecanismo de idempotencia en memoria volátil para prevenir el despacho
 * de transacciones redundantes hacia el Ledger Cloud de persistencia.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Clean Paths).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa) e ISO/IEC 25010 (Mantenibilidad y Robustez).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { z } from 'zod';

import {
  AvailabilityStatusSchema,
  type TAvailabilityStatus,
} from '../../schemas/UserPresence.schema';

/**
 * @name PresenceStateSignatureSchema
 * @description Contrato Zod con sellado de marca nominal para la firma de presencia.
 */
export const PresenceStateSignatureSchema = z
  .string()
  .trim()
  .min(1, { message: 'LA_FIRMA_DE_ESTADO_DE_PRESENCIA_NO_PUEDE_ESTAR_VACIA' })
  .brand<'PresenceStateSignature'>();

/** Tipo nominal inmutable para la huella digital del estado de presencia. */
export type TPresenceStateSignature = z.infer<typeof PresenceStateSignatureSchema>;

/**
 * @name PresenceStateSnapshotSchema
 * @description Contrato estructural de validación para el snapshot de presencia.
 */
export const PresenceStateSnapshotSchema = z
  .object({
    /** Estado ontológico de disponibilidad técnica. */
    availabilityStatusLiteral: AvailabilityStatusSchema.optional(),

    /** Mensaje de contexto lingüístico o estado visible. */
    customStatusMessageLiteral: z.string().optional(),

    /** Token secreto de hardware para notificaciones Web Push PWA. */
    pushSubscriptionTokenSecret: z.string().optional(),

    /** @deprecated Alias heredado para disponibilidad ontológica */
    status: AvailabilityStatusSchema.optional(),

    /** @deprecated Alias heredado para mensaje de estado */
    customMessage: z.string().optional(),

    /** @deprecated Alias heredado para token Push */
    pushToken: z.string().optional(),
  })
  .readonly();

/**
 * @interface IPresenceStateSnapshot
 * @description Contrato inmutable que estructura las señales de disponibilidad ciudadana.
 * Cumple estrictamente con 'exactOptionalPropertyTypes: true' mediante la unión con undefined.
 */
export interface IPresenceStateSnapshot {
  readonly availabilityStatusLiteral?: TAvailabilityStatus | undefined;
  readonly customStatusMessageLiteral?: string | undefined;
  readonly pushSubscriptionTokenSecret?: string | undefined;

  /** @deprecated Utilizar 'availabilityStatusLiteral' bajo norma ISO 11179 */
  readonly status?: TAvailabilityStatus | undefined;

  /** @deprecated Utilizar 'customStatusMessageLiteral' bajo norma ISO 11179 */
  readonly customMessage?: string | undefined;

  /** @deprecated Utilizar 'pushSubscriptionTokenSecret' bajo norma ISO 11179 */
  readonly pushToken?: string | undefined;
}

/**
 * @interface IPresenceSovereignSnapshot
 * @description Alias institucional de compatibilidad histórica para prevenir roturas en el enjambre.
 * @deprecated Utilizar canónicamente 'IPresenceStateSnapshot' bajo el estándar OEDP-V18.1.
 */
export type IPresenceSovereignSnapshot = IPresenceStateSnapshot;

/**
 * Genera una firma textual inalterable, determinista y libre de colisiones.
 * Resuelve las propiedades canónicas y los alias históricos de forma idempotente.
 *
 * @param presenceSnapshot - Snapshot inmutable con las propiedades de disponibilidad y hardware.
 * @returns {TPresenceStateSignature} Firma determinista tipada nominalmente.
 */
export const CalculatePresenceStateSignature = (
  presenceSnapshot: IPresenceStateSnapshot,
): TPresenceStateSignature => {
  const validationResultSnapshot = PresenceStateSnapshotSchema.safeParse(presenceSnapshot);
  const sanitizedSnapshot = validationResultSnapshot.success
    ? validationResultSnapshot.data
    : presenceSnapshot;

  /**
   * @section Resolución Polimórfica de Propiedades
   * Prioriza la nomenclatura formal ISO 11179 sobre los alias históricos heredados.
   */
  const resolvedStatusLiteral: TAvailabilityStatus =
    sanitizedSnapshot.availabilityStatusLiteral ?? sanitizedSnapshot.status ?? 'OFFLINE';

  const rawMessageLiteral: string =
    sanitizedSnapshot.customStatusMessageLiteral ?? sanitizedSnapshot.customMessage ?? '';

  const resolvedMessageLiteral: string = rawMessageLiteral.trim();

  const resolvedTokenLiteral: string =
    sanitizedSnapshot.pushSubscriptionTokenSecret ?? sanitizedSnapshot.pushToken ?? 'NONE';

  /**
   * @section Serialización Determinista Normalizada
   * Protege contra inyecciones de caracteres delimitadores garantizando orden de claves fijo.
   */
  const deterministicPayloadSnapshot = {
    status: resolvedStatusLiteral,
    message: resolvedMessageLiteral,
    token: resolvedTokenLiteral,
  };

  const serializedSignatureLiteral = JSON.stringify(deterministicPayloadSnapshot);

  return PresenceStateSignatureSchema.parse(serializedSignatureLiteral);
};

/**
 * @name CalculatePresenceSovereignSignature
 * @description Alias institucional de compatibilidad histórica para transiciones en el monorepo.
 * @deprecated Utilizar canónicamente 'CalculatePresenceStateSignature' bajo el estándar OEDP-V18.1.
 */
export const CalculatePresenceSovereignSignature = CalculatePresenceStateSignature;
