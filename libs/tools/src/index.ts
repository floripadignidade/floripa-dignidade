/**
 * @section Tools & Automation - Package Entry Point (Enterprise Barrel)
 * @description Único punto de exportación autorizado para las herramientas de
 * mantenimiento, auditoría y automatización del ecosistema.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Clean Paths).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa) e ISO/IEC 25010 (Mantenibilidad).
 * SANEADO Zenith: Exposición canónica del orquestador de conformidad de workspaces
 * y erradicación definitiva de extensiones '.js' virtuales.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

/** Versión del búnker de herramientas sincronizada. */
export const TOOLS_BUNKER_VERSION = '1.3.1';

/**
 * @section 1. Orquestadores Lingüísticos
 * Compilación y tejido de diccionarios multilingües.
 */
export {
  BuildInternationalizationDictionaries,
  InternationalizationDictionaryBuilder,
} from './lib/i18n-builder/InternationalizationDictionaryBuilder';

/**
 * @section 2. Orquestadores de Mantenimiento y SRE
 * Higiene de hardware y purga de emisiones de compilación.
 */
export { ExecutePurgeOrchestrator } from './lib/maintenance-tools/ExecutePurgeOrchestrator';
export { ExecuteRecursiveEmissionsPurge } from './lib/maintenance-tools/ExecuteRecursiveEmissionsPurge';

/**
 * @section 3. Orquestadores de Auditoría Forense
 * Verificación física de artefactos y conformidad arquitectónica del monorepo.
 */
export { AuditExceptionsBuildArtifacts } from './lib/build-auditor/AuditExceptionsBuildArtifacts';
export { AuditWorkspaceConformance } from './lib/workspace-conformance/AuditWorkspaceConformance';
export type { IWorkspaceConformanceReport } from './lib/workspace-conformance/schemas/WorkspaceConformanceReport.schema';

/**
 * @section 4. Orquestadores de Datos Financieros
 * Ingesta interactiva de presupuestos institucionales.
 */
export { ExecuteFinancialIngestionOrchestrator } from './lib/financial-tools/ExecuteFinancialIngestionOrchestrator';

/**
 * @section 5. Auditoría de Infraestructura y Secretos Cloud
 */
export { AuditCloudInfrastructureSecrets } from './lib/infrastructure-auditor/AuditCloudInfrastructureSecrets';
export type { ICloudInfrastructureAuditReport } from './lib/infrastructure-auditor/schemas/CloudInfrastructureAuditReport.schema';
