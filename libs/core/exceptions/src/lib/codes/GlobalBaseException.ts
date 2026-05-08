/**
 * @section Exception Engine - Base Infrastructure
 * @description Clase base abstracta para la gestión estandarizada de anomalías.
 * Proporciona la estructura fundamental para la captura forense de fallos,
 * inmutabilidad de contexto y trazabilidad en el sistema nervioso central.
 *
 * Protocolo OEDP-V17.0 - ISO Technical Naming & Isomorphic Integrity.
 * Vision: Immutable Evidence Capture for the Neural Sentinel.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import type { ErrorCode, IRuntimeSnapshot } from '../schemas/Exception.schema';

/**
 * @interface IV8StackProvider
 * @description Interfaz técnica para el acceso seguro a las APIs de rastro de V8.
 * Permite que el motor sea compatible con Node.js y navegadores basados en Chromium.
 */
interface IV8StackProvider {
  readonly captureStackTrace: (
    targetObject: object,
    constructorOption?: (...args: unknown[]) => unknown
  ) => void;
}

/**
 * @class GlobalBaseException
 * @extends {Error}
 * @description Ancestro supremo de todas las excepciones del ecosistema.
 * Obliga a la generación de un snapshot de memoria inmutable en el momento del fallo.
 */
export abstract class GlobalBaseException extends Error {
  /** Código operativo soberano para el triaje de la IA. */
  public readonly operationalErrorCodeLiteral: ErrorCode;

  /** Código de estado técnico para la capa de transporte (HTTP/Edge). */
  public readonly httpStatusCodeNumeric: number;

  /** Marca temporal de precisión ISO 8601 de la ocurrencia. */
  public readonly occurrenceTimestampISO: string;

  /** Snapshot inmutable de la evidencia técnica del entorno. */
  public readonly runtimeContextSnapshot: IRuntimeSnapshot;

  /**
   * Inicializa la excepción inyectando el ADN forense institucional.
   *
   * @param messageLiteral - Descripción técnica del fallo para el desarrollador.
   * @param operationalErrorCodeLiteral - Código sellado del catálogo de ADN.
   * @param httpStatusCodeNumeric - Estatus RFC 9110 para la respuesta de red.
   * @param runtimeContextSnapshotSource - Diccionario opcional de variables de entorno.
   */
  protected constructor(
    messageLiteral: string,
    operationalErrorCodeLiteral: ErrorCode,
    httpStatusCodeNumeric: number,
    runtimeContextSnapshotSource: Record<string, unknown> = {}
  ) {
    super(messageLiteral);

    // 1. ASIGNACIÓN DE IDENTIDAD NOMINAL
    this.name = this.constructor.name;
    this.operationalErrorCodeLiteral = operationalErrorCodeLiteral;
    this.httpStatusCodeNumeric = httpStatusCodeNumeric;
    this.occurrenceTimestampISO = new Date().toISOString();

    /**
     * 2. CONSTRUCCIÓN DE SNAPSHOT FORENSE (Immutable context)
     * Implementamos el patrón de sellado total para proteger la cadena de custodia.
     * Sincronizado con 'RuntimeSnapshotSchema'.
     */
    this.runtimeContextSnapshot = Object.freeze({
      ...runtimeContextSnapshotSource,
      exceptionIdentifierLiteral: this.name,
      operationalErrorCodeLiteral: this.operationalErrorCodeLiteral,
      httpStatusCodeNumeric: this.httpStatusCodeNumeric,
      occurrenceTimestampISO: this.occurrenceTimestampISO,
    }) as IRuntimeSnapshot;

    /**
     * 3. CAPTURA DE RASTRO DE PILA (Isomorphic Sentry)
     * SANEADO Zenith: Verificación de seguridad para compatibilidad con
     * Edge Runtimes donde 'Error.captureStackTrace' puede no estar cableado.
     */
    const errorConstructorReference = Error as unknown as IV8StackProvider;

    if (typeof errorConstructorReference.captureStackTrace === 'function') {
      const currentInstanceConstructor = this.constructor as (...args: unknown[]) => unknown;
      errorConstructorReference.captureStackTrace(this, currentInstanceConstructor);
    }
  }
}
