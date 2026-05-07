/**
 * @section Identity Logic - Authority Synchronization Orchestrator
 * @description Orquestador soberano encargado de coordinar la persistencia del
 * peso bayesiano. Une los átomos de mapeo y transmisión bajo rastro forense.
 *
 * Protocolo OEDP-V17.0 - Swarm Intelligence & High Performance SRE.
 * @author Raz Podestá - MetaShark Tech
 */

import { ValidateEnvironmentAduana } from '@floripa-dignidade/environment-validator';
import { InternalSystemException } from '@floripa-dignidade/exceptions';
import {
  EmitTelemetrySignal,
  GenerateCorrelationIdentifier,
  TraceExecutionTime,
} from '@floripa-dignidade/telemetry';

/* 1. ADN de Entrada (Verbatim Types) */
import type { IIdentityAuthorityResult } from './atomic/schemas/CalculateIdentityAuthority.schema';

/* 2. Enjambre Atómico Local (Pulverized Logic) */
import { MapAuthorityToLedgerRecord } from './atomic/MapAuthorityToLedgerRecord';
import { TransmitAuthorityLedgerPatch } from './atomic/TransmitAuthorityLedgerPatch';

/** Identificador técnico del aparato para el Neural Sentinel. */
const ORCHESTRATOR_IDENTIFIER = 'IDENTITY_AUTHORITY_SYNC_ORCHESTRATOR';

/**
 * Ejecuta la transacción íntegra de sincronización de autoridad ciudadana.
 *
 * @param citizenIdentifierLiteral - UUID del ciudadano objetivo.
 * @param authoritySnapshot - Datos de autoridad calculados previamente.
 * @param correlationIdentifier - ID de trazabilidad (opcional).
 */
export const SyncIdentityAuthority = async (
  citizenIdentifierLiteral: string,
  authoritySnapshot: IIdentityAuthorityResult,
  correlationIdentifier: string = GenerateCorrelationIdentifier()
): Promise<void> => {

  // 1. ADUANA DE INFRAESTRUCTURA (Aislamiento de Hardware)
  const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = ValidateEnvironmentAduana();

  return await TraceExecutionTime(
    ORCHESTRATOR_IDENTIFIER,
    'EXECUTE_AUTHORITY_SYNC_FLOW',
    correlationIdentifier,
    async () => {
      try {
        // 2. CONSTRUCCIÓN DE REGISTRO (Átomo Mapper)
        const ledgerRecordSnapshot = MapAuthorityToLedgerRecord(
          authoritySnapshot,
          correlationIdentifier
        );

        // 3. DESPACHO FÍSICO (Átomo Dispatcher)
        await TransmitAuthorityLedgerPatch({
          cloudUrlLiteral: SUPABASE_URL,
          cloudSecurityKeySecret: SUPABASE_SERVICE_ROLE_KEY,
          citizenIdentifierLiteral,
          ledgerRecordSnapshot,
        });

        // 4. REPORTE DE ÉXITO (SRE Visibility)
        void EmitTelemetrySignal({
          severityLevel: 'INFO',
          moduleIdentifier: ORCHESTRATOR_IDENTIFIER,
          operationCode: 'AUTHORITY_SYNC_SUCCESS',
          correlationIdentifier,
          message: 'IDENTIDAD.LOGS.AUTHORITY_SYNC_NOMINAL',
          contextMetadataSnapshot: {
            citizenId: citizenIdentifierLiteral,
            weightNumeric: authoritySnapshot.authorityCoefficientNumeric
          }
        });

      } catch (caughtError: unknown) {
        // 5. GESTIÓN FORENSE DE COLAPSO (Resilience)
        const errorDescriptionLiteral = caughtError instanceof Error
          ? caughtError.message
          : String(caughtError);

        void EmitTelemetrySignal({
          severityLevel: 'CRITICAL',
          moduleIdentifier: ORCHESTRATOR_IDENTIFIER,
          operationCode: 'AUTHORITY_SYNC_COLLAPSE',
          correlationIdentifier,
          message: 'Error crítico al intentar grabar autoridad en el Ledger.',
          contextMetadataSnapshot: { errorTrace: errorDescriptionLiteral }
        });

        throw new InternalSystemException('FALLO_EN_PERSISTENCIA_DE_AUTORIDAD_SRE', {
          originalError: errorDescriptionLiteral,
          correlationIdentifier
        });
      }
    }
  );
};
