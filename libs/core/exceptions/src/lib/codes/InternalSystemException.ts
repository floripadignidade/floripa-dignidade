/**
 * @section Exception Engine - Specialized Infrastructure Exceptions
 * @description Excepción de Fallo Interno del Sistema (Nivel Servidor / HTTP 500).
 * Actúa como la señal de máxima prioridad operativa. Su emisión notifica
 * automáticamente al Neural Sentinel para iniciar protocolos de auto-sanación.
 *
 * Protocolo OEDP-V17.0 - High Severity Infrastructure Signal & ISO Naming.
 * SANEADO Zenith: Sincronización de parámetros con la Clase Base y Rigor ISO.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { GlobalBaseException } from './GlobalBaseException';
import type { ErrorCode } from '../schemas/Exception.schema';

/**
 * @class InternalSystemException
 * @extends {GlobalBaseException}
 * @description Representa errores críticos imprevistos donde la infraestructura,
 * la base de datos o la lógica central han colapsado.
 */
export class InternalSystemException extends GlobalBaseException {
  /**
   * Inicializa una instancia de error de sistema con severidad de colapso técnica.
   *
   * @param messageLiteral - Descripción técnica detallada de la anomalía detectada.
   * @param runtimeContextSnapshotSource - Colección inmutable de metadatos para reconstrucción.
   */
  public constructor(
    messageLiteral: string,
    runtimeContextSnapshotSource: Record<string, unknown> = {},
  ) {
    /**
     * @constant INTERNAL_SYSTEM_FAILURE - Código semántico inmutable (ISO Standard).
     * 🛡️ SANEADO: Se aplica casting 'as ErrorCode' para satisfacer el Branded Type
     * definido en el ExceptionSchema, garantizando la integridad del enjambre.
     */
    const operationalErrorCodeLiteral = 'INTERNAL_SYSTEM_FAILURE' as ErrorCode;
    const httpStatusCodeNumeric = 500;

    super(
      messageLiteral,
      operationalErrorCodeLiteral,
      httpStatusCodeNumeric,
      runtimeContextSnapshotSource,
    );
  }
}
