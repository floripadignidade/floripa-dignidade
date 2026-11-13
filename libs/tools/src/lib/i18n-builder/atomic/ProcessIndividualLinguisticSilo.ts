/**
 * @section Tools & Infrastructure - Individual Linguistic Silo Processor (Atom)
 * @description Átomo encargado de procesar un único silo `i18n`: valida los parámetros
 * de entrada, resuelve su identificador semántico, extrae sus diccionarios (formato
 * ADR 0030 por carpeta de idioma o archivo plano legado), audita la paridad exacta por
 * namespace frente al idioma fuente y emite la señal de trazabilidad SRE.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & ADR 0030).
 * Normas: BCP 47 (RFC 5646), ISO/IEC 11179 e ISO/IEC 25010 (Mantenibilidad y Confiabilidad).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { normalize } from 'node:path';
import { z } from 'zod';

import { ValidationException } from '@floripa-dignidade/exceptions';
import {
  type CorrelationIdentifier,
  CorrelationIdentifierSchema,
  EmitTelemetrySignal,
  type ModuleIdentifier,
  type OperationCode,
} from '@floripa-dignidade/telemetry';

import {
  type IForensicAuditEntry,
  type ILinguisticParityViolation,
  WEAVER_CONFIGURATION,
} from '../constants/WeaverConfiguration';
import { AuditLocaleKeyParity } from './AuditLocaleKeyParity';
import { ExtractSiloLocaleDictionaries } from './ExtractSiloLocaleDictionaries';
import { ResolveSiloModuleIdentifier } from './ResolveSiloModuleIdentifier';

const ProcessIndividualLinguisticSiloParametersSchema = z
  .object({
    scopePrefixLiteral: z.enum(['libs', 'apps']),
    rootDirectoryPathLiteral: z.string().trim().min(1),
    siloDirectoryPathLiteral: z.string().trim().min(1),
    correlationIdentifier: CorrelationIdentifierSchema,
  })
  .readonly();

/**
 * @interface IProcessIndividualLinguisticSiloParameters
 * @description Contrato inmutable de entrada para el procesamiento unitario de un silo lingüístico.
 */
export interface IProcessIndividualLinguisticSiloParameters {
  readonly scopePrefixLiteral: 'libs' | 'apps';
  readonly rootDirectoryPathLiteral: string;
  readonly siloDirectoryPathLiteral: string;
  readonly correlationIdentifier: CorrelationIdentifier;
}

/**
 * @interface IProcessedIndividualSiloResult
 * @description Resultado sellado con los diccionarios extraídos, entrada de auditoría y violaciones.
 */
export interface IProcessedIndividualSiloResult {
  readonly moduleIdentifierLiteral: string;
  readonly siloDirectoryPathLiteral: string;
  readonly dictionariesByLocaleMapping: Readonly<Record<string, Record<string, unknown>>>;
  readonly auditEntrySnapshot: IForensicAuditEntry;
  readonly violationsCollection: readonly ILinguisticParityViolation[];
}

/**
 * Ejecuta la extracción, auditoría de paridad por formato de silo y reporte telemétrico unitario.
 *
 * @param parametersSnapshot - Coordenadas físicas del silo y correlación forense de la compilación.
 * @returns {Promise<IProcessedIndividualSiloResult>} Resultado inmutable del procesamiento unitario.
 * @throws {ValidationException} Si las rutas o el identificador de correlación violan el contrato Zod.
 */
export const ProcessIndividualLinguisticSilo = async (
  parametersSnapshot: IProcessIndividualLinguisticSiloParameters,
): Promise<IProcessedIndividualSiloResult> => {
  const parameterValidationResult =
    ProcessIndividualLinguisticSiloParametersSchema.safeParse(parametersSnapshot);

  if (!parameterValidationResult.success) {
    throw new ValidationException('PARAMETROS_PROCESAMIENTO_SILO_LINGUISTICO_INVALIDOS', {
      validationIssuesCollection: parameterValidationResult.error.flatten(),
    });
  }

  const {
    scopePrefixLiteral,
    rootDirectoryPathLiteral,
    siloDirectoryPathLiteral,
    correlationIdentifier,
  } = parameterValidationResult.data;

  const moduleIdentifierLiteral = ResolveSiloModuleIdentifier(
    scopePrefixLiteral,
    rootDirectoryPathLiteral,
    siloDirectoryPathLiteral,
  );

  const extractionOutcome = await ExtractSiloLocaleDictionaries(
    siloDirectoryPathLiteral,
    moduleIdentifierLiteral,
    correlationIdentifier,
  );

  const moduleParityViolationsCollection = AuditLocaleKeyParity(
    moduleIdentifierLiteral,
    extractionOutcome.dictionariesByLocaleMapping,
    extractionOutcome.siloFormatLiteral,
  );

  const combinedViolationsCollection: readonly ILinguisticParityViolation[] = Object.freeze([
    ...extractionOutcome.syntaxViolationsCollection,
    ...moduleParityViolationsCollection,
  ]);

  const auditEntrySnapshot: IForensicAuditEntry = Object.freeze({
    moduleIdentifierLiteral,
    filesystemPathLiteral: normalize(siloDirectoryPathLiteral),
    processedLocalesCollection: Object.freeze([...extractionOutcome.processedLocalesCollection]),
    siloFormatLiteral: extractionOutcome.siloFormatLiteral,
    missingLocalesCollection: Object.freeze([...extractionOutcome.missingLocalesCollection]),
    parityViolationsCountQuantity: combinedViolationsCollection.length,
  });

  const hasViolationsBoolean = combinedViolationsCollection.length > 0;
  const weaverEngineIdentifierLiteral =
    WEAVER_CONFIGURATION.WEAVER_ENGINE_IDENTIFIER_LITERAL as ModuleIdentifier;

  void EmitTelemetrySignal({
    occurrenceTimestampISO: new Date().toISOString(),
    severityLevelLiteral: hasViolationsBoolean ? 'WARNING' : 'INFO',
    moduleIdentifierLiteral: weaverEngineIdentifierLiteral,
    operationCodeLiteral: 'SILO_WEAVED' as OperationCode,
    correlationIdentifier,
    messageContentLiteral: `Módulo lingüístico integrado: [${moduleIdentifierLiteral}]`,
    semanticIntentTag: 'I18N_SILO_DISCOVERY',
    contextMetadataSnapshot: {
      moduleIdentifierLiteral,
      siloFormatLiteral: extractionOutcome.siloFormatLiteral,
      localesCollection: extractionOutcome.processedLocalesCollection,
      missingLocalesCollection: extractionOutcome.missingLocalesCollection,
      parityViolationsCountQuantity: combinedViolationsCollection.length,
      ...(hasViolationsBoolean && {
        parityViolationsCollection: combinedViolationsCollection,
      }),
    },
  });

  return Object.freeze({
    moduleIdentifierLiteral,
    siloDirectoryPathLiteral: auditEntrySnapshot.filesystemPathLiteral,
    dictionariesByLocaleMapping: extractionOutcome.dictionariesByLocaleMapping,
    auditEntrySnapshot,
    violationsCollection: combinedViolationsCollection,
  });
};
