/**
 * @file libs/tools/src/index.ts
 * @section Tools & Automation - Package Entry Point
 * @description Único punto de exportación autorizado para las herramientas de
 * mantenimiento, auditoría de conformidad, secretos cloud, diagnóstico, auditoría,
 * volcado seguro y provisionamiento idempotente de Supabase del ecosistema Floripa Dignidade.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Clean Paths).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa) e ISO/IEC 25010 (Mantenibilidad y Modularidad).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

/** Versión técnica sincronizada del módulo de herramientas. */
export const TOOLS_BUNKER_VERSION = '1.3.6';

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
 * @section 5. Diagnóstico, Auditoría Profunda y Provisionamiento de Supabase
 * Sondas autenticadas SQL, auditoría granular de recursos, HTTP, volcado seguro (LGPD)
 * y motor transaccional idempotente de carga inicial/incremental SQL.
 */
export { AuditSupabaseConnection } from './lib/supabase-auditor/AuditSupabaseConnection';
export { AuditSupabaseDumpSnapshot } from './lib/supabase-auditor/AuditSupabaseDumpSnapshot';
export { AuditSupabaseResources } from './lib/supabase-auditor/AuditSupabaseResources';
export { ProvisionInitialSupabaseDatabase } from './lib/supabase-auditor/ProvisionInitialSupabaseDatabase';
export { SUPABASE_EXPECTED_RESOURCES_CATALOG } from './lib/supabase-auditor/constants/SupabaseExpectedResourcesCatalog';
export type {
  ISqlConnectionDiagnostic,
  ISupabaseConnectionReport,
  ISupabaseHttpLayerDiagnostic,
  TSupabaseConnectionCheckStatus,
} from './lib/supabase-auditor/schemas/SupabaseConnectionReport.schema';
export type {
  IExpectedVsActualGapSummary,
  ISupabaseResourcesAuditReport,
  ITableGranularAuditSnapshot,
} from './lib/supabase-auditor/schemas/SupabaseResourcesAuditReport.schema';
export type {
  IFunctionDefinitionDump,
  ISanitizedTableDataDump,
  ISupabaseDumpSnapshotReport,
  ITablePolicyDumpEntry,
  ITriggerDefinitionDump,
} from './lib/supabase-auditor/schemas/SupabaseDumpSnapshotReport.schema';
export type {
  IProvisionedMigrationEntry,
  IProvisioningOptions,
  ISupabaseProvisioningReport,
  TProvisionedMigrationStatus,
  TProvisioningExecutionMode,
} from './lib/supabase-auditor/schemas/SupabaseProvisioningReport.schema';

/**
 * @section 6. Orquestadores de Datos Financieros
 * Ingesta interactiva y validación de matrices presupuestarias institucionales (XLSX).
 */
export { ExecuteFinancialIngestionOrchestrator } from './lib/financial-tools/ExecuteFinancialIngestionOrchestrator';
