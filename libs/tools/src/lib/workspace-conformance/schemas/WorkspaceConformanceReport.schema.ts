/**
 * @section Tools & Infrastructure - Workspace Conformance Report Contract
 * @description Contrato Zod inmutable que define el informe forense de alineamiento
 * estructural, sintáctico y arquitectónico de todos los workspaces del monorepo.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa) e ISO/IEC 25010 (Mantenibilidad y Calidad).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { z } from 'zod';

export const ConformanceViolationSeveritySchema = z.enum([
  'CRITICAL_VIOLATION',
  'WARNING_DEFECT',
  'OPTIMIZATION_HINT',
]);

export type TConformanceViolationSeverity = z.infer<typeof ConformanceViolationSeveritySchema>;

export const ConformanceDimensionSchema = z.enum([
  'TYPESCRIPT_CONFIGURATION',
  'PACKAGE_MANIFEST',
  'NX_PROJECT_METADATA',
  'ROOT_PATHS_SYMMETRY',
  'QA_MIRROR_INTEGRITY',
]);

export type TConformanceDimension = z.infer<typeof ConformanceDimensionSchema>;

export const IndividualWorkspaceViolationSchema = z
  .object({
    conformanceDimensionLiteral: ConformanceDimensionSchema,
    violationSeverityLiteral: ConformanceViolationSeveritySchema,
    ruleIdentifierLiteral: z.string().min(1),
    problemDescriptionLiteral: z.string().min(1),
    remediationActionHintLiteral: z.string().min(1),
    afflictedFileRelativePathLiteral: z.string().min(1),
  })
  .readonly();

export type IIndividualWorkspaceViolation = z.infer<typeof IndividualWorkspaceViolationSchema>;

export const IndividualWorkspaceAuditResultSchema = z
  .object({
    workspaceNameLiteral: z.string().min(1),
    workspaceRelativePathLiteral: z.string().min(1),
    isWorkspaceFullyCompliantBoolean: z.boolean(),
    violationsCollection: z.array(IndividualWorkspaceViolationSchema).readonly(),
  })
  .readonly();

export type IIndividualWorkspaceAuditResult = z.infer<typeof IndividualWorkspaceAuditResultSchema>;

export const WorkspaceConformanceReportSchema = z
  .object({
    reportIdentifier: z.string().uuid(),
    generationTimestampISO: z.string().datetime(),
    correlationIdentifier: z.string().uuid(),
    totalWorkspacesAuditedQuantity: z.number().int().nonnegative(),
    compliantWorkspacesCountQuantity: z.number().int().nonnegative(),
    nonCompliantWorkspacesCountQuantity: z.number().int().nonnegative(),
    isMonorepoFullyAlignedBoolean: z.boolean(),
    workspacesAuditCollection: z.array(IndividualWorkspaceAuditResultSchema).readonly(),
  })
  .readonly();

export type IWorkspaceConformanceReport = z.infer<typeof WorkspaceConformanceReportSchema>;
