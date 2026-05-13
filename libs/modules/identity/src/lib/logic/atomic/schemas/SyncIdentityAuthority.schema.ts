/**
 * @section Identity DNA - Authority Sync Contract
 * @description Define el contrato de integridad para la operación de persistencia
 * de autoridad. Garantiza que el ciudadano y su peso bayesiano cumplan con el
 * estándar institucional antes de impactar el Ledger Cloud.
 *
 * Protocolo OEDP-V17.0 - Sovereign Data & ReadOnly Integrity.
 * @author Raz Podestá - MetaShark Tech
 */

import { z } from 'zod';
import { UserIdentifierSchema } from '../../../schemas/UserIdentity.schema';
import { IdentityAuthorityResultSchema } from './CalculateIdentityAuthority.schema';

/**
 * @name SyncIdentityAuthoritySchema
 * @description Aduana de ADN para los parámetros del orquestador de sincronización.
 */
export const SyncIdentityAuthoritySchema = z.object({
  /** Identificador nominal del ciudadano (Branded Type). */
  citizenIdentifier: UserIdentifierSchema,

  /** Resultado inmutable del cálculo de autoridad. */
  authoritySnapshot: IdentityAuthorityResultSchema,

  /** Rastro de trazabilidad del hilo de ejecución. */
  correlationIdentifier: z.string().uuid()
}).readonly();

/** 🛡️ ADN Tipado para exportación Verbatim */
export type ISyncIdentityAuthorityParameters = z.infer<typeof SyncIdentityAuthoritySchema>;
