/**
 * @section Tools & Infrastructure - Workspace Project Manifest Auditor Atom
 * @description Átomo encargado de verificar la existencia y la integridad de los tags
 * arquitectónicos de Nx (tríada: scope:*, type:*, platform:*) en el manifiesto 'project.json'.
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

interface IParsedProjectJson {
  readonly tags?: string[];
}

/**
 * Audita el archivo 'project.json' de un workspace individual.
 *
 * @param workspaceDirectoryAbsolutePath - Ruta absoluta del workspace.
 * @param workspaceRootAbsolutePath - Ruta absoluta a la raíz del monorepo.
 * @returns {Promise<IIndividualWorkspaceViolation[]>} Colección de infracciones detectadas.
 */
export const AuditWorkspaceProjectJson = async (
  workspaceDirectoryAbsolutePath: string,
  workspaceRootAbsolutePath: string,
): Promise<IIndividualWorkspaceViolation[]> => {
  const violationsCollection: IIndividualWorkspaceViolation[] = [];
  const projectJsonAbsolutePath = join(workspaceDirectoryAbsolutePath, 'project.json');

  if (!existsSync(projectJsonAbsolutePath)) {
    return violationsCollection;
  }

  const afflictedFileRelativePathLiteral = relative(
    workspaceRootAbsolutePath,
    projectJsonAbsolutePath,
  ).replace(/\\/g, '/');

  try {
    const rawFileContentLiteral = await filesystemPromises.readFile(
      projectJsonAbsolutePath,
      'utf-8',
    );
    const parsedProjectSnapshot = JSON.parse(rawFileContentLiteral) as IParsedProjectJson;
    const projectTagsCollection = parsedProjectSnapshot.tags ?? [];

    const hasScopeTagBoolean = projectTagsCollection.some((tagLiteral) =>
      tagLiteral.startsWith('scope:'),
    );
    const hasTypeTagBoolean = projectTagsCollection.some((tagLiteral) =>
      tagLiteral.startsWith('type:'),
    );
    const hasPlatformTagBoolean = projectTagsCollection.some((tagLiteral) =>
      tagLiteral.startsWith('platform:'),
    );

    const isTrinityCompleteBoolean =
      hasScopeTagBoolean && hasTypeTagBoolean && hasPlatformTagBoolean;

    if (!isTrinityCompleteBoolean) {
      violationsCollection.push({
        conformanceDimensionLiteral: 'NX_PROJECT_METADATA',
        violationSeverityLiteral: 'WARNING_DEFECT',
        ruleIdentifierLiteral: 'NX_TAGS_TRINITY_INCOMPLETE',
        problemDescriptionLiteral:
          'El archivo project.json no posee la tríada de tags (scope:*, type:*, platform:*).',
        remediationActionHintLiteral:
          'Declarar los tres tags arquitectónicos obligatorios según el Manifiesto ADR 0003.',
        afflictedFileRelativePathLiteral,
      });
    }

    return violationsCollection;
  } catch {
    violationsCollection.push({
      conformanceDimensionLiteral: 'NX_PROJECT_METADATA',
      violationSeverityLiteral: 'CRITICAL_VIOLATION',
      ruleIdentifierLiteral: 'PROJECT_JSON_SYNTAX_ERROR',
      problemDescriptionLiteral: 'El archivo project.json contiene errores de sintaxis JSON.',
      remediationActionHintLiteral: 'Validar y corregir la estructura sintáctica del archivo.',
      afflictedFileRelativePathLiteral,
    });

    return violationsCollection;
  }
};
