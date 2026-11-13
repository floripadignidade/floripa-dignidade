/**
 * @section Tools & Automation - Package Entry Point (Enterprise Barrel)
 * @description Único punto de exportación autorizado para las herramientas de
 * mantenimiento, auditoría, conformidad y automatización del ecosistema Floripa Dignidade.
 * Centraliza la exposición de orquestadores de compilación de i18n, higiene SRE de hardware,
 * auditoría forense de infraestructura cloud y herramientas de ingesta de presupuestos.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Clean Paths).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa) e ISO/IEC 25010 (Mantenibilidad y Modularidad).
 *
 * SANEADO Zenith:
 * 1. Re-incorporación canónica de 'AuditCloudInfrastructureSecrets' y sus esquemas de reporte.
 * 2. Rutas relativas limpias (Extensionless) para resolución determinista en Next.js y Nx.
 * 3. Exportación isomórfica libre de dependencias colapsantes para CI/CD.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

/** Versión técnica sincronizada del búnker de herramientas. */
export const TOOLS_BUNKER_VERSION = '1.3.2';

/**
 * @section 1. Orquestadores Lingüísticos (Weaver Engine)
 * Compilación, extracción y tejido de diccionarios multilingües del monorepo.
 */
export {
  BuildInternationalizationDictionaries,
  InternationalizationDictionaryBuilder,
} from './lib/i18n-builder/InternationalizationDictionaryBuilder';

/**
 * @section 2. Orquestadores de Mantenimiento e Higiene SRE
 * Detección y purga física de emisiones y artefactos huérfanos de compilación.
 */
export { ExecutePurgeOrchestrator } from './lib/maintenance-tools/ExecutePurgeOrchestrator';
export { ExecuteRecursiveEmissionsPurge } from './lib/maintenance-tools/ExecuteRecursiveEmissionsPurge';

/**
 * @section 3. Orquestadores de Auditoría Forense y Conformidad
 * Verificación física de artefactos de compilación y alineamiento estructural de workspaces.
 */
export { AuditExceptionsBuildArtifacts } from './lib/build-auditor/AuditExceptionsBuildArtifacts';
export { AuditWorkspaceConformance } from './lib/workspace-conformance/AuditWorkspaceConformance';
export type { IWorkspaceConformanceReport } from './lib/workspace-conformance/schemas/WorkspaceConformanceReport.schema';

/**
 * @section 4. Auditoría Activa de Infraestructura Cloud y Secretos
 * Sondas de red en vivo (Postgres, Supabase REST/S3, Resend, Gemini, Meta WhatsApp).
 */
export { AuditCloudInfrastructureSecrets } from './lib/infrastructure-auditor/AuditCloudInfrastructureSecrets';
export type {
  ICloudInfrastructureAuditReport,
  IIndividualProviderAuditSnapshot,
  TProbeExecutionStatus,
} from './lib/infrastructure-auditor/schemas/CloudInfrastructureAuditReport.schema';

/**
 * @section 5. Orquestadores de Datos Financieros
 * Ingesta interactiva y validación de matrices presupuestarias institucionales (XLSX).
 */
export { ExecuteFinancialIngestionOrchestrator } from './lib/financial-tools/ExecuteFinancialIngestionOrchestrator';
