/**
 * @section Tools & Infrastructure - Internationalization Dictionary Weaver Orchestrator
 * @description Orquestador maestro del pipeline de consolidación lingüística (ADR 0030).
 * Coordina la validación opcional de parámetros, higiene previa de emisiones huérfanas,
 * inicialización de directorios con propagación de correlación, escaneo concurrente de
 * silos en `libs/` y `apps/`, persistencia de diccionarios/reporte forense y verificación
 * Fail-Fast configurable de paridad lingüística.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Clean Paths).
 * Normas: BCP 47 (RFC 5646), ISO/IEC 11179, ISO/IEC 25010 e ISO/IEC 27001.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { z } from 'zod';

import {
  GlobalBaseException,
  InternalSystemException,
  ValidationException,
} from '@floripa-dignidade/exceptions';
import {
  type CorrelationIdentifier,
  CorrelationIdentifierSchema,
  EmitTelemetrySignal,
  GenerateCorrelationIdentifier,
  type ModuleIdentifier,
  type OperationCode,
  TraceExecutionTime,
} from '@floripa-dignidade/telemetry';

import { type IWeaverAuditReport, WEAVER_CONFIGURATION } from './constants/WeaverConfiguration';
import { InitializeWeaverInfrastructure } from './atomic/InitializeWeaverInfrastructure';
import { PersistDictionariesAndAuditReport } from './atomic/PersistDictionariesAndAuditReport';
import { ScanAndExtractLinguisticSilos } from './atomic/ScanAndExtractLinguisticSilos';
import { ExecuteRecursiveEmissionsPurge } from '../maintenance-tools/ExecuteRecursiveEmissionsPurge';

/**
 * @name BuildDictionariesOptionsSchema
 * @description Aduana Zod para configurar la ejecución del compilador lingüístico Weaver.
 */
export const BuildDictionariesOptionsSchema = z
  .object({
    isFailFastOnParityViolationBoolean: z
      .boolean()
      .default(false)
      .describe(
        'Cuando es verdadero, aborta el pipeline si faltan claves o archivos respecto al idioma fuente.',
      ),
    correlationIdentifier: CorrelationIdentifierSchema.optional().describe(
      'Identificador UUID v4 opcional para enlazar la compilación con un pipeline superior.',
    ),
  })
  .readonly();

export type IBuildDictionariesOptions = z.input<typeof BuildDictionariesOptionsSchema>;

const evaluateParityVerdictAction = (
  auditReportSnapshot: IWeaverAuditReport,
  isFailFastOnParityViolationBoolean: boolean,
  weaverEngineIdentifierLiteral: ModuleIdentifier,
  correlationIdentifier: CorrelationIdentifier,
): void => {
  if (auditReportSnapshot.isParityVerifiedBoolean) {
    return;
  }

  const violationsCountQuantity = auditReportSnapshot.parityViolationsCollection.length;

  void EmitTelemetrySignal({
    occurrenceTimestampISO: new Date().toISOString(),
    severityLevelLiteral: isFailFastOnParityViolationBoolean ? 'CRITICAL' : 'WARNING',
    moduleIdentifierLiteral: weaverEngineIdentifierLiteral,
    operationCodeLiteral: 'WEAVER_PARITY_VIOLATIONS_DETECTED' as OperationCode,
    correlationIdentifier,
    messageContentLiteral: `Auditoría de paridad detectó [${violationsCountQuantity}] inconsistencias frente a [${auditReportSnapshot.sourceLocaleIdentifier}].`,
    semanticIntentTag: 'I18N_PARITY_VIOLATION',
    contextMetadataSnapshot: {
      isFailFastOnParityViolationBoolean,
      violationsCountQuantity,
      parityViolationsCollection: auditReportSnapshot.parityViolationsCollection,
    },
  });

  if (isFailFastOnParityViolationBoolean) {
    throw new ValidationException('VIOLACION_DE_PARIDAD_LINGUISTICA_I18N', {
      sourceLocaleIdentifier: auditReportSnapshot.sourceLocaleIdentifier,
      violationsCountQuantity,
      parityViolationsCollection: auditReportSnapshot.parityViolationsCollection,
      correlationIdentifier,
    });
  }
};

/**
 * Ejecuta el pipeline integral de compilación y consolidación de diccionarios multilingües.
 *
 * @param rawOptionsSnapshot - Opciones opcionales de compilación (ej. modo Fail-Fast estricto).
 * @returns {Promise<IWeaverAuditReport>} Reporte maestro validado y persistido en disco.
 * @throws {ValidationException} Si las opciones son inválidas o falla la paridad en modo Fail-Fast.
 * @throws {InternalSystemException} Si cualquier fase de I/O sufre un colapso irrecuperable.
 */
export const BuildInternationalizationDictionaries = async (
  rawOptionsSnapshot: IBuildDictionariesOptions = {},
): Promise<IWeaverAuditReport> => {
  const optionsValidationResult = BuildDictionariesOptionsSchema.safeParse(rawOptionsSnapshot);

  if (!optionsValidationResult.success) {
    throw new ValidationException('OPCIONES_DE_COMPILACION_WEAVER_INVALIDAS', {
      validationIssuesCollection: optionsValidationResult.error.flatten(),
    });
  }

  const {
    isFailFastOnParityViolationBoolean,
    correlationIdentifier = GenerateCorrelationIdentifier(),
  } = optionsValidationResult.data;

  const weaverEngineIdentifierLiteral =
    WEAVER_CONFIGURATION.WEAVER_ENGINE_IDENTIFIER_LITERAL as ModuleIdentifier;

  return await TraceExecutionTime(
    weaverEngineIdentifierLiteral,
    'DICTIONARY_CONSOLIDATION_PIPELINE' as OperationCode,
    correlationIdentifier,
    async (): Promise<IWeaverAuditReport> => {
      try {
        await ExecuteRecursiveEmissionsPurge(
          WEAVER_CONFIGURATION.TARGET_OUTPUT_DIRECTORY_LITERAL,
          correlationIdentifier,
        );

        await InitializeWeaverInfrastructure(correlationIdentifier);

        const extractionResultSnapshot = await ScanAndExtractLinguisticSilos(correlationIdentifier);

        const auditReportSnapshot = await PersistDictionariesAndAuditReport(
          extractionResultSnapshot.aggregatedLinguisticDictionaries,
          extractionResultSnapshot.forensicAuditTrail,
          correlationIdentifier,
          extractionResultSnapshot.parityViolationsCollection,
        );

        evaluateParityVerdictAction(
          auditReportSnapshot,
          isFailFastOnParityViolationBoolean,
          weaverEngineIdentifierLiteral,
          correlationIdentifier,
        );

        void EmitTelemetrySignal({
          occurrenceTimestampISO: new Date().toISOString(),
          severityLevelLiteral: 'INFO',
          moduleIdentifierLiteral: weaverEngineIdentifierLiteral,
          operationCodeLiteral: 'WEAVER_PIPELINE_NOMINAL_SUCCESS' as OperationCode,
          correlationIdentifier,
          messageContentLiteral:
            'Consolidación lingüística finalizada: Diccionarios unificados y sincronizados.',
          semanticIntentTag: 'I18N_COMPILATION_COMPLETE',
          contextMetadataSnapshot: {
            processedModulesQuantity: auditReportSnapshot.totalModulesProcessedQuantity,
            isParityVerifiedBoolean: auditReportSnapshot.isParityVerifiedBoolean,
            targetPathLiteral: WEAVER_CONFIGURATION.TARGET_OUTPUT_DIRECTORY_LITERAL,
          },
        });

        return auditReportSnapshot;
      } catch (caughtExecutionError: unknown) {
        if (caughtExecutionError instanceof GlobalBaseException) {
          throw caughtExecutionError;
        }

        const errorDescriptionLiteral =
          caughtExecutionError instanceof Error
            ? caughtExecutionError.message
            : String(caughtExecutionError);

        void EmitTelemetrySignal({
          occurrenceTimestampISO: new Date().toISOString(),
          severityLevelLiteral: 'CRITICAL',
          moduleIdentifierLiteral: weaverEngineIdentifierLiteral,
          operationCodeLiteral: 'WEAVER_PIPELINE_CRITICAL_FAULT' as OperationCode,
          correlationIdentifier,
          messageContentLiteral: `Fallo catastrófico en el compilador de diccionarios: ${errorDescriptionLiteral}`,
          semanticIntentTag: 'I18N_COMPILATION_FAULT',
          contextMetadataSnapshot: {
            errorTraceLiteral: errorDescriptionLiteral,
          },
        });

        throw new InternalSystemException('FALLO_EN_PIPELINE_DE_COMPILACION_I18N', {
          originalErrorLiteral: errorDescriptionLiteral,
          correlationIdentifier,
        });
      }
    },
  );
};

/**
 * @name InternationalizationDictionaryBuilder
 * @description Alias institucional de compatibilidad histórica para disparadores CLI y scripts.
 */
export const InternationalizationDictionaryBuilder = BuildInternationalizationDictionaries;
