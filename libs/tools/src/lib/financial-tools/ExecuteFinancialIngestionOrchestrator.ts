/**
 * @section Tools Logic - Financial Ingestion CLI Orchestrator
 * @description Orquestador de interacción humana encargado de disparar la ingesta
 * de presupuestos institucionales. Gestiona el ciclo de vida de la consola,
 * valida rutas físicas y vincula la operación con el rastro de telemetría.
 *
 * Protocolo OEDP-V17.0 - Swarm Intelligence & ISO Technical Naming.
 * SANEADO Zenith: Erradicación absoluta de 'any' y sincronización de contratos inmutables.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import * as filesystemReference from 'node:fs';
import * as pathReference from 'node:path';
import * as readlinePromises from 'node:readline/promises';
import { stdin as standardInputReference, stdout as standardOutputReference } from 'node:process';

/* 1. Infraestructura Core (Atmos PascalCase) */
import {
  EmitTelemetrySignal,
  GenerateCorrelationIdentifier,
  TraceExecutionTime,
} from '@floripa-dignidade/telemetry';

import {
  InternalSystemException,
  ValidationException
} from '@floripa-dignidade/exceptions';

/* 2. Motores de Negocio (Engines) */
import {
  ExtractWorkbookData,
  PersistFinancialLedgerToCloud,
} from '@floripa-dignidade/financial-ingestion-engine';

/** Identificador técnico del aparato para el Neural Sentinel. */
const TOOL_IDENTIFIER = 'FINANCIAL_INGESTION_CLI_TOOL';

/**
 * @section ADN Lingüístico Local
 */
const CLI_DICTIONARY = {
  headerLiteral: '\n--- [ZENITH SENTRY]: SISTEMA DE INGESTA FINANCIERA ---',
  prompts: {
    targetFilePathLiteral: '\n📄 Ingrese la ruta física del archivo Excel de presupuesto: ',
  },
  status: {
    analyzingDnaLiteral: (fileName: string) => `\n🔍 Analizando integridad de ADN: ${fileName}...`,
    aduanaSuccessLiteral: (recordsQuantity: number) =>
      `✅ Aduana Zod Superada: [${recordsQuantity}] registros purificados.`,
    transmittingToCloudLiteral: '☁️ Transmitiendo soberanía al Ledger de Transparencia...',
    executionFinishedLiteral: '\n--- [ZENITH SENTRY]: INGESTA CONSOLIDADA EXITOSAMENTE ---\n',
  },
  errors: {
    fileNotFoundLiteral: (path: string) => `\n❌ ERROR_I/O: Archivo no identificado en: [${path}]`,
    fatalCollapseLiteral: (errorTraceLiteral: string) =>
      `[FATAL_TOOL_COLLAPSE]: Falla crítica: ${errorTraceLiteral}`,
  }
} as const;

/**
 * Ejecuta el flujo interactivo de ingesta de datos financieros.
 * Implementa un patrón de cierre seguro de interfaz para evitar fugas de recursos.
 *
 * @returns {Promise<void>}
 */
export const ExecuteFinancialIngestionOrchestrator = async (): Promise<void> => {
  const correlationIdentifier = GenerateCorrelationIdentifier();
  let rawPathInputLiteral = 'PENDING_INPUT';

  const cliInteractionInterface = readlinePromises.createInterface({
    input: standardInputReference,
    output: standardOutputReference
  });

  return await TraceExecutionTime(
    TOOL_IDENTIFIER,
    'EXECUTE_INTERACTIVE_INGESTION_FLOW',
    correlationIdentifier,
    async () => {
      try {
        console.warn(CLI_DICTIONARY.headerLiteral);

        // 1. CAPTURA DE INTENCIÓN (Human-in-the-loop)
        const userInputLiteral = await cliInteractionInterface.question(
          CLI_DICTIONARY.prompts.targetFilePathLiteral
        );
        rawPathInputLiteral = userInputLiteral.trim();

        const absoluteFilePathLiteral = pathReference.resolve(process.cwd(), rawPathInputLiteral);

        // 2. ADUANA DE HARDWARE (I/O Sentry)
        if (!filesystemReference.existsSync(absoluteFilePathLiteral)) {
          throw new ValidationException('ARCHIVO_FINANCIERO_NO_ENCONTRADO', {
            attemptedPathLiteral: absoluteFilePathLiteral
          });
        }

        // 3. PROCESAMIENTO TÉCNICO (Delegación al Engine)
        console.warn(
          CLI_DICTIONARY.status.analyzingDnaLiteral(pathReference.basename(absoluteFilePathLiteral))
        );

        const validatedRecordsCollection = await ExtractWorkbookData({
          absoluteFilePathLiteral,
          correlationIdentifier
        });

        console.warn(
          CLI_DICTIONARY.status.aduanaSuccessLiteral(validatedRecordsCollection.length)
        );

        // 4. PERSISTENCIA INMUTABLE (Cloud Ledger Synchronization)
        console.warn(CLI_DICTIONARY.status.transmittingToCloudLiteral);

        /**
         * 🛡️ SANEADO Zenith: ERRADICACIÓN DE 'any'.
         * Gracias a la nivelación de la firma en 'PersistFinancialLedgerToCloud',
         * el flujo de datos inmutables es ahora 100% Type-Safe.
         */
        await PersistFinancialLedgerToCloud(
          validatedRecordsCollection,
          correlationIdentifier
        );

        // 5. REPORTE DE FINALIZACIÓN
        console.warn(CLI_DICTIONARY.status.executionFinishedLiteral);

        void EmitTelemetrySignal({
          severityLevelLiteral: 'INFO',
          moduleIdentifierLiteral: TOOL_IDENTIFIER,
          operationCodeLiteral: 'INGESTION_TOOL_NOMINAL_SUCCESS',
          correlationIdentifier,
          messageContentLiteral: 'Proceso de ingesta manual finalizado con precisión industrial.'
        });

      } catch (caughtError: unknown) {
        const isUserFaultBoolean = caughtError instanceof ValidationException;
        const errorDescriptionLiteral = caughtError instanceof Error
          ? caughtError.message
          : String(caughtError);

        if (isUserFaultBoolean) {
          console.error(CLI_DICTIONARY.errors.fileNotFoundLiteral(rawPathInputLiteral));
        } else {
          console.error(CLI_DICTIONARY.errors.fatalCollapseLiteral(errorDescriptionLiteral));
        }

        void EmitTelemetrySignal({
          severityLevelLiteral: isUserFaultBoolean ? 'WARNING' : 'CRITICAL',
          moduleIdentifierLiteral: TOOL_IDENTIFIER,
          operationCodeLiteral: 'INGESTION_TOOL_FAULT',
          correlationIdentifier,
          messageContentLiteral: `Fallo en herramienta de ingesta: ${errorDescriptionLiteral}`,
          contextMetadataSnapshot: { attemptedPath: rawPathInputLiteral }
        });

        if (caughtError instanceof ValidationException || caughtError instanceof InternalSystemException) {
          throw caughtError;
        }

        throw new InternalSystemException('COLLAPSE_IN_FINANCIAL_TOOL', {
          originalErrorLiteral: errorDescriptionLiteral,
          inputPathLiteral: rawPathInputLiteral
        });

      } finally {
        cliInteractionInterface.close();
      }
    }
  );
};
