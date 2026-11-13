/**
 * @section Exception Engine - Specialized Validation Exceptions
 * @description Excepción de Fallo de Integridad de Datos (Nivel Cliente / HTTP 400).
 * Se dispara cuando los payloads no cumplen con los contratos de ADN (Zod)
 * establecidos en las fronteras de los búnkeres.
 *
 * Protocolo OEDP-V17.0 - Data Sovereignty Enforcement & ISO Naming.
 * SANEADO Zenith: Sincronización de parámetros con la Clase Base y Prosa ISO.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { GlobalBaseException } from './GlobalBaseException';
import type { ErrorCode } from '../schemas/Exception.schema';

/**
 * @class ValidationException
 * @extends {GlobalBaseException}
 * @description Representa un rechazo en la aduana de datos. Indica que la
 * solicitud es semánticamente incorrecta o incompleta, previniendo la
 * ejecución de lógica sobre datos impuros.
 */
export class ValidationException extends GlobalBaseException {
  /**
   * Inicializa un error de validación con estatus de solicitud incorrecta (Bad Request).
   *
   * @param messageLiteral - Descripción del fallo de integridad o contrato detectado.
   * @param runtimeContextSnapshotSource - Snapshot de los campos, reglas o esquemas que fallaron.
   */
  public constructor(
    messageLiteral: string,
    runtimeContextSnapshotSource: Record<string, unknown> = {},
  ) {
    /**
     * @constant VALIDATION_FAILED - Código semántico inmutable para fallos de esquema.
     * 🛡️ SANEADO: Se aplica casting 'as ErrorCode' para cumplir con el sellado
     * nominal de marca (Branded Type) del sistema.
     */
    const operationalErrorCodeLiteral = 'VALIDATION_FAILED' as ErrorCode;
    const httpStatusCodeNumeric = 400;

    super(
      messageLiteral,
      operationalErrorCodeLiteral,
      httpStatusCodeNumeric,
      runtimeContextSnapshotSource,
    );
  }
}
