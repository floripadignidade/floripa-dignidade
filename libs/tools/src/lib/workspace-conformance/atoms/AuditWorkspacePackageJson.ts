/**
 * @section Tools & Infrastructure - Workspace Package Manifest Auditor Atom
 * @description Átomo encargado de auditar la integridad del archivo 'package.json'
 * de un workspace. Certifica la presencia de "type": "module" y detecta divergencias
 * en las versiones de dependencias '@nx/*' con respecto a la raíz del monorepo.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Clean Paths).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa) e ISO/IEC 25010 (Mantenibilidad).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { existsSync, promises as filesystemPromises } from 'node:fs';
import { join, relative } from 'node:path';
import type { IIndividualWorkspaceViolation } from '../schemas/WorkspaceConformanceReport.schema';

interface IParsedPackageJson {
  readonly name?: string;
  readonly type?: string;
  readonly dependencies?: Record<string, string>;
  readonly devDependencies?: Record<string, string>;
}

export interface IPackageAuditResult {
  readonly violationsCollection: IIndividualWorkspaceViolation[];
  readonly workspaceNameLiteral: string;
}

/**
 * Audita el archivo 'package.json' de un workspace individual.
 *
 * @param workspaceDirectoryAbsolutePath - Ruta absoluta del workspace bajo inspección.
 * @param workspaceRootAbsolutePath - Ruta absoluta a la raíz del monorepo.
 * @param rootNxVersionLiteral - Versión canónica de Nx instalada en la raíz.
 * @returns {Promise<IPackageAuditResult>} Diagnóstico con infracciones y nombre del paquete.
 */
export const AuditWorkspacePackageJson = async (
  workspaceDirectoryAbsolutePath: string,
  workspaceRootAbsolutePath: string,
  rootNxVersionLiteral: string,
): Promise<IPackageAuditResult> => {
  const violationsCollection: IIndividualWorkspaceViolation[] = [];
  const packageJsonAbsolutePath = join(workspaceDirectoryAbsolutePath, 'package.json');
  const afflictedFileRelativePathLiteral = relative(
    workspaceRootAbsolutePath,
    packageJsonAbsolutePath,
  ).replace(/\\/g, '/');

  const defaultWorkspaceNameLiteral = relative(
    workspaceRootAbsolutePath,
    workspaceDirectoryAbsolutePath,
  ).replace(/\\/g, '/');

  if (!existsSync(packageJsonAbsolutePath)) {
    return {
      violationsCollection,
      workspaceNameLiteral: defaultWorkspaceNameLiteral,
    };
  }

  try {
    const rawFileContentLiteral = await filesystemPromises.readFile(
      packageJsonAbsolutePath,
      'utf-8',
    );
    const parsedPackageSnapshot = JSON.parse(rawFileContentLiteral) as IParsedPackageJson;
    const workspaceNameLiteral = parsedPackageSnapshot.name ?? defaultWorkspaceNameLiteral;

    if (parsedPackageSnapshot.type !== 'module') {
      violationsCollection.push({
        conformanceDimensionLiteral: 'PACKAGE_MANIFEST',
        violationSeverityLiteral: 'WARNING_DEFECT',
        ruleIdentifierLiteral: 'PACKAGE_TYPE_MODULE_REQUIRED',
        problemDescriptionLiteral: 'El archivo package.json no define "type": "module".',
        remediationActionHintLiteral:
          'Agregar "type": "module" para garantizar interoperabilidad ESM pura.',
        afflictedFileRelativePathLiteral,
      });
    }

    const unifiedDependenciesRecord = {
      ...parsedPackageSnapshot.dependencies,
      ...parsedPackageSnapshot.devDependencies,
    };

    for (const [dependencyNameLiteral, rawVersionLiteral] of Object.entries(
      unifiedDependenciesRecord,
    )) {
      const isNxDependencyBoolean =
        dependencyNameLiteral.startsWith('@nx/') && !!rootNxVersionLiteral;

      if (isNxDependencyBoolean) {
        const sanitizedVersionLiteral = rawVersionLiteral.replace(/[\^~]/g, '');
        const isVersionDivergentBoolean =
          sanitizedVersionLiteral !== rootNxVersionLiteral &&
          !rawVersionLiteral.includes('workspace');

        if (isVersionDivergentBoolean) {
          violationsCollection.push({
            conformanceDimensionLiteral: 'PACKAGE_MANIFEST',
            violationSeverityLiteral: 'CRITICAL_VIOLATION',
            ruleIdentifierLiteral: 'NX_DEPENDENCY_DRIFT_DETECTED',
            problemDescriptionLiteral: `Desalineación de versión en ${dependencyNameLiteral}: usa "${rawVersionLiteral}", pero la raíz fija "${rootNxVersionLiteral}".`,
            remediationActionHintLiteral: `Fijar la versión exacta "${rootNxVersionLiteral}" sin prefijo "^" para evitar colapsos del monorepo.`,
            afflictedFileRelativePathLiteral,
          });
        }
      }
    }

    return { violationsCollection, workspaceNameLiteral };
  } catch {
    violationsCollection.push({
      conformanceDimensionLiteral: 'PACKAGE_MANIFEST',
      violationSeverityLiteral: 'CRITICAL_VIOLATION',
      ruleIdentifierLiteral: 'PACKAGE_JSON_SYNTAX_ERROR',
      problemDescriptionLiteral: 'El archivo package.json contiene errores de sintaxis JSON.',
      remediationActionHintLiteral: 'Validar y corregir la estructura sintáctica del archivo.',
      afflictedFileRelativePathLiteral,
    });

    return {
      violationsCollection,
      workspaceNameLiteral: defaultWorkspaceNameLiteral,
    };
  }
};
