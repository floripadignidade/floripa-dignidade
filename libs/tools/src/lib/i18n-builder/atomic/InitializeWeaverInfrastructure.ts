/**
 * @section Tools & Infrastructure - Weaver Infrastructure Initialization Atom
 * @description Garantiza la disponibilidad e integridad de la infraestructura física
 * de directorios para la compilación del Weaver. Implementa normalización de rutas absolutas,
 * auditoría proactiva de permisos de escritura de hardware (W_OK) y rastro telemétrico SRE.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa), ISO/IEC 25010 (Confiabilidad) e ISO/IEC 27001 (Seguridad).
 * SANEADO Zenith: Inyección obligatoria de 'occurrenceTimestampISO', trazabilidad de 'correlationIdentifier',
 * resolución estricta con extensiones '.js' y reporte telemétrico en condiciones de colapso de I/O.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import {
  promises as filesystemPromises,
  constants as filesystemStandardConstants,
} from 'node:fs';
import { normalize, resolve } from 'node:path';

/* 1. Infraestructura Core de Telemetría y Excepciones */
import {
  EmitTelemetrySignal,
  GenerateCorrelationIdentifier,
  type ModuleIdentifier,
  type OperationCode,
} from '@floripa-dignidade/telemetry';

import { InternalSystemException } from '@floripa-dignidade/exceptions';

/* 2. Contratos de Configuración Local (Resolución ESM Estricta) */
import { WEAVER_CONFIGURATION } from '../constants/WeaverConfiguration.js';

/** Identificador técnico del aparato para el monitor de salud y telemetría forense. */
const INITIALIZER_MODULE_IDENTIFIER =
  'WEAVER_INFRASTRUCTURE_INITIALIZER' as ModuleIdentifier;

/**
 * Inicializa los directorios base para el procesamiento lingüístico y valida permisos de hardware.
 *
 * @param correlationIdentifierFallback - Identificador único de correlación opcional para trazabilidad forense.
 * @returns {Promise<void>} Promesa que resuelve nominalmente si la infraestructura está lista.
 * @throws {InternalSystemException} Si falla la creación de carpetas o el acceso de escritura en disco.
 */
export const InitializeWeaverInfrastructure = async (
  correlationIdentifierFallback: string = GenerateCorrelationIdentifier(),
): Promise<void> => {
  const correlationIdentifier = correlationIdentifierFallback;

  const targetPathsCollection = [
    normalize(resolve(WEAVER_CONFIGURATION.TARGET_OUTPUT_DIRECTORY_LITERAL)),
    normalize(resolve(WEAVER_CONFIGURATION.FORENSIC_REPORTS_DIRECTORY_LITERAL)),
  ];

  try {
    // 1. CREACIÓN IDEMPOTENTE DE DIRECTORIOS (Hardware Isolation)
    await Promise.all(
      targetPathsCollection.map((pathLiteral) =>
        filesystemPromises.mkdir(pathLiteral, { recursive: true }),
      ),
    );

    // 2. AUDITORÍA SRE: Verificación de permisos de escritura física (Pre-flight Check)
    await Promise.all(
      targetPathsCollection.map((pathLiteral) =>
        filesystemPromises.access(pathLiteral, filesystemStandardConstants.W_OK),
      ),
    );

    // 3. TELEMETRÍA FORENSE: Reporte conforme a TelemetrySignalSchema
    void EmitTelemetrySignal({
      occurrenceTimestampISO: new Date().toISOString(),
      severityLevelLiteral: 'INFO',
      moduleIdentifierLiteral: INITIALIZER_MODULE_IDENTIFIER,
      operationCodeLiteral: 'INFRASTRUCTURE_READY' as OperationCode,
      correlationIdentifier,
      messageContentLiteral:
        'Infraestructura de persistencia para el Weaver inicializada correctamente.',
      semanticIntentTag: 'I18N_INFRASTRUCTURE_INITIALIZATION',
      contextMetadataSnapshot: {
        initializedPathsCollection: targetPathsCollection,
      },
    });
  } catch (caughtExecutionError: unknown) {
    // 4. GESTIÓN FORENSE DE FALLO DE HARDWARE (Resilience Layer)
    const errorInstance = caughtExecutionError as NodeJS.ErrnoException;
    const errorDescriptionLiteral =
      errorInstance.message ?? String(caughtExecutionError);

    void EmitTelemetrySignal({
      occurrenceTimestampISO: new Date().toISOString(),
      severityLevelLiteral: 'CRITICAL',
      moduleIdentifierLiteral: INITIALIZER_MODULE_IDENTIFIER,
      operationCodeLiteral:
        'INFRASTRUCTURE_INITIALIZATION_FAULT' as OperationCode,
      correlationIdentifier,
      messageContentLiteral: `Fallo crítico de hardware al inicializar directorios del Weaver: ${errorDescriptionLiteral}`,
      semanticIntentTag: 'I18N_INFRASTRUCTURE_FAULT',
      contextMetadataSnapshot: {
        faultyPathsCollection: targetPathsCollection,
        systemErrorCodeLiteral: errorInstance.code ?? 'FS_ERROR',
      },
    });

    throw new InternalSystemException('WEAVER_INFRASTRUCTURE_FAILURE', {
      intentLiteral: 'INITIALIZE_BUILD_DIRECTORIES',
      faultyPathsCollection: targetPathsCollection,
      systemErrorCodeLiteral: errorInstance.code ?? 'FS_ERROR',
      originalErrorLiteral: errorDescriptionLiteral,
      correlationIdentifier,
    });
  }
};