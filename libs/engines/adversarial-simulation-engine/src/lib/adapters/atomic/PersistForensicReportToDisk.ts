/**
 * @section Adversarial Adapters - Forensic Persistence Atom
 * @description Átomo encargado de la comunicación física con el sistema de archivos.
 * Isole el uso de 'node:fs' para garantizar la soberanía de hardware.
 *
 * Protocolo OEDP-V17.0 - Hardware Isolation & SRE Visibility.
 * @author Raz Podestá - MetaShark Tech
 */

import { promises as filesystemPromises } from 'node:fs';
import * as fileSystemPath from 'node:path';
import { InternalSystemException } from '@floripa-dignidade/exceptions';

/**
 * Escribe el reporte físico en el almacenamiento del entorno de ejecución.
 *
 * @param targetDirectoryLiteral - Ruta absoluta del directorio.
 * @param fileNameLiteral - Nombre del archivo con extensión .json.
 * @param payload - Datos serializables a persistir.
 * @throws {InternalSystemException} Si el hardware deniega la operación.
 */
export const PersistForensicReportToDisk = async (
  targetDirectoryLiteral: string,
  fileNameLiteral: string,
  payload: Record<string, unknown>,
): Promise<string> => {
  const finalFilePathLiteral = fileSystemPath.join(targetDirectoryLiteral, fileNameLiteral);

  try {
    // 1. Aseguramos la existencia del búnker de reportes
    await filesystemPromises.mkdir(targetDirectoryLiteral, { recursive: true });

    // 2. Escritura atómica
    await filesystemPromises.writeFile(
      finalFilePathLiteral,
      JSON.stringify(payload, null, 2),
      'utf-8',
    );

    return finalFilePathLiteral;
  } catch (caughtError: unknown) {
    throw new InternalSystemException('HARDWARE_I/O_PERSISTENCE_FAULT', {
      originalErrorLiteral:
        caughtError instanceof Error ? caughtError.message : String(caughtError),
      targetPathLiteral: finalFilePathLiteral,
    });
  }
};
