/**
 * @section Financial Ingestion - Cloud Persistence Orchestrator
 * @description Orquestador soberano encargado de coordinar el volcado de datos
 * financieros hacia el Data Lake institucional. Une los átomos de mapeo y
 * transmisión física bajo rastro de telemetría y vigilancia SRE.
 *
 * Protocolo OEDP-V17.0 - Swarm Intelligence & High Performance.
 * SANEADO Zenith: Reconexión de rutas planas y blindaje de secretos cloud.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */
import type { IProjectFinancialRecord } from '../../schemas/ProjectFinancialLedger.schema';
/**
 * Ejecuta la transacción íntegra de volcado financiero hacia el Data Lake.
 * Coordina la transformación de protocolos y la seguridad de red.
 *
 * @param financialRecordsCollection - Lista de registros purificados tras la extracción.
 * @param correlationIdentifier - Identificador para la trazabilidad forense del proceso.
 * @returns {Promise<void>} Operación resuelta cuando los datos son inmutables en la nube.
 */
export declare const PersistFinancialLedgerToCloud: (financialRecordsCollection: IProjectFinancialRecord[], correlationIdentifier?: string) => Promise<void>;
//# sourceMappingURL=PersistFinancialLedgerToCloud.d.ts.map