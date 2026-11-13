/**
 * @section Newsletter Logic - Cloud I/O Atom
 * @description Átomo encargado exclusivamente de la comunicación física con
 * el Tier de Datos de Supabase bajo protocolos SRE.
 *
 * Protocolo OEDP-V17.0 - Hardware Isolation & Network Resilience.
 */

import type { ISovereignHeadersResult } from './BuildCloudPatchHeaders';

/**
 * Ejecuta el PATCH físico hacia el Ledger de suscriptores.
 *
 * @param cloudUrlLiteral - Endpoint base de la base de datos.
 * @param headersSnapshot - Cabeceras de seguridad inyectadas.
 * @param tokenLiteral - Identificador del ciudadano a activar.
 * @param correlationId - ID de trazabilidad forense.
 * @returns {Promise<Response>} Respuesta cruda del servidor.
 */
export const ExecuteCloudActivationRequest = async (
  cloudUrlLiteral: string,
  headersSnapshot: ISovereignHeadersResult,
  tokenLiteral: string,
  correlationId: string,
): Promise<Response> => {
  const requestUrlLiteral = `${cloudUrlLiteral}/rest/v1/newsletter_subscribers?verification_token=eq.${tokenLiteral}&status=eq.PENDING_VERIFICATION`;

  return await fetch(requestUrlLiteral, {
    method: 'PATCH',
    headers: { ...headersSnapshot },
    body: JSON.stringify({
      status: 'ACTIVE',
      verified_at: new Date().toISOString(),
      activation_correlation_id: correlationId,
    }),
    /** SRE: Límite de 10 segundos para la activación de identidad */
    signal: AbortSignal.timeout(10000),
  });
};
