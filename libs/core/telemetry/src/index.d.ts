/**
 * @section Core Telemetry - Package Entry Point (Barrel)
 * @description Orquestador soberano del Sistema Nervioso Central del ecosistema.
 * Centraliza las capacidades de observabilidad, inalterabilidad Merkle,
 * procesamiento en segundo plano y persistencia de resiliencia local.
 *
 * Protocolo OEDP-V17.0 - Single Source Resolution & Verbatim Module Syntax.
 * SANEADO Zenith: Resolución de TS2307 (Poda de aparatos obsoletos) e integración
 * de la arquitectura de átomos pulverizados.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */
/**
 * @version 1.5.1
 * Estatus: Nivelación Zenith completada. Grafo de tipos estabilizado tras
 * la pulverización de drivers híbridos y sanación de contexto isomórfico.
 */
export declare const CORE_TELEMETRY_VERSION = "1.5.1";
/**
 * @section Capa 1: ADN Estructural (Schemas & Branded Types)
 * @description Contratos inmutables para la validación de señales y huellas digitales.
 */
export { ContentFingerprintSchema, CorrelationIdentifierSchema, ModuleIdentifierSchema, OperationCodeSchema, SeverityLevelSchema, TelemetrySignalSchema, } from './lib/schemas/TelemetrySignal.schema';
export type { ContentFingerprint, CorrelationIdentifier, ITelemetrySignal, ModuleIdentifier, OperationCode, SeverityLevel, } from './lib/schemas/TelemetrySignal.schema';
/**
 * @section Capa 2: Almas Lingüísticas (Internationalization)
 * @description Esquemas para la auditoría de diccionarios de logs semánticos.
 */
export { TelemetryLinguisticDictionarySchema } from './lib/i18n/TelemetryLinguisticDictionary.schema';
export type { ITelemetryLinguisticDictionary } from './lib/i18n/TelemetryLinguisticDictionary.schema';
/**
 * @section Capa 3: Lógica Atómica (Aparatos de Observabilidad)
 * @description Funciones puras para el flujo sanguíneo digital del ecosistema.
 */
export { EmitTelemetrySignal } from './lib/logic/atomic/EmitTelemetrySignal';
export { GenerateCorrelationIdentifier } from './lib/logic/atomic/GenerateCorrelationIdentifier';
export { ReportForensicException } from './lib/logic/atomic/ReportForensicException';
export { TraceExecutionTime } from './lib/logic/atomic/TraceExecutionTime';
/**
 * @section Capa 4: Sensores de Soberanía de Entorno (Isomorphic)
 * @description Identificación de hardware y modo de ejecución.
 */
export { DetermineDevelopmentEnvironment } from './lib/logic/atomic/DetermineDevelopmentEnvironment';
export { DetermineServerRuntime } from './lib/logic/atomic/DetermineServerRuntime';
/**
 * @section Capa 5: Motores de Transporte y Resiliencia (Drivers)
 * @description Enjambre de átomos pulverizados para la gestión física de datos.
 */
export { AddTelemetrySignalToBuffer } from './lib/logic/drivers/AddTelemetrySignalToBuffer';
export { FlushTelemetryBufferSignals } from './lib/logic/drivers/FlushTelemetryBufferSignals';
export { GetTelemetryBufferSizeQuantity } from './lib/logic/drivers/GetTelemetryBufferSizeQuantity';
export { ClearSovereignTelemetryVaultAction } from './lib/logic/drivers/ClearSovereignTelemetryVaultAction';
export { PersistTelemetrySignalsToLocalStorage } from './lib/logic/drivers/PersistTelemetrySignalsToLocalStorage';
export { RetrieveTelemetryBatchFromLocalStorage } from './lib/logic/drivers/RetrieveTelemetryBatchFromLocalStorage';
export { QueueTelemetrySignalForTransportAction } from './lib/logic/drivers/LogTransportDriver';
export { RequestBackgroundComputation } from './lib/logic/drivers/RequestBackgroundComputation';
export { TransmitTelemetrySignalsToCloud } from './lib/logic/drivers/TransmitTelemetrySignalsToCloud';
//# sourceMappingURL=index.d.ts.map