/**
 * @section Tools & Infrastructure - Workspace Conformance Master Orchestrator
 * @description Orquestador supremo encargado de coordinar la auditoría integral de conformidad
 * y alineamiento estructural de todos los workspaces del monorepo. Delega el descubrimiento y
 * el diagnóstico en átomos especializados, compila estadísticas globales, certifica el contrato
 * con Zod y persiste el informe forense inmutable en 'reports/conformance/'.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Clean Paths).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa) e ISO/IEC 25010 (Confiabilidad y Calidad).
 * SANEADO Zenith: Reducción ciclomática a 3, pulverización a sub-átomos, límites físicos
 * estrictos (< 130 líneas), eliminación de variables no utilizadas y rutas limpias.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { existsSync, promises as filesystemPromises } from 'node:fs';
import { join, resolve } from 'node:path';

/* 1. Infraestructura Core de Telemetría */
import {
  EmitTelemetrySignal,
  GenerateCorrelationIdentifier,
  type ModuleIdentifier,
  type OperationCode,
  TraceExecutionTime,
} from '@floripa-dignidade/telemetry';

/* 2. Contratos Centralizados de Auditoría */
import {
  type IIndividualWorkspaceAuditResult,
  type IWorkspaceConformanceReport,
  WorkspaceConformanceReportSchema,
} from './schemas/WorkspaceConformanceReport.schema';

/* 3. Enjambre Atómico Local (Swiss-Watch Swarm) */
import { DiscoverWorkspaceDirectories } from './atoms/DiscoverWorkspaceDirectories';
import { AuditIndividualWorkspace } from './atoms/AuditIndividualWorkspace';

/** Identificador técnico del aparato para el monitor de salud y telemetría forense. */
const ORCHESTRATOR_MODULE_IDENTIFIER = 'WORKSPACE_CONFORMANCE_ORCHESTRATOR' as ModuleIdentifier;

const extractRootNxVersionLiteral = async (workspaceRootAbsolutePath: string): Promise<string> => {
  const rootPackageJsonAbsolutePath = join(workspaceRootAbsolutePath, 'package.json');
  if (!existsSync(rootPackageJsonAbsolutePath)) {
    return '22.6.5';
  }

  try {
    const rawContentLiteral = await filesystemPromises.readFile(
      rootPackageJsonAbsolutePath,
      'utf-8',
    );
    const parsedPackageJson = JSON.parse(rawContentLiteral) as {
      readonly devDependencies?: Record<string, string>;
      readonly dependencies?: Record<string, string>;
    };

    const rawVersionLiteral =
      parsedPackageJson.devDependencies?.['nx'] ?? parsedPackageJson.dependencies?.['nx'];

    return rawVersionLiteral ? rawVersionLiteral.replace(/[\^~]/g, '') : '22.6.5';
  } catch {
    return '22.6.5';
  }
};

/**
 * Ejecuta la auditoría integral de conformidad arquitectónica de todo el monorepo.
 *
 * @param customRootPathLiteral - Ruta raíz del monorepo (opcional).
 * @param correlationIdentifierFallback - Identificador de correlación para trazabilidad forense.
 * @returns {Promise<IWorkspaceConformanceReport>} Reporte maestro sellado e inmutable.
 */
export const AuditWorkspaceConformance = async (
  customRootPathLiteral: string = process.cwd(),
  correlationIdentifierFallback: string = GenerateCorrelationIdentifier(),
): Promise<IWorkspaceConformanceReport> => {
  const correlationIdentifier = correlationIdentifierFallback;
  const workspaceRootAbsolutePath = resolve(customRootPathLiteral);

  return await TraceExecutionTime(
    ORCHESTRATOR_MODULE_IDENTIFIER,
    'EXECUTE_WORKSPACE_CONFORMANCE_SCAN' as OperationCode,
    correlationIdentifier,
    async (): Promise<IWorkspaceConformanceReport> => {
      const rootNxVersionLiteral = await extractRootNxVersionLiteral(workspaceRootAbsolutePath);
      const discoveredDirectoriesCollection =
        await DiscoverWorkspaceDirectories(workspaceRootAbsolutePath);

      const workspacesAuditCollection: IIndividualWorkspaceAuditResult[] = await Promise.all(
        discoveredDirectoriesCollection.map((directoryAbsolutePath) =>
          AuditIndividualWorkspace(
            directoryAbsolutePath,
            workspaceRootAbsolutePath,
            rootNxVersionLiteral,
          ),
        ),
      );

      const totalWorkspacesAuditedQuantity = workspacesAuditCollection.length;
      const compliantWorkspacesCountQuantity = workspacesAuditCollection.filter(
        (auditResultSnapshot) => auditResultSnapshot.isWorkspaceFullyCompliantBoolean,
      ).length;
      const nonCompliantWorkspacesCountQuantity =
        totalWorkspacesAuditedQuantity - compliantWorkspacesCountQuantity;
      const isMonorepoFullyAlignedBoolean = nonCompliantWorkspacesCountQuantity === 0;

      const finalAuditReportSnapshot = WorkspaceConformanceReportSchema.parse({
        reportIdentifier: GenerateCorrelationIdentifier(),
        generationTimestampISO: new Date().toISOString(),
        correlationIdentifier,
        totalWorkspacesAuditedQuantity,
        compliantWorkspacesCountQuantity,
        nonCompliantWorkspacesCountQuantity,
        isMonorepoFullyAlignedBoolean,
        workspacesAuditCollection,
      });

      const reportOutputDirectoryAbsolutePath = join(
        workspaceRootAbsolutePath,
        'reports',
        'conformance',
      );
      await filesystemPromises.mkdir(reportOutputDirectoryAbsolutePath, { recursive: true });

      const reportFileAbsolutePath = join(
        reportOutputDirectoryAbsolutePath,
        'workspace-conformance-audit-report.json',
      );
      await filesystemPromises.writeFile(
        reportFileAbsolutePath,
        JSON.stringify(finalAuditReportSnapshot, null, 2),
        'utf-8',
      );

      void EmitTelemetrySignal({
        occurrenceTimestampISO: new Date().toISOString(),
        severityLevelLiteral: isMonorepoFullyAlignedBoolean ? 'INFO' : 'WARNING',
        moduleIdentifierLiteral: ORCHESTRATOR_MODULE_IDENTIFIER,
        operationCodeLiteral: 'WORKSPACE_CONFORMANCE_SCAN_COMPLETED' as OperationCode,
        correlationIdentifier,
        messageContentLiteral: `Auditoría finalizada: [${compliantWorkspacesCountQuantity}/${totalWorkspacesAuditedQuantity}] workspaces alineados.`,
        semanticIntentTag: 'WORKSPACE_CONFORMANCE_AUDIT',
        contextMetadataSnapshot: {
          totalWorkspacesAuditedQuantity,
          compliantWorkspacesCountQuantity,
          nonCompliantWorkspacesCountQuantity,
        },
      });

      return finalAuditReportSnapshot;
    },
  );
};
