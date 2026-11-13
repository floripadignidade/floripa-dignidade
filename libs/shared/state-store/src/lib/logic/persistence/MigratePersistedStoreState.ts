/**
 * @section Shared State Store - Persisted State Migration Engine (Atom)
 * @description Átomo de lógica pura encargado de migrar y validar mediante Zod
 * (`PersistedStateSnapshotSchema`) los datos recuperados de versiones previas del
 * almacenamiento local antes de fusionarlos en el almacén activo (ADR 0025).
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Clean Paths).
 * Normas: ISO/IEC 11179 (Nomenclatura Técnica) e ISO/IEC 25010 (Confiabilidad).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import {
  EmitTelemetrySignal,
  GenerateCorrelationIdentifier,
  type ModuleIdentifier,
  type OperationCode,
} from '@floripa-dignidade/telemetry';

import type { IGlobalSovereignStore } from '../../GlobalInfrastructureStateStore';
import { PersistedStateSnapshotSchema } from '../hydration/schemas/PersistedStateSnapshot.schema';

const MIGRATION_MODULE_IDENTIFIER = 'STATE_STORE_MIGRATION_ENGINE' as ModuleIdentifier;

/**
 * Valida y normaliza un snapshot persistido proveniente de versiones anteriores o actuales.
 * Si el payload está corrupto, retorna un objeto vacío seguro para preservar la disponibilidad UI.
 *
 * @param rawPersistedStateSnapshot - Estado crudo deserializado desde `localStorage`.
 * @param previousSchemaVersionNumeric - Número de versión leído del almacenamiento persistido.
 * @returns {Partial<IGlobalSovereignStore>} Subconjunto purificado compatible con el estado vigente.
 */
export const MigratePersistedStoreState = (
  rawPersistedStateSnapshot: unknown,
  previousSchemaVersionNumeric: number,
): Partial<IGlobalSovereignStore> => {
  if (!rawPersistedStateSnapshot || typeof rawPersistedStateSnapshot !== 'object') {
    return {};
  }

  const validationResult = PersistedStateSnapshotSchema.safeParse(rawPersistedStateSnapshot);

  if (!validationResult.success) {
    void EmitTelemetrySignal({
      occurrenceTimestampISO: new Date().toISOString(),
      severityLevelLiteral: 'WARNING',
      moduleIdentifierLiteral: MIGRATION_MODULE_IDENTIFIER,
      operationCodeLiteral: 'PERSISTED_STATE_MIGRATION_RESET' as OperationCode,
      correlationIdentifier: GenerateCorrelationIdentifier(),
      messageContentLiteral:
        'Snapshot persistido incompatible tras migración; se aplica respaldo limpio inicial.',
      semanticIntentTag: 'LOCAL_PERSISTENCE_MIGRATION_RESET',
      contextMetadataSnapshot: {
        previousSchemaVersionNumeric,
        validationIssuesCollection: validationResult.error.flatten().fieldErrors,
      },
    });

    return {};
  }

  return validationResult.data;
};
