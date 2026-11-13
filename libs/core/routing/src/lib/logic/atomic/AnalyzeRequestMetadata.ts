/**
 * @section Routing Logic - Request Metadata Analyzer Apparatus
 * @description Extrae e inyecta metadatos técnicos de las cabeceras HTTP en el contexto
 * soberano de ruteo. Implementa detección de IP multi-capa y normalización de User Agent.
 *
 * Protocolo OEDP-V16.0 - Forensic Capture & Zero Unused Vars.
 * Saneamiento: Resolución de TS2532 (noUncheckedIndexedAccess) en extracción de IP.
 *
 * @author Raz  Podestá - MetaShark Tech
 */

import type { IRoutingContext } from '../../schemas/RoutingContext.schema';

/**
 * Analiza las cabeceras de la solicitud entrante y enriquece el contexto de ruteo.
 *
 * @param incomingRequestHeaders - Cabeceras nativas de la petición HTTP.
 * @param existingRoutingContext - Contexto previo que será evolucionado.
 * @returns {IRoutingContext} Un nuevo IRoutingContext inmutable con metadatos técnicos inyectados.
 */
export const AnalyzeRequestMetadata = (
  incomingRequestHeaders: Headers,
  existingRoutingContext: IRoutingContext,
): IRoutingContext => {
  /**
   * 1. EXTRACCIÓN DE IDENTIDAD TÉCNICA
   * Capturamos la IP considerando la cadena de confianza de proxies (x-forwarded-for).
   */
  const rawForwardedForHeaderLiteral = incomingRequestHeaders.get('x-forwarded-for');
  let clientIpAddressLiteral = '127.0.0.1';

  if (rawForwardedForHeaderLiteral) {
    const ipAddressPartsCollection = rawForwardedForHeaderLiteral.split(',');
    const firstIpAddressLiteral = ipAddressPartsCollection[0];

    // 🛡️ SANEADO: Validación segura para cumplir con "noUncheckedIndexedAccess"
    if (firstIpAddressLiteral) {
      clientIpAddressLiteral = firstIpAddressLiteral.trim();
    }
  }

  const userAgentLiteral = incomingRequestHeaders.get('user-agent') || 'unknown-agent';

  /**
   * 2. EVOLUCIÓN DE CONTEXTO (Sovereign Inmutability)
   * Retornamos una nueva instancia del contexto cumpliendo con el ADN
   * de 'RoutingContextSchema'.
   */
  return {
    ...existingRoutingContext,
    clientMetadata: {
      ...existingRoutingContext.clientMetadata,
      ipAddressLiteral: clientIpAddressLiteral,
      userAgentLiteral: userAgentLiteral,
    },
  };
};
