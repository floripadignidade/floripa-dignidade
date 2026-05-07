/**
 * @section Financial Ingestion - Cloud Batch Transmitter
 * @description Átomo encargado exclusivamente de la comunicación física I/O
 * con el Tier de Datos (Supabase). Implementa el protocolo de persistencia
 * asíncrona mediante fetch nativo y garantiza la idempotencia de los datos
 * mediante políticas de resolución de duplicados.
 *
 * Protocolo OEDP-V17.0 - Hardware Isolation & Cloud Sovereign.
 * SANEADO Zenith: Implementación de Upsert Idempotente y SRE Timeout.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */
import type { IFinancialLedgerRow } from './MapFinancialRecordsToLedger';
/**
 * @interface ITransmissionParameters
 * @description Contrato inmutable para la operación de red masiva.
 */
interface ITransmissionParameters {
    /** URL absoluta de la API REST de la base de datos. */
    readonly cloudUrlLiteral: string;
    /** Llave maestra de acceso (Service Role) validada por la aduana. */
    readonly cloudSecurityKeySecret: string;
    /** Lote de registros mapeados bajo el esquema físico del Ledger. */
    readonly ledgerPayloadCollection: IFinancialLedgerRow[];
}
/**
 * Ejecuta el despacho físico de datos hacia la infraestructura de Supabase.
 * Implementa el patrón 'Stateless Fetch' compatible con Vercel Edge Runtime.
 *
 * @param parameters - Configuración técnica y carga útil de la transacción.
 * @returns {Promise<void>} Promesa de finalización de la transacción física.
 * @throws {InternalSystemException} Si la nube rechaza la persistencia o expira el tiempo.
 */
export declare const TransmitFinancialBatch: (parameters: ITransmissionParameters) => Promise<void>;
export {};
//# sourceMappingURL=TransmitFinancialBatch.d.ts.map