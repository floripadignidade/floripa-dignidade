/**
 * @section Scripts - Rogue Emissions Purge Trigger
 * @description Punto de entrada CLI para la limpieza de artefactos de compilación
 * huérfanos (.js, .d.ts, .map, .tsbuildinfo). Soporta ejecución automatizada no-interactiva
 * para pipelines de Vercel/CI/Husky (--ci, --yes o CI=true) y modo interactivo manual,
 * delegando la lógica en @floripa-dignidade/tools (ADR 0003).
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Trigger Pattern).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa), ISO/IEC 25010 (Confiabilidad) y ADR 0027.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import process from 'node:process';

/* 1. Infraestructura Core de Telemetría */
import {
  EmitTelemetrySignal,
  GenerateCorrelationIdentifier,
  type ModuleIdentifier,
  type OperationCode,
} from '@floripa-dignidade/telemetry';

/* 2. Búnker de Herramientas Institucional */
import { ExecutePurgeOrchestrator, ExecuteRecursiveEmissionsPurge } from '@floripa-dignidade/tools';

/** Identificador técnico del disparador para el monitor de salud y telemetría forense. */
const TRIGGER_MODULE_IDENTIFIER = 'ROGUE_EMISSIONS_PURGE_CLI_TRIGGER' as ModuleIdentifier;

/**
 * Determina si la ejecución debe correr en modo automatizado no-interactivo.
 */
const determineNonInteractiveModeBoolean = (
  commandArgumentsCollection: readonly string[],
): boolean => {
  const hasCiFlagBoolean = commandArgumentsCollection.includes('--ci');
  const hasYesFlagBoolean =
    commandArgumentsCollection.includes('--yes') || commandArgumentsCollection.includes('-y');
  const isCiEnvironmentBoolean = process.env['CI'] === 'true';

  return hasCiFlagBoolean || hasYesFlagBoolean || isCiEnvironmentBoolean;
};

/**
 * Inicia la secuencia de limpieza institucional delegando según el modo de ejecución.
 * Implementa captura de colapsos y emisión telemétrica forense conforme a ISO/IEC 11179.
 *
 * @returns {Promise<void>} Finaliza el proceso con código 0 (nominal) o 1 (fallo).
 */
const executeTriggerAction = async (): Promise<void> => {
  const correlationIdentifier = GenerateCorrelationIdentifier();
  const isNonInteractiveModeBoolean = determineNonInteractiveModeBoolean(process.argv.slice(2));

  try {
    if (isNonInteractiveModeBoolean) {
      const targetLibrariesDirectoryPathLiteral = resolve(process.cwd(), 'libs');

      console.warn(
        '\n--- [ZENITH SENTRY]: PURGA NO-INTERACTIVA DE EMISIONES EN LIBS/ (CI/PREFLIGHT) ---',
      );

      if (existsSync(targetLibrariesDirectoryPathLiteral)) {
        await ExecuteRecursiveEmissionsPurge(
          targetLibrariesDirectoryPathLiteral,
          correlationIdentifier,
        );
      }

      void EmitTelemetrySignal({
        occurrenceTimestampISO: new Date().toISOString(),
        severityLevelLiteral: 'INFO',
        moduleIdentifierLiteral: TRIGGER_MODULE_IDENTIFIER,
        operationCodeLiteral: 'AUTOMATED_PURGE_COMPLETED' as OperationCode,
        correlationIdentifier,
        messageContentLiteral:
          'Purga no-interactiva de artefactos huérfanos en libs/ completada nominalmente.',
        semanticIntentTag: 'CI_WORKSPACE_HYGIENE',
        contextMetadataSnapshot: {
          targetDirectoryLiteral: targetLibrariesDirectoryPathLiteral,
          executionModeLiteral: 'NON_INTERACTIVE',
        },
      });

      console.warn('--- [ZENITH SENTRY]: HIGIENE SOURCE-FIRST DE LIBS/ VERIFICADA ---\n');
      process.exit(0);
    }

    await ExecutePurgeOrchestrator();
    process.exit(0);
  } catch (caughtError: unknown) {
    const errorDescriptionLiteral =
      caughtError instanceof Error ? caughtError.message : String(caughtError);

    void EmitTelemetrySignal({
      occurrenceTimestampISO: new Date().toISOString(),
      severityLevelLiteral: 'CRITICAL',
      moduleIdentifierLiteral: TRIGGER_MODULE_IDENTIFIER,
      operationCodeLiteral: 'PURGE_TRIGGER_FAILURE' as OperationCode,
      correlationIdentifier,
      messageContentLiteral: `Fallo en el disparador de purga de emisiones: ${errorDescriptionLiteral}`,
      semanticIntentTag: 'CLI_TOOL_FAULT',
      contextMetadataSnapshot: {
        isNonInteractiveModeBoolean,
        errorDescriptionLiteral,
      },
    });

    console.error(
      `[CRITICAL_INFRASTRUCTURE_FAILURE]: Purga de emisiones interrumpida. Rastro: ${errorDescriptionLiteral}`,
    );
    process.exit(1);
  }
};

/** Disparo determinista con contención de promesa flotante */
void executeTriggerAction();
