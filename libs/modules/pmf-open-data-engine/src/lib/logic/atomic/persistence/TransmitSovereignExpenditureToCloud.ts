/**
 * @section PMF Engine Logic - Cloud Transmission Atom
 * @description Átomo encargado exclusivamente de la comunicación física I/O.
 * Implementa el protocolo PostgREST para el volcado inmutable de datos.
 *
 * Protocolo OEDP-V17.0 - Hardware Isolation & Network Resilience.
 * @author Raz Podestá - MetaShark Tech
 */

import { MapHttpErrorToException } from '@floripa-dignidade/exceptions';
import { PERSISTENCE_SENTRY_CONFIGURATION } from '../../../constants/PersistenceSentry.config';

interface ITransmissionParameters {
  readonly cloudUrlLiteral: string;
  readonly cloudKeySecret: string;
  readonly payloadSnapshot: Record<string, unknown>;
}

/**
 * Ejecuta el POST físico hacia el Tier de Datos de la ONG.
 *
 * @param parameters - Configuración técnica y ADN del gasto.
 * @throws {GlobalBaseException} Si la nube rechaza la persistencia.
 */
export const TransmitSovereignExpenditureToCloud = async (
  parameters: ITransmissionParameters
): Promise<void> => {
  const { cloudUrlLiteral, cloudKeySecret, payloadSnapshot } = parameters;

  const targetEndpointLiteral = `${cloudUrlLiteral}/rest/v1/${PERSISTENCE_SENTRY_CONFIGURATION.TARGET_LEDGER_TABLE_LITERAL}`;

  const networkResponse = await fetch(targetEndpointLiteral, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': cloudKeySecret,
      'Authorization': `Bearer ${cloudKeySecret}`,
      /** 🛡️ LEY DE INTEGRIDAD: resolution=merge-duplicates asegura la unicidad por ID. */
      'Prefer': 'resolution=merge-duplicates'
    },
    body: JSON.stringify(payloadSnapshot),
    signal: AbortSignal.timeout(PERSISTENCE_SENTRY_CONFIGURATION.TRANSACTION_TIMEOUT_MILLISECONDS_QUANTITY)
  });

  if (!networkResponse.ok) {
    throw MapHttpErrorToException(
      networkResponse.status,
      'LEDGER_PERSISTENCE_REJECTED',
      { table: PERSISTENCE_SENTRY_CONFIGURATION.TARGET_LEDGER_TABLE_LITERAL }
    );
  }
};
