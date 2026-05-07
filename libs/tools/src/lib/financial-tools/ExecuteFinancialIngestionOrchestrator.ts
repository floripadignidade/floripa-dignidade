/**
 * @section Tools Logic - Financial Ingestion CLI Orchestrator
 * @description Orquestador de interacción humana para la ingesta de datos.
 *
 * Protocolo OEDP-V17.0 - Swarm Intelligence & ISO Standard Naming.
 * SANEADO Zenith: Resolución de visibilidad de módulos Core y Engine.
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

import { InternalSystemException } from '@floripa-dignidade/exceptions';

/* 2. Motores de Negocio (Engines) */
import {
  ExtractWorkbookData,
  PersistFinancialLedgerToCloud,
} from '@floripa-dignidade/financial-ingestion-engine';

/** Identificador técnico del aparato para el Neural Sentinel. */
const TOOL_IDENTIFIER = 'FINANCIAL_INGESTION_CLI_TOOL';

/** @section ADN Lingüístico Local */
const CLI_DICTIONARY = {
  header: '\n--- [ZENITH SENTRY]: SISTEMA DE INGESTA FINANCIERA ---',
  prompts: {
    targetFilePath: '\n📄 Ingrese la ruta física del archivo Excel de presupuesto: ',
  },
  status: {
    analyzingDna: (fileName: string) => `\n🔍 Analizando integridad de ADN: ${fileName}...`,
    aduanaSuccess: (count: number) => `✅ Aduana Zod Superada: [${count}] registros purificados.`,
    transmitting: '☁️ Transmitiendo soberanía al Ledger de Transparencia...',
    finished: '\n--- [ZENITH SENTRY]: INGESTA CONSOLIDADA EXITOSAMENTE ---\n',
  },
  errors: {
    fileNotFound: (path: string) => `\n❌ ERROR_I/O: Archivo no identificado en: [${path}]`,
    fatalCollapse: (trace: string) => `[FATAL_TOOL_COLLAPSE]: Falla crítica: ${trace}`,
  }
} as const;

export const ExecuteFinancialIngestionOrchestrator = async (): Promise<void> => {
  const correlationIdentifier = GenerateCorrelationIdentifier();
  let rawPathInputLiteral = 'NOT_PROVIDED_YET';

  const cliInteractionInterface = readlinePromises.createInterface({
    input: standardInputReference,
    output: standardOutputReference
  });

  return await TraceExecutionTime(
    TOOL_IDENTIFIER,
    'EXECUTE_INTERACTIVE_INGESTION',
    correlationIdentifier,
    async () => {
      try {
        console.warn(CLI_DICTIONARY.header);

        // 1. CAPTURA (Human Interaction)
        const userInput = await cliInteractionInterface.question(CLI_DICTIONARY.prompts.targetFilePath);
        rawPathInputLiteral = userInput.trim();
        const absoluteFilePathLiteral = pathReference.resolve(process.cwd(), rawPathInputLiteral);

        // 2. ADUANA (I/O Sentry)
        if (!filesystemReference.existsSync(absoluteFilePathLiteral)) {
          throw new Error(`FILE_NOT_FOUND_AT_${absoluteFilePathLiteral}`);
        }

        // 3. PROCESAMIENTO (Delegación al Motor)
        console.warn(CLI_DICTIONARY.status.analyzingDna(pathReference.basename(absoluteFilePathLiteral)));

        const validatedRecordsCollection = await ExtractWorkbookData({
          absoluteFilePathLiteral,
          correlationIdentifier
        });

        console.warn(CLI_DICTIONARY.status.aduanaSuccess(validatedRecordsCollection.length));

        // 4. PERSISTENCIA (Cloud Transmission)
        console.warn(CLI_DICTIONARY.status.transmitting);
        await PersistFinancialLedgerToCloud([...validatedRecordsCollection], correlationIdentifier);

        // 5. REPORTE
        console.warn(CLI_DICTIONARY.status.finished);

        void EmitTelemetrySignal({
          severityLevelLiteral: 'INFO',
          moduleIdentifierLiteral: TOOL_IDENTIFIER,
          operationCodeLiteral: 'INGESTION_FINISHED_NOMINAL',
          correlationIdentifier,
          messageContentLiteral: 'Proceso de ingesta manual finalizado con éxito.'
        });

      } catch (caughtError: unknown) {
        const errorDescriptionLiteral = caughtError instanceof Error ? caughtError.message : String(caughtError);

        void EmitTelemetrySignal({
          severityLevelLiteral: 'CRITICAL',
          moduleIdentifierLiteral: TOOL_IDENTIFIER,
          operationCodeLiteral: 'INGESTION_TOOL_COLLAPSE',
          correlationIdentifier,
          messageContentLiteral: CLI_DICTIONARY.errors.fatalCollapse(errorDescriptionLiteral),
          contextMetadataSnapshot: { attemptedPath: rawPathInputLiteral }
        });

        throw new InternalSystemException('COLLAPSE_IN_FINANCIAL_TOOL', {
          originalError: errorDescriptionLiteral,
          inputPath: rawPathInputLiteral
        });
      } finally {
        cliInteractionInterface.close();
      }
    }
  );
};
