/**
 * @section Infrastructure Auditor - Disk Persistence Atom
 * @description Átomo encargado exclusivamente de la escritura física del reporte JSON
 * en el subdirectorio 'reports/infrastructure/', garantizando la creación recursiva de carpetas.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Clean Paths).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa) e ISO/IEC 25010 (Mantenibilidad).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import * as fileSystemPromises from 'node:fs/promises';
import * as pathModule from 'node:path';
import type { ICloudInfrastructureAuditReport } from '../schemas/CloudInfrastructureAuditReport.schema';

/**
 * Persiste físicamente en disco el reporte de auditoría inmutable.
 *
 * @param outputDirectoryPathLiteral - Ruta absoluta del directorio de destino.
 * @param reportFileNameLiteral - Nombre del archivo JSON a escribir.
 * @param reportSnapshot - Datos estructurados y validados por Zod.
 * @returns {Promise<string>} Ruta absoluta del archivo persistido exitosamente.
 */
export const PersistInfrastructureAuditReportToDisk = async (
  outputDirectoryPathLiteral: string,
  reportFileNameLiteral: string,
  reportSnapshot: ICloudInfrastructureAuditReport,
): Promise<string> => {
  const targetAbsoluteFilePathLiteral = pathModule.join(
    outputDirectoryPathLiteral,
    reportFileNameLiteral,
  );

  await fileSystemPromises.mkdir(outputDirectoryPathLiteral, {
    recursive: true,
  });

  await fileSystemPromises.writeFile(
    targetAbsoluteFilePathLiteral,
    JSON.stringify(reportSnapshot, null, 2),
    'utf-8',
  );

  return targetAbsoluteFilePathLiteral;
};
