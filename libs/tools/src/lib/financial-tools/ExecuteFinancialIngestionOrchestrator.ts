/**
 * @section Tools Logic - Financial Ingestion CLI Orchestrator
 * @description Orquestador de interacción humana encargado de coordinar la ingesta
 * interactiva de presupuestos institucionales. Gestiona el ciclo de vida de la consola,
 * valida rutas físicas y delega la ejecución al motor financiero mediante importación
 * dinámica bajo demanda (Lazy Import), erradicando el acoplamiento parásito en el arranque.
 *
 * Protocolo OEDP-V18.1 - Swarm Intelligence & ISO Technical Naming.
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa) e ISO/IEC 25010 (Modularidad y Rendimiento).
 * SANEADO Zenith: Desacoplamiento estático del motor financiero para blindar el arranque
 * de herramientas independientes (I18n Weaver, Auditores de Build y Purgadores).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import * as filesystemReference from 'node:fs';
import * as pathReference from 'node:path';
import * as readlinePromises from 'node:readline/promises';
import { stdin as standardInputReference, stdout as standardOutputReference } from 'node:process';

/* 1. Infraestructura Core de Telemetría y Excepciones */
import {
  EmitTelemetrySignal,
  GenerateCorrelationIdentifier,
  TraceExecutionTime,
} from '@floripa-dignidade/telemetry';

import { InternalSystemException, ValidationException } from '@floripa-dignidade/exceptions';

/** Identificador técnico del aparato para el monitor de salud y telemetría forense. */
const TOOL_IDENTIFIER = 'FINANCIAL_INGESTION_CLI_TOOL';

/**
 * @section ADN Lingüístico Local
 * Definición inmutable de los mensajes emitidos hacia la consola del operador.
 */
const CLI_DICTIONARY = {
  headerLiteral: '\n--- [ZENITH SENTRY]: SISTEMA DE INGESTA FINANCIERA ---',
  prompts: {
    targetFilePathLiteral: '\n📄 Ingrese la ruta física del archivo Excel de presupuesto: ',
  },
  status: {
    analyzingDnaLiteral: (fileNameLiteral: string) =>
      `\n🔍 Analizando integridad de ADN: ${fileNameLiteral}...`,
    aduanaSuccessLiteral: (recordsQuantityNumeric: number) =>
      `✅ Aduana Zod Superada: [${recordsQuantityNumeric}] registros purificados.`,
    transmittingToCloudLiteral: '☁️ Transmitiendo soberanía al Ledger de Transparencia...',
    executionFinishedLiteral: '\n--- [ZENITH SENTRY]: INGESTA CONSOLIDADA EXITOSAMENTE ---\n',
  },
  errors: {
    fileNotFoundLiteral: (targetPathLiteral: string) =>
      `\n❌ ERROR_I/O: Archivo no identificado en: [${targetPathLiteral}]`,
    fatalCollapseLiteral: (errorTraceLiteral: string) =>
      `[FATAL_TOOL_COLLAPSE]: Falla crítica: ${errorTraceLiteral}`,
  },
} as const;

/**
 * Ejecuta el flujo interactivo de ingesta de datos presupuestarios en consola.
 * Implementa el patrón de cierre seguro de interfaz y desacoplamiento de dependencias pesadas.
 *
 * @returns {Promise<void>} Promesa que resuelve nominalmente al finalizar la interacción.
 * @throws {ValidationException} Si el archivo objetivo no existe en el sistema de archivos.
 * @throws {InternalSystemException} Si ocurre un colapso en el motor de extracción o persistencia.
 */
export const ExecuteFinancialIngestionOrchestrator = async (): Promise<void> => {
  const correlationIdentifier = GenerateCorrelationIdentifier();
  let rawPathInputLiteral = 'PENDING_INPUT';

  const cliInteractionInterface = readlinePromises.createInterface({
    input: standardInputReference,
    output: standardOutputReference,
  });

  return await TraceExecutionTime(
    TOOL_IDENTIFIER,
    'EXECUTE_INTERACTIVE_INGESTION_FLOW',
    correlationIdentifier,
    async () => {
      try {
        console.warn(CLI_DICTIONARY.headerLiteral);

        // 1. CAPTURA DE INTENCIÓN (Interacción Humana)
        const userInputLiteral = await cliInteractionInterface.question(
          CLI_DICTIONARY.prompts.targetFilePathLiteral,
        );
        rawPathInputLiteral = userInputLiteral.trim();

        const absoluteFilePathLiteral = pathReference.resolve(process.cwd(), rawPathInputLiteral);

        // 2. AUDITORÍA DE HARDWARE (Sensor I/O de Existencia Física)
        if (!filesystemReference.existsSync(absoluteFilePathLiteral)) {
          throw new ValidationException('ARCHIVO_FINANCIERO_NO_ENCONTRADO', {
            attemptedPathLiteral: absoluteFilePathLiteral,
          });
        }

        // 3. PROCESAMIENTO TÉCNICO (Carga Dinámica Bajo Demanda)
        console.warn(
          CLI_DICTIONARY.status.analyzingDnaLiteral(
            pathReference.basename(absoluteFilePathLiteral),
          ),
        );

        /**
         * 🛡️ LEY DE DESACOPLAMIENTO SRE:
         * El motor de extracción y la librería de Excel solo se importan en memoria
         * si el operador ha confirmado físicamente la existencia de la ruta.
         */
        const { ExtractWorkbookData, PersistFinancialLedgerToCloud } = await import(
          '@floripa-dignidade/financial-ingestion-engine'
        );

        const validatedRecordsCollection = await ExtractWorkbookData({
          absoluteFilePathLiteral,
          correlationIdentifier,
        });

        console.warn(CLI_DICTIONARY.status.aduanaSuccessLiteral(validatedRecordsCollection.length));

        // 4. PERSISTENCIA INMUTABLE (Sincronización con el Ledger Cloud)
        console.warn(CLI_DICTIONARY.status.transmittingToCloudLiteral);

        await PersistFinancialLedgerToCloud(validatedRecordsCollection, correlationIdentifier);

        // 5. REPORTE DE FINALIZACIÓN Y TRAZABILIDAD SRE
        console.warn(CLI_DICTIONARY.status.executionFinishedLiteral);

        void EmitTelemetrySignal({
          occurrenceTimestampISO: new Date().toISOString(),
          severityLevelLiteral: 'INFO',
          moduleIdentifierLiteral: TOOL_IDENTIFIER,
          operationCodeLiteral: 'INGESTION_TOOL_NOMINAL_SUCCESS',
          correlationIdentifier,
          messageContentLiteral: 'Proceso de ingesta manual finalizado con precisión industrial.',
          semanticIntentTag: 'FINANCIAL_MANUAL_INGESTION_COMPLETE',
        });
      } catch (caughtError: unknown) {
        const isUserFaultBoolean = caughtError instanceof ValidationException;
        const errorDescriptionLiteral =
          caughtError instanceof Error ? caughtError.message : String(caughtError);

        if (isUserFaultBoolean) {
          console.error(CLI_DICTIONARY.errors.fileNotFoundLiteral(rawPathInputLiteral));
        } else {
          console.error(CLI_DICTIONARY.errors.fatalCollapseLiteral(errorDescriptionLiteral));
        }

        void EmitTelemetrySignal({
          occurrenceTimestampISO: new Date().toISOString(),
          severityLevelLiteral: isUserFaultBoolean ? 'WARNING' : 'CRITICAL',
          moduleIdentifierLiteral: TOOL_IDENTIFIER,
          operationCodeLiteral: 'INGESTION_TOOL_FAULT',
          correlationIdentifier,
          messageContentLiteral: `Fallo en herramienta de ingesta: ${errorDescriptionLiteral}`,
          semanticIntentTag: 'CLI_TOOL_FAULT',
          contextMetadataSnapshot: { attemptedPath: rawPathInputLiteral },
        });

        if (
          caughtError instanceof ValidationException ||
          caughtError instanceof InternalSystemException
        ) {
          throw caughtError;
        }

        throw new InternalSystemException('COLLAPSE_IN_FINANCIAL_TOOL', {
          originalErrorLiteral: errorDescriptionLiteral,
          inputPathLiteral: rawPathInputLiteral,
        });
      } finally {
        cliInteractionInterface.close();
      }
    },
  );
};
