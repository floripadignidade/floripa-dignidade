/**
 * @section Messaging Logic - Thread Archiving Orchestrator
 * @description Orquestador encargado de la eliminación lógica (Soft Delete) de hilos
 * de conversación. Coordina la validación de ADN de la solicitud, la seguridad
 * perimetral y la delegación hacia el Ledger de persistencia inmutable.
 *
 * Protocolo OEDP-V17.0 - Swarm Intelligence & High Performance SRE.
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

/* 1. ADN de Entrada (Aduana de Intención) */
/**
 * @name ArchiveThreadRequestSchema
 * @description Define el contrato de integridad para la operación de archivado.
 */
const ArchiveThreadRequestSchema = z
  .object({
    targetThreadIdentifier: z
      .string()
      .uuid()
      .describe('Identificador único del hilo de conversación a procesar.'),

    activeActorIdentifier: z
      .string()
      .uuid()
      .describe('Identificador del ciudadano solicitante para validación de propiedad.'),
  })
  .readonly();

/* 2. Enjambre Atómico Local (Internal Swarm) */
import { CreateSovereignDatabaseHeaders } from '../dispatchers/CreateSovereignDatabaseHeaders';
import { UpdateMessageThreadStatus } from './UpdateMessageThreadStatus';

/** Identificador técnico del aparato para el Neural Sentinel. */
const THREAD_MUTATOR_IDENTIFIER = 'MESSAGE_THREAD_ARCHIVE_ORCHESTRATOR';

/**
 * Ejecuta el proceso de archivado de una conversación privada.
 * Implementa el patrón "Cloud Sovereign" garantizando que los secretos de red
 * estén plenamente resueltos antes de la mutación física.
 *
 * @param unvalidatedRequestSnapshot - Datos crudos de la solicitud capturados en la interfaz.
 * @returns {Promise<boolean>} Verdadero si la operación fue aceptada y consolidada.
 * @throws {ValidationException} Si el contrato de datos es violado.
 * @throws {InternalSystemException} Si la infraestructura cloud colapsa.
 */
export const ArchiveMessageThread = async (
  unvalidatedRequestSnapshot: unknown,
): Promise<boolean> => {
  const correlationIdentifier = GenerateCorrelationIdentifier();

  return await TraceExecutionTime(
    THREAD_MUTATOR_IDENTIFIER,
    'EXECUTE_THREAD_ARCHIVE_FLOW',
    correlationIdentifier,
    async () => {
      try {
        /**
         * 1. CAPTURA DE INFRAESTRUCTURA (Sovereign Secrets)
         * 🛡️ SANEADO Zenith (Fix TS2339): Inyección de await mandatorio.
         * La resolución de secretos se audita ahora dentro del rastro de latencia.
         */
        const { SUPABASE_URL: cloudUrlLiteral, SUPABASE_SERVICE_ROLE_KEY: cloudSecurityKeySecret } =
          await ValidateEnvironmentAduana();

        // 2. ADUANA DE ADN (Safe Parsing)
        const validationResult = ArchiveThreadRequestSchema.safeParse(unvalidatedRequestSnapshot);

        if (!validationResult.success) {
          /** Reporte de violación estructural antes del colapso */
          void EmitTelemetrySignal({
            severityLevelLiteral: 'WARNING',
            moduleIdentifierLiteral: THREAD_MUTATOR_IDENTIFIER,
            operationCodeLiteral: 'ARCHIVE_ADN_CONTRACT_VIOLATION',
            correlationIdentifier,
            messageContentLiteral: 'La estructura de la solicitud de archivado es inválida.',
            contextMetadataSnapshot: { issuesCollection: validationResult.error.flatten() },
          });

          throw new ValidationException('DATOS_DE_ARCHIVADO_INVALIDOS', {
            issuesCollection: validationResult.error.flatten(),
          });
        }

        const { targetThreadIdentifier, activeActorIdentifier } = validationResult.data;

        // 3. SEGURIDAD Y PERSISTENCIA (Delegación Atómica)
        /**
         * Generamos las cabeceras soberanas con preferencia 'minimal' para
         * optimizar el ancho de banda en la transacción de actualización.
         */
        const securityHeaders = CreateSovereignDatabaseHeaders(cloudSecurityKeySecret, 'minimal');

        await UpdateMessageThreadStatus(
          cloudUrlLiteral,
          securityHeaders,
          targetThreadIdentifier,
          activeActorIdentifier,
          'ARCHIVED_BY_USER',
          correlationIdentifier,
        );

        // 4. REPORTE DE ÉXITO (SRE Analytics)
        void EmitTelemetrySignal({
          severityLevelLiteral: 'INFO',
          moduleIdentifierLiteral: THREAD_MUTATOR_IDENTIFIER,
          operationCodeLiteral: 'THREAD_ARCHIVED_SUCCESSFULLY',
          correlationIdentifier,
          messageContentLiteral:
            'Ciclo de vida de la conversación finalizado. Hilo archivado lógicamente.',
          contextMetadataSnapshot: { targetThreadIdentifier },
        });

        return true;
      } catch (caughtError: unknown) {
        // 5. GESTIÓN FORENSE DE FALLO (Resilience Layer)
        if (caughtError instanceof ValidationException) throw caughtError;

        const errorDescriptionLiteral =
          caughtError instanceof Error ? caughtError.message : String(caughtError);

        void EmitTelemetrySignal({
          severityLevelLiteral: 'CRITICAL',
          moduleIdentifierLiteral: THREAD_MUTATOR_IDENTIFIER,
          operationCodeLiteral: 'THREAD_ARCHIVE_COLLAPSE',
          correlationIdentifier,
          messageContentLiteral: 'Error crítico al intentar archivar el hilo de conversación.',
          contextMetadataSnapshot: { errorTraceLiteral: errorDescriptionLiteral },
        });

        throw new InternalSystemException('FALLO_EN_MUTACION_DE_HILO_SRE', {
          originalErrorLiteral: errorDescriptionLiteral,
          correlationIdentifier,
        });
      }
    },
  );
};
