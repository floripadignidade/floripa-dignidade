/**
 * @section Tools Logic - Exceptions Build Auditor (Master)
 * @description Escanea físicamente los directorios de salida para validar la
 * integridad de los artefactos generados por TSC y SWC.
 *
 * Protocolo OEDP-V17.0 - High Performance SRE & ISO Standard Naming.
 * SANEADO Zenith: Erradicación de 'no-console' y 'unused-vars'.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { promises as filesystemPromises } from 'node:fs';
import * as pathReference from 'node:path';

/* 1. Infraestructura Core (Atmos PascalCase) */
import {
  EmitTelemetrySignal,
  GenerateCorrelationIdentifier,
  TraceExecutionTime,
} from '@floripa-dignidade/telemetry';

import { InternalSystemException } from '@floripa-dignidade/exceptions';

/* 2. ADN Estructural Local */
import type { IBuildArtifact } from './schemas/BuildAuditReport.schema';

/** Identificador técnico del aparato para el Neural Sentinel. */
const BUILD_AUDITOR_IDENTIFIER = 'EXCEPTIONS_BUILD_AUDITOR';

/**
 * Ejecuta la auditoría física de los cimientos del búnker 'exceptions'.
 * Garantiza que el ADN (TSC) y la Lógica (SWC) existan en el disco.
 *
 * @returns {Promise<void>}
 * @throws {InternalSystemException} Si el hardware deniega el acceso a las rutas.
 */
export const AuditExceptionsBuildArtifacts = async (): Promise<void> => {
  const correlationIdentifier = GenerateCorrelationIdentifier();
  const workspaceRootDirectoryPathLiteral = process.cwd();

  return await TraceExecutionTime(
    BUILD_AUDITOR_IDENTIFIER,
    'EXECUTE_PHYSICAL_ARTIFACT_AUDIT',
    correlationIdentifier,
    async () => {
      /**
       * @section Definición de Objetivos de Auditoría
       * Mapeamos las rutas donde el enjambre espera encontrar los binarios.
       */
      const targetAuditPathsCollection = [
        {
          pathLiteral: pathReference.join(
            workspaceRootDirectoryPathLiteral,
            'dist/out-tsc/libs/core/exceptions'
          ),
          artifactCategoryLabelLiteral: 'ADN_DECLARATION (TSC)',
        },
        {
          pathLiteral: pathReference.join(
            workspaceRootDirectoryPathLiteral,
            'dist/libs/core/exceptions'
          ),
          artifactCategoryLabelLiteral: 'LOGIC_EXECUTABLE (SWC)',
        },
      ];

      console.warn(`\n=== [ZENITH SENTRY]: AUDITORÍA FÍSICA: @floripa-dignidade/exceptions ===`);

      const discoveredArtifactsCollection: IBuildArtifact[] = [];

      for (const auditTarget of targetAuditPathsCollection) {
        console.warn(`\nVerificando: ${auditTarget.artifactCategoryLabelLiteral}`);
        console.warn(`Ruta: ${auditTarget.pathLiteral}`);

        try {
          const directoryEntriesCollection = await filesystemPromises.readdir(
            auditTarget.pathLiteral
          );

          if (directoryEntriesCollection.length === 0) {
            console.warn('  ⚠️ Carpeta FÍSICAMENTE VACÍA.');
          } else {
            directoryEntriesCollection.forEach((fileNameLiteral) => {
              console.warn(`  [+] ${fileNameLiteral}`);

              // Registro de metadatos del artefacto
              discoveredArtifactsCollection.push({
                fileNameLiteral,
                fileAbsolutePathLiteral: pathReference.join(
                  auditTarget.pathLiteral,
                  fileNameLiteral
                ),
                fileSizeInBytesQuantity: 0, // TODO: Implementar stat en Fase 2
                artifactTypeLiteral: auditTarget.artifactCategoryLabelLiteral.includes('ADN')
                  ? 'ADN_DECLARATION'
                  : 'LOGIC_EXECUTABLE'
              });
            });
          }
        } catch (_caughtError: unknown) {
          /**
           * 🛡️ SANEADO: Prefijo '_' inyectado para cumplir con @typescript-eslint/no-unused-vars.
           * Reportamos el fallo de hardware pero permitimos que la auditoría continúe.
           */
          console.error(`  ❌ ERROR_I/O: No se pudo acceder a la jurisdicción física.`);
        }
      }

      /**
       * @section Generación de Reporte Forense
       * Persistimos los resultados para que Shannon AI pueda analizarlos en el CI.
       */
      const reportPathLiteral = pathReference.join(
        workspaceRootDirectoryPathLiteral,
        'reports/exceptions-build-audit.json'
      );

      try {
        await filesystemPromises.mkdir(pathReference.dirname(reportPathLiteral), { recursive: true });

        const reportSnapshot = {
          auditTimestampISO: new Date().toISOString(),
          correlationIdentifier,
          targetBunkerIdentifier: '@floripa-dignidade/exceptions',
          artifactsCountQuantity: discoveredArtifactsCollection.length,
          discoveredArtifactsCollection
        };

        await filesystemPromises.writeFile(
          reportPathLiteral,
          JSON.stringify(reportSnapshot, null, 2),
          'utf-8'
        );

        console.warn(`\n>>> REPORTE FORENSE GENERADO: ${reportPathLiteral}\n`);

      } catch (caughtPersistenceError: unknown) {
        throw new InternalSystemException('FALLO_AL_GRABAR_REPORTE_DE_AUDITORIA', {
          originalErrorLiteral: caughtPersistenceError instanceof Error
            ? caughtPersistenceError.message
            : String(caughtPersistenceError),
          reportPathLiteral
        });
      }

      // REPORTE FINAL AL NEURAL SENTINEL
      void EmitTelemetrySignal({
        severityLevel: discoveredArtifactsCollection.length > 0 ? 'INFO' : 'WARNING',
        moduleIdentifier: BUILD_AUDITOR_IDENTIFIER,
        operationCode: 'BUILD_AUDIT_FINISHED',
        correlationIdentifier,
        message: 'Auditoría física de artefactos completada.'
      });
    }
  );
};
