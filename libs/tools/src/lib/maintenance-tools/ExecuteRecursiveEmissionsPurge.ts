/**
 * @section Tools Logic - Recursive Emissions Purge Atom
 * @description Átomo encargado de la navegación física y eliminación de archivos
 * no deseados (.js, .map, .d.ts) en el código fuente.
 *
 * Protocolo OEDP-V17.0 - High Performance SRE & Hardware Isolation.
 */

import { promises as filesystemPromises } from 'node:fs';
import { join } from 'node:path';
import { EmitTelemetrySignal } from '@floripa-dignidade/telemetry';

/**
 * @section Definición de Restricciones (Ground Truth)
 */
const ROGUE_EXTENSION_COLLECTION = ['.js', '.d.ts', '.map', '.tsbuildinfo'];
const PROTECTED_DIRECTORY_COLLECTION = ['node_modules', '.git', '.nx', '.next', 'dist', 'out-tsc'];

/**
 * Ejecuta el borrado recursivo utilizando I/O asíncrono para no bloquear el hardware.
 *
 * @param targetDirectoryPathLiteral - Ruta absoluta de la carpeta a limpiar.
 * @param correlationIdentifier - Identificador de trazabilidad forense.
 */
export const ExecuteRecursiveEmissionsPurge = async (
  targetDirectoryPathLiteral: string,
  correlationIdentifier: string
): Promise<void> => {
  const directoryEntriesCollection = await filesystemPromises.readdir(targetDirectoryPathLiteral, {
    withFileTypes: true
  });

  for (const entry of directoryEntriesCollection) {
    const entryFullAbsolutePathLiteral = join(targetDirectoryPathLiteral, entry.name);

    // 1. NAVEGACIÓN RECURSIVA (Protegiendo fronteras críticas)
    if (entry.isDirectory()) {
      if (!PROTECTED_DIRECTORY_COLLECTION.includes(entry.name)) {
        await ExecuteRecursiveEmissionsPurge(entryFullAbsolutePathLiteral, correlationIdentifier);
      }
      continue;
    }

    // 2. ADUANA DE IDENTIFICACIÓN: ¿Es un archivo de emisión huérfana?
    const isRogueArtifactBoolean = ROGUE_EXTENSION_COLLECTION.some((extensionLiteral) =>
      entry.name.endsWith(extensionLiteral)
    );

    // Evitamos borrar archivos de configuración legítimos (ej: tailwind.config.js)
    const isProtectedConfigurationBoolean = entry.name.includes('.config.');

    if (isRogueArtifactBoolean && !isProtectedConfigurationBoolean) {
      try {
        await filesystemPromises.unlink(entryFullAbsolutePathLiteral);

        void EmitTelemetrySignal({
          severityLevel: 'DEBUG',
          moduleIdentifier: 'EMISSIONS_PURGE_ATOM',
          operationCode: 'ROGUE_FILE_DELETED',
          correlationIdentifier,
          message: `Artefacto eliminado: [${entry.name}]`
        });
      } catch (_caughtError: unknown) {
        console.error(`  ⚠️ [HARDWARE_BLOCK]: No se pudo eliminar ${entry.name}`);
      }
    }
  }
};
