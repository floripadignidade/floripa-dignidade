/**
 * @section Storage Logic - Upload Error Normalizer (Atom)
 * @description Átomo encargado de traducir fallos ocurridos durante la carga binaria
 * hacia excepciones tipadas de dominio (`GlobalBaseException`), preservando instancias
 * existentes, clasificando cancelaciones por timeout como HTTP 504 y sanitizando URLs
 * para impedir filtración de parámetros sensibles.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Clean Paths).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa), ISO/IEC 25010 e ISO/IEC 27001.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { GlobalBaseException, MapHttpErrorToException } from '@floripa-dignidade/exceptions';
import type { CorrelationIdentifier } from '@floripa-dignidade/telemetry';

/**
 * Normaliza cualquier error capturado durante la transferencia HTTP de almacenamiento en la nube.
 *
 * @param caughtExecutionError - Excepción cruda capturada en el bloque de transporte.
 * @param endpointSanitizedPathLiteral - Origen y ruta de destino sin cadena de consulta.
 * @param timeoutInMillisecondsQuantity - Umbral de timeout configurado para la transacción.
 * @param correlationIdentifier - Identificador UUID v4 de trazabilidad forense.
 * @returns {GlobalBaseException} Excepción institucional clasificada y sellada.
 */
export const NormalizeCloudStorageUploadError = (
  caughtExecutionError: unknown,
  endpointSanitizedPathLiteral: string,
  timeoutInMillisecondsQuantity: number,
  correlationIdentifier: CorrelationIdentifier,
): GlobalBaseException => {
  if (caughtExecutionError instanceof GlobalBaseException) {
    return caughtExecutionError;
  }

  const isTimeoutOrAbortErrorBoolean =
    caughtExecutionError instanceof Error &&
    (caughtExecutionError.name === 'AbortError' || caughtExecutionError.name === 'TimeoutError');

  if (isTimeoutOrAbortErrorBoolean) {
    return MapHttpErrorToException(504, 'CLOUD_STORAGE_UPLOAD_TIMEOUT', {
      endpointSanitizedPathLiteral,
      timeoutInMillisecondsQuantity,
      correlationIdentifier,
    });
  }

  const errorDescriptionLiteral =
    caughtExecutionError instanceof Error
      ? caughtExecutionError.message
      : String(caughtExecutionError);

  return MapHttpErrorToException(500, 'CLOUD_STORAGE_PHYSICAL_UPLOAD_FAILURE', {
    originalErrorLiteral: errorDescriptionLiteral,
    endpointSanitizedPathLiteral,
    correlationIdentifier,
  });
};
