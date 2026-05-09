/**
 * @section Messaging Logic - Thread Status Persistence Atom
 * @description Átomo encargado exclusivamente de la actualización física (PATCH)
 * del estado de un hilo de conversación en el Tier de Datos de Supabase.
 * Implementa seguridad a nivel de fila (RLS) mediante filtros de propiedad de actor.
 *
 * Protocolo OEDP-V17.0 - High Performance SRE & ISO Technical Naming.
 * SANEADO Zenith: Inyección de telemetría forense y normalización de parámetros.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { MapHttpErrorToException } from '@floripa-dignidade/exceptions';
import {
  EmitTelemetrySignal,
  TraceExecutionTime,
} from '@floripa-dignidade/telemetry';

import type { ISovereignHeadersResult } from '../dispatchers/CreateSovereignDatabaseHeaders';

/** Identificador técnico del aparato para el Neural Sentinel. */
const PERSISTENCE_ATOM_IDENTIFIER = 'MESSAGE_THREAD_STATUS_MUTATOR_ATOM';

/**
 * Ejecuta la mutación física de estado sobre un hilo filtrando por autoridad de actor.
 * Garantiza que solo el emisor o el receptor puedan alterar el estatus del hilo.
 *
 * @param cloudProviderEndpointLiteral - URL absoluta del Tier de Datos.
 * @param securityHeadersSnapshot - Cabeceras de seguridad soberanas pre-validadas.
 * @param targetThreadIdentifierLiteral - UUID del hilo de conversación objetivo.
 * @param activeActorIdentifierLiteral - UUID del ciudadano para validación de propiedad.
 * @param targetStatusLiteral - Nuevo estado ontológico (ARCHIVED_BY_USER, TRASHED_DELETED).
 * @param correlationIdentifier - ID de trazabilidad forense del hilo de ejecución.
 * @returns {Promise<void>} Operación resuelta tras el reconocimiento de la nube.
 * @throws {InternalSystemException} Si la infraestructura rechaza la mutación.
 */
export const UpdateMessageThreadStatus = async (
  cloudProviderEndpointLiteral: string,
  securityHeadersSnapshot: ISovereignHeadersResult,
  targetThreadIdentifierLiteral: string,
  activeActorIdentifierLiteral: string,
  targetStatusLiteral: string,
  correlationIdentifier: string
): Promise<void> => {

  return await TraceExecutionTime(
    PERSISTENCE_ATOM_IDENTIFIER,
    'EXECUTE_PHYSICAL_THREAD_PATCH_TRANSACTION',
    correlationIdentifier,
    async () => {
      /**
       * @section Filtro de Seguridad Perimetral
       * Aplicamos una cláusula OR en la URL para asegurar que el parche solo
       * se aplique si el actor es parte legítima de la conversación.
       */
      const queryFilterLiteral = `thread_id=eq.${targetThreadIdentifierLiteral}&or=(sender_id.eq.${activeActorIdentifierLiteral},recipient_id.eq.${activeActorIdentifierLiteral})`;
      const targetRequestUrlLiteral = `${cloudProviderEndpointLiteral}/rest/v1/direct_messages_ledger?${queryFilterLiteral}`;

      try {
        const networkResponse = await fetch(targetRequestUrlLiteral, {
          method: 'PATCH',
          headers: { ...securityHeadersSnapshot },
          body: JSON.stringify({
            current_status: targetStatusLiteral,
            mutation_correlation_id: correlationIdentifier,
            updated_at: new Date().toISOString(),
          }),
          /** SRE: Límite de 8 segundos para evitar bloqueos en el hilo principal */
          signal: AbortSignal.timeout(8000)
        });

        if (!networkResponse.ok) {
          throw MapHttpErrorToException(networkResponse.status, 'LEDGER_MUTATION_REJECTED', {
            targetThread: targetThreadIdentifierLiteral,
            httpStatusNumeric: networkResponse.status
          });
        }

        // REPORTE DE ÉXITO (SRE Visibility)
        void EmitTelemetrySignal({
          severityLevelLiteral: 'INFO',
          moduleIdentifierLiteral: PERSISTENCE_ATOM_IDENTIFIER,
          operationCodeLiteral: 'THREAD_STATUS_MUTATED_IN_CLOUD',
          correlationIdentifier,
          messageContentLiteral: 'Mutación física de estado de hilo consolidada en el Ledger.',
          contextMetadataSnapshot: {
            threadId: targetThreadIdentifierLiteral,
            newStatusLiteral: targetStatusLiteral
          }
        });

      } catch (caughtError: unknown) {
        /**
         * @section Gestión Forense de I/O
         * Re-envolvemos cualquier error de red en la gramática de fallos institucional.
         */
        const errorDescriptionLiteral = caughtError instanceof Error
          ? caughtError.message
          : String(caughtError);

        void EmitTelemetrySignal({
          severityLevelLiteral: 'ERROR',
          moduleIdentifierLiteral: PERSISTENCE_ATOM_IDENTIFIER,
          operationCodeLiteral: 'PHYSICAL_PATCH_FAULT',
          correlationIdentifier,
          messageContentLiteral: 'Fallo crítico al intentar impactar el Ledger de mensajería.',
          contextMetadataSnapshot: { errorTraceLiteral: errorDescriptionLiteral }
        });

        throw MapHttpErrorToException(500, 'FALLO_FISICO_MUTACION_HILO', {
          originalErrorLiteral: errorDescriptionLiteral,
          threadIdentifier: targetThreadIdentifierLiteral
        });
      }
    }
  );
};
