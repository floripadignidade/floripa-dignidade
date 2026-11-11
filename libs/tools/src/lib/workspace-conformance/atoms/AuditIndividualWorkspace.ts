/**
 * @section Tools & Infrastructure - Individual Workspace Auditor Coordinator (Atom)
 * @description Coordina la ejecución de las auditorías atómicas (package.json,
 * project.json y tsconfig) sobre un workspace específico y ensambla el resultado inmutable.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Clean Paths).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa) e ISO/IEC 25010 (Mantenibilidad).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { relative } from 'node:path';
import type {
  IIndividualWorkspaceAuditResult,
  IIndividualWorkspaceViolation,
} from '../schemas/WorkspaceConformanceReport.schema';

import { AuditWorkspacePackageJson } from './AuditWorkspacePackageJson';
import { AuditWorkspaceProjectJson } from './AuditWorkspaceProjectJson';
import { AuditWorkspaceTypeScriptConfig } from './AuditWorkspaceTypeScriptConfig';

/**
 * Ejecuta la auditoría integral de un workspace individual delegando en sus sub-átomos.
 *
 * @param workspaceDirectoryAbsolutePath - Ruta física al directorio del workspace.
 * @param workspaceRootAbsolutePath - Ruta absoluta a la raíz del monorepo.
 * @param rootNxVersionLiteral - Versión institucional de Nx para análisis de desalineación.
 * @returns {Promise<IIndividualWorkspaceAuditResult>} Diagnóstico consolidado del workspace.
 */
export const AuditIndividualWorkspace = async (
  workspaceDirectoryAbsolutePath: string,
  workspaceRootAbsolutePath: string,
  rootNxVersionLiteral: string,
): Promise<IIndividualWorkspaceAuditResult> => {
  const workspaceRelativePathLiteral = relative(
    workspaceRootAbsolutePath,
    workspaceDirectoryAbsolutePath,
  ).replace(/\\/g, '/');

  const [packageAuditResult, projectViolationsCollection, tsconfigViolationsCollection] =
    await Promise.all([
      AuditWorkspacePackageJson(
        workspaceDirectoryAbsolutePath,
        workspaceRootAbsolutePath,
        rootNxVersionLiteral,
      ),
      AuditWorkspaceProjectJson(workspaceDirectoryAbsolutePath, workspaceRootAbsolutePath),
      AuditWorkspaceTypeScriptConfig(workspaceDirectoryAbsolutePath, workspaceRootAbsolutePath),
    ]);

  const combinedViolationsCollection: readonly IIndividualWorkspaceViolation[] = Object.freeze([
    ...packageAuditResult.violationsCollection,
    ...projectViolationsCollection,
    ...tsconfigViolationsCollection,
  ]);

  return Object.freeze({
    workspaceNameLiteral: packageAuditResult.workspaceNameLiteral,
    workspaceRelativePathLiteral,
    isWorkspaceFullyCompliantBoolean: combinedViolationsCollection.length === 0,
    violationsCollection: combinedViolationsCollection,
  });
};
