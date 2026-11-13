/**
 * @section Adversarial Orchestrators - Security Audit Pipeline (Master)
 * @description Orquestador soberano encargado de coordinar el ciclo de vida
 * completo del Red Team automatizado. Une el arsenal de ataque, el motor de
 * fuzzing in-memory y los adaptadores de salida para Shannon AI.
 *
 * Protocolo OEDP-V17.0 - Swarm Intelligence & High Performance SRE.
 * SANEADO Zenith: Implementación de concurrencia de enjambre (Promise.all),
 * inyección de telemetría i18n y cumplimiento de Prosa ISO (ADR 0002).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import {
  EmitTelemetrySignal,
  GenerateCorrelationIdentifier,
  TraceExecutionTime,
} from '@floripa-dignidade/telemetry';

import { InternalSystemException } from '@floripa-dignidade/exceptions';

/* 🛡️ SANEADO Zenith: Inyección Agnóstica vía ZodTypeAny */
import type { ZodTypeAny } from 'zod';

/* 1. ADN de Dominio y Salida (Verbatim Module Syntax) */
import type { IForensicAuditReport } from '../schemas/ForensicAuditReport.schema';
import type { IAdversarialVulnerability } from '../schemas/AdversarialVulnerability.schema';

/* 2. Enjambre Atómico Local (Swiss-Watch Swarm) */
import { ExportShannonForensicReport } from '../adapters/ExportShannonForensicReport';
import { LoadAdversarialArsenal } from '../generators/atomic/LoadAdversarialArsenal';
import { ExecuteAdversarialFuzzing } from '../simulators/ExecuteAdversarialFuzzing';
import { ConsolidateForensicReport } from './atomic/ConsolidateForensicReport';
import { EvaluateAuditIntegrityVerdict } from './atomic/EvaluateAuditIntegrityVerdict';

/** Identificador técnico del orquestador para el Neural Sentinel. */
const PIPELINE_ORCHESTRATOR_IDENTIFIER = 'ADVERSARIAL_PIPELINE_ORCHESTRATOR';

/**
 * @interface ITargetAduanaDefinition
 * @description Contrato de inyección de dependencia para esquemas sujetos a auditoría.
 */
export interface ITargetAduanaDefinition {
  /** Nombre técnico del búnker u objeto bajo ataque. */
  readonly apparatusNameLiteral: string;
  /** Instancia del esquema Zod que actúa como frontera defensiva. */
  readonly schemaInstance: ZodTypeAny;
}

/**
 * Ejecuta la matriz de ataque completa contra las aduanas suministradas.
 * Realiza el fuzzing en paralelo para optimizar la latencia del build.
 *
 * @param targetAduanaDefinitionsCollection - Colección de esquemas a vulnerar.
 * @param outputDirectoryLiteral - Ruta física para el volcado del reporte Shannon.
 * @returns {Promise<IForensicAuditReport>} Reporte consolidado de la auditoría.
 * @throws {InternalSystemException} Si el pipeline colapsa por fallos de I/O o memoria.
 */
export const ExecuteSecurityAuditPipeline = async (
  targetAduanaDefinitionsCollection: readonly ITargetAduanaDefinition[],
  outputDirectoryLiteral: string,
): Promise<IForensicAuditReport> => {
  const correlationIdentifier = GenerateCorrelationIdentifier();

  return await TraceExecutionTime(
    PIPELINE_ORCHESTRATOR_IDENTIFIER,
    'EXECUTE_FULL_ADVERSARIAL_AUDIT_SESSION',
    correlationIdentifier,
    async () => {
      const executionStartTimestampNumeric = performance.now();

      // 1. REPORTE DE INICIO DE SESIÓN RED TEAM
      void EmitTelemetrySignal({
        severityLevelLiteral: 'INFO',
        moduleIdentifierLiteral: PIPELINE_ORCHESTRATOR_IDENTIFIER,
        operationCodeLiteral: 'ADVERSARIAL_SESSION_STARTED',
        correlationIdentifier,
        messageContentLiteral: 'ADVERSARIAL_SIMULATION.LOGS.SIMULATION_STARTED',
        contextMetadataSnapshot: {
          targetCountQuantity: targetAduanaDefinitionsCollection.length,
        },
      });

      try {
        // 2. CARGA DE ARSENAL (Carga de payloads maliciosos)
        const adversarialWeaponsCollection = LoadAdversarialArsenal();

        /**
         * 3. CICLO DE ATAQUE CONCURRENTE (Swarm Processing)
         * 🛡️ SANEADO Zenith: Transición a procesamiento en paralelo para reducir
         * el tiempo de bloqueo en el pipeline de CI/CD.
         */
        const attackPromisesCollection = targetAduanaDefinitionsCollection.map((targetAduana) =>
          ExecuteAdversarialFuzzing({
            targetApparatusIdentifierLiteral: targetAduana.apparatusNameLiteral,
            targetAduanaSchema: targetAduana.schemaInstance,
            adversarialWeaponsCollection,
            correlationIdentifier,
          }),
        );

        const resultsByTargetCollection = await Promise.all(attackPromisesCollection);

        /**
         * 4. CONSOLIDACIÓN DE BRECHAS
         * Aplanamos los hallazgos de todos los objetivos en una colección única.
         */
        const globalVulnerabilitiesCollection: IAdversarialVulnerability[] =
          resultsByTargetCollection.flat();

        // 5. ENSAMBLAJE DE REPORTE FORENSE (Delegación Atómica)
        const finalForensicReportSnapshot = ConsolidateForensicReport({
          vulnerabilitiesCollection: globalVulnerabilitiesCollection,
          totalSimulationsExecutedQuantity:
            targetAduanaDefinitionsCollection.length * adversarialWeaponsCollection.length,
          startTimestampNumeric: executionStartTimestampNumeric,
          endTimestampNumeric: performance.now(),
        });

        // 6. TRADUCCIÓN Y EXPORTACIÓN (Shannon AI Integration)
        await ExportShannonForensicReport(
          finalForensicReportSnapshot,
          outputDirectoryLiteral,
          correlationIdentifier,
        );

        // 7. VEREDICTO DE INTEGRIDAD (SRE Quality Gate)
        EvaluateAuditIntegrityVerdict(finalForensicReportSnapshot, correlationIdentifier);

        // 8. REPORTE DE FINALIZACIÓN NOMINAL
        void EmitTelemetrySignal({
          severityLevelLiteral: 'INFO',
          moduleIdentifierLiteral: PIPELINE_ORCHESTRATOR_IDENTIFIER,
          operationCodeLiteral: 'ADVERSARIAL_SESSION_COMPLETED',
          correlationIdentifier,
          messageContentLiteral: 'ADVERSARIAL_SIMULATION.LOGS.SIMULATION_COMPLETED',
          contextMetadataSnapshot: {
            breachCountQuantity: globalVulnerabilitiesCollection.length,
            isSystemCompromisedBoolean: globalVulnerabilitiesCollection.some(
              (v) => v.threatSeverityLevel === 'CRITICAL_COLLAPSE',
            ),
          },
        });

        return finalForensicReportSnapshot;
      } catch (caughtError: unknown) {
        /**
         * @section Gestión de Colapso de Pipeline
         * Si el motor de ataque falla, emitimos señal de prioridad máxima.
         */
        const errorDescriptionLiteral =
          caughtError instanceof Error ? caughtError.message : String(caughtError);

        void EmitTelemetrySignal({
          severityLevelLiteral: 'CRITICAL',
          moduleIdentifierLiteral: PIPELINE_ORCHESTRATOR_IDENTIFIER,
          operationCodeLiteral: 'ADVERSARIAL_PIPELINE_CRITICAL_FAULT',
          correlationIdentifier,
          messageContentLiteral: `Fallo catastrófico en la sesión de auditoría: ${errorDescriptionLiteral}`,
          contextMetadataSnapshot: {
            attemptedTargetsQuantity: targetAduanaDefinitionsCollection.length,
          },
        });

        throw new InternalSystemException('FALLO_EN_PIPELINE_DE_SIMULACION_ADVERSARIA', {
          originalErrorLiteral: errorDescriptionLiteral,
          correlationIdentifier,
        });
      }
    },
  );
};
