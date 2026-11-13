/**
 * @section Tools Logic - Purge Interaction Orchestrator
 * @description Orquestador encargado de la comunicación segura con el operador
 * humano y el disparo del átomo de limpieza recursiva. Incorpora validación de
 * frontera de directorio (confinamiento al monorepo), manejo estandarizado de
 * excepciones y telemetría forense conforme a ISO/IEC 11179.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Hardware Isolation).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa), ISO/IEC 25010 (Confiabilidad) e ISO/IEC 27001.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { existsSync } from 'node:fs';
import { resolve, sep } from 'node:path';
import { stdin as standardInputReference, stdout as standardOutputReference } from 'node:process';
import * as readlinePromises from 'node:readline/promises';

/* 1. Infraestructura Core de Excepciones y Telemetría */
import { InternalSystemException, ValidationException } from '@floripa-dignidade/exceptions';
import {
  EmitTelemetrySignal,
  GenerateCorrelationIdentifier,
  type ModuleIdentifier,
  type OperationCode,
  TraceExecutionTime,
} from '@floripa-dignidade/telemetry';

/* 2. Átomo de Limpieza Recursiva */
import { ExecuteRecursiveEmissionsPurge } from './ExecuteRecursiveEmissionsPurge';

/** Identificador técnico del aparato para el monitor de salud y telemetría forense. */
const ORCHESTRATOR_IDENTIFIER = 'MAINTENANCE_PURGE_ORCHESTRATOR' as ModuleIdentifier;

/**
 * @interface IPurgeOrchestratorOptions
 * @description Parámetros opcionales para ejecución programática o interactiva controlada.
 */
export interface IPurgeOrchestratorOptions {
  readonly targetDirectoryPathLiteral?: string;
  readonly isConfirmationBypassedBoolean?: boolean;
}

/**
 * Verifica que la ruta candidata resida estrictamente dentro de la raíz del monorepo.
 */
const isPathWithinWorkspaceBoolean = (
  workspaceRootPathLiteral: string,
  candidatePathLiteral: string,
): boolean => {
  return (
    candidatePathLiteral === workspaceRootPathLiteral ||
    candidatePathLiteral.startsWith(`${workspaceRootPathLiteral}${sep}`)
  );
};

/**
 * Normaliza y valida que el directorio objetivo sea no-vacío, seguro y existente en disco.
 */
const resolveValidatedTargetPathLiteral = (rawDirectoryInputLiteral: string): string => {
  const trimmedInputLiteral = rawDirectoryInputLiteral.trim();
  if (trimmedInputLiteral.length === 0) {
    throw new ValidationException('RUTA_DE_PURGA_VACIA_PROHIBIDA', {
      resolutionHintLiteral: 'Debe especificar un subdirectorio válido (ej: libs).',
    });
  }

  const workspaceRootPathLiteral = resolve(process.cwd());
  const targetAbsolutePathLiteral = resolve(workspaceRootPathLiteral, trimmedInputLiteral);

  if (!isPathWithinWorkspaceBoolean(workspaceRootPathLiteral, targetAbsolutePathLiteral)) {
    throw new ValidationException('RUTA_DE_PURGA_FUERA_DE_JURISDICCION', {
      attemptedPathLiteral: targetAbsolutePathLiteral,
      workspaceRootPathLiteral,
    });
  }

  if (!existsSync(targetAbsolutePathLiteral)) {
    throw new ValidationException('DIRECTORIO_OBJETIVO_INEXISTENTE', {
      attemptedPathLiteral: targetAbsolutePathLiteral,
    });
  }

  return targetAbsolutePathLiteral;
};

/**
 * Ejecuta el flujo de purga de artefactos huérfanos con resguardo de frontera física.
 *
 * @param optionsSnapshot - Configuración opcional para bypass controlado sin alterar la firma CLI.
 * @returns {Promise<void>} Promesa resuelta tras finalizar o abortar la operación.
 * @throws {ValidationException} Si la ruta es vacía, inexistente o externa al monorepo.
 * @throws {InternalSystemException} Si ocurre un fallo inesperado de sistema durante la limpieza.
 */
export const ExecutePurgeOrchestrator = async (
  optionsSnapshot?: IPurgeOrchestratorOptions,
): Promise<void> => {
  const correlationIdentifier = GenerateCorrelationIdentifier();
  const cliInterface = readlinePromises.createInterface({
    input: standardInputReference,
    output: standardOutputReference,
  });

  return await TraceExecutionTime(
    ORCHESTRATOR_IDENTIFIER,
    'EXECUTE_INTERACTIVE_PURGE_SESSION' as OperationCode,
    correlationIdentifier,
    async (): Promise<void> => {
      try {
        console.warn('\n--- [ENTERPRISE MAINTENANCE]: LIMPIADOR DE EMISIONES ---');

        const rawDirectoryInputLiteral =
          optionsSnapshot?.targetDirectoryPathLiteral ??
          (await cliInterface.question(
            '\n📂 Ingrese la ruta relativa dentro del monorepo a purificar (ej: libs): ',
          ));

        const targetAbsolutePathLiteral =
          resolveValidatedTargetPathLiteral(rawDirectoryInputLiteral);

        if (!optionsSnapshot?.isConfirmationBypassedBoolean) {
          console.warn(`\n⚠️ Se purgarán emisiones huérfanas en: ${targetAbsolutePathLiteral}`);
          const confirmationLiteral = await cliInterface.question(
            '¿Confirmar acción de borrado? (s/n): ',
          );

          if (confirmationLiteral.trim().toLowerCase() !== 's') {
            console.warn('\n🚫 Operación abortada por el operador.\n');
            return;
          }
        }

        await ExecuteRecursiveEmissionsPurge(targetAbsolutePathLiteral, correlationIdentifier);

        console.warn('\n✅ LIMPIEZA COMPLETADA: El código fuente está purificado.\n');

        void EmitTelemetrySignal({
          occurrenceTimestampISO: new Date().toISOString(),
          severityLevelLiteral: 'INFO',
          moduleIdentifierLiteral: ORCHESTRATOR_IDENTIFIER,
          operationCodeLiteral: 'PURGE_SESSION_FINISHED' as OperationCode,
          correlationIdentifier,
          messageContentLiteral: 'Sesión de limpieza de artefactos finalizada con éxito.',
          semanticIntentTag: 'WORKSPACE_HYGIENE_INTERACTIVE',
          contextMetadataSnapshot: { targetAbsolutePathLiteral },
        });
      } catch (caughtExecutionError: unknown) {
        if (caughtExecutionError instanceof ValidationException) {
          throw caughtExecutionError;
        }

        const errorDescriptionLiteral =
          caughtExecutionError instanceof Error
            ? caughtExecutionError.message
            : String(caughtExecutionError);

        throw new InternalSystemException('FALLO_EN_ORQUESTADOR_DE_PURGA', {
          originalErrorLiteral: errorDescriptionLiteral,
          correlationIdentifier,
        });
      } finally {
        cliInterface.close();
      }
    },
  );
};
