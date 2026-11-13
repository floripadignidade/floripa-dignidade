/**
 * @section Tools Logic - Recursive Emissions Purge Atom
 * @description Átomo encargado de la navegación física y eliminación concurrente
 * de artefactos de compilación huérfanos (.js, .d.ts, .map, .tsbuildinfo) en el
 * código fuente. Incorpora salvaguardas para activos estáticos, configuraciones
 * ambientales (next-env.d.ts, jest.preset.js) y directorios de sistema.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Hardware Isolation).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa), ISO/IEC 25010 (Confiabilidad) e ISO/IEC 27001.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { existsSync, promises as filesystemPromises } from 'node:fs';
import { join } from 'node:path';

/* 1. Infraestructura Core de Telemetría */
import {
  EmitTelemetrySignal,
  GenerateCorrelationIdentifier,
  type ModuleIdentifier,
  type OperationCode,
} from '@floripa-dignidade/telemetry';

/** Extensiones clasificadas como emisiones compiladas huérfanas. */
const EMISSION_ARTIFACT_EXTENSIONS_COLLECTION: readonly string[] = [
  '.js',
  '.d.ts',
  '.map',
  '.tsbuildinfo',
];

/** Directorios que el motor de limpieza jamás debe recorrer ni alterar. */
const IMMUTABLE_SYSTEM_DIRECTORIES_SET: ReadonlySet<string> = new Set([
  'node_modules',
  'dist',
  'out-tsc',
  'coverage',
  'reports',
  'public',
  'tmp',
  'test-output',
]);

/** Archivos legítimos protegidos explícitamente contra borrado accidental. */
const PROTECTED_FILE_NAMES_SET: ReadonlySet<string> = new Set(['next-env.d.ts', 'jest.preset.js']);

/** Identificador técnico del aparato para el monitor de salud y telemetría forense. */
const PURGE_ATOM_IDENTIFIER = 'HARDWARE_EMISSIONS_PURGE_ATOM' as ModuleIdentifier;

/**
 * Determina si un directorio debe quedar excluido del escaneo recursivo.
 */
const isProtectedDirectoryBoolean = (directoryNameLiteral: string): boolean => {
  return (
    directoryNameLiteral.startsWith('.') ||
    IMMUTABLE_SYSTEM_DIRECTORIES_SET.has(directoryNameLiteral)
  );
};

/**
 * Evalúa si un archivo corresponde a un artefacto huérfano seguro para eliminar.
 */
const shouldPurgeEmissionArtifactBoolean = (fileNameLiteral: string): boolean => {
  if (fileNameLiteral.startsWith('.') || fileNameLiteral.includes('.config.')) {
    return false;
  }

  if (PROTECTED_FILE_NAMES_SET.has(fileNameLiteral)) {
    return false;
  }

  return EMISSION_ARTIFACT_EXTENSIONS_COLLECTION.some((extensionLiteral) =>
    fileNameLiteral.endsWith(extensionLiteral),
  );
};

/**
 * Ejecuta de forma segura la eliminación física de un artefacto y reporta telemetría SRE.
 */
const unlinkRogueArtifactSafelyAction = async (
  fileAbsolutePathLiteral: string,
  fileNameLiteral: string,
  correlationIdentifier: string,
): Promise<void> => {
  try {
    await filesystemPromises.unlink(fileAbsolutePathLiteral);

    void EmitTelemetrySignal({
      occurrenceTimestampISO: new Date().toISOString(),
      severityLevelLiteral: 'DEBUG',
      moduleIdentifierLiteral: PURGE_ATOM_IDENTIFIER,
      operationCodeLiteral: 'ARTIFACT_PHYSICALLY_PURGED' as OperationCode,
      correlationIdentifier,
      messageContentLiteral: `Higiene completada: Artefacto eliminado en [${fileNameLiteral}].`,
      semanticIntentTag: 'WORKSPACE_EMISSION_PURGE',
      contextMetadataSnapshot: { fileNameLiteral },
    });
  } catch (_caughtInputOutputError: unknown) {
    void EmitTelemetrySignal({
      occurrenceTimestampISO: new Date().toISOString(),
      severityLevelLiteral: 'WARNING',
      moduleIdentifierLiteral: PURGE_ATOM_IDENTIFIER,
      operationCodeLiteral: 'HARDWARE_UNLINK_DENIED' as OperationCode,
      correlationIdentifier,
      messageContentLiteral: `Hardware bloqueó la eliminación de: [${fileNameLiteral}].`,
      semanticIntentTag: 'WORKSPACE_EMISSION_PURGE_WARNING',
      contextMetadataSnapshot: { fileNameLiteral },
    });
  }
};

/**
 * Ejecuta el borrado recursivo utilizando I/O asíncrono y concurrencia por nivel.
 * Garantiza la preservación de configuraciones, activos estáticos y declaraciones ambientales.
 *
 * @param targetDirectoryAbsolutePathLiteral - Ruta absoluta del directorio a purificar.
 * @param correlationIdentifier - Identificador único de trazabilidad forense del proceso.
 * @returns {Promise<void>} Promesa que resuelve una vez purificado el árbol objetivo.
 */
export const ExecuteRecursiveEmissionsPurge = async (
  targetDirectoryAbsolutePathLiteral: string,
  correlationIdentifier: string = GenerateCorrelationIdentifier(),
): Promise<void> => {
  if (!existsSync(targetDirectoryAbsolutePathLiteral)) {
    return;
  }

  const directoryEntriesCollection = await filesystemPromises.readdir(
    targetDirectoryAbsolutePathLiteral,
    { withFileTypes: true },
  );

  const executionPromisesCollection: Promise<void>[] = [];

  for (const entrySnapshot of directoryEntriesCollection) {
    const entryFullAbsolutePathLiteral = join(
      targetDirectoryAbsolutePathLiteral,
      entrySnapshot.name,
    );

    if (entrySnapshot.isDirectory()) {
      if (!isProtectedDirectoryBoolean(entrySnapshot.name)) {
        executionPromisesCollection.push(
          ExecuteRecursiveEmissionsPurge(entryFullAbsolutePathLiteral, correlationIdentifier),
        );
      }
      continue;
    }

    if (shouldPurgeEmissionArtifactBoolean(entrySnapshot.name)) {
      executionPromisesCollection.push(
        unlinkRogueArtifactSafelyAction(
          entryFullAbsolutePathLiteral,
          entrySnapshot.name,
          correlationIdentifier,
        ),
      );
    }
  }

  await Promise.all(executionPromisesCollection);
};
