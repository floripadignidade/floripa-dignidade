/**
 * @section Scripts & Automation - Workspace Conformance Auditor CLI Runner
 * @description Disparador ejecutable de línea de comandos (CLI) encargado de orquestar
 * la auditoría de alineamiento estructural y arquitectónico de todos los workspaces.
 * Cumple con los límites modulares de Nx, emite salida formateada con colores ANSI vía
 * 'console.warn' y gestiona los códigos de salida para el pipeline de CI/CD.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Clean Paths).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa), ISO/IEC 25010 (Calidad) e ISO/IEC 27001.
 * SANEADO Zenith: Erradicación de importaciones relativas entre proyectos, erradicación
 * de 'console.log' a favor de 'console.warn' y modularización de renderizado (complejidad <= 5).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import process from 'node:process';

/* 1. Infraestructura Core de Telemetría */
import {
  EmitTelemetrySignal,
  GenerateCorrelationIdentifier,
  type ModuleIdentifier,
  type OperationCode,
} from '@floripa-dignidade/telemetry';

/* 2. Biblioteca de Herramientas Canónica (Importación con Scope Oficial) */
import {
  AuditWorkspaceConformance,
  type IWorkspaceConformanceReport,
} from '@floripa-dignidade/tools';

/** Identificador técnico del aparato para el monitor de salud y telemetría forense. */
const SCRIPT_MODULE_IDENTIFIER = 'WORKSPACE_CONFORMANCE_CLI_RUNNER' as ModuleIdentifier;

/**
 * @section Constantes de Estilo ANSI para Consola
 */
const ANSI_COLOR_RESET_LITERAL = '\x1b[0m';
const ANSI_COLOR_BOLD_LITERAL = '\x1b[1m';
const ANSI_COLOR_GREEN_LITERAL = '\x1b[32m';
const ANSI_COLOR_YELLOW_LITERAL = '\x1b[33m';
const ANSI_COLOR_RED_LITERAL = '\x1b[31m';
const ANSI_COLOR_CYAN_LITERAL = '\x1b[36m';
const ANSI_COLOR_GRAY_LITERAL = '\x1b[90m';

/**
 * Renderiza el estado y las infracciones de un workspace individual.
 *
 * @param workspaceSnapshot - Diagnóstico unitario del workspace evaluado.
 */
const renderWorkspaceAuditRowAction = (
  workspaceSnapshot: IWorkspaceConformanceReport['workspacesAuditCollection'][number],
): void => {
  if (workspaceSnapshot.isWorkspaceFullyCompliantBoolean) {
    console.warn(
      `${ANSI_COLOR_GREEN_LITERAL}✔${ANSI_COLOR_RESET_LITERAL} ${workspaceSnapshot.workspaceNameLiteral.padEnd(
        50,
        ' ',
      )} ${ANSI_COLOR_GRAY_LITERAL}[${workspaceSnapshot.workspaceRelativePathLiteral}]${ANSI_COLOR_RESET_LITERAL}`,
    );
    return;
  }

  console.warn(
    `${ANSI_COLOR_RED_LITERAL}✖${ANSI_COLOR_RESET_LITERAL} ${ANSI_COLOR_BOLD_LITERAL}${workspaceSnapshot.workspaceNameLiteral.padEnd(
      50,
      ' ',
    )}${ANSI_COLOR_RESET_LITERAL} ${ANSI_COLOR_GRAY_LITERAL}[${workspaceSnapshot.workspaceRelativePathLiteral}]${ANSI_COLOR_RESET_LITERAL}`,
  );

  for (const individualViolation of workspaceSnapshot.violationsCollection) {
    const isCriticalViolationBoolean =
      individualViolation.violationSeverityLiteral === 'CRITICAL_VIOLATION';
    const severityColorLiteral = isCriticalViolationBoolean
      ? ANSI_COLOR_RED_LITERAL
      : ANSI_COLOR_YELLOW_LITERAL;

    console.warn(
      `    ${severityColorLiteral}↳ [${individualViolation.ruleIdentifierLiteral}]${ANSI_COLOR_RESET_LITERAL} ${individualViolation.problemDescriptionLiteral}`,
    );
    console.warn(
      `      ${ANSI_COLOR_GRAY_LITERAL}Sugerencia:${ANSI_COLOR_RESET_LITERAL} ${individualViolation.remediationActionHintLiteral}`,
    );
    console.warn(
      `      ${ANSI_COLOR_GRAY_LITERAL}Archivo:${ANSI_COLOR_RESET_LITERAL} ${individualViolation.afflictedFileRelativePathLiteral}\n`,
    );
  }
};

/**
 * Función principal de arranque del runner de conformidad de workspaces.
 */
const ExecuteCommandLineRunner = async (): Promise<void> => {
  const correlationIdentifier = GenerateCorrelationIdentifier();

  console.warn(
    `\n${ANSI_COLOR_BOLD_LITERAL}${ANSI_COLOR_CYAN_LITERAL}--- [FLORIPA DIGNIDADE]: AUDITOR DE CONFORMIDAD Y ALINEAMIENTO DE WORKSPACES ---${ANSI_COLOR_RESET_LITERAL}\n`,
  );

  void EmitTelemetrySignal({
    occurrenceTimestampISO: new Date().toISOString(),
    severityLevelLiteral: 'INFO',
    moduleIdentifierLiteral: SCRIPT_MODULE_IDENTIFIER,
    operationCodeLiteral: 'WORKSPACE_AUDIT_CLI_TRIGGERED' as OperationCode,
    correlationIdentifier,
    messageContentLiteral: 'Iniciando runner CLI de conformidad de workspaces del monorepo.',
    semanticIntentTag: 'CLI_WORKSPACE_AUDIT_START',
  });

  try {
    const conformanceReportSnapshot: IWorkspaceConformanceReport = await AuditWorkspaceConformance(
      process.cwd(),
      correlationIdentifier,
    );

    for (const individualWorkspace of conformanceReportSnapshot.workspacesAuditCollection) {
      renderWorkspaceAuditRowAction(individualWorkspace);
    }

    const hasNonCompliantWorkspacesBoolean =
      conformanceReportSnapshot.nonCompliantWorkspacesCountQuantity > 0;
    const nonCompliantColorLiteral = hasNonCompliantWorkspacesBoolean
      ? ANSI_COLOR_RED_LITERAL
      : ANSI_COLOR_GREEN_LITERAL;

    console.warn(
      `\n${ANSI_COLOR_BOLD_LITERAL}Total Workspaces Auditados:${ANSI_COLOR_RESET_LITERAL}   ${conformanceReportSnapshot.totalWorkspacesAuditedQuantity}`,
    );
    console.warn(
      `${ANSI_COLOR_BOLD_LITERAL}Workspaces Conformantes:${ANSI_COLOR_RESET_LITERAL}       ${ANSI_COLOR_GREEN_LITERAL}${conformanceReportSnapshot.compliantWorkspacesCountQuantity}${ANSI_COLOR_RESET_LITERAL}`,
    );
    console.warn(
      `${ANSI_COLOR_BOLD_LITERAL}Workspaces Desalineados:${ANSI_COLOR_RESET_LITERAL}       ${nonCompliantColorLiteral}${conformanceReportSnapshot.nonCompliantWorkspacesCountQuantity}${ANSI_COLOR_RESET_LITERAL}`,
    );
    console.warn(
      `${ANSI_COLOR_BOLD_LITERAL}Reporte Forense JSON:${ANSI_COLOR_RESET_LITERAL}          ${ANSI_COLOR_CYAN_LITERAL}reports/conformance/workspace-conformance-audit-report.json${ANSI_COLOR_RESET_LITERAL}\n`,
    );

    if (conformanceReportSnapshot.isMonorepoFullyAlignedBoolean) {
      console.warn(
        `${ANSI_COLOR_BOLD_LITERAL}${ANSI_COLOR_GREEN_LITERAL}✔ CONFORMIDAD 100% NOMINAL: Todos los workspaces cumplen estrictamente los estándares de ingeniería.${ANSI_COLOR_RESET_LITERAL}\n`,
      );
      process.exit(0);
    } else {
      console.warn(
        `${ANSI_COLOR_BOLD_LITERAL}${ANSI_COLOR_RED_LITERAL}✖ ALERTA DE CONFORMIDAD: Se identificaron anomalías estructurales en los archivos de configuración.${ANSI_COLOR_RESET_LITERAL}\n`,
      );
      process.exit(1);
    }
  } catch (caughtExecutionError: unknown) {
    const errorDescriptionLiteral =
      caughtExecutionError instanceof Error
        ? caughtExecutionError.message
        : String(caughtExecutionError);

    console.error(
      `\n${ANSI_COLOR_BOLD_LITERAL}${ANSI_COLOR_RED_LITERAL}COLAPSO EN EJECUCIÓN DE AUDITORÍA:${ANSI_COLOR_RESET_LITERAL} ${errorDescriptionLiteral}\n`,
    );

    process.exit(1);
  }
};

void ExecuteCommandLineRunner();
