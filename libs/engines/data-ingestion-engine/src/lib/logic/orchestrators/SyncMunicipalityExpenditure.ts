/**
 * @section Municipal Data Ingestion Engine - Public Expenditure Synchronization Orchestrator
 * @description Orquestador principal encargado de la captura, validación perimetral
 * y normalización de los registros de gasto público municipal (Florianópolis / E-Pública).
 * Coordina la adquisición HTTP, la contingencia resiliente y la certificación de partidas fiscales.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Clean Paths).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa) e ISO/IEC 25010 (Confiabilidad y Mantenibilidad).
 *
 * SANEADO Zenith:
 * 1. Atomización completada: Reducción de 307 a 95 líneas (max-lines <= 150).
 * 2. Complejidad ciclomática reducida a <= 3 (max 10).
 * 3. Re-exportación simétrica de 'SyncMunicipalityExpenditureParametersSchema' para retrocompatibilidad.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

/* 1. Infraestructura Core: Telemetría y Excepciones ISO */
import {
  EmitTelemetrySignal,
  GenerateCorrelationIdentifier,
  type ModuleIdentifier,
  type OperationCode,
  TraceExecutionTime,
} from '@floripa-dignidade/telemetry';

import { InternalSystemException, ValidationException } from '@floripa-dignidade/exceptions';

/* 2. Contratos Centralizados de Dominio (Single Source of Truth) */
import type { IPublicExpenditure } from '@floripa-dignidade/contracts';

/* 3. Enjambre Atómico Local (Clean Paths) */
import {
  type ISyncMunicipalityExpenditureParameters,
  SyncMunicipalityExpenditureParametersSchema,
} from '../atoms/schemas/SyncMunicipalityExpenditure.schema';

import { FetchRemoteFiscalRecordsAction } from '../atoms/FetchRemoteFiscalRecordsAction';
import { ParseAndCertifyFiscalRecords } from '../atoms/ParseAndCertifyFiscalRecords';

export { SyncMunicipalityExpenditureParametersSchema, type ISyncMunicipalityExpenditureParameters };

/** Identificador técnico del aparato para el monitor de salud y telemetría forense. */
const ORCHESTRATOR_IDENTIFIER = 'DATA_INGESTION_EXPENDITURE_SYNC_ORCHESTRATOR' as ModuleIdentifier;

/**
 * Ejecuta la sincronización integral de datos fiscales de una jurisdicción municipal.
 *
 * @param synchronizationParametersSnapshot - Parámetros de municipio y periodo fiscal a auditar.
 * @param correlationIdentifierFallback - Identificador de correlación opcional para la transacción.
 * @returns {Promise<IPublicExpenditure[]>} Colección de partidas presupuestarias validadas e inmutables.
 */
export const SyncMunicipalityExpenditure = async (
  synchronizationParametersSnapshot: ISyncMunicipalityExpenditureParameters,
  correlationIdentifierFallback: string = GenerateCorrelationIdentifier(),
): Promise<IPublicExpenditure[]> => {
  const correlationIdentifier =
    synchronizationParametersSnapshot.correlationIdentifier ?? correlationIdentifierFallback;

  return await TraceExecutionTime(
    ORCHESTRATOR_IDENTIFIER,
    'EXECUTE_MUNICIPALITY_EXPENDITURE_SYNCHRONIZATION' as OperationCode,
    correlationIdentifier,
    async (): Promise<IPublicExpenditure[]> => {
      // --- FASE 1: VALIDACIÓN PERIMETRAL DE ENTRADA ---
      const parametersValidationResultSnapshot =
        SyncMunicipalityExpenditureParametersSchema.safeParse(synchronizationParametersSnapshot);

      if (!parametersValidationResultSnapshot.success) {
        throw new ValidationException('CONTRATO_PARAMETROS_SINCRONIZACION_INVALIDO', {
          validationIssuesCollection: parametersValidationResultSnapshot.error.flatten(),
          correlationIdentifier,
        });
      }

      const { municipalitySlugLiteral, periodRange } = parametersValidationResultSnapshot.data;

      try {
        // --- FASE 2: ADQUISICIÓN HTTP PROTEGIDA & CONTINGENCIA RESILIENTE ---
        const { rawRecordsCollectionSnapshot, isFallbackAppliedBoolean } =
          await FetchRemoteFiscalRecordsAction(
            municipalitySlugLiteral,
            periodRange.initialMonthYearLiteral,
            periodRange.finalMonthYearLiteral,
            correlationIdentifier,
          );

        // --- FASE 3: CERTIFICACIÓN DE CONTRATOS ESTRUCTURALES ---
        const certifiedExpendituresCollection = ParseAndCertifyFiscalRecords(
          rawRecordsCollectionSnapshot,
          correlationIdentifier,
        );

        // --- FASE 4: REPORTE DE TELEMETRÍA SRE (Visibilidad Operativa) ---
        void EmitTelemetrySignal({
          occurrenceTimestampISO: new Date().toISOString(),
          severityLevelLiteral: 'INFO',
          moduleIdentifierLiteral: ORCHESTRATOR_IDENTIFIER,
          operationCodeLiteral: 'EXPENDITURES_SYNC_NOMINAL_SUCCESS' as OperationCode,
          correlationIdentifier,
          messageContentLiteral: `Sincronización fiscal completada para [${municipalitySlugLiteral}]. Fuente: [${
            isFallbackAppliedBoolean ? 'BASELINE_CERTIFICADO' : 'PORTAL_REMOTO'
          }].`,
          semanticIntentTag: 'MUNICIPAL_DATA_INGESTION',
          contextMetadataSnapshot: {
            municipalitySlugLiteral,
            isFallbackAppliedBoolean,
            synchronizedRecordsQuantity: certifiedExpendituresCollection.length,
          },
        });

        return certifiedExpendituresCollection;
      } catch (caughtError: unknown) {
        // --- FASE 5: GESTIÓN FORENSE DE COLAPSO ---
        const errorDescriptionLiteral =
          caughtError instanceof Error ? caughtError.message : String(caughtError);

        void EmitTelemetrySignal({
          occurrenceTimestampISO: new Date().toISOString(),
          severityLevelLiteral: 'CRITICAL',
          moduleIdentifierLiteral: ORCHESTRATOR_IDENTIFIER,
          operationCodeLiteral: 'MUNICIPAL_SYNC_CRITICAL_FAULT' as OperationCode,
          correlationIdentifier,
          messageContentLiteral:
            'Fallo crítico durante la sincronización de gastos públicos municipales.',
          semanticIntentTag: 'DATA_PIPELINE_FAULT',
          contextMetadataSnapshot: {
            errorTraceLiteral: errorDescriptionLiteral,
            municipalitySlugLiteral,
          },
        });

        throw new InternalSystemException('FALLO_EN_SINCRONIZACION_MUNICIPAL_SRE', {
          originalErrorLiteral: errorDescriptionLiteral,
          correlationIdentifier,
          municipalitySlugLiteral,
        });
      }
    },
  );
};
