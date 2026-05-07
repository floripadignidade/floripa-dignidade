/**
 * @section Identity Logic - Cloud Transmission Dispatcher
 * @description Átomo encargado exclusivamente de la comunicación I/O con la nube.
 * Implementa el protocolo Stateless para el Edge Runtime.
 *
 * Protocolo OEDP-V17.0 - Hardware Isolation & Network Resilience.
 */

import { InternalSystemException } from '@floripa-dignidade/exceptions';
import type { IAuthorityLedgerRecord } from './MapAuthorityToLedgerRecord';

/**
 * @interface ITransmissionParameters
 * @description Contrato inmutable para la operación de red.
 */
interface ITransmissionParameters {
  readonly cloudUrlLiteral: string;
  readonly cloudSecurityKeySecret: string;
  readonly citizenIdentifierLiteral: string;
  readonly ledgerRecordSnapshot: IAuthorityLedgerRecord;
}

/**
 * Ejecuta el PATCH físico hacia la base de datos soberana.
 *
 * @param parameters - Configuración y datos para la transmisión.
 * @throws {InternalSystemException} Si la infraestructura rechaza la conexión.
 */
export const TransmitAuthorityLedgerPatch = async (
  parameters: ITransmissionParameters
): Promise<void> => {
  const { cloudUrlLiteral, cloudSecurityKeySecret, citizenIdentifierLiteral, ledgerRecordSnapshot } = parameters;

  const targetEndpointLiteral = `${cloudUrlLiteral}/rest/v1/citizen_identities_ledger?citizen_id=eq.${citizenIdentifierLiteral}`;

  const networkResponse = await fetch(targetEndpointLiteral, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'apikey': cloudSecurityKeySecret,
      'Authorization': `Bearer ${cloudSecurityKeySecret}`,
      'Prefer': 'return=minimal',
    },
    body: JSON.stringify(ledgerRecordSnapshot),
    /** SRE: Límite de 8 segundos para la persistencia de identidad */
    signal: AbortSignal.timeout(8000),
  });

  if (!networkResponse.ok) {
    throw new InternalSystemException('CLOUD_PERSISTENCE_REJECTED', {
      httpStatusNumeric: networkResponse.status,
      citizenIdentifier: citizenIdentifierLiteral,
    });
  }
};
