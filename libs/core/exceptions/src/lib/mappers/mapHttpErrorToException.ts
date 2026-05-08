/**
 * @section Exception Logic - HTTP to Domain Mapper
 * @description Átomo encargado de la traducción de protocolos. Transforma códigos de
 * estado HTTP y mensajes de red en instancias de excepciones soberanas niveladas.
 * Actúa como el intérprete en las fronteras de los API Gateways y Edge Handlers.
 *
 * Protocolo OEDP-V17.0 - Functional Atomicity & High Performance SRE.
 * SANEADO Zenith: Sincronización de parámetros con la arquitectura de clases base.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { InternalSystemException } from '../codes/InternalSystemException';
import { ValidationException } from '../codes/ValidationException';
import type { GlobalBaseException } from '../codes/GlobalBaseException';

/**
 * Traduce un fallo de red o estado HTTP a una excepción del dominio de Floripa Dignidade.
 * Proporciona un triaje automático basado en la jerarquía del código de estado RFC 9110.
 *
 * @param httpStatusCodeNumeric - Código físico recibido (Familia 4xx o 5xx).
 * @param customMessageLiteral - Descripción del contexto del error capturado.
 * @param runtimeContextSnapshotSource - Snapshot opcional de variables para auditoría forense.
 * @returns {GlobalBaseException} Instancia de una excepción especializada (Validation o Internal).
 */
export const MapHttpErrorToException = (
  httpStatusCodeNumeric: number,
  customMessageLiteral: string,
  runtimeContextSnapshotSource: Record<string, unknown> = {}
): GlobalBaseException => {

  /**
   * @section Triaje de Gravedad
   * 4xx: Errores de validación, autoridad o recursos no encontrados (Culpa del Cliente).
   * 5xx: Errores de infraestructura, timeouts o colapsos (Culpa del Servidor).
   */

  // 1. Gestión de Fallos de Integridad y Aduana (4xx)
  if (httpStatusCodeNumeric >= 400 && httpStatusCodeNumeric < 500) {
    return new ValidationException(customMessageLiteral, {
      ...runtimeContextSnapshotSource,
      originalHttpStatusCodeNumeric: httpStatusCodeNumeric,
      errorFamilyLiteral: 'CLIENT_SIDE_FAULT',
    });
  }

  // 2. Gestión de Colapsos de Infraestructura y SRE (5xx o Desconocidos)
  return new InternalSystemException(customMessageLiteral, {
    ...runtimeContextSnapshotSource,
    originalHttpStatusCodeNumeric: httpStatusCodeNumeric,
    errorFamilyLiteral: 'INFRASTRUCTURE_COLLAPSE',
  });
};
