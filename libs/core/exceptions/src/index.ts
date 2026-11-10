// libs/core/exceptions/src/index.ts

/**
 * @section Core Exceptions - Master Entry Point (Barrel)
 * @description Único punto de exportación autorizado para la gestión unificada de anomalías
 * y contratos de error en el ecosistema Floripa Dignidade. Centraliza la taxonomía del fallo,
 * las capturas forenses inmutables y los traductores de protocolo HTTP.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa) e ISO/IEC 25010 (Confiabilidad y Mantenibilidad).
 * SANEADO Zenith: Incorporación universal de extensiones de módulo canónicas ESM (.js)
 * para garantizar compatibilidad estricta con Node.js 20/22/26, tsx y el motor de compilación de Vercel.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

/**
 * @version 1.3.1
 * Estatus: Nivelación Zenith y estabilización de resolución ESM determinista en Linux/Vercel.
 */
export const CORE_EXCEPTIONS_VERSION = '1.3.1';

/**
 * @section Capa 1: ADN Estructural (Schemas & Nominal Types)
 * Exportación de contratos de validación en tiempo de ejecución y tipos sellados nominalmente.
 */
export {
  ErrorCodeSchema,
  RuntimeSnapshotSchema,
  ExceptionContractSchema,
} from './lib/schemas/Exception.schema.js';

export type {
  ErrorCode,
  IRuntimeSnapshot,
  IExceptionContract,
} from './lib/schemas/Exception.schema.js';

/**
 * @section Capa 2: Almas Lingüísticas (Internationalization Contracts)
 * Contrato de integridad estructural para diccionarios de traducción de errores técnicos.
 */
export { ExceptionsLinguisticDictionarySchema } from './lib/i18n/ExceptionsI18n.schema.js';

export type { IExceptionsLinguisticDictionary } from './lib/i18n/ExceptionsI18n.schema.js';

/**
 * @section Capa 3: Clases de Excepción Especializadas (Logic & Inheritance)
 * Jerarquía de clases que capturan snapshots forenses inmutables del entorno de ejecución.
 */
export { GlobalBaseException } from './lib/codes/GlobalBaseException.js';
export { InternalSystemException } from './lib/codes/InternalSystemException.js';
export { ValidationException } from './lib/codes/ValidationException.js';

/**
 * @section Capa 4: Adaptadores de Protocolo de Red (Mappers)
 * Traductores atómicos para transformar códigos de estado RFC 9110 en excepciones de dominio.
 * SANEADO ISO 11179 & ESM: Resolución explícita con extensión .js y PascalCase estricto.
 */
export { MapHttpErrorToException } from './lib/mappers/MapHttpErrorToException.js';
