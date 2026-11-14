/**
 * @section Analytics Logic - Beacon Network Transport (Atom)
 * @description Átomo de transporte encargado de transmitir la carga analítica de forma
 * no bloqueante y garantizada ante cierres de página. Utiliza prioritariamente
 * `navigator.sendBeacon` con fallback a `fetch` nativo configurado con `keepalive: true`.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Clean Paths).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa) e ISO/IEC 25010 (Confiabilidad y Portabilidad).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import type { IAnalyticsEvent } from '../../schemas/AnalyticsEvent.schema';

/** Endpoint relativo institucional para la ingestión de eventos analíticos del portal. */
const CANONICAL_ANALYTICS_INGESTION_ENDPOINT_LITERAL = '/api/analytics/events';

interface INavigatorBeaconCapableWindow {
  readonly navigator?: {
    readonly sendBeacon?: (endpointUrlLiteral: string, payloadData: string) => boolean;
  };
}

/**
 * Despacha físicamente un evento analítico purificado hacia la infraestructura de recolección.
 *
 * @param validatedEventSnapshot - Evento analítico que superó la validación Zod.
 * @param correlationIdentifier - Identificador único de correlación para la transacción.
 * @returns {boolean} Verdadero si la transmisión fue aceptada por el hardware de red.
 */
export const TransmitAnalyticsBeacon = (
  validatedEventSnapshot: IAnalyticsEvent,
  correlationIdentifier: string,
): boolean => {
  const globalContextReference = globalThis as unknown as INavigatorBeaconCapableWindow;
  const isSendBeaconAvailableBoolean =
    typeof globalContextReference.navigator?.sendBeacon === 'function';

  const serializedPayloadLiteral = JSON.stringify({
    ...validatedEventSnapshot,
    correlationIdentifier,
  });

  if (isSendBeaconAvailableBoolean && globalContextReference.navigator?.sendBeacon) {
    const isTransmittedSuccessfullyBoolean = globalContextReference.navigator.sendBeacon(
      CANONICAL_ANALYTICS_INGESTION_ENDPOINT_LITERAL,
      serializedPayloadLiteral,
    );

    if (isTransmittedSuccessfullyBoolean) {
      return true;
    }
  }

  // Fallback isomórfico con keepalive para navegadores donde sendBeacon rechace o no exista
  if (typeof fetch === 'function') {
    void fetch(CANONICAL_ANALYTICS_INGESTION_ENDPOINT_LITERAL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Floripa-Correlation-ID': correlationIdentifier,
      },
      body: serializedPayloadLiteral,
      keepalive: true,
      signal: AbortSignal.timeout(5000),
    }).catch(() => {
      // Silencio operativo: la analítica no debe interrumpir el hilo de ejecución principal
    });

    return true;
  }

  return false;
};
