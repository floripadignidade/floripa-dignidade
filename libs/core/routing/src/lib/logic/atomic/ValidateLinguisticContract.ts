/**
 * @section Routing Logic - Linguistic Contract Guardian Apparatus
 * @description Aparato de auditoría estructural que garantiza que los diccionarios
 * JSON cumplan estrictamente con el ADN (Zod Schema) definido en el búnker.
 *
 * Protocolo OEDP-V15.0 - Structural Integrity, Type Resilience & Standard Exceptions.
 * @author Dirección de Ingeniería - Floripa Dignidade
 */

import { EmitTelemetrySignal, GenerateCorrelationIdentifier } from '@floripa-dignidade/telemetry';

import { InternalSystemException } from '@floripa-dignidade/exceptions';

/** 🛡️ SANEAMIENTO Zenith: Importación exclusiva de ADN estructural */
import type { ZodTypeAny } from 'zod';

/**
 * Valida la integridad de un aparato lingüístico contra su esquema soberano.
 *
 * @param apparatusIdentifierLiteral - Nombre técnico del búnker auditado.
 * @param contractSovereignSchema - Esquema de Zod (ZodTypeAny para soportar Readonly/Object).
 * @param jsonDictionaryPayload - Contenido crudo del archivo JSON de traducción.
 * @param targetLocaleIdentifier - Idioma que se está auditando.
 * @throws {InternalSystemException} Si el contrato JSON no coincide con el ADN esperado.
 */
export const ValidateLinguisticContract = (
  apparatusIdentifierLiteral: string,
  contractSovereignSchema: ZodTypeAny, // SANEADO: Uso directo del tipo sin instanciar 'z'
  jsonDictionaryPayload: unknown,
  targetLocaleIdentifier: string,
): void => {
  const correlationIdentifier = GenerateCorrelationIdentifier();

  // 1. Auditoría de ADN (Safe Parsing)
  const validationResult = contractSovereignSchema.safeParse(jsonDictionaryPayload);

  if (!validationResult.success) {
    const errorMetadata = validationResult.error.format();

    EmitTelemetrySignal({
      severityLevel: 'CRITICAL',
      moduleIdentifier: 'INTEGRITY_GUARDIAN',
      operationCode: 'LINGUISTIC_CONTRACT_VIOLATION',
      correlationIdentifier,
      message: `Integridad de Aparato Fallida: [${apparatusIdentifierLiteral}] en [${targetLocaleIdentifier}]`,
      contextMetadata: {
        apparatus: apparatusIdentifierLiteral,
        locale: targetLocaleIdentifier,
        missingFields: errorMetadata,
      },
    });

    // 2. Colapso Controlado (Standard Exception Engine)
    throw new InternalSystemException('VIOLACION_DE_CONTRATO_LINGUISTICO', {
      apparatusIdentifierLiteral,
      targetLocaleIdentifier,
      validationIssues: errorMetadata,
    });
  }

  // 3. Reporte de Salud Estructural
  EmitTelemetrySignal({
    severityLevel: 'INFO',
    moduleIdentifier: 'INTEGRITY_GUARDIAN',
    operationCode: 'APPARATUS_CONTRACT_VERIFIED',
    correlationIdentifier,
    message: `Aparato íntegro: ${apparatusIdentifierLiteral} (${targetLocaleIdentifier})`,
  });
};
