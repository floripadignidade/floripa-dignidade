/**
 * @section Core Environment Validator - Package Entry Point (Barrel)
 * @description Orquestrador soberano para a auditoria de infraestrutura e
 * validação de ADN de ambiente. Centraliza a exportação de contratos
 * criptográficos (Branded Types), sensores de hardware e almas linguísticas.
 *
 * Protocolo OEDP-V17.0 - Verbatim Module Syntax & High Performance Treeshaking.
 * SANEADO Zenith: Integração de átomos de violação e captura isomórfica.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */
/**
 * @version 1.2.0
 * Estatus: Nivelamento Zenith concluído. Suporte para Branded Types de hardware,
 * isolamento de process.env e reporte forense de integridade.
 */
export declare const CORE_ENVIRONMENT_VALIDATOR_VERSION = "1.2.0";
/**
 * @section Camada 1: ADN Estrutural (Schemas & Types)
 * @description Exportação de contratos de segredos cloud e identidades de hardware.
 */
export { EnvironmentSchema } from './lib/schemas/Environment.schema';
export type { IEnvironmentVariables } from './lib/schemas/Environment.schema';
/**
 * @section Camada 2: Almas Linguísticas (Internationalization)
 * @description Definições para a validação de dicionários de auditoria de infraestrutura.
 */
export { EnvironmentLinguisticDictionarySchema } from './lib/i18n/EnvironmentLinguisticDictionary.schema';
export type { IEnvironmentLinguisticDictionary } from './lib/i18n/EnvironmentLinguisticDictionary.schema';
/**
 * @section Camada 3: Motores de Lógica e Orquestração (Atoms)
 * @description Unidades funcionais para a gestão de integridade do ambiente.
 */
/** Orquestrador principal de inicialização (Fail-Fast Guardian). */
export { ValidateEnvironmentAduana } from './lib/logic/ValidateEnvironmentAduana';
/** Sensor de hardware para extração de metadatos de processo. */
export { GatherEnvironmentMetadata } from './lib/logic/GatherEnvironmentMetadata';
/** Átomo de triagem para o colapso controlado em caso de ADN corrompido. */
export { ReportEnvironmentIntegrityViolation } from './lib/logic/atomic/ReportEnvironmentIntegrityViolation';
/** Interfaces de rastro técnico. */
export type { IEnvironmentMetadataSnapshot } from './lib/logic/GatherEnvironmentMetadata';
//# sourceMappingURL=index.d.ts.map