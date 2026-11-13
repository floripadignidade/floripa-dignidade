/**
 * @section Messaging Logic - Group Data Mapper
 * @description Átomo puro encargado de transformar el ADN del grupo de comunicación
 * al esquema físico de columnas del Ledger soberano (PostgREST/Supabase).
 *
 * Protocolo OEDP-V17.0 - Functional Atomicity & Pure Logic.
 */

import type { ICommunicationGroup } from '../../schemas/CommunicationGroup.schema';

/**
 * Representación física en el Ledger (Snake Case Standard).
 * 🛡️ Blindaje técnico para evitar errores de tipografía en columnas de base de datos.
 */
export interface ICommunicationGroupPersistence {
  readonly group_id: string;
  readonly display_name: string;
  readonly slug_identifier: string;
  readonly description_text: string;
  readonly owner_org_id: string;
  readonly territory_id: string | undefined;
  readonly governance_model: string;
  readonly visibility_mode: string;
  readonly operational_status: string;
  readonly participation_stats_json: unknown;
  readonly creator_id: string;
  readonly created_at: string;
  readonly correlation_id: string;
}

/**
 * Mapea una instancia de grupo validada al formato de persistencia físico.
 * ⚡ OPTIMIZACIÓN: Función pura sin efectos secundarios para máxima velocidad de despacho.
 *
 * @param data - ADN purificado del círculo de comunicación.
 * @param creatorId - Identificador de la identidad soberana responsable.
 * @param correlationId - ID de trazabilidad forense.
 */
export const MapCommunicationGroupToPersistence = (
  data: ICommunicationGroup,
  creatorId: string,
  correlationId: string,
): ICommunicationGroupPersistence => ({
  group_id: data.groupIdentifier,
  display_name: data.officialDisplayNameLiteral,
  slug_identifier: data.technicalSlugLiteral,
  description_text: data.groupDescriptionLiteral,
  owner_org_id: data.organizationalOwnerIdentifier,
  territory_id: data.territorialFocusIdentifier,
  governance_model: data.governanceModelLiteral,
  visibility_mode: data.visibilityModeLiteral,
  operational_status: data.operationalStatusLiteral,
  // 🛡️ SANEADO: Inyección de metadatos para análisis por el Neural Sentinel.
  participation_stats_json: data.participationMetadata,
  creator_id: creatorId,
  created_at: data.occurrenceTimestampISO,
  correlation_id: correlationId,
});
