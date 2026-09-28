/**
 * @section Core Infrastructure - Telemetry Package Entry Point (Barrel)
 * @description Orquestador central del sistema nervioso digital del ecosistema.
 * Centraliza las capacidades de observabilidad, integridad Merkle, procesamiento
 * en segundo plano y resiliencia de persistencia local.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First).
 * Mantenibilidad: ISO/IEC 25010 & ISO 11179.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

/**
 * @version 1.6.0
 * Estatus: Nivelación Zenith completada. Grafo de tipos estabilizado tras
 * la purga de nomenclatura coloquial y normalización de rutas ESM.
 */
export const CORE_TELEMETRY_VERSION = '1.6.0';

/**
 * @domain 1. ADN ESTRUCTURAL (Schemas & Branded Types)
 * @description Contratos inmutables para la validación de señales y firmas digitales.
 */
export {
  ContentFingerprintSchema,
  CorrelationIdentifierSchema,
  ModuleIdentifierSchema,
  OperationCodeSchema,
  SeverityLevelSchema,
  TelemetrySignalSchema,
} from './lib/schemas/TelemetrySignal.schema.js';

export type {
  ContentFingerprint,
  CorrelationIdentifier,
  ITelemetrySignal,
  ModuleIdentifier,
  OperationCode,
  SeverityLevel,
} from './lib/schemas/TelemetrySignal.schema.js';

/**
 * @domain 2. ALMAS LINGÜÍSTICAS (Internationalization)
 * @description Esquemas para la auditoría de diccionarios de logs semánticos.
 */
export {
  TelemetryLinguisticDictionarySchema
} from './lib/i18n/TelemetryLinguisticDictionary.schema.js';

export type {
  ITelemetryLinguisticDictionary
} from './lib/i18n/TelemetryLinguisticDictionary.schema.js';

/**
 * @domain 3. LÓGICA ATÓMICA (Observability Atoms)
 * @description Funciones puras para el flujo sanguíneo digital del ecosistema.
 */
export { EmitTelemetrySignal } from './lib/logic/atomic/EmitTelemetrySignal.js';
export { GenerateCorrelationIdentifier } from './lib/logic/atomic/GenerateCorrelationIdentifier.js';
export { ReportForensicException } from './lib/logic/atomic/ReportForensicException.js';
export { TraceExecutionTime } from './lib/logic/atomic/TraceExecutionTime.js';

/**
 * @domain 4. SENSORES DE INFRAESTRUCTURA (Isomorphic Detection)
 */
export { DetermineDevelopmentEnvironment } from './lib/logic/atomic/DetermineDevelopmentEnvironment.js';
export { DetermineServerRuntime } from './lib/logic/atomic/DetermineServerRuntime.js';

/**
 * @domain 5. MOTORES DE TRANSPORTE Y RESILIENCIA (Drivers)
 */

/* 5.1. Gestión de Memoria Volátil (Buffer Pipeline) */
export { AddTelemetrySignalToBuffer } from './lib/logic/drivers/AddTelemetrySignalToBuffer.js';
export { FlushTelemetryBufferSignals } from './lib/logic/drivers/FlushTelemetryBufferSignals.js';
export { GetTelemetryBufferSizeQuantity } from './lib/logic/drivers/GetTelemetryBufferSizeQuantity.js';

/* 5.2. Persistencia de Resiliencia Local (Hardware Shield) */
/** 🛡️ SANEADO (Naming): 'Sovereign' ➔ 'Primary' para cumplimiento de Manual de Nomenclatura. */
export { ClearSovereignTelemetryVaultAction as ClearPrimaryTelemetryVaultAction } from './lib/logic/drivers/ClearSovereignTelemetryVaultAction.js';
export { PersistTelemetrySignalsToLocalStorage } from './lib/logic/drivers/PersistTelemetrySignalsToLocalStorage.js';
export { RetrieveTelemetryBatchFromLocalStorage } from './lib/logic/drivers/RetrieveTelemetryBatchFromLocalStorage.js';

/* 5.3. Orquestación y Transporte Cloud (I/O Delegation) */
export { QueueTelemetrySignalForTransportAction } from './lib/logic/drivers/LogTransportDriver.js';
export { RequestBackgroundComputation } from './lib/logic/drivers/RequestBackgroundComputation.js';
export { TransmitTelemetrySignalsToCloud } from './lib/logic/drivers/TransmitTelemetrySignalsToCloud.js';
