/**
 * @section Tools - Initialization Atom
 * @description Garantiza la integridad de la infraestructura física para el Weaver.
 * Implementa normalización de rutas, auditoría de permisos y rastro de telemetría.
 *
 * Protocolo OEDP-V17.0 - Zenith Architecture Standard & Clean Paths.
 * SANEADO Zenith: Sincronización de orden alfabético y normalización de excepciones ISO.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { promises as filesystemPromises, constants as filesystemStandardConstants } from 'node:fs';
import { normalize, resolve } from 'node:path';

/* 1. Infraestructura Core (Atmos PascalCase) */
import { EmitTelemetrySignal } from '@floripa-dignidade/telemetry';
import { InternalSystemException } from '@floripa-dignidade/exceptions';

/* 2. ADN Estructural Local */
import { WEAVER_CONFIGURATION } from '../constants/WeaverConfiguration';

/** Identificador técnico del aparato para el Neural Sentinel. */
const INITIALIZER_IDENTIFIER = 'WEAVER_INFRASTRUCTURE_INITIALIZER';

/**
 * Inicializa los directorios base para el procesamiento lingüístico.
 * Realiza una validación proactiva de permisos de escritura en el hardware.
 *
 * @returns {Promise<void>}
 * @throws {InternalSystemException} Si falla la creación o el acceso físico.
 */
export const InitializeWeaverInfrastructure = async (): Promise<void> => {
  const targetPathsCollection = [
    normalize(resolve(WEAVER_CONFIGURATION.TARGET_OUTPUT_DIRECTORY_LITERAL)),
    normalize(resolve(WEAVER_CONFIGURATION.FORENSIC_REPORTS_DIRECTORY_LITERAL))
  ];

  try {
    // 1. EJECUCIÓN: Creación idempotente de directorios (Hardware Isolation)
    await Promise.all(
      targetPathsCollection.map((pathLiteral) =>
        filesystemPromises.mkdir(pathLiteral, { recursive: true })
      )
    );

    // 2. AUDITORÍA: Verificación de permisos de escritura pre-vuelo (SRE Check)
    await Promise.all(
      targetPathsCollection.map((pathLiteral) =>
        filesystemPromises.access(pathLiteral, filesystemStandardConstants.W_OK)
      )
    );

    // 3. TELEMETRÍA: Reporte de salud de infraestructura de build
    void EmitTelemetrySignal({
      severityLevelLiteral: 'INFO',
      moduleIdentifierLiteral: INITIALIZER_IDENTIFIER,
      operationCodeLiteral: 'INFRASTRUCTURE_READY',
      messageContentLiteral: 'Infraestructura de persistencia para el Weaver inicializada correctamente.',
      contextMetadataSnapshot: { initializedPathsCollection: targetPathsCollection }
    });

  } catch (caughtError: unknown) {
    /**
     * @section Gestión Forense de Hardware
     * Capturamos los códigos de error nativos de Node.js para el rastro de la IA.
     */
    const errorInstance = caughtError as NodeJS.ErrnoException;

    throw new InternalSystemException('WEAVER_INFRASTRUCTURE_FAILURE', {
      intentLiteral: 'INITIALIZE_BUILD_DIRECTORIES',
      faultyPathsCollection: targetPathsCollection,
      systemErrorCodeLiteral: errorInstance.code ?? 'FS_ERROR',
      originalErrorLiteral: errorInstance.message
    });
  }
};
