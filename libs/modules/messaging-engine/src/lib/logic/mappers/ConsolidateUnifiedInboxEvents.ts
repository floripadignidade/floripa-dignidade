/**
 * @section Messaging Logic - Unified Inbox Consolidation Engine
 * @description Átomo de lógica pura encargado de unificar, mapear y ordenar
 * cronológicamente las señales de comunicación (Alertas y Mensajes Directos)
 * en una línea de tiempo única y soberana para la interfaz del ciudadano.
 *
 * Protocolo OEDP-V17.0 - Functional Atomicity & ISO Standard Naming.
 * SANEADO Zenith: Resolución de error 'sort-imports' y erradicación de abreviaturas.
 *
 * @author Raz Podestá - MetaShark Tech
 */

import type { IDirectMessage } from '../../schemas/DirectMessage.schema';
import type { ISystemNotification } from '../../schemas/SystemNotification.schema';

/**
 * 🛡️ SANEADO Zenith: Miembros ordenados alfabéticamente (I < M < M)
 * para cumplimiento estricto de la regla 'sort-imports' del linter.
 */
import {
  type IUnifiedCommunicationEvent,
  MapMessageToUnifiedEvent,
  MapNotificationToUnifiedEvent,
} from './MapToUnifiedCommunicationEvent';

/**
 * Consolida un enjambre de señales multiformes en un flujo unificado y ordenado.
 * Implementa una estrategia de mapeo polimórfico y ordenamiento descendente (LIFO).
 *
 * @param systemNotificationsCollection - Lista de alertas institucionales capturadas.
 * @param directMessagesCollection - Lista de mensajes privados entre actores.
 * @returns {IUnifiedCommunicationEvent[]} Flujo cronológico listo para renderizado.
 */
export const ConsolidateUnifiedInboxEvents = (
  systemNotificationsCollection: ISystemNotification[],
  directMessagesCollection: IDirectMessage[],
): IUnifiedCommunicationEvent[] => {
  /**
   * @section Unificación de Señales
   * Transformamos cada entidad específica a su representación visual universal.
   */
  const unifiedEventsCollection: IUnifiedCommunicationEvent[] = [
    ...systemNotificationsCollection.map(MapNotificationToUnifiedEvent),
    ...directMessagesCollection.map(MapMessageToUnifiedEvent),
  ];

  /**
   * @section Algoritmo de Ordenamiento (Temporal Precision)
   * Garantiza que lo más reciente sea lo primero en la visualización.
   * SANEADO: Uso de nomenclatura descriptiva en los comparadores.
   */
  return unifiedEventsCollection.sort(
    (comparisonFirstEventSnapshot, comparisonSecondEventSnapshot) => {
      const firstTimestampNumeric = new Date(comparisonFirstEventSnapshot.timestampISO).getTime();
      const secondTimestampNumeric = new Date(comparisonSecondEventSnapshot.timestampISO).getTime();

      return secondTimestampNumeric - firstTimestampNumeric;
    },
  );
};
