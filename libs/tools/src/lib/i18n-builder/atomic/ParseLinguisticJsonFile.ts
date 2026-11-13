/**
 * @section Tools & Infrastructure - Linguistic JSON File Parser (Atom)
 * @description Átomo encargado exclusivamente de leer un archivo JSON lingüístico,
 * validar su sintaxis y certificar con Zod que la raíz sea un objeto plano (`Record`),
 * reportando telemetría forense ante corrupción estructural y preservando errores de hardware.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Clean Paths).
 * Normas: ISO/IEC 11179 (Nomenclatura Técnica), ISO/IEC 25010 (Confiabilidad) e ISO/IEC 27001.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { promises as filesystemPromises } from 'node:fs';
import { z } from 'zod';

import {
  EmitTelemetrySignal,
  type ModuleIdentifier,
  type OperationCode,
} from '@floripa-dignidade/telemetry';

import {
  type ILinguisticParityViolation,
  WEAVER_CONFIGURATION,
} from '../constants/WeaverConfiguration';

const PlainJsonObjectSchema = z.record(z.string(), z.unknown());

/**
 * @interface IParseLinguisticJsonFileParameters
 * @description Contrato inmutable de entrada para la lectura y validación de un archivo JSON.
 */
export interface IParseLinguisticJsonFileParameters {
  readonly filePathLiteral: string;
  readonly moduleIdentifierLiteral: string;
  readonly localeCodeLiteral: string;
  readonly namespaceLiteral: string;
  readonly correlationIdentifier: string;
}

/**
 * @interface IParsedLinguisticJsonFileResult
 * @description Resultado sellado con el objeto JSON validado o la violación sintáctica detectada.
 */
export interface IParsedLinguisticJsonFileResult {
  readonly parsedPayload: Readonly<Record<string, unknown>> | null;
  readonly syntaxViolation: ILinguisticParityViolation | null;
}

const isNotFoundSystemErrorBoolean = (caughtError: unknown): boolean => {
  return (
    typeof caughtError === 'object' &&
    caughtError !== null &&
    'code' in caughtError &&
    caughtError.code === 'ENOENT'
  );
};

const emitJsonCorruptionTelemetryAction = (
  parametersSnapshot: IParseLinguisticJsonFileParameters,
  errorDetailsLiteral: string,
): IParsedLinguisticJsonFileResult => {
  void EmitTelemetrySignal({
    occurrenceTimestampISO: new Date().toISOString(),
    severityLevelLiteral: 'ERROR',
    moduleIdentifierLiteral:
      WEAVER_CONFIGURATION.WEAVER_ENGINE_IDENTIFIER_LITERAL as ModuleIdentifier,
    operationCodeLiteral: 'LINGUISTIC_CORRUPTION_DETECTED' as OperationCode,
    correlationIdentifier: parametersSnapshot.correlationIdentifier,
    messageContentLiteral: `Contenido JSON inválido en archivo lingüístico: [${parametersSnapshot.filePathLiteral}]`,
    semanticIntentTag: 'I18N_SYNTAX_ERROR',
    contextMetadataSnapshot: {
      errorDetailsLiteral,
      filePathLiteral: parametersSnapshot.filePathLiteral,
    },
  });

  return Object.freeze({
    parsedPayload: null,
    syntaxViolation: Object.freeze({
      moduleIdentifierLiteral: parametersSnapshot.moduleIdentifierLiteral,
      localeCodeLiteral: parametersSnapshot.localeCodeLiteral,
      namespaceLiteral: parametersSnapshot.namespaceLiteral,
      violationTypeLiteral: 'INVALID_JSON_SYNTAX',
      missingKeysCollection: Object.freeze([]),
    }),
  });
};

/**
 * Lee, parsea y certifica estructuralmente un archivo JSON de traducción.
 *
 * @param parametersSnapshot - Ruta del archivo, metadatos de silo y correlación forense.
 * @returns {Promise<IParsedLinguisticJsonFileResult>} Payload validado o violación estructurada.
 */
export const ParseLinguisticJsonFile = async (
  parametersSnapshot: IParseLinguisticJsonFileParameters,
): Promise<IParsedLinguisticJsonFileResult> => {
  try {
    const rawContentLiteral = await filesystemPromises.readFile(
      parametersSnapshot.filePathLiteral,
      'utf-8',
    );
    const rawParsedSnapshot: unknown = JSON.parse(rawContentLiteral);
    const objectValidationResult = PlainJsonObjectSchema.safeParse(rawParsedSnapshot);

    if (!objectValidationResult.success) {
      return emitJsonCorruptionTelemetryAction(
        parametersSnapshot,
        'JSON_ROOT_MUST_BE_PLAIN_OBJECT',
      );
    }

    return Object.freeze({
      parsedPayload: Object.freeze(objectValidationResult.data),
      syntaxViolation: null,
    });
  } catch (caughtError: unknown) {
    if (caughtError instanceof SyntaxError) {
      return emitJsonCorruptionTelemetryAction(parametersSnapshot, caughtError.message);
    }

    if (isNotFoundSystemErrorBoolean(caughtError)) {
      return Object.freeze({ parsedPayload: null, syntaxViolation: null });
    }

    throw caughtError;
  }
};
