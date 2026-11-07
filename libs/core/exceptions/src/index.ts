/**
 * @section Core Exceptions - Package Entry Point (Barrel)
 * @description Orquestador soberano para la gestión unificada de anomalías y contratos
 * de error del ecosistema. Centraliza la exportación de la gramática del fallo,
 * capturas forenses y traductores de protocolo HTTP.
 *
 * Protocolo OEDP-V17.0 - Verbatim Module Syntax & High Performance Treeshaking.
 * SANEADO Zenith: Integración de esquemas atómicos y mappers de protocolo.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

/**
 * @version 1.2.5
 * Estatus: Nivelación Zenith completada. Grafo de tipos sincronizado.
 */
export const CORE_EXCEPTIONS_VERSION = '1.2.5';

/**
 * @section Capa 1: ADN Estructural (Schemas & Types)
 * Exportación de contratos de validación y tipos nominales (Branded).
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
 * @section Capa 2: Almas Lingüísticas (Internationalization)
 */
export {
  ExceptionsLinguisticDictionarySchema,
} from './lib/i18n/ExceptionsI18n.schema';

export type {
  IExceptionsLinguisticDictionary,
} from './lib/i18n/ExceptionsI18n.schema';

/**
 * @section Capa 3: Motores de Excepción (Logic & Classes)
 */
export { GlobalBaseException } from './lib/codes/GlobalBaseException';
export { InternalSystemException } from './lib/codes/InternalSystemException';
export { ValidationException } from './lib/codes/ValidationException';

/**
 * @section Capa 4: Adaptadores de Protocolo (Mappers)
 * Traductores atómicos para estados de red.
 * Sincronizado para resolución estricta en entornos POSIX/Linux.
 */
export { MapHttpErrorToException } from './lib/mappers/mapHttpErrorToException';
