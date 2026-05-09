/**
 * @section Tools & Automation - Package Entry Point (Enterprise Barrel)
 * @description Único punto de exportación autorizado para las herramientas de
 * mantenimiento, auditoría y automatización del ecosistema.
 *
 * Protocolo OEDP-V17.0 - Single Source Resolution & ESM Strict.
 * SANEADO Zenith: Registro de orquestadores de purga, auditoría e ingesta.
 * 🛡️ RIGOR ESM: Inclusión obligatoria de extensiones '.js' para resolución Node16+.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

/** Versión del búnker de herramientas sincronizada. */
export const TOOLS_BUNKER_VERSION = '1.3.0';

/**
 * @section 1. Orquestadores Lingüísticos
 * Compilación y tejido de diccionarios multilingües.
 */
export {
  BuildInternationalizationDictionaries
} from './lib/i18n-builder/InternationalizationDictionaryBuilder.js';

/**
 * @section 2. Orquestadores de Mantenimiento y SRE
 * Higiene de hardware y purga de emisiones de compilación.
 */
export {
  ExecutePurgeOrchestrator
} from './lib/maintenance-tools/ExecutePurgeOrchestrator.js';

export {
  ExecuteRecursiveEmissionsPurge
} from './lib/maintenance-tools/ExecuteRecursiveEmissionsPurge.js';

/**
 * @section 3. Orquestadores de Auditoría Forense
 * Verificación física de artefactos de construcción.
 */
export {
  AuditExceptionsBuildArtifacts
} from './lib/build-auditor/AuditExceptionsBuildArtifacts.js';

/**
 * @section 4. Orquestadores de Datos Financieros
 * Ingesta interactiva de presupuestos institucionales.
 */
export {
  ExecuteFinancialIngestionOrchestrator
} from './lib/financial-tools/ExecuteFinancialIngestionOrchestrator.js';
