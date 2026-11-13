/**
 * @section Messaging Logic - Notification Read Receipt Mutator
 * @description Átomo de lógica encargado de la transición de estado de una alerta
 * institucional hacia el estatus de 'Leída'. Registra la marca temporal de
 * reconocimiento y garantiza la integridad del contador de notificaciones pendientes.
 *
 * Protocolo OEDP-V17.0 - High Performance SRE & Swarm Intelligence.
 * SANEADO Zenith: Resolución de Paradoja Asíncrona (await) en Aduana de Entorno.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { z } from 'zod';
import { ValidateEnvironmentAduana } from '@floripa-dignidade/environment-validator';
import { InternalSystemException, ValidationException } from '@floripa-dignidade/exceptions';
import {
  EmitTelemetrySignal,
  GenerateCorrelationIdentifier,
  TraceExecutionTime,
} from '@floripa-dignidade/telemetry';

/* 1. ADN de Intención (Aduana Atómica) */
/**
 * @name MarkAsReadRequestSchema
 * @description Define el contrato de integridad para marcar notificaciones como leídas.
 */
const MarkAsReadRequestSchema = z
  .object({
    /** Identificador único de la notificación capturada en el Ledger. */
    notificationIdentifier: z
      .string()
      .uuid()
      .describe('ID de la alerta de sistema que el ciudadano ha visualizado.'),

    /** UUID del destinatario legítimo para validación de propiedad (RLS Guard). */
    recipientIdentifier: z
      .string()
      .uuid()
      .describe('Identificador del ciudadano para prevenir manipulaciones cruzadas de buzón.'),
  })
  .readonly();

/** Identificador técnico del aparato para el Neural Sentinel. */
const NOTIFICATION_MUTATOR_IDENTIFIER = 'MARK_NOTIFICATION_READ_MUTATOR';

/**
 * Ejecuta la transición de estado en la nube, marcando una notificación como leída.
 * Implementa el patrón "Cloud Sovereign" garantizando la resolución asíncrona de
 * infraestructura antes de la mutación física en el Ledger.
 *
 * @param unvalidatedRequestSnapshot - Payload con el ID del mensaje y del receptor.
 * @returns {Promise<boolean>} Verdadero si la mutación fue aceptada por la infraestructura.
 * @throws {ValidationException} Si el ADN de la solicitud es ilegítimo.
 * @throws {InternalSystemException} Si la persistencia en el Tier de Datos colapsa.
 */
export const MarkNotificationAsRead = async (
  unvalidatedRequestSnapshot: unknown,
): Promise<boolean> => {
  const correlationIdentifier = GenerateCorrelationIdentifier();

  return await TraceExecutionTime(
    NOTIFICATION_MUTATOR_IDENTIFIER,
    'EXECUTE_NOTIFICATION_ACKNOWLEDGE_TRANSACTION',
    correlationIdentifier,
    async () => {
      try {
        /**
         * 1. CAPTURA DE INFRAESTRUCTURA (Sovereign Secrets)
         * 🛡️ SANEADO Zenith (Fix TS2339): Inyección de await mandatorio.
         * La resolución de secretos se audita ahora dentro del rastro de latencia.
         */
        const {
          SUPABASE_URL: cloudStorageUrlLiteral,
          SUPABASE_SERVICE_ROLE_KEY: cloudSecurityKeySecret,
        } = await ValidateEnvironmentAduana();

        // 2. ADUANA DE ADN (Safe Parsing)
        const validationResult = MarkAsReadRequestSchema.safeParse(unvalidatedRequestSnapshot);

        if (!validationResult.success) {
          /** Reporte de violación estructural antes del colapso */
          void EmitTelemetrySignal({
            severityLevelLiteral: 'WARNING',
            moduleIdentifierLiteral: NOTIFICATION_MUTATOR_IDENTIFIER,
            operationCodeLiteral: 'ACKNOWLEDGE_ADN_VIOLATION',
            correlationIdentifier,
            messageContentLiteral: 'La estructura de reconocimiento de lectura es inválida.',
            contextMetadataSnapshot: { issuesCollection: validationResult.error.flatten() },
          });

          throw new ValidationException('DATOS_DE_LECTURA_INVALIDOS', {
            issuesCollection: validationResult.error.flatten(),
          });
        }

        const { notificationIdentifier, recipientIdentifier } = validationResult.data;

        /**
         * 3. MUTACIÓN EN EL TIER DE DATOS (PostgREST Protocol)
         * Se realiza un PATCH condicional: La notificación solo se actualiza si
         * pertenece físicamente al ciudadano que lo solicita, reforzando la seguridad.
         */
        const cloudPersistenceResponse = await fetch(
          `${cloudStorageUrlLiteral}/rest/v1/system_notifications_ledger?notification_id=eq.${notificationIdentifier}&recipient_id=eq.${recipientIdentifier}`,
          {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              apikey: cloudSecurityKeySecret,
              Authorization: `Bearer ${cloudSecurityKeySecret}`,
              Prefer: 'return=minimal',
            },
            body: JSON.stringify({
              interaction_status: 'ACKNOWLEDGED_READ',
              acknowledged_at: new Date().toISOString(),
              mutation_correlation_id: correlationIdentifier,
            }),
            /** SRE: Tiempo de espera limitado para mantener la fluidez de la UI */
            signal: AbortSignal.timeout(8000),
          },
        );

        if (!cloudPersistenceResponse.ok) {
          throw new Error(`CLOUD_DATABASE_FAULT_CODE_${cloudPersistenceResponse.status}`);
        }

        // 4. REPORTE DE ÉXITO (SRE Analytics)
        void EmitTelemetrySignal({
          severityLevelLiteral: 'INFO',
          moduleIdentifierLiteral: NOTIFICATION_MUTATOR_IDENTIFIER,
          operationCodeLiteral: 'NOTIFICATION_MARKED_AS_READ_NOMINAL',
          correlationIdentifier,
          messageContentLiteral:
            'Notificación reconocida y sincronizada exitosamente con el Ledger.',
          contextMetadataSnapshot: {
            notificationIdentifier,
            recipientIdentifier,
          },
        });

        return true;
      } catch (caughtError: unknown) {
        // 5. GESTIÓN FORENSE DE FALLO (Resilience Layer)
        if (caughtError instanceof ValidationException) throw caughtError;

        const errorDescriptionLiteral =
          caughtError instanceof Error ? caughtError.message : String(caughtError);

        void EmitTelemetrySignal({
          severityLevelLiteral: 'ERROR',
          moduleIdentifierLiteral: NOTIFICATION_MUTATOR_IDENTIFIER,
          operationCodeLiteral: 'MARK_READ_PROCESS_COLLAPSE',
          correlationIdentifier,
          messageContentLiteral:
            'Error crítico al intentar transicionar el estado de la notificación.',
          contextMetadataSnapshot: { errorTraceLiteral: errorDescriptionLiteral },
        });

        throw new InternalSystemException('FALLO_EN_PERSISTENCIA_DE_LECTURA_SRE', {
          originalErrorLiteral: errorDescriptionLiteral,
          correlationIdentifier,
        });
      }
    },
  );
};
