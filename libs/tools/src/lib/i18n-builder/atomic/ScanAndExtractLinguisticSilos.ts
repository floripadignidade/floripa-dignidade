/**
 * @section Tools & Infrastructure - Scanning & Extraction Orchestrator (Atom)
 * @description Orquestador de descubrimiento y extracción de silos lingüísticos en `libs/`
 * y `apps/`. Valida la trazabilidad de entrada vía Zod, delega el rastreo y procesamiento
 * unitario concurrente en átomos puros, detecta colisiones de identificadores modulares y
 * consolida el artefacto final bajo `TraceExecutionTime`.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & ADR 0030).
 * Normas: BCP 47 (RFC 5646), ISO/IEC 11179, ISO/IEC 25010 e ISO/IEC 27001.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { z } from 'zod';

import { InternalSystemException, ValidationException } from '@floripa-dignidade/exceptions';
import {
  type CorrelationIdentifier,
  CorrelationIdentifierSchema,
  EmitTelemetrySignal,
  GenerateCorrelationIdentifier,
  type ModuleIdentifier,
  type OperationCode,
  TraceExecutionTime,
} from '@floripa-dignidade/telemetry';

import {
  type IForensicAuditEntry,
  type ILinguisticModulePayload,
  type ILinguisticParityViolation,
  WEAVER_CONFIGURATION,
} from '../constants/WeaverConfiguration';
import { DiscoverLinguisticSiloDirectories } from './DiscoverLinguisticSiloDirectories';
import {
  type IProcessedIndividualSiloResult,
  ProcessIndividualLinguisticSilo,
} from './ProcessIndividualLinguisticSilo';

type TMutableDictionaryCollection = Record<string, Record<string, Record<string, unknown>>>;

const ScanAndExtractParametersSchema = z
  .object({
    correlationIdentifier: CorrelationIdentifierSchema.describe(
      'Identificador UUID v4 sellado para trazabilidad forense del proceso de extracción.',
    ),
  })
  .readonly();

/**
 * @interface IExtractionResult
 * @description Contrato inmutable de salida con los diccionarios agregados, traza forense y paridad.
 */
export interface IExtractionResult {
  readonly aggregatedLinguisticDictionaries: Record<string, ILinguisticModulePayload>;
  readonly forensicAuditTrail: IForensicAuditEntry[];
  readonly parityViolationsCollection: readonly ILinguisticParityViolation[];
  readonly isParityVerifiedBoolean: boolean;
}

const mergeProcessedSiloOutcomeAction = (
  processedSiloSnapshot: IProcessedIndividualSiloResult,
  aggregatedLinguisticDictionaries: TMutableDictionaryCollection,
  seenModuleIdentifiersMap: Map<string, string>,
  correlationIdentifier: CorrelationIdentifier,
): void => {
  const { moduleIdentifierLiteral, siloDirectoryPathLiteral, dictionariesByLocaleMapping } =
    processedSiloSnapshot;

  const previousSiloPathLiteral = seenModuleIdentifiersMap.get(moduleIdentifierLiteral);
  const hasModuleCollisionBoolean = previousSiloPathLiteral !== undefined;

  if (hasModuleCollisionBoolean) {
    void EmitTelemetrySignal({
      occurrenceTimestampISO: new Date().toISOString(),
      severityLevelLiteral: 'WARNING',
      moduleIdentifierLiteral:
        WEAVER_CONFIGURATION.WEAVER_ENGINE_IDENTIFIER_LITERAL as ModuleIdentifier,
      operationCodeLiteral: 'DUPLICATE_SILO_IDENTIFIER_DETECTED' as OperationCode,
      correlationIdentifier,
      messageContentLiteral: `Colisión de identificador lingüístico detectada para [${moduleIdentifierLiteral}].`,
      semanticIntentTag: 'I18N_IDENTIFIER_COLLISION',
      contextMetadataSnapshot: {
        moduleIdentifierLiteral,
        previousSiloPathLiteral,
        overwritingSiloPathLiteral: siloDirectoryPathLiteral,
      },
    });
  }

  seenModuleIdentifiersMap.set(moduleIdentifierLiteral, siloDirectoryPathLiteral);

  for (const [localeCodeLiteral, moduleDictionary] of Object.entries(dictionariesByLocaleMapping)) {
    const targetLocaleContainer = aggregatedLinguisticDictionaries[localeCodeLiteral];
    if (targetLocaleContainer !== undefined) {
      targetLocaleContainer[moduleIdentifierLiteral] = moduleDictionary;
    }
  }
};

/**
 * Escanea concurrentemente `libs/` y `apps/`, consolida diccionarios y audita paridad lingüística.
 *
 * @param correlationIdentifierInput - Identificador UUID de correlación para trazabilidad forense.
 * @returns {Promise<IExtractionResult>} Diccionarios compilados, auditoría y violaciones de paridad.
 * @throws {ValidationException} Si el identificador de correlación no cumple el formato UUID v4.
 * @throws {InternalSystemException} Si ocurre un fallo inesperado de lectura o consolidación.
 */
export const ScanAndExtractLinguisticSilos = async (
  correlationIdentifierInput: string = GenerateCorrelationIdentifier(),
): Promise<IExtractionResult> => {
  const validationResult = ScanAndExtractParametersSchema.safeParse({
    correlationIdentifier: correlationIdentifierInput,
  });

  if (!validationResult.success) {
    throw new ValidationException('IDENTIFICADOR_CORRELACION_WEAVER_INVALIDO', {
      validationIssuesCollection: validationResult.error.flatten(),
    });
  }

  const { correlationIdentifier } = validationResult.data;
  const weaverEngineIdentifierLiteral =
    WEAVER_CONFIGURATION.WEAVER_ENGINE_IDENTIFIER_LITERAL as ModuleIdentifier;

  return await TraceExecutionTime(
    weaverEngineIdentifierLiteral,
    'SCAN_AND_EXTRACT_LINGUISTIC_SILOS' as OperationCode,
    correlationIdentifier,
    async (): Promise<IExtractionResult> => {
      try {
        const aggregatedLinguisticDictionaries: TMutableDictionaryCollection = Object.fromEntries(
          WEAVER_CONFIGURATION.SUPPORTED_LOCALES_COLLECTION.map((localeCodeLiteral: string) => [
            localeCodeLiteral,
            {},
          ]),
        );

        const forensicAuditTrailCollection: IForensicAuditEntry[] = [];
        const parityViolationsCollection: ILinguisticParityViolation[] = [];
        const seenModuleIdentifiersMap = new Map<string, string>();

        for (const scanRootConfiguration of WEAVER_CONFIGURATION.SCAN_ROOT_DIRECTORIES_COLLECTION) {
          const discoveredSiloPathsCollection = await DiscoverLinguisticSiloDirectories(
            scanRootConfiguration.rootDirectoryPathLiteral,
          );

          const processedSilosCollection = await Promise.all(
            discoveredSiloPathsCollection.map((siloDirectoryPathLiteral) =>
              ProcessIndividualLinguisticSilo({
                scopePrefixLiteral: scanRootConfiguration.scopePrefixLiteral,
                rootDirectoryPathLiteral: scanRootConfiguration.rootDirectoryPathLiteral,
                siloDirectoryPathLiteral,
                correlationIdentifier,
              }),
            ),
          );

          for (const processedSiloSnapshot of processedSilosCollection) {
            mergeProcessedSiloOutcomeAction(
              processedSiloSnapshot,
              aggregatedLinguisticDictionaries,
              seenModuleIdentifiersMap,
              correlationIdentifier,
            );
            forensicAuditTrailCollection.push(processedSiloSnapshot.auditEntrySnapshot);
            parityViolationsCollection.push(...processedSiloSnapshot.violationsCollection);
          }
        }

        return Object.freeze({
          aggregatedLinguisticDictionaries: aggregatedLinguisticDictionaries as Record<
            string,
            ILinguisticModulePayload
          >,
          forensicAuditTrail: forensicAuditTrailCollection,
          parityViolationsCollection: Object.freeze(parityViolationsCollection),
          isParityVerifiedBoolean: parityViolationsCollection.length === 0,
        });
      } catch (caughtExecutionError: unknown) {
        if (caughtExecutionError instanceof ValidationException) {
          throw caughtExecutionError;
        }

        const errorDescriptionLiteral =
          caughtExecutionError instanceof Error
            ? caughtExecutionError.message
            : String(caughtExecutionError);

        throw new InternalSystemException('FALLO_EN_EXTRACCION_DE_SILOS_LINGUISTICOS', {
          originalErrorLiteral: errorDescriptionLiteral,
          correlationIdentifier,
        });
      }
    },
  );
};
