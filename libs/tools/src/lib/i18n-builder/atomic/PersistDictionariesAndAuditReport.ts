/**
 * @section Tools & Infrastructure - Dictionary & Audit Persistence Orchestrator (Atom)
 * @description Orquestador de persistencia lingüística del Weaver. Valida en frontera
 * la correlación y los diccionarios agregados, coordina secuencialmente la escritura de
 * diccionarios por idioma (`WriteLocaleDictionariesToDisk`) y del informe forense
 * (`WriteWeaverAuditReportToDisk`), bajo medición `TraceExecutionTime` y telemetría SRE.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Clean Paths).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa), ISO/IEC 25010 (Confiabilidad) e ISO/IEC 27001.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { z } from 'zod';

import { InternalSystemException, ValidationException } from '@floripa-dignidade/exceptions';
import {
  CorrelationIdentifierSchema,
  EmitTelemetrySignal,
  type ModuleIdentifier,
  type OperationCode,
  TraceExecutionTime,
} from '@floripa-dignidade/telemetry';

import {
  type IForensicAuditEntry,
  type ILinguisticModulePayload,
  type ILinguisticParityViolation,
  type IWeaverAuditReport,
  LinguisticModulePayloadSchema,
} from '../constants/WeaverConfiguration';
import { WriteLocaleDictionariesToDisk } from './WriteLocaleDictionariesToDisk';
import { WriteWeaverAuditReportToDisk } from './WriteWeaverAuditReportToDisk';

const PERSISTENCE_MODULE_IDENTIFIER = 'WEAVER_PERSISTENCE_ATOM' as ModuleIdentifier;

const PersistDictionariesInputSchema = z
  .object({
    correlationIdentifier: CorrelationIdentifierSchema,
    aggregatedLinguisticDictionaries: z.record(z.string(), LinguisticModulePayloadSchema),
  })
  .readonly();

/**
 * Persiste en disco los diccionarios compilados por idioma y el informe forense de auditoría.
 *
 * @param aggregatedLinguisticDictionaries - Diccionarios consolidados indexados por código BCP 47.
 * @param forensicAuditTrailCollection - Entradas de auditoría de todos los silos escaneados.
 * @param correlationIdentifier - Identificador UUID único de correlación para trazabilidad forense.
 * @param parityViolationsCollection - Divergencias de paridad o sintaxis detectadas (opcional).
 * @returns {Promise<IWeaverAuditReport>} Informe maestro validado y persistido en disco.
 * @throws {ValidationException} Si la correlación o la estructura de diccionarios son inválidas.
 * @throws {InternalSystemException} Si falla la escritura en el sistema de archivos.
 */
export const PersistDictionariesAndAuditReport = async (
  aggregatedLinguisticDictionaries: Readonly<Record<string, ILinguisticModulePayload>>,
  forensicAuditTrailCollection: readonly IForensicAuditEntry[],
  correlationIdentifier: string,
  parityViolationsCollection: readonly ILinguisticParityViolation[] = [],
): Promise<IWeaverAuditReport> => {
  const inputValidationResult = PersistDictionariesInputSchema.safeParse({
    correlationIdentifier,
    aggregatedLinguisticDictionaries,
  });

  if (!inputValidationResult.success) {
    throw new ValidationException('CONTRATO_PERSISTENCIA_DICCIONARIOS_INVALIDO', {
      validationIssuesCollection: inputValidationResult.error.flatten(),
    });
  }

  const {
    correlationIdentifier: validatedCorrelationIdentifier,
    aggregatedLinguisticDictionaries: validatedDictionariesSnapshot,
  } = inputValidationResult.data;

  return await TraceExecutionTime(
    PERSISTENCE_MODULE_IDENTIFIER,
    'PERSIST_DICTIONARIES_AND_AUDIT_REPORT' as OperationCode,
    validatedCorrelationIdentifier,
    async (): Promise<IWeaverAuditReport> => {
      try {
        const persistedLocalesCountQuantity = await WriteLocaleDictionariesToDisk(
          validatedDictionariesSnapshot,
        );

        const { reportSnapshot, reportFilePathLiteral } = await WriteWeaverAuditReportToDisk({
          correlationIdentifier: validatedCorrelationIdentifier,
          forensicAuditTrailCollection,
          parityViolationsCollection,
        });

        void EmitTelemetrySignal({
          occurrenceTimestampISO: new Date().toISOString(),
          severityLevelLiteral: reportSnapshot.isParityVerifiedBoolean ? 'INFO' : 'WARNING',
          moduleIdentifierLiteral: PERSISTENCE_MODULE_IDENTIFIER,
          operationCodeLiteral: 'DICTIONARIES_PERSISTED_NOMINAL' as OperationCode,
          correlationIdentifier: validatedCorrelationIdentifier,
          messageContentLiteral:
            'Diccionarios unificados y reporte de auditoría lingüística persistidos en disco.',
          semanticIntentTag: 'I18N_PERSISTENCE_SUCCESS',
          contextMetadataSnapshot: {
            totalLocalesPersistedQuantity: persistedLocalesCountQuantity,
            totalModulesProcessedQuantity: forensicAuditTrailCollection.length,
            isParityVerifiedBoolean: reportSnapshot.isParityVerifiedBoolean,
            parityViolationsCountQuantity: parityViolationsCollection.length,
            targetReportFilePathLiteral: reportFilePathLiteral,
          },
        });

        return reportSnapshot;
      } catch (caughtExecutionError: unknown) {
        if (caughtExecutionError instanceof ValidationException) {
          throw caughtExecutionError;
        }

        const errorDescriptionLiteral =
          caughtExecutionError instanceof Error
            ? caughtExecutionError.message
            : String(caughtExecutionError);

        void EmitTelemetrySignal({
          occurrenceTimestampISO: new Date().toISOString(),
          severityLevelLiteral: 'CRITICAL',
          moduleIdentifierLiteral: PERSISTENCE_MODULE_IDENTIFIER,
          operationCodeLiteral: 'DICTIONARY_PERSISTENCE_FAULT' as OperationCode,
          correlationIdentifier: validatedCorrelationIdentifier,
          messageContentLiteral: `Fallo crítico al persistir diccionarios en disco: ${errorDescriptionLiteral}`,
          semanticIntentTag: 'I18N_PERSISTENCE_FAULT',
          contextMetadataSnapshot: {
            errorTraceLiteral: errorDescriptionLiteral,
          },
        });

        throw new InternalSystemException('FALLO_EN_PERSISTENCIA_DE_DICCIONARIOS_I18N', {
          originalErrorLiteral: errorDescriptionLiteral,
          correlationIdentifier: validatedCorrelationIdentifier,
        });
      }
    },
  );
};
