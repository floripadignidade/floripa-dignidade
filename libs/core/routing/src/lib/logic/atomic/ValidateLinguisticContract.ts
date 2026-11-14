/**
 * @section Routing Logic - Linguistic Contract Validator (Atom)
 * @description Validador atómico encargado de certificar que un payload de traducción
 * cumpla estrictamente con el contrato estructural Zod definido para el módulo.
 * Emite telemetría forense SRE conforme a `TelemetrySignalSchema` y aborta la ejecución
 * mediante `InternalSystemException` ante cualquier corrupción estructural en runtime.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Clean Paths).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa), ISO/IEC 25010 (Confiabilidad) y ADR 0030.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import type { ZodType } from 'zod';

/* 1. Infraestructura Core de Excepciones y Telemetría */
import { InternalSystemException } from '@floripa-dignidade/exceptions';
import {
  EmitTelemetrySignal,
  GenerateCorrelationIdentifier,
  type ModuleIdentifier,
  ModuleIdentifierSchema,
  type OperationCode,
} from '@floripa-dignidade/telemetry';

const GUARDIAN_MODULE_IDENTIFIER = ModuleIdentifierSchema.parse(
  'LINGUISTIC_CONTRACT_GUARDIAN',
) as ModuleIdentifier;

/**
 * Valida la integridad de un diccionario de traducción contra su contrato estructural Zod.
 *
 * @template TDictionary - Tipo inferido esperado para el contenido del diccionario.
 * @param moduleIdentifierLiteral - Nombre técnico o ruta del módulo bajo auditoría.
 * @param linguisticContractSchema - Esquema Zod de validación estructural.
 * @param jsonDictionaryPayload - Contenido crudo del archivo o módulo JSON de traducción.
 * @param targetLocaleIdentifier - Código BCP 47 del idioma auditado.
 * @returns {TDictionary} Diccionario purificado y sellado contra mutaciones.
 * @throws {InternalSystemException} Si el payload viola el contrato de datos esperado.
 */
export const ValidateLinguisticContract = <TDictionary = unknown>(
  moduleIdentifierLiteral: string,
  linguisticContractSchema: ZodType<TDictionary>,
  jsonDictionaryPayload: unknown,
  targetLocaleIdentifier: string,
): TDictionary => {
  const correlationIdentifier = GenerateCorrelationIdentifier();

  // 1. AUDITORÍA ESTRUCTURAL DE ADN (Safe Parsing)
  const validationResult = linguisticContractSchema.safeParse(jsonDictionaryPayload);

  if (!validationResult.success) {
    const structuralIssuesCollection = validationResult.error.format();
    const occurrenceTimestampISO = new Date().toISOString();

    void EmitTelemetrySignal({
      occurrenceTimestampISO,
      severityLevelLiteral: 'CRITICAL',
      moduleIdentifierLiteral: GUARDIAN_MODULE_IDENTIFIER,
      operationCodeLiteral: 'LINGUISTIC_CONTRACT_VIOLATION' as OperationCode,
      correlationIdentifier,
      messageContentLiteral: `Violación de contrato lingüístico: [${moduleIdentifierLiteral}] en [${targetLocaleIdentifier}].`,
      semanticIntentTag: 'I18N_CONTRACT_VIOLATION',
      contextMetadataSnapshot: Object.freeze({
        moduleIdentifierLiteral,
        targetLocaleIdentifier,
        missingFieldsSnapshot: structuralIssuesCollection,
      }),
    });

    throw new InternalSystemException('VIOLACION_DE_CONTRATO_LINGUISTICO', {
      moduleIdentifierLiteral,
      targetLocaleIdentifier,
      validationIssuesCollection: structuralIssuesCollection,
      correlationIdentifier,
    });
  }

  // 2. REPORTE TELEMÉTRICO DE ESTADO NOMINAL
  void EmitTelemetrySignal({
    occurrenceTimestampISO: new Date().toISOString(),
    severityLevelLiteral: 'INFO',
    moduleIdentifierLiteral: GUARDIAN_MODULE_IDENTIFIER,
    operationCodeLiteral: 'APPARATUS_CONTRACT_VERIFIED' as OperationCode,
    correlationIdentifier,
    messageContentLiteral: `Contrato lingüístico certificado: [${moduleIdentifierLiteral}] (${targetLocaleIdentifier}).`,
    semanticIntentTag: 'I18N_CONTRACT_VERIFIED',
    contextMetadataSnapshot: Object.freeze({
      moduleIdentifierLiteral,
      targetLocaleIdentifier,
    }),
  });

  return Object.freeze(validationResult.data);
};
