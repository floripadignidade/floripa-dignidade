/**
 * @section Territorial Logic - Database Mapper Atom
 * @description Átomo de lógica pura que transforma el ADN soberano al esquema
 * físico de columnas de la tabla 'territorial_master_data' en Supabase.
 *
 * Protocolo OEDP-V17.0 - Functional Atomicity & Pure Logic.
 */

import type { ITerritorialEntity } from '../../schemas/TerritorialEntity.schema';

/**
 * Mapea una entidad territorial para el protocolo PostgREST Upsert.
 */
export const MapTerritoryToCloudLedger = (
  territorialEntitySnapshot: ITerritorialEntity,
): Record<string, unknown> => ({
  ibge_id: territorialEntitySnapshot.territorialTechnicalIdentifier,
  name_literal: territorialEntitySnapshot.officialTerritoryNameLiteral,
  hierarchy_level: territorialEntitySnapshot.administrativeHierarchyLevel,
  last_sync_at: territorialEntitySnapshot.lastSovereignSyncTimestampISO,
  metadata_snapshot: territorialEntitySnapshot.geographicCentroidMetadata ?? {},
});
