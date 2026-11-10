// libs/core/exceptions/src/lib/mappers/MapHttpErrorToException.ts

/**
 * @section Exception Logic - HTTP to Domain Mapper (Atom)
 * @description Átomo puro encargado de la traducción de protocolos. Transforma códigos
 * de estado HTTP (RFC 9110) y mensajes de red en instancias de excepciones institucionales
 * tipadas y niveladas. Actúa como el intérprete en las fronteras de los API Gateways y Edge Handlers.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa) e ISO/IEC 25010 (Confiabilidad y Portabilidad).
 * SANEADO Zenith: Incorporación de extensiones de módulo ESM canónicas (.js) y blindaje
 * de tipado nominal para ejecución determinista en Linux / Vercel.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

/* 1. Clases de Excepción y Jerarquía de Dominio (Resolución ESM Estricta) */
import { InternalSystemException } from '../codes/InternalSystemException.js';
import { ValidationException } from '../codes/ValidationException.js';
import type { GlobalBaseException } from '../codes/GlobalBaseException.js';

/**
 * Traduce un fallo de red o código de estado HTTP a una excepción formal del dominio Floripa Dignidade.
 * Proporciona un triaje automático determinista basado en la jerarquía del código de estado RFC 9110.
 *
 * @param httpStatusCodeNumeric - Código numérico de estado HTTP recibido (Familias 4xx o 5xx).
 * @param customMessageLiteral - Descripción semántica del contexto del fallo capturado.
 * @param runtimeContextSnapshotSource - Diccionario opcional de variables de contexto y metadatos forenses.
 * @returns {GlobalBaseException} Instancia especializada de excepción (ValidationException o InternalSystemException).
 */
export const MapHttpErrorToException = (
  httpStatusCodeNumeric: number,
  customMessageLiteral: string,
  runtimeContextSnapshotSource: Record<string, unknown> = {},
): GlobalBaseException => {
  /**
   * @section Triaje de Gravedad RFC 9110
   * - Familia 4xx (400 - 499): Errores de cliente, aduana, validación o autorización insuficiente.
   * - Familia 5xx (500 - 599) o códigos anómalos: Errores de infraestructura, timeouts o colapsos de servidor.
   */
  const isClientSideFaultBoolean = httpStatusCodeNumeric >= 400 && httpStatusCodeNumeric < 500;

  if (isClientSideFaultBoolean) {
    return new ValidationException(customMessageLiteral, {
      ...runtimeContextSnapshotSource,
      originalHttpStatusCodeNumeric: httpStatusCodeNumeric,
      errorFamilyLiteral: 'CLIENT_SIDE_FAULT',
    });
  }

  return new InternalSystemException(customMessageLiteral, {
    ...runtimeContextSnapshotSource,
    originalHttpStatusCodeNumeric: httpStatusCodeNumeric,
    errorFamilyLiteral: 'INFRASTRUCTURE_COLLAPSE',
  });
};
