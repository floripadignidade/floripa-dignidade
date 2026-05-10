/**
 * @section Messaging Logic - Inbox Snapshot Assembler
 * @description Átomo de lógica pura encargado de estructurar el contrato de salida
 * final. Inyecta metadatos de sincronización y garantiza la inmutabilidad del rastro.
 *
 * Protocolo OEDP-V17.0 - Functional Atomicity & ISO Technical Naming.
 */

import type { IUnifiedCommunicationEvent } from '../../mappers/MapToUnifiedCommunicationEvent';
import type { IUnifiedInboxSnapshot } from '../GetUnifiedCitizenInbox';

/**
 * Ensambla el snapshot inmutable para la interfaz ciudadana.
 *
 * @param timelineCollection - Eventos unificados y ordenados.
 * @returns {IUnifiedInboxSnapshot} Contrato de salida sellado.
 */
export const AssembleInboxSnapshot = (
  timelineCollection: IUnifiedCommunicationEvent[]
): IUnifiedInboxSnapshot => {
  return Object.freeze({
    unifiedTimelineCollection: timelineCollection,
    metadata: {
      totalItemsQuantityNumeric: timelineCollection.length,
      synchronizationTimestampISO: new Date().toISOString()
    }
  });
};
