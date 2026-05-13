/**
 * @section PMF Engine - Persistence Configuration
 * @description Única Fuente de Verdad (SSOT) para la infraestructura de datos.
 * Define los endpoints y tiempos de espera para el guardado inmutable.
 */
export const PERSISTENCE_SENTRY_CONFIGURATION = {
  /** Nombre de la tabla en Supabase según el migration_master_schema.sql */
  TARGET_LEDGER_TABLE_LITERAL: 'territorial_master_data',

  /** Tiempo límite para la transacción de persistencia (SRE Standard). */
  TRANSACTION_TIMEOUT_MILLISECONDS_QUANTITY: 15000,

  /** Identificador para el Neural Sentinel. */
  MODULE_IDENTIFIER_LITERAL: 'SOVEREIGN_PERSISTENCE_SENTRY',
} as const;
