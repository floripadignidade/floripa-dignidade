/**
 * @section User Management & Identity - Physical Data Contracts
 * @description Define el contrato de integridad para el rastro físico en el Ledger
 * de identidad (Base de Datos). Garantiza la simetría absoluta entre el modelo
 * de dominio y las columnas de la tabla 'citizen_identities_ledger'.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First).
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { z } from 'zod';

/**
 * @name IdentityPhysicalRecordSchema
 * @description Validador estructural para los registros del Ledger institucional.
 * Utiliza nomenclatura en Snake Case para compatibilidad directa con PostgreSQL.
 *
 * @prompt_ia: "Valida que 'trust_weight_score' sea un flotante entre 0.1 y 1.0
 * y que 'last_authority_sync_at' cumpla con el estándar ISO 8601."
 */
export const IdentityPhysicalRecordSchema = z.object({
  /** Coeficiente bayesiano de confianza. */
  trust_weight_score: z.number().min(0.1).max(1.0),

  /** Bandera de validación legal humana (Auditoría Documental). */
  is_verified_human: z.boolean(),

  /** Marca temporal inmutable de la última actualización física. */
  last_authority_sync_at: z.string().datetime(),

  /** Identificador de seguimiento para la cadena de custodia digital. */
  sync_correlation_id: z.string().uuid(),
}).readonly();

/** 🛡️ ADN Tipado para exportación Verbatim */
export type IIdentityPhysicalRecord = z.infer<typeof IdentityPhysicalRecordSchema>;
