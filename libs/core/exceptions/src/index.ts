/**
 * @section Core Exceptions - Master Entry Point (Barrel)
 * @description Único punto de exportación autorizado para la gestión unificada de anomalías
 * y contratos de error en el ecosistema Floripa Dignidade. Centraliza la taxonomía del fallo,
 * las capturas forenses inmutables y los traductores de protocolo HTTP.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa) e ISO/IEC 25010 (Confiabilidad y Mantenibilidad).
 * SANEADO Zenith: Erradicación definitiva de TS1261 mediante alineación estricta de casing
 * hacia PascalCase en la resolución del módulo MapHttpErrorToException.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

/**
 * @version 1.3.0
 * Estatus: Nivelación Zenith y resolución de consistencia de nombres de archivo.
 */
export const CORE_EXCEPTIONS_VERSION = '1.3.0';

/**
 * @section Capa 1: ADN Estructural (Schemas & Nominal Types)
 * Exportación de contratos de validación en tiempo de ejecución y tipos sellados nominalmente.
 */
export {
  ErrorCodeSchema,
  RuntimeSnapshotSchema,
  ExceptionContractSchema,
} from './lib/schemas/Exception.schema';

export type {
  ErrorCode,
  IRuntimeSnapshot,
  IExceptionContract,
} from './lib/schemas/Exception.schema';

/**
 * @section Capa 2: Almas Lingüísticas (Internationalization Contracts)
 * Contrato de integridad estructural para diccionarios de traducción de errores técnicos.
 */
export {
  ExceptionsLinguisticDictionarySchema,
} from './lib/i18n/ExceptionsI18n.schema';

export type {
  IExceptionsLinguisticDictionary,
} from './lib/i18n/ExceptionsI18n.schema';

/**
 * @section Capa 3: Clases de Excepción Especializadas (Logic & Inheritance)
 * Jerarquía de clases que capturan snapshots forenses inmutables del entorno de ejecución.
 */
export { GlobalBaseException } from './lib/codes/GlobalBaseException';
export { InternalSystemException } from './lib/codes/InternalSystemException';
export { ValidationException } from './lib/codes/ValidationException';

/**
 * @section Capa 4: Adaptadores de Protocolo de Red (Mappers)
 * Traductores atómicos para transformar códigos de estado RFC 9110 en excepciones de dominio.
 * SANEADO ISO 11179: Alineación simétrica con el nombre físico 'MapHttpErrorToException.ts'.
 */
export { MapHttpErrorToException } from './lib/mappers/MapHttpErrorToException';
