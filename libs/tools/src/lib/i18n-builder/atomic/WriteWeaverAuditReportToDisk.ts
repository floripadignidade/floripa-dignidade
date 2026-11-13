/**
 * @section Tools & Infrastructure - Forensic Audit Report Writer (Atom)
 * @description Átomo encargado exclusivamente de construir, certificar contra
 * `WeaverAuditReportSchema` y persistir físicamente en disco el informe de auditoría
 * lingüística (`reports/internationalization-audit-report.json`), garantizando la
 * existencia previa del directorio destino y salto de línea final compatible con Prettier.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Clean Paths).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa), ISO/IEC 25010 (Confiabilidad) e ISO/IEC 27001.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { promises as filesystemPromises } from 'node:fs';
import { join } from 'node:path';

import {
  type IForensicAuditEntry,
  type ILinguisticParityViolation,
  type IWeaverAuditReport,
  WEAVER_CONFIGURATION,
  WeaverAuditReportSchema,
} from '../constants/WeaverConfiguration';

/**
 * @interface IWriteWeaverAuditReportParameters
 * @description Contrato inmutable de entrada para ensamblar y escribir el informe del Weaver.
 */
export interface IWriteWeaverAuditReportParameters {
  readonly correlationIdentifier: string;
  readonly forensicAuditTrailCollection: readonly IForensicAuditEntry[];
  readonly parityViolationsCollection: readonly ILinguisticParityViolation[];
}

/**
 * @interface IWrittenWeaverAuditReportResult
 * @description Resultado sellado con el informe validado y la ruta física persistida.
 */
export interface IWrittenWeaverAuditReportResult {
  readonly reportSnapshot: IWeaverAuditReport;
  readonly reportFilePathLiteral: string;
}

/**
 * Valida estructuralmente el informe de auditoría del Weaver y lo escribe en disco.
 *
 * @param parametersSnapshot - Trazas de módulos compilados, violaciones detectadas y correlación.
 * @returns {Promise<IWrittenWeaverAuditReportResult>} Informe certificado e inmutable y su ruta.
 */
export const WriteWeaverAuditReportToDisk = async (
  parametersSnapshot: IWriteWeaverAuditReportParameters,
): Promise<IWrittenWeaverAuditReportResult> => {
  const { correlationIdentifier, forensicAuditTrailCollection, parityViolationsCollection } =
    parametersSnapshot;

  const reportSnapshot = WeaverAuditReportSchema.parse({
    generationTimestampISO: new Date().toISOString(),
    correlationIdentifier,
    sourceLocaleIdentifier: WEAVER_CONFIGURATION.SOURCE_LOCALE_IDENTIFIER,
    activeLocalesCollection: [...WEAVER_CONFIGURATION.SUPPORTED_LOCALES_COLLECTION],
    totalModulesProcessedQuantity: forensicAuditTrailCollection.length,
    isParityVerifiedBoolean: parityViolationsCollection.length === 0,
    parityViolationsCollection: [...parityViolationsCollection],
    auditTrailCollection: [...forensicAuditTrailCollection],
  });

  await filesystemPromises.mkdir(WEAVER_CONFIGURATION.FORENSIC_REPORTS_DIRECTORY_LITERAL, {
    recursive: true,
  });

  const reportFilePathLiteral = join(
    WEAVER_CONFIGURATION.FORENSIC_REPORTS_DIRECTORY_LITERAL,
    'internationalization-audit-report.json',
  );

  await filesystemPromises.writeFile(
    reportFilePathLiteral,
    `${JSON.stringify(reportSnapshot, null, 2)}\n`,
    'utf-8',
  );

  return Object.freeze({
    reportSnapshot,
    reportFilePathLiteral,
  });
};
