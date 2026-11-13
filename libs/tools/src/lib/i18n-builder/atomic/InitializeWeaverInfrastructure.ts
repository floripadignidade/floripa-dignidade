/**
 * @section Tools & Infrastructure - Weaver Infrastructure Initialization Atom
 * @description Garantiza la disponibilidad e integridad física de los directorios de
 * salida y reportes del compilador lingüístico Weaver. Normaliza y deduplica rutas absolutas,
 * valida el identificador de correlación contra el esquema nominal SSOT, verifica que los
 * destinos sean directorios reales con permisos de escritura (`W_OK`) y mide latencia SRE.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Clean Paths).
 * Normas: ISO/IEC 11179 (Nomenclatura Técnica), ISO/IEC 25010 (Confiabilidad) e ISO/IEC 27001.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { constants as filesystemConstants, promises as filesystemPromises } from 'node:fs';
import { normalize, resolve } from 'node:path';

import { InternalSystemException, ValidationException } from '@floripa-dignidade/exceptions';
import {
  CorrelationIdentifierSchema,
  EmitTelemetrySignal,
  GenerateCorrelationIdentifier,
  type ModuleIdentifier,
  type OperationCode,
  TraceExecutionTime,
} from '@floripa-dignidade/telemetry';

import { WEAVER_CONFIGURATION } from '../constants/WeaverConfiguration';

const INITIALIZER_MODULE_IDENTIFIER = 'WEAVER_INFRASTRUCTURE_INITIALIZER' as ModuleIdentifier;

const extractSystemErrorCodeLiteral = (caughtExecutionError: unknown): string => {
  if (
    typeof caughtExecutionError === 'object' &&
    caughtExecutionError !== null &&
    'code' in caughtExecutionError &&
    typeof caughtExecutionError.code === 'string'
  ) {
    return caughtExecutionError.code;
  }

  return 'FS_ERROR';
};

const ensureWritableDirectoryAction = async (directoryPathLiteral: string): Promise<void> => {
  await filesystemPromises.mkdir(directoryPathLiteral, { recursive: true });
  const directoryStatsSnapshot = await filesystemPromises.stat(directoryPathLiteral);

  if (!directoryStatsSnapshot.isDirectory()) {
    throw new Error(`PATH_IS_NOT_A_DIRECTORY:${directoryPathLiteral}`);
  }

  await filesystemPromises.access(directoryPathLiteral, filesystemConstants.W_OK);
};

/**
 * Inicializa los directorios base del compilador lingüístico y certifica permisos de escritura.
 *
 * @param correlationIdentifierFallback - Identificador único de correlación opcional para trazabilidad.
 * @returns {Promise<void>} Resuelve cuando todos los directorios requeridos están listos.
 * @throws {ValidationException} Si el identificador de correlación provisto no es un UUID v4 válido.
 * @throws {InternalSystemException} Si falla la creación o verificación de permisos en disco.
 */
export const InitializeWeaverInfrastructure = async (
  correlationIdentifierFallback: string = GenerateCorrelationIdentifier(),
): Promise<void> => {
  const correlationValidationResult = CorrelationIdentifierSchema.safeParse(
    correlationIdentifierFallback,
  );

  if (!correlationValidationResult.success) {
    throw new ValidationException('WEAVER_CORRELATION_IDENTIFIER_INVALIDO', {
      validationIssuesCollection: correlationValidationResult.error.flatten(),
    });
  }

  const correlationIdentifier = correlationValidationResult.data;
  const targetPathsCollection: readonly string[] = Object.freeze(
    Array.from(
      new Set([
        normalize(resolve(WEAVER_CONFIGURATION.TARGET_OUTPUT_DIRECTORY_LITERAL)),
        normalize(resolve(WEAVER_CONFIGURATION.FORENSIC_REPORTS_DIRECTORY_LITERAL)),
      ]),
    ),
  );

  return await TraceExecutionTime(
    INITIALIZER_MODULE_IDENTIFIER,
    'INITIALIZE_WEAVER_INFRASTRUCTURE' as OperationCode,
    correlationIdentifier,
    async (): Promise<void> => {
      try {
        await Promise.all(
          targetPathsCollection.map((directoryPathLiteral) =>
            ensureWritableDirectoryAction(directoryPathLiteral),
          ),
        );

        void EmitTelemetrySignal({
          occurrenceTimestampISO: new Date().toISOString(),
          severityLevelLiteral: 'INFO',
          moduleIdentifierLiteral: INITIALIZER_MODULE_IDENTIFIER,
          operationCodeLiteral: 'INFRASTRUCTURE_READY' as OperationCode,
          correlationIdentifier,
          messageContentLiteral:
            'Infraestructura de persistencia para el compilador Weaver inicializada correctamente.',
          semanticIntentTag: 'I18N_INFRASTRUCTURE_INITIALIZATION',
          contextMetadataSnapshot: {
            initializedPathsCollection: targetPathsCollection,
          },
        });
      } catch (caughtExecutionError: unknown) {
        const errorDescriptionLiteral =
          caughtExecutionError instanceof Error
            ? caughtExecutionError.message
            : String(caughtExecutionError);
        const systemErrorCodeLiteral = extractSystemErrorCodeLiteral(caughtExecutionError);

        void EmitTelemetrySignal({
          occurrenceTimestampISO: new Date().toISOString(),
          severityLevelLiteral: 'CRITICAL',
          moduleIdentifierLiteral: INITIALIZER_MODULE_IDENTIFIER,
          operationCodeLiteral: 'INFRASTRUCTURE_INITIALIZATION_FAULT' as OperationCode,
          correlationIdentifier,
          messageContentLiteral: `Fallo crítico de hardware al inicializar directorios del Weaver: ${errorDescriptionLiteral}`,
          semanticIntentTag: 'I18N_INFRASTRUCTURE_FAULT',
          contextMetadataSnapshot: {
            faultyPathsCollection: targetPathsCollection,
            systemErrorCodeLiteral,
          },
        });

        throw new InternalSystemException('WEAVER_INFRASTRUCTURE_FAILURE', {
          intentLiteral: 'INITIALIZE_BUILD_DIRECTORIES',
          faultyPathsCollection: targetPathsCollection,
          systemErrorCodeLiteral,
          originalErrorLiteral: errorDescriptionLiteral,
          correlationIdentifier,
        });
      }
    },
  );
};
