/**
 * @section Core Infrastructure - Telemetry Package Entry Point (Barrel)
 * @description Orquestador central del sistema de observabilidad y trazabilidad del ecosistema.
 * Centraliza las capacidades de telemetría, integridad Merkle, procesamiento
 * en segundo plano y resiliencia de persistencia local.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Clean Paths).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa) e ISO/IEC 25010 (Mantenibilidad y Rendimiento).
 * SANEADO Turbopack: Erradicación definitiva de extensiones '.js' a favor de Rutas Limpias (Extensionless).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

/**
 * @version 1.6.1
 * Estatus: Nivelación Turbopack completada. Rutas limpias deterministas para Next.js 16.
 */
export const CORE_TELEMETRY_VERSION = '1.6.1';

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
} from './lib/schemas/TelemetrySignal.schema';

export type {
  ContentFingerprint,
  CorrelationIdentifier,
  ITelemetrySignal,
  ModuleIdentifier,
  OperationCode,
  SeverityLevel,
} from './lib/schemas/TelemetrySignal.schema';

/**
 * @domain 2. ALMAS LINGÜÍSTICAS (Internationalization)
 * @description Esquemas para la auditoría de diccionarios de logs semánticos.
 */
export { TelemetryLinguisticDictionarySchema } from './lib/i18n/TelemetryLinguisticDictionary.schema';

export type { ITelemetryLinguisticDictionary } from './lib/i18n/TelemetryLinguisticDictionary.schema';

/**
 * @domain 3. LÓGICA ATÓMICA (Observability Atoms)
 * @description Funciones puras para el flujo telemétrico y observabilidad del ecosistema.
 */
export { EmitTelemetrySignal } from './lib/logic/atomic/EmitTelemetrySignal';
export { GenerateCorrelationIdentifier } from './lib/logic/atomic/GenerateCorrelationIdentifier';
export { ReportForensicException } from './lib/logic/atomic/ReportForensicException';
export { TraceExecutionTime } from './lib/logic/atomic/TraceExecutionTime';

/**
 * @domain 4. SENSORES DE INFRAESTRUCTURA (Isomorphic Detection)
 */
export { DetermineDevelopmentEnvironment } from './lib/logic/atomic/DetermineDevelopmentEnvironment';
export { DetermineServerRuntime } from './lib/logic/atomic/DetermineServerRuntime';

/**
 * @domain 5. MOTORES DE TRANSPORTE Y RESILIENCIA (Drivers)
 */

/* 5.1. Gestión de Memoria Volátil (Buffer Pipeline) */
export { AddTelemetrySignalToBuffer } from './lib/logic/drivers/AddTelemetrySignalToBuffer';
export { FlushTelemetryBufferSignals } from './lib/logic/drivers/FlushTelemetryBufferSignals';
export { GetTelemetryBufferSizeQuantity } from './lib/logic/drivers/GetTelemetryBufferSizeQuantity';

/* 5.2. Persistencia de Resiliencia Local (Hardware Shield) */
export { ClearSovereignTelemetryVaultAction as ClearPrimaryTelemetryVaultAction } from './lib/logic/drivers/ClearSovereignTelemetryVaultAction';
export { PersistTelemetrySignalsToLocalStorage } from './lib/logic/drivers/PersistTelemetrySignalsToLocalStorage';
export { RetrieveTelemetryBatchFromLocalStorage } from './lib/logic/drivers/RetrieveTelemetryBatchFromLocalStorage';

/* 5.3. Orquestación y Transporte Cloud (I/O Delegation) */
export { QueueTelemetrySignalForTransportAction } from './lib/logic/drivers/LogTransportDriver';
export { RequestBackgroundComputation } from './lib/logic/drivers/RequestBackgroundComputation';
export { TransmitTelemetrySignalsToCloud } from './lib/logic/drivers/TransmitTelemetrySignalsToCloud';
