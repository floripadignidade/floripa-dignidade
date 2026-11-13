/**
 * @section Impact Analytics - Expenditure to Social Impact Linker (Orchestrator)
 * @description Orquestador de cruzamiento encargado de vincular la ejecución
 * presupuestaria con los indicadores de impacto popular. Implementa la auditoría
 * de eficiencia social coordinando el enjambre de átomos de cálculo y ensamblaje.
 *
 * Protocolo OEDP-V17.0 - Swarm Intelligence & High Performance SRE.
 * SANEADO Zenith: Atomización de búsqueda territorial, ensamblaje de reporte e integridad forense.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import {
  EmitTelemetrySignal,
  GenerateCorrelationIdentifier,
  TraceExecutionTime,
} from '@floripa-dignidade/telemetry';

import { InternalSystemException, ValidationException } from '@floripa-dignidade/exceptions';

/* 1. ADN Estructural y Contratos (Verbatim Module Syntax) */
import { SocialEfficiencyReportSchema } from '../schemas/SocialEfficiencyReport.schema';
import type { IExpenditureInput } from '../schemas/ExpenditureInput.schema';
import type { ISocialEfficiencyReport } from '../schemas/SocialEfficiencyReport.schema';
import type { ITerritorialImpactReport } from '../schemas/TerritorialImpactReport.schema';

/* 2. Enjambre Atómico de Inteligencia (Swiss-Watch Swarm) */
import { CalculateSocialEfficiencyRatio } from './atomic/CalculateSocialEfficiencyRatio';
import { DetectSpendingAnomaly } from './atomic/DetectSpendingAnomaly';
import { IdentifyTerritorialAprovalScore } from './atomic/IdentifyTerritorialAprovalScore';
import { AssembleSocialEfficiencyReport } from './atomic/AssembleSocialEfficiencyReport';

/** Identificador técnico para el Neural Sentinel. */
const CROSS_LINKER_IDENTIFIER = 'SOCIAL_EFFICIENCY_CROSS_LINKER_ORCHESTRATOR';

/**
 * Cruza un registro de gasto con el mapa de impacto territorial para auditar la eficiencia.
 * Implementa el patrón "Data Linkage" con rastro de telemetría forense.
 *
 * @param expenditureInputSnapshot - Gasto normalizado (Agnóstico a la fuente de datos).
 * @param globalImpactReportSnapshot - Reporte de impacto territorial generado por el motor.
 * @returns {Promise<ISocialEfficiencyReport>} Reporte de eficiencia validado e inmutable.
 * @throws {ValidationException} Si el cruce genera un ADN de reporte corrupto.
 * @throws {InternalSystemException} Si ocurre un colapso en el motor de cruzamiento.
 */
export const LinkPmfExpenditureToSocialImpact = async (
  expenditureInputSnapshot: IExpenditureInput,
  globalImpactReportSnapshot: ITerritorialImpactReport,
): Promise<ISocialEfficiencyReport> => {
  const correlationIdentifier = GenerateCorrelationIdentifier();

  return await TraceExecutionTime(
    CROSS_LINKER_IDENTIFIER,
    'EXECUTE_SOCIAL_CORRELATION_CROSSING_TRANSACTION',
    correlationIdentifier,
    async () => {
      try {
        // FASE 1: BÚSQUEDA DE AFINIDAD TERRITORIAL (Delegación Atómica)
        const { trustScoreNumeric, territoryNameLiteral } = IdentifyTerritorialAprovalScore(
          expenditureInputSnapshot.targetTerritoryIdentifier,
          globalImpactReportSnapshot,
        );

        // FASE 2: INTELIGENCIA ATÓMICA (Cálculos Puros)
        const efficiencyIndexNumeric = CalculateSocialEfficiencyRatio(
          expenditureInputSnapshot.totalExecutedAmountNumeric,
          trustScoreNumeric,
        );

        const isAnomalyDetectedBoolean = DetectSpendingAnomaly(
          expenditureInputSnapshot.totalExecutedAmountNumeric,
          trustScoreNumeric,
        );

        // FASE 3: ENSAMBLAJE SOBERANO (Delegación Atómica)
        const socialEfficiencySnapshot = AssembleSocialEfficiencyReport({
          expenditureIdentifier: expenditureInputSnapshot.expenditureIdentifier,
          ibgeIdentifier: expenditureInputSnapshot.targetTerritoryIdentifier,
          territoryNameLiteral,
          executedAmountNumeric: expenditureInputSnapshot.totalExecutedAmountNumeric,
          communityTrustScoreNumeric: trustScoreNumeric,
          efficiencyIndexNumeric,
          isAnomalyDetectedBoolean,
        });

        // 4. ADUANA DE ADN (Validación de Integridad Final)
        const validationResult = SocialEfficiencyReportSchema.safeParse(socialEfficiencySnapshot);

        if (!validationResult.success) {
          void EmitTelemetrySignal({
            severityLevelLiteral: 'CRITICAL',
            moduleIdentifierLiteral: CROSS_LINKER_IDENTIFIER,
            operationCodeLiteral: 'EFFICIENCY_REPORT_DNA_CORRUPTION',
            correlationIdentifier,
            messageContentLiteral: 'El cruce de datos generó un rastro de reporte inválido.',
            contextMetadataSnapshot: { issues: validationResult.error.flatten() },
          });

          throw new ValidationException('CONTRATO_DE_EFICIENCIA_SOCIAL_CORRUPTO', {
            structuralIssuesCollection: validationResult.error.flatten(),
          });
        }

        // 5. REPORTE DE SALUD SRE (Visibility)
        void EmitTelemetrySignal({
          severityLevelLiteral: isAnomalyDetectedBoolean ? 'WARNING' : 'INFO',
          moduleIdentifierLiteral: CROSS_LINKER_IDENTIFIER,
          operationCodeLiteral: 'SOCIAL_EFFICIENCY_CROSS_LINK_NOMINAL',
          correlationIdentifier,
          messageContentLiteral: 'Cruce de eficiencia social completado exitosamente.',
          semanticIntentTag: 'CROSS_DATA_CORRELATION',
          contextMetadataSnapshot: {
            efficiencyIndexNumeric,
            isAnomalyDetectedBoolean,
            territoryLiteral: territoryNameLiteral,
          },
        });

        return validationResult.data;
      } catch (caughtError: unknown) {
        // 6. GESTIÓN FORENSE DE FALLO (Resilience Layer)
        if (caughtError instanceof ValidationException) throw caughtError;

        const errorDescriptionLiteral =
          caughtError instanceof Error ? caughtError.message : String(caughtError);

        throw new InternalSystemException('FALLO_EN_CRUZAMIENTO_DE_DATOS_SRE', {
          originalErrorLiteral: errorDescriptionLiteral,
          expenditureIdentifierLiteral: expenditureInputSnapshot.expenditureIdentifier,
          correlationIdentifier,
        });
      }
    },
  );
};
