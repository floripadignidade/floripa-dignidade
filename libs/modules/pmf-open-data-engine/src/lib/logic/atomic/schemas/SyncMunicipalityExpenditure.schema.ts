/**
 * @section PMF Engine DNA - Synchronization Request Contract
 * @description Define el contrato de integridad para la auditoría masiva de gastos.
 * Garantiza que los rangos temporales y los identificadores de inquilino (Tenant)
 * sean válidos antes de iniciar la captura de datos gubernamentales.
 *
 * Protocolo OEDP-V17.0 - Sovereign Data & ReadOnly Integrity.
 * @author Raz Podestá - MetaShark Tech
 */

import { z } from 'zod';

/**
 * @name SyncMunicipalityExpenditureSchema
 * @description Aduana de entrada para el orquestador de sincronización masiva.
 */
export const SyncMunicipalityExpenditureSchema = z.object({
  /** Identificador del municipio (ej: 'florianopolis'). */
  municipalitySlugLiteral: z.string().min(3),

  /** Rango de auditoría fiscal. */
  periodRange: z.object({
    /** Formato técnico: 'mm/aaaa'. */
    initialMonthYearLiteral: z.string().regex(/^\d{2}\/\d{4}$/),
    finalMonthYearLiteral: z.string().regex(/^\d{2}\/\d{4}$/),
  }),

  /** Código de unidad gestora (Opcional). */
  managementUnitTechnicalIdentifier: z.number().int().positive().optional(),

}).readonly();

/** 🛡️ ADN Tipado para exportación Verbatim */
export type ISyncMunicipalityExpenditureParameters = z.infer<typeof SyncMunicipalityExpenditureSchema>;
