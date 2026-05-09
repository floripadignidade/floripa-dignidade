/**
 * @section Messaging Logic - User Presence Heartbeat Mutator
 * @description Orquestador encargado de validar y persistir el pulso de vida
 * (Heartbeat) del ciudadano en el Ledger soberano. Asegura que el estado de
 * disponibilidad y el rastro de hardware estén sincronizados con la nube.
 *
 * Protocolo OEDP-V17.0 - High Performance SRE & Atomic Responsibility.
 * SANEADO Zenith: Resolución de Paradoja Asíncrona (await) en Aduana de Entorno.
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
export const UpdateUserPresence = async (
  unvalidatedPayloadSnapshot: unknown
): Promise<boolean> => {
  const correlationIdentifier = GenerateCorrelationIdentifier();

  return await TraceExecutionTime(
    PRESENCE_MUTATOR_IDENTIFIER,
    'EXECUTE_PRESENCE_HEARTBEAT_SYNCHRONIZATION',
    correlationIdentifier,
    async () => {

      /**
       * 1. CAPTURA DE INFRAESTRUCTURA (Sovereign Secrets)
       * 🛡️ SANEADO Zenith (Fix TS2339): Inyección de await mandatorio.
       * La resolución de secretos se audita ahora dentro del rastro de latencia.
       */
      const {
        SUPABASE_URL: cloudStorageUrlLiteral,
        SUPABASE_SERVICE_ROLE_KEY: cloudSecurityKeySecret
      } = await ValidateEnvironmentAduana();

      // 2. ADUANA DE ADN (Validación de Contrato Zod)
      const validationResult = UserPresenceSchema.safeParse(unvalidatedPayloadSnapshot);

      if (!validationResult.success) {
        throw new InternalSystemException('PRESENCE_DNA_VIOLATION', {
          correlationIdentifier,
          structuralIssuesCollection: validationResult.error.format(),
          intentLiteral: 'VALIDATE_PRESENCE_PAYLOAD'
        });
      }

      const validatedPresenceData: IUserPresence = validationResult.data;

      try {
        // 3. MAPEO DE PERSISTENCIA (Protocol Translation)
        const ledgerPayloadSnapshot = MapPresenceToLedger(validatedPresenceData, correlationIdentifier);

        /**
         * 4. PERSISTENCIA FÍSICA (PostgREST Protocol)
         * Realizamos un Upsert basado en la llave primaria (citizen_id).
         */
        const cloudPersistenceResponse = await fetch(`${cloudStorageUrlLiteral}/rest/v1/user_presence_ledger`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': cloudSecurityKeySecret,
            'Authorization': `Bearer ${cloudSecurityKeySecret}`,
            /** 🛡️ ESTRATEGIA: Upsert para evitar duplicidad de registros de presencia. */
            'Prefer': 'resolution=merge-duplicates',
          },
          body: JSON.stringify(ledgerPayloadSnapshot),
          /** SRE: Timeout corto para no bloquear el hilo de navegación del ciudadano */
          signal: AbortSignal.timeout(5000)
        });

        if (!cloudPersistenceResponse.ok) {
          throw new Error(`CLOUD_LEDGER_REJECTION_HTTP_${cloudPersistenceResponse.status}`);
        }

        // 5. REPORTE DE ÉXITO (SRE Visibility)
        void EmitTelemetrySignal({
          severityLevelLiteral: 'INFO',
          moduleIdentifierLiteral: PRESENCE_MUTATOR_IDENTIFIER,
          operationCodeLiteral: 'HEARTBEAT_SYNCHRONIZED_SUCCESSFULLY',
          correlationIdentifier,
          messageContentLiteral: 'Pulso de vida ciudadano sincronizado exitosamente con el Ledger.',
          contextMetadataSnapshot: {
            citizenIdentifierLiteral: validatedPresenceData.citizenIdentifier,
            availabilityStatusLiteral: validatedPresenceData.currentAvailabilityStatus
          }
        });

        return true;

      } catch (caughtError: unknown) {
        const errorDescriptionLiteral = caughtError instanceof Error
          ? caughtError.message
          : String(caughtError);

        void EmitTelemetrySignal({
          severityLevelLiteral: 'CRITICAL',
          moduleIdentifierLiteral: PRESENCE_MUTATOR_IDENTIFIER,
          operationCodeLiteral: 'PRESENCE_SYNC_COLLAPSE',
          correlationIdentifier,
          messageContentLiteral: 'Fallo catastrófico en la sincronización del pulso de presencia.',
          contextMetadataSnapshot: {
            errorTraceLiteral: errorDescriptionLiteral,
            citizenId: validatedPresenceData.citizenIdentifier
          }
        });

        throw new InternalSystemException('FALLO_EN_SINCRONIZACION_DE_PRESENCIA_SRE', {
          correlationIdentifier,
          originalErrorLiteral: errorDescriptionLiteral,
          citizenIdentifier: validatedPresenceData.citizenIdentifier
        });
      }
    }
  );
};

/**
 * 🔒 ATOMIZACIÓN PRIVADA: Mapeador de Infraestructura.
 * @description Transforma el modelo de dominio al esquema físico de persistencia (snake_case).
 * Cumple con la norma de Objeto + Propiedad + Representación.
 */
const MapPresenceToLedger = (
  domainDataSnapshot: IUserPresence,
  correlationIdentifier: string
): Record<string, unknown> => ({
  citizen_id: domainDataSnapshot.citizenIdentifier,
  availability_status: domainDataSnapshot.currentAvailabilityStatus,
  custom_status_text: domainDataSnapshot.customStatusMessageLiteral,
  platform_type: domainDataSnapshot.lastActivePlatformLiteral,
  push_token: domainDataSnapshot.activePushSubscriptionTokenSecret,
  last_heartbeat_at: domainDataSnapshot.lastHeartbeatTimestampISO,
  correlation_id: correlationIdentifier,
});
