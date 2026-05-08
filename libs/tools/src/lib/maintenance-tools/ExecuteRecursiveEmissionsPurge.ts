/**
 * @section Tools Logic - Recursive Emissions Purge Atom
 * @description Átomo encargado de la navegación física y eliminación concurrente
 * de artefactos de compilación huérfanos (.js, .map, .d.ts) en el código fuente.
 * Actúa como el sensor de higiene de hardware del ecosistema.
 *
 * Protocolo OEDP-V17.0 - High Performance SRE & Hardware Isolation.
 * SANEADO Zenith: Procesamiento paralelo por nivel, Prosa ISO y blindaje de exclusión.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { promises as filesystemPromises } from 'node:fs';
import { join } from 'node:path';

/* 1. Infraestructura Core (Atmos PascalCase) */
import {
  EmitTelemetrySignal,
  GenerateCorrelationIdentifier
} from '@floripa-dignidade/telemetry';

/**
 * @section Definición de Restricciones (Ground Truth)
 * Centralizamos las extensiones y carpetas que definen la "Emisión Huérfana".
 */
const EMISSION_ARTIFACT_EXTENSIONS_COLLECTION: readonly string[] = [
  '.js',
  '.d.ts',
  '.map',
  '.tsbuildinfo'
];

/**
 * Jurisdicciones físicas que el motor jamás debe alterar.
 */
const IMMUTABLE_SYSTEM_JURISDICTIONS_COLLECTION: readonly string[] = [
  'node_modules',
  '.git',
  '.nx',
  '.next',
  'dist',
  'out-tsc'
];

/** Identificador técnico del aparato para el Neural Sentinel. */
const PURGE_ATOM_IDENTIFIER = 'HARDWARE_EMISSIONS_PURGE_ATOM';

/**
 * Ejecuta el borrado recursivo utilizando I/O asíncrono y concurrencia por nivel.
 * Garantiza que los archivos de configuración y cimientos no sean purgados.
 *
 * @param targetDirectoryAbsolutePathLiteral - Ruta absoluta del directorio a purificar.
 * @param correlationIdentifier - Identificador de trazabilidad forense del proceso.
 * @returns {Promise<void>}
 */
export const ExecuteRecursiveEmissionsPurge = async (
  targetDirectoryAbsolutePathLiteral: string,
  correlationIdentifier: string = GenerateCorrelationIdentifier()
): Promise<void> => {

  // 1. CAPTURA DE CONTENIDO (I/O Sentry)
  const directoryEntriesCollection = await filesystemPromises.readdir(
    targetDirectoryAbsolutePathLiteral,
    { withFileTypes: true }
  );

  /**
   * @section Orquestación de Enjambre (Concurrent Tasking)
   * Dividimos el trabajo en promesas para no bloquear el hardware.
   */
  const executionPromisesCollection: Promise<void>[] = [];

  for (const entrySnapshot of directoryEntriesCollection) {
    const entryFullAbsolutePathLiteral = join(targetDirectoryAbsolutePathLiteral, entrySnapshot.name);

    // CASO A: Jurisdicción de Directorio
    if (entrySnapshot.isDirectory()) {
      /**
       * 🛡️ LEY DE PROTECCIÓN: Solo descendemos si la carpeta no es parte
       * del núcleo inmutable del monorepo.
       */
      const isDirectoryProtectedBoolean = IMMUTABLE_SYSTEM_JURISDICTIONS_COLLECTION.includes(
        entrySnapshot.name
      );

      if (!isDirectoryProtectedBoolean) {
        executionPromisesCollection.push(
          ExecuteRecursiveEmissionsPurge(entryFullAbsolutePathLiteral, correlationIdentifier)
        );
      }
      continue;
    }

    // CASO B: Identificación de Artefacto (File Analysis)
    const isEmissionArtifactBoolean = EMISSION_ARTIFACT_EXTENSIONS_COLLECTION.some(
      (extensionLiteral) => entrySnapshot.name.endsWith(extensionLiteral)
    );

    /**
     * 🛡️ BLOQUEO DE SEGURIDAD: Evitamos borrar archivos que contengan ".config."
     * o que sean archivos de entorno ocultos (.env, .gitignore).
     */
    const isConfigurationFileBoolean = entrySnapshot.name.includes('.config.');
    const isHiddenSystemFileBoolean = entrySnapshot.name.startsWith('.');

    const shouldPurgeFileBoolean =
      isEmissionArtifactBoolean &&
      !isConfigurationFileBoolean &&
      !isHiddenSystemFileBoolean;

    if (shouldPurgeFileBoolean) {
      executionPromisesCollection.push(
        (async () => {
          try {
            await filesystemPromises.unlink(entryFullAbsolutePathLiteral);

            // REPORTE DE LIMPIEZA (DEBUG Visibility)
            void EmitTelemetrySignal({
              severityLevelLiteral: 'DEBUG',
              moduleIdentifierLiteral: PURGE_ATOM_IDENTIFIER,
              operationCodeLiteral: 'ARTIFACT_PHYSICALLY_PURGED',
              correlationIdentifier,
              messageContentLiteral: `Higiene completada: Artefacto eliminado en [${entrySnapshot.name}].`,
              contextMetadataSnapshot: { fileNameLiteral: entrySnapshot.name }
            });
          } catch (_caughtInputOutputError: unknown) {
            /** Silencio en consola para no saturar el buffer, reporte a telemetría. */
            void EmitTelemetrySignal({
              severityLevelLiteral: 'WARNING',
              moduleIdentifierLiteral: PURGE_ATOM_IDENTIFIER,
              operationCodeLiteral: 'HARDWARE_UNLINK_DENIED',
              correlationIdentifier,
              messageContentLiteral: `Hardware bloqueó la eliminación de: ${entrySnapshot.name}`,
            });
          }
        })()
      );
    }
  }

  /**
   * ⚡ EXECUTION: Esperamos la finalización de todas las tareas del nivel actual
   * antes de reportar el éxito del nodo al orquestador superior.
   */
  await Promise.all(executionPromisesCollection);
};
