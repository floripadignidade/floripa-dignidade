/**
 * @section Interaction Logic - Cloud Transmission Atom
 * @description Átomo encargado exclusivamente de la comunicación I/O con la nube.
 * Implementa el protocolo Stateless para el Edge Runtime.
 *
 * Protocolo OEDP-V17.0 - Hardware Isolation & Network Resilience.
 * @author Raz Podestá - MetaShark Tech
 */

import { InternalSystemException } from '@floripa-dignidade/exceptions';
import type { IPublicReaction } from '../../schemas/PublicReaction.schema';

/**
 * Ejecuta el despacho físico de una interacción hacia el Tier de Datos.
 *
 * @param targetApiEndpointLiteral - Endpoint físico para la transacción.
 * @param validatedReactionSnapshot - Reacción purificada con peso calculado.
 * @returns {Promise<void>}
 */
export const TransmitPublicReactionToCloud = async (
  targetApiEndpointLiteral: string,
  validatedReactionSnapshot: IPublicReaction & { readonly calculatedImpactWeightNumeric: number },
): Promise<void> => {
  const outgoingResponse = await fetch(targetApiEndpointLiteral, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(validatedReactionSnapshot),
  });

  if (!outgoingResponse.ok) {
    throw new InternalSystemException('FALLO_TRANSMISION_FISICA_REACCION', {
      httpStatus: outgoingResponse.status,
      targetEndpoint: targetApiEndpointLiteral,
    });
  }
};
