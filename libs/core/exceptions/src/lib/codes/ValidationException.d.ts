/**
 * @section Exception Engine - Specialized Validation Exceptions
 * @description Excepción de Fallo de Integridad de Datos (Nivel Cliente / HTTP 400).
 * Se dispara cuando los payloads no cumplen con los contratos de ADN (Zod)
 * establecidos en las fronteras de los búnkeres.
 *
 * Protocolo OEDP-V17.0 - Data Sovereignty Enforcement & ISO Naming.
 * SANEADO Zenith: Resolución de TS2345 (Branded Type Match) y Nomenclatura Prosaica.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */
import { GlobalBaseException } from './GlobalBaseException';
/**
 * @class ValidationException
 * @extends {GlobalBaseException}
 * @description Representa un rechazo en la aduana de datos. Indica que la
 * solicitud es semánticamente incorrecta, previniendo la polución de la lógica.
 */
export declare class ValidationException extends GlobalBaseException {
    /**
     * Inicializa un error de validación con estatus de solicitud incorrecta (Bad Request).
     *
     * @param messageLiteral - Descripción del fallo de integridad o contrato detectado.
     * @param contextMetadataCollection - Snapshot de los campos o reglas que fallaron.
     */
    constructor(messageLiteral: string, contextMetadataCollection?: Record<string, unknown>);
}
//# sourceMappingURL=ValidationException.d.ts.map