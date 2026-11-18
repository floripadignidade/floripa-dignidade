/**
 * @file libs/tools/src/lib/supabase-auditor/atoms/PersistSupabaseReportToDisk.ts
 * @section Supabase Auditor - Supabase Report Disk Writer (Atom)
 * @description Átomo encargado exclusivamente de crear el directorio dedicado
 * `<workspaceRoot>/reports/supabase/` si no existe y persistir los reportes JSON
 * forenses de conexión, auditoría granular y volcado seguro.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Clean Paths).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa), ISO/IEC 25010 e ISO/IEC 27001.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { promises as filesystemPromises } from 'node:fs';
import { join, normalize } from 'node:path';
import { z } from 'zod';

import { InternalSystemException, ValidationException } from '@floripa-dignidade/exceptions';
import {
  type CorrelationIdentifier,
  CorrelationIdentifierSchema,
  EmitTelemetrySignal,
  GenerateCorrelationIdentifier,
  type ModuleIdentifier,
  ModuleIdentifierSchema,
  type OperationCode,
  OperationCodeSchema,
  ReportForensicException,
} from '@floripa-dignidade/telemetry';

import { ResolveWorkspaceRootDirectory } from '../../i18n-builder/constants/ResolveWorkspaceRootDirectory';

const PERSISTER_MODULE_IDENTIFIER: ModuleIdentifier = ModuleIdentifierSchema.parse(
  'SUPABASE_REPORT_DISK_PERSISTER',
);

const REPORT_PERSISTED_OPERATION_CODE: OperationCode = OperationCodeSchema.parse(
  'SUPABASE_REPORT_PERSISTED',
);

const ReportFileNameSchema = z
  .string()
  .trim()
  .regex(/^[a-z0-9][a-z0-9._-]{2,80}\.json$/, {
    message: 'SUPABASE_REPORT_FILENAME_INVALID',
  });

const resolveSafeCorrelationIdentifier = (
  candidateIdentifier: string | undefined,
): CorrelationIdentifier => {
  const validationResult = CorrelationIdentifierSchema.safeParse(candidateIdentifier);
  return validationResult.success ? validationResult.data : GenerateCorrelationIdentifier();
};

/**
 * Resuelve la ruta absoluta del directorio `reports/supabase/` en la raíz del monorepo.
 *
 * @returns {string} Ruta absoluta normalizada de destino para reportes de Supabase.
 */
export const ResolveSupabaseReportsDirectory = (): string =>
  normalize(join(ResolveWorkspaceRootDirectory(), 'reports', 'supabase'));

/**
 * Persiste un reporte JSON validado dentro de `reports/supabase/` asegurando la creación de carpetas.
 *
 * @param reportFileNameLiteral - Nombre seguro del archivo JSON (ej. `connection-diagnostic-report.json`).
 * @param reportPayloadSnapshot - Objeto serializable inmutable validado por contrato Zod.
 * @param correlationIdentifierFallback - Identificador UUID v4 opcional de trazabilidad forense.
 * @returns {Promise<string>} Ruta absoluta del archivo escrito en disco.
 * @throws {ValidationException} Si el nombre del archivo incumple las reglas de seguridad.
 * @throws {InternalSystemException} Si ocurre un fallo físico de escritura en disco.
 */
export const PersistSupabaseReportToDisk = async (
  reportFileNameLiteral: string,
  reportPayloadSnapshot: unknown,
  correlationIdentifierFallback?: string,
): Promise<string> => {
  const correlationIdentifier = resolveSafeCorrelationIdentifier(correlationIdentifierFallback);
  const fileNameValidation = ReportFileNameSchema.safeParse(reportFileNameLiteral);

  if (!fileNameValidation.success) {
    const validationException = new ValidationException('SUPABASE_REPORT_FILENAME_INVALID', {
      attemptedFileNameLiteral: reportFileNameLiteral,
      correlationIdentifier,
    });
    ReportForensicException(validationException, correlationIdentifier);
    throw validationException;
  }

  const targetDirectoryPathLiteral = ResolveSupabaseReportsDirectory();
  const targetFileAbsolutePathLiteral = join(targetDirectoryPathLiteral, fileNameValidation.data);

  try {
    await filesystemPromises.mkdir(targetDirectoryPathLiteral, { recursive: true });
    await filesystemPromises.writeFile(
      targetFileAbsolutePathLiteral,
      `${JSON.stringify(reportPayloadSnapshot, null, 2)}\n`,
      'utf-8',
    );

    void EmitTelemetrySignal({
      occurrenceTimestampISO: new Date().toISOString(),
      severityLevelLiteral: 'INFO',
      moduleIdentifierLiteral: PERSISTER_MODULE_IDENTIFIER,
      operationCodeLiteral: REPORT_PERSISTED_OPERATION_CODE,
      correlationIdentifier,
      messageContentLiteral: `Reporte de Supabase persistido en [${fileNameValidation.data}].`,
      semanticIntentTag: 'SUPABASE_AUDIT_REPORT_PERSISTED',
      contextMetadataSnapshot: Object.freeze({
        targetFileAbsolutePathLiteral,
      }),
    });

    return targetFileAbsolutePathLiteral;
  } catch (caughtExecutionError: unknown) {
    const errorDescriptionLiteral =
      caughtExecutionError instanceof Error
        ? caughtExecutionError.message
        : String(caughtExecutionError);

    const persistenceException = new InternalSystemException('SUPABASE_REPORT_PERSISTENCE_FAULT', {
      originalErrorLiteral: errorDescriptionLiteral,
      targetFileAbsolutePathLiteral,
      correlationIdentifier,
    });

    ReportForensicException(persistenceException, correlationIdentifier);
    throw persistenceException;
  }
};
