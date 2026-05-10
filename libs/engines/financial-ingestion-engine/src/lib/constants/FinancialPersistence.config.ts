/**
 * @section Financial Ingestion - Persistence Configuration
 * @description Única Fuente de Verdad (SSOT) para los parámetros de red y
 * persistencia del motor financiero.
 *
 * Protocolo OEDP-V17.0 - ISO Technical Naming & SRE Resilience.
 */

export const FINANCIAL_PERSISTENCE_CONFIG = {
  /** Nombre físico de la tabla en el Ledger de Supabase. */
  TARGET_DATABASE_TABLE_NAME_LITERAL: 'project_financial_ledger',

  /** Tiempo máximo de espera para ingestas masivas (30 segundos). */
  NETWORK_TRANSMISSION_TIMEOUT_MILLISECONDS_QUANTITY: 30000,

  /** Identificador del búnker para el rastro forense. */
  MODULE_IDENTIFIER: 'FINANCIAL_PERSISTENCE_ATOM',
} as const;
