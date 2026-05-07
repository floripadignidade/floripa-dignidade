/**
 * @section Exception Engine - Base Infrastructure
 * @description Clase base abstracta para la gestión estandarizada de anomalías.
 * Proporciona la estructura fundamental para la captura forense de fallos
 * e inmutabilidad de contexto (ADR 0014).
 *
 * Protocolo OEDP-V17.0 - ISO Technical Naming & Isomorphic Integrity.
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */
import type { ErrorCode } from '../schemas/Exception.schema';
/**
 * @class GlobalBaseException
 * @extends {Error}
 * @description Ancestro supremo de todas las excepciones del ecosistema.
 * Obliga a la captura de un snapshot de memoria para auditoría del Neural Sentinel.
 */
export declare abstract class GlobalBaseException extends Error {
    readonly operationalErrorCodeLiteral: ErrorCode;
    readonly httpStatusCodeNumeric: number;
    readonly occurrenceTimestampISO: string;
    readonly runtimeContextSnapshot: Record<string, unknown>;
    /**
     * Inicializa la excepción inyectando el ADN forense.
     *
     * @param messageLiteral - Descripción humana/técnica del fallo.
     * @param operationalErrorCodeLiteral - Código soberano catalogado en la Aduana de ADN.
     * @param httpStatusCodeNumeric - Código de estado HTTP para el triaje de red.
     * @param contextMetadataCollection - Diccionario opcional de variables de entorno del fallo.
     */
    constructor(messageLiteral: string, operationalErrorCodeLiteral: ErrorCode, httpStatusCodeNumeric: number, contextMetadataCollection?: Record<string, unknown>);
}
//# sourceMappingURL=GlobalBaseException.d.ts.map