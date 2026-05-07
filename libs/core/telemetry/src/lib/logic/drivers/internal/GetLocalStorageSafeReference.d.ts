/**
 * @section Telemetry Logic - LocalStorage Safe Reference
 * @description Proporciona un acceso seguro e isomórfico al objeto de almacenamiento
 * del hardware del ciudadano. Implementa un puente estructural para garantizar
 * la compilación en entornos de servidor (Node.js) donde los tipos de DOM
 * no están presentes.
 *
 * Protocolo OEDP-V17.0 - Hardware Isolation & Isomorphic Integrity.
 * SANEADO Zenith: Erradicación del error TS2304 mediante el patrón 'Bridge Interface'.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */
/**
 * @interface IStorageHardwareBridge
 * @description Definición técnica de la forma física del almacenamiento local.
 * Este puente permite que el búnker sea agnóstico a la presencia de la
 * librería "DOM" durante la compilación de motores de servidor.
 */
interface IStorageHardwareBridge {
    readonly getItem: (keyLiteral: string) => string | null;
    readonly setItem: (keyLiteral: string, valueLiteral: string) => void;
    readonly removeItem: (keyLiteral: string) => void;
    readonly clear: () => void;
    readonly length: number;
}
/**
 * Recupera una referencia segura al motor de persistencia del hardware si está disponible.
 * Implementa el patrón 'Return Early' para evitar accesos nulos en el servidor.
 *
 * @returns {IStorageHardwareBridge | null} Instancia física del almacén o nulo si es Runtime de Servidor.
 */
export declare const GetLocalStorageSafeReference: () => IStorageHardwareBridge | null;
export {};
//# sourceMappingURL=GetLocalStorageSafeReference.d.ts.map