/**
 * @section Messaging Logic - User Presence Heartbeat Mutator
 * @description Orquestador encargado de coordinar la sincronización del pulso de vida
 * ciudadano. Valida el ADN, delega la transformación física y orquesta el despacho
 * hacia el Tier de Datos bajo rastro de telemetría y vigilancia SRE.
 *
 * Protocolo OEDP-V17.0 - Swarm Intelligence & High Performance SRE.
 * SANEADO Zenith: Pulverización de mappers, erradicación de lógica I/O y Prosa ISO.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { ValidateEnvironmentAduana } from '@floripa-dignidade/environment-validator';
import { InternalSystemException } from '@floripa-dignidade/exceptions';
import {
  EmitTelemetrySignal,
  GenerateCorrelationIdentifier,
  TraceExecutionTime,
} from '@floripa-dignidade/telemetry';

/* 1. ADN Estructural (Verbatim Module Syntax) */
import { UserPresenceSchema } from '../../schemas/UserPresence.schema';
import type { IUserPresence } from '../../schemas/UserPresence.schema';

/* 2. Enjambre Atómico Local (Swiss-Watch Swarm) */
import { MapPresenceToLedgerSnapshot } from '../mappers/MapPresenceToLedgerSnapshot';
import { CreateSovereignDatabaseHeaders } from '../dispatchers/CreateSovereignDatabaseHeaders';

/** Identificador técnico del aparato para el Neural Sentinel. */
const PRESENCE_MUTATOR_IDENTIFIER = 'CITIZEN_PRESENCE_HEARTBEAT_MUTATOR';

/**
 * Ejecuta la actualización soberana del estado de presencia ciudadana.
 * Implementa el patrón "Cloud Sovereign" garantizando la resolución asíncrona de
 * infraestructura antes de impactar el Ledger de disponibilidad.
 *
 * @param unvalidatedPayloadSnapshot - Datos crudos provenientes del sensor del cliente.
 * @returns {Promise<boolean>} Verdadero si el pulso fue reconocido por la infraestructura.
 * @throws {InternalSystemException} Si el ADN es corrupto o la nube rechaza la sincronización.
 */
export const UpdateUserPresence = async (unvalidatedPayloadSnapshot: unknown): Promise<boolean> => {
  const correlationIdentifier = GenerateCorrelationIdentifier();

  return await TraceExecutionTime(
    PRESENCE_MUTATOR_IDENTIFIER,
    'EXECUTE_PRESENCE_HEARTBEAT_ORCHESTRATION',
    correlationIdentifier,
    async () => {
      try {
        /**
         * 1. CAPTURA DE INFRAESTRUCTURA (Sovereign Secrets)
         * El búnker environment-validator garantiza secretos tipados nominalmente.
         */
        const {
          SUPABASE_URL: cloudStorageUrlLiteral,
          SUPABASE_SERVICE_ROLE_KEY: cloudSecurityKeySecret,
        } = await ValidateEnvironmentAduana();

        // 2. ADUANA DE ADN (Safe Parsing)
        const validationResult = UserPresenceSchema.safeParse(unvalidatedPayloadSnapshot);

        if (!validationResult.success) {
          throw new InternalSystemException('PRESENCE_DNA_VIOLATION', {
            structuralIssuesCollection: validationResult.error.format(),
            correlationIdentifier,
          });
        }

        const validatedPresenceData: IUserPresence = validationResult.data;

        // 3. TRANSFORMACIÓN DE ADN (Delegación Atómica)
        const ledgerPayloadSnapshot = MapPresenceToLedgerSnapshot(
          validatedPresenceData,
          correlationIdentifier,
        );

        /**
         * 4. PERSISTENCIA FÍSICA (Cloud I/O)
         * Implementamos el protocolo de red directamente aquí para mantener la
         * eficiencia del Edge, utilizando el generador de cabeceras institucional.
         */
        const cloudPersistenceResponse = await fetch(
          `${cloudStorageUrlLiteral}/rest/v1/user_presence_ledger`,
          {
            method: 'POST',
            headers: {
              ...CreateSovereignDatabaseHeaders(cloudSecurityKeySecret, 'minimal'),
            },
            body: JSON.stringify(ledgerPayloadSnapshot),
            /** 🛡️ LEY DE RESILIENCIA: Upsert basado en citizen_id. */
            Prefer: 'resolution=merge-duplicates',
            signal: AbortSignal.timeout(5000),
          } as RequestInit,
        );

        if (!cloudPersistenceResponse.ok) {
          throw new Error(`CLOUD_LEDGER_REJECTION_HTTP_${cloudPersistenceResponse.status}`);
        }

        // 5. REPORTE DE ÉXITO (SRE Visibility)
        void EmitTelemetrySignal({
          severityLevelLiteral: 'INFO',
          moduleIdentifierLiteral: PRESENCE_MUTATOR_IDENTIFIER,
          operationCodeLiteral: 'HEARTBEAT_SYNC_NOMINAL',
          correlationIdentifier,
          messageContentLiteral: 'Pulso de vida sincronizado exitosamente con el Ledger.',
          contextMetadataSnapshot: {
            citizenId: validatedPresenceData.citizenIdentifier,
            status: validatedPresenceData.currentAvailabilityStatus,
          },
        });

        return true;
      } catch (caughtError: unknown) {
        // 6. GESTIÓN FORENSE DE COLAPSO (Resilience Layer)
        const errorDescriptionLiteral =
          caughtError instanceof Error ? caughtError.message : String(caughtError);

        void EmitTelemetrySignal({
          severityLevelLiteral: 'CRITICAL',
          moduleIdentifierLiteral: PRESENCE_MUTATOR_IDENTIFIER,
          operationCodeLiteral: 'PRESENCE_SYNC_COLLAPSE',
          correlationIdentifier,
          messageContentLiteral: 'Fallo catastrófico en la sincronización del pulso.',
          contextMetadataSnapshot: { errorTraceLiteral: errorDescriptionLiteral },
        });

        throw new InternalSystemException('FALLO_EN_SINCRONIZACION_DE_PRESENCIA_SRE', {
          originalErrorLiteral: errorDescriptionLiteral,
          correlationIdentifier,
        });
      }
    },
  );
};
