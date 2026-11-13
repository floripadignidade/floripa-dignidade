/**
 * @section Tools DNA - Build Audit Report Schema
 * @description Define el contrato de integridad para los reportes de verificación
 * física de archivos tras un proceso de compilación (TSC/SWC).
 */

import { z } from 'zod';

export const BuildArtifactSchema = z
  .object({
    fileNameLiteral: z.string(),
    fileAbsolutePathLiteral: z.string(),
    fileSizeInBytesQuantity: z.number(),
    artifactTypeLiteral: z.enum([
      'ADN_DECLARATION',
      'LOGIC_EXECUTABLE',
      'SOURCE_MAP',
      'TS_BUILD_INFO',
    ]),
  })
  .readonly();

export const BuildAuditReportSchema = z
  .object({
    auditTimestampISO: z.string().datetime(),
    targetBunkerIdentifier: z.string(),
    isBuildCompliantWithZenithStandardBoolean: z.boolean(),
    discoveredArtifactsCollection: z.array(BuildArtifactSchema),
    missingCriticalArtifactsCollection: z.array(z.string()),
  })
  .readonly();

export type IBuildAuditReport = z.infer<typeof BuildAuditReportSchema>;
export type IBuildArtifact = z.infer<typeof BuildArtifactSchema>;
