/**
 * @section Tools & Infrastructure - Workspace TypeScript Configuration Auditor Atom
 * @description Átomo encargado de auditar 'tsconfig.json' y 'tsconfig.lib.json' en cada
 * workspace. Valida la herencia matemática relativa de 'tsconfig.base.json', verifica
 * la prohibición estricta de 'baseUrl', previene la exclusión en ESLint Project Service
 * y neutraliza referencias circulares en archivos compuestos.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Clean Paths).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa) e ISO/IEC 25010 (Mantenibilidad y Robustez).
 * SANEADO Zenith: Complejidad reducida de 15 a <= 6 mediante delegación a sub-funciones puras,
 * erradicación de colisiones de tipos y preservación de límites físicos (< 150 líneas).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { existsSync, promises as filesystemPromises } from 'node:fs';
import { join, normalize, relative } from 'node:path';
import type { IIndividualWorkspaceViolation } from '../schemas/WorkspaceConformanceReport.schema';

interface IParsedTsconfig {
  readonly extends?: string;
  readonly compilerOptions?: {
    readonly baseUrl?: string;
  };
  readonly include?: string[];
  readonly references?: Array<{ readonly path: string }>;
}

const calculateExpectedBaseTsconfigPathLiteral = (
  workspaceDirectoryAbsolutePath: string,
  workspaceRootAbsolutePath: string,
): string => {
  const relativePathFromWorkspaceToRootLiteral = relative(
    workspaceDirectoryAbsolutePath,
    workspaceRootAbsolutePath,
  );
  const normalizedPathLiteral = normalize(
    join(relativePathFromWorkspaceToRootLiteral, 'tsconfig.base.json'),
  ).replace(/\\/g, '/');

  return normalizedPathLiteral.startsWith('.')
    ? normalizedPathLiteral
    : `./${normalizedPathLiteral}`;
};

const parseJsoncSafe = async (filePathAbsolutePath: string): Promise<IParsedTsconfig | null> => {
  try {
    const rawContentLiteral = await filesystemPromises.readFile(filePathAbsolutePath, 'utf-8');
    const sanitizedJsonLiteral = rawContentLiteral.replace(
      /\/\*[\s\S]*?\*\/|([^:]|^)\/\/.*$/gm,
      '$1',
    );
    return JSON.parse(sanitizedJsonLiteral) as IParsedTsconfig;
  } catch {
    return null;
  }
};

const hasConfiguredEntriesBoolean = (entriesCollection?: unknown[]): boolean => {
  return Array.isArray(entriesCollection) && entriesCollection.length > 0;
};

/**
 * Audita el manifiesto 'tsconfig.json' principal (Gatekeeper). Complejidad: 6.
 */
const auditMainTsconfig = async (
  workspaceDirectoryAbsolutePath: string,
  workspaceRootAbsolutePath: string,
): Promise<IIndividualWorkspaceViolation[]> => {
  const tsconfigPath = join(workspaceDirectoryAbsolutePath, 'tsconfig.json');
  if (!existsSync(tsconfigPath)) {
    return [];
  }

  const parsedTsconfigSnapshot = await parseJsoncSafe(tsconfigPath);
  if (!parsedTsconfigSnapshot) {
    return [];
  }

  const violationsCollection: IIndividualWorkspaceViolation[] = [];
  const afflictedRelativePathLiteral = relative(workspaceRootAbsolutePath, tsconfigPath).replace(
    /\\/g,
    '/',
  );
  const expectedExtendsPathLiteral = calculateExpectedBaseTsconfigPathLiteral(
    workspaceDirectoryAbsolutePath,
    workspaceRootAbsolutePath,
  );

  const currentExtendsLiteral = parsedTsconfigSnapshot.extends;
  if (currentExtendsLiteral !== expectedExtendsPathLiteral) {
    violationsCollection.push({
      conformanceDimensionLiteral: 'TYPESCRIPT_CONFIGURATION',
      violationSeverityLiteral: 'CRITICAL_VIOLATION',
      ruleIdentifierLiteral: 'TSCONFIG_EXTENDS_MISMATCH',
      problemDescriptionLiteral: `La propiedad "extends" es "${currentExtendsLiteral ?? 'null'}", pero debe ser "${expectedExtendsPathLiteral}".`,
      remediationActionHintLiteral: `Corregir la herencia relativa a: "extends": "${expectedExtendsPathLiteral}".`,
      afflictedFileRelativePathLiteral: afflictedRelativePathLiteral,
    });
  }

  if (parsedTsconfigSnapshot.compilerOptions?.baseUrl) {
    violationsCollection.push({
      conformanceDimensionLiteral: 'TYPESCRIPT_CONFIGURATION',
      violationSeverityLiteral: 'CRITICAL_VIOLATION',
      ruleIdentifierLiteral: 'TSCONFIG_BASE_URL_PROHIBITED',
      problemDescriptionLiteral: 'Se detectó la propiedad prohibida "baseUrl" en compilerOptions.',
      remediationActionHintLiteral:
        'Eliminar baseUrl conforme al Manifiesto ADR 0018 para evitar ambigüedades en Turbopack.',
      afflictedFileRelativePathLiteral: afflictedRelativePathLiteral,
    });
  }

  const hasIncludesBoolean = hasConfiguredEntriesBoolean(parsedTsconfigSnapshot.include);
  const hasReferencesBoolean = hasConfiguredEntriesBoolean(parsedTsconfigSnapshot.references);

  if (!hasIncludesBoolean && !hasReferencesBoolean) {
    violationsCollection.push({
      conformanceDimensionLiteral: 'TYPESCRIPT_CONFIGURATION',
      violationSeverityLiteral: 'CRITICAL_VIOLATION',
      ruleIdentifierLiteral: 'PROJECT_SERVICE_ISOLATION_DEFECT',
      problemDescriptionLiteral:
        'tsconfig.json posee "include": [] y "references": [] vacíos, provocando que ESLint Project Service ignore los archivos.',
      remediationActionHintLiteral:
        'Declarar "include": ["src/**/*.ts", "src/**/*.tsx"] o referenciar tsconfig.lib.json.',
      afflictedFileRelativePathLiteral: afflictedRelativePathLiteral,
    });
  }

  return violationsCollection;
};

/**
 * Audita el archivo 'tsconfig.lib.json' (Emitter) para detectar referencias circulares. Complejidad: 4.
 */
const auditTsconfigLibJson = async (
  workspaceDirectoryAbsolutePath: string,
  workspaceRootAbsolutePath: string,
): Promise<IIndividualWorkspaceViolation[]> => {
  const tsconfigLibPath = join(workspaceDirectoryAbsolutePath, 'tsconfig.lib.json');
  if (!existsSync(tsconfigLibPath)) {
    return [];
  }

  const parsedTsconfigLibSnapshot = await parseJsoncSafe(tsconfigLibPath);
  if (!parsedTsconfigLibSnapshot) {
    return [];
  }

  const hasSelfReferenceBoolean = parsedTsconfigLibSnapshot.references?.some(
    (ref) => ref.path === './tsconfig.lib.json' || ref.path === 'tsconfig.lib.json',
  );

  if (hasSelfReferenceBoolean) {
    const afflictedLibRelativePathLiteral = relative(
      workspaceRootAbsolutePath,
      tsconfigLibPath,
    ).replace(/\\/g, '/');

    return [
      {
        conformanceDimensionLiteral: 'TYPESCRIPT_CONFIGURATION',
        violationSeverityLiteral: 'CRITICAL_VIOLATION',
        ruleIdentifierLiteral: 'CIRCULAR_SELF_REFERENCE_DEFECT',
        problemDescriptionLiteral:
          'tsconfig.lib.json se referencia a sí mismo en el array "references".',
        remediationActionHintLiteral:
          'Purgar la referencia circular eliminando el bloque references o fijándolo en [].',
        afflictedFileRelativePathLiteral: afflictedLibRelativePathLiteral,
      },
    ];
  }

  return [];
};

/**
 * Orquestador de auditoría de TypeScript para un workspace. Complejidad: 1.
 */
export const AuditWorkspaceTypeScriptConfig = async (
  workspaceDirectoryAbsolutePath: string,
  workspaceRootAbsolutePath: string,
): Promise<IIndividualWorkspaceViolation[]> => {
  const [tsconfigViolationsCollection, tsconfigLibViolationsCollection] = await Promise.all([
    auditMainTsconfig(workspaceDirectoryAbsolutePath, workspaceRootAbsolutePath),
    auditTsconfigLibJson(workspaceDirectoryAbsolutePath, workspaceRootAbsolutePath),
  ]);

  return [...tsconfigViolationsCollection, ...tsconfigLibViolationsCollection];
};
