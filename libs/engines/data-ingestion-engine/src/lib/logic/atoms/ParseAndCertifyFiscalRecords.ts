/**
 * @section Data Ingestion - Fiscal Records Certification Engine (Atom)
 * @description Átomo puro encargado de certificar individualmente cada partida
 * presupuestaria contra el contrato SSOT 'PublicExpenditureSchema', descartando
 * registros corruptos y emitiendo señales telemétricas de advertencia.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Clean Paths).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa) e ISO/IEC 25010 (Confiabilidad y Precisión).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import {
  EmitTelemetrySignal,
  type ModuleIdentifier,
  type OperationCode,
} from '@floripa-dignidade/telemetry';

import { type IPublicExpenditure, PublicExpenditureSchema } from '@floripa-dignidade/contracts';

const CERTIFIER_MODULE_IDENTIFIER = 'FISCAL_RECORDS_CERTIFIER_ATOM' as ModuleIdentifier;

/**
 * Certifica individualmente una colección cruda de registros fiscales contra el contrato SSOT.
 *
 * @param rawFiscalRecordsCollectionSnapshot - Matriz de datos no verificados.
 * @param correlationIdentifier - Identificador de correlación para trazabilidad.
 * @returns {IPublicExpenditure[]} Lista pura de gastos certificados.
 */
export const ParseAndCertifyFiscalRecords = (
  rawFiscalRecordsCollectionSnapshot: readonly unknown[],
  correlationIdentifier: string,
): IPublicExpenditure[] => {
  const validatedExpendituresCollection: IPublicExpenditure[] = [];

  for (const rawFiscalRecordSnapshot of rawFiscalRecordsCollectionSnapshot) {
    const recordValidationResultSnapshot =
      PublicExpenditureSchema.safeParse(rawFiscalRecordSnapshot);

    if (!recordValidationResultSnapshot.success) {
      void EmitTelemetrySignal({
        occurrenceTimestampISO: new Date().toISOString(),
        severityLevelLiteral: 'WARNING',
        moduleIdentifierLiteral: CERTIFIER_MODULE_IDENTIFIER,
        operationCodeLiteral: 'CORRUPTED_FISCAL_RECORD_DROPPED' as OperationCode,
        correlationIdentifier,
        messageContentLiteral:
          'Registro fiscal descartado por no cumplir el contrato institucional de gasto público.',
        semanticIntentTag: 'FISCAL_RECORD_VALIDATION_WARNING',
        contextMetadataSnapshot: {
          issuesCollection: recordValidationResultSnapshot.error.flatten(),
        },
      });
      continue;
    }

    validatedExpendituresCollection.push(recordValidationResultSnapshot.data);
  }

  return validatedExpendituresCollection;
};
