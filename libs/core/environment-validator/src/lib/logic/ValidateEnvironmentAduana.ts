/**
 * @section Environment Logic - Infrastructure Integrity Guardian Orchestrator
 * @description Orquestador de validación proactiva y preventiva (Fail-Fast). Garantiza que el
 * contrato de configuración de infraestructura sea 100% íntegro antes de autorizar el arranque
 * de la aplicación en Next.js 16 (App Router) o Payload CMS.
 * Implementa medición de latencia física y despacho de telemetría forense estandarizada.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Clean Paths).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa) e ISO/IEC 25010 (Confiabilidad y Operabilidad).
 * SANEADO Turbopack: Erradicación definitiva de extensiones '.js' a favor de Rutas Limpias.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

/* 1. Infraestructura Core de Telemetría */
import {
  EmitTelemetrySignal,
  GenerateCorrelationIdentifier,
  type ModuleIdentifier,
  type OperationCode,
  TraceExecutionTime,
} from '@floripa-dignidade/telemetry';

/* 2. Contratos Estructurales (Rutas Limpias - Extensionless) */
import { EnvironmentSchema } from '../schemas/Environment.schema';
import type { IEnvironmentVariables } from '../schemas/Environment.schema';

/* 3. Enjambre Atómico de Soporte (Módulos Internos) */
import { GatherEnvironmentMetadata } from './GatherEnvironmentMetadata';
import { ReportEnvironmentIntegrityViolation } from './atomic/ReportEnvironmentIntegrityViolation';

/** Identificador técnico del aparato para el monitor de salud y telemetría forense. */
const ENVIRONMENT_VALIDATOR_IDENTIFIER = 'ENVIRONMENT_INFRASTRUCTURE_VALIDATOR' as ModuleIdentifier;

/**
 * Realiza una auditoría exhaustiva del contrato de secretos de infraestructura del sistema.
 * Implementa el patrón Fail-Fast: si el entorno carece de credenciales mandatorias o viola
 * las restricciones de formato (Zod), el sistema aborta el arranque emitiendo una alerta crítica.
 *
 * Esta función es invocada durante el bootstrap en 'instrumentation.ts' y en 'payload.config.ts'.
 *
 * @returns {Promise<IEnvironmentVariables>} Contrato de infraestructura purificado y tipado nominalmente.
 * @throws {InternalSystemException} Si se detecta corrupción o ausencia de secretos obligatorios.
 */
export const ValidateEnvironmentContract = async (): Promise<IEnvironmentVariables> => {
  const correlationIdentifier = GenerateCorrelationIdentifier();

  return await TraceExecutionTime(
    ENVIRONMENT_VALIDATOR_IDENTIFIER,
    'EXECUTE_ENVIRONMENT_AUDIT_TRANSACTION' as OperationCode,
    correlationIdentifier,
    async (): Promise<IEnvironmentVariables> => {
      // 1. RECOLECCIÓN DE METADATOS (Sensor de Hardware Isomórfico)
      const rawEnvironmentMetadataSnapshot = GatherEnvironmentMetadata();

      // 2. AUDITORÍA DE INTEGRIDAD (Validación contra Esquema Multi-Cloud Zod)
      const environmentValidationResult = EnvironmentSchema.safeParse(
        rawEnvironmentMetadataSnapshot,
      );

      if (!environmentValidationResult.success) {
        /**
         * Delegamos el reporte de violación forense y el colapso controlado
         * al átomo especializado para preservar la responsabilidad única (SRP).
         */
        return ReportEnvironmentIntegrityViolation(
          environmentValidationResult.error,
          correlationIdentifier,
        );
      }

      const validatedEnvironmentDataSnapshot: IEnvironmentVariables =
        environmentValidationResult.data;

      // 3. DETECCIÓN DE PROVEEDORES DE INTELIGENCIA ARTIFICIAL HABILITADOS
      const isGoogleGeminiConfiguredBoolean =
        !!validatedEnvironmentDataSnapshot.GOOGLE_GEMINI_API_KEY &&
        validatedEnvironmentDataSnapshot.GOOGLE_GEMINI_API_KEY.trim() !== '';

      const isHuggingFaceConfiguredBoolean =
        !!validatedEnvironmentDataSnapshot.HUGGING_FACE_API_TOKEN &&
        !!validatedEnvironmentDataSnapshot.HUGGING_FACE_MODEL_URL &&
        validatedEnvironmentDataSnapshot.HUGGING_FACE_API_TOKEN.trim() !== '' &&
        validatedEnvironmentDataSnapshot.HUGGING_FACE_MODEL_URL.trim() !== '';

      // 4. CONFIRMACIÓN DE ESTADO NOMINAL (Telemetría SRE Conforme a ISO/IEC 11179)
      void EmitTelemetrySignal({
        occurrenceTimestampISO: new Date().toISOString(),
        severityLevelLiteral: 'INFO',
        moduleIdentifierLiteral: ENVIRONMENT_VALIDATOR_IDENTIFIER,
        operationCodeLiteral: 'ENVIRONMENT_VERIFIED_SUCCESSFULLY' as OperationCode,
        correlationIdentifier,
        messageContentLiteral: 'ENVIRONMENT.LOGS.VERIFICATION_SUCCESS',
        semanticIntentTag: 'INFRASTRUCTURE_VERIFICATION_NOMINAL',
        contextMetadataSnapshot: {
          isGoogleGeminiConfiguredBoolean,
          isHuggingFaceConfiguredBoolean,
          executionEnvironmentLiteral: validatedEnvironmentDataSnapshot.NODE_ENV,
          storageBucketLiteral: validatedEnvironmentDataSnapshot.S3_BUCKET,
          storageRegionLiteral: validatedEnvironmentDataSnapshot.S3_REGION,
        },
      });

      return validatedEnvironmentDataSnapshot;
    },
  );
};

/**
 * @name ValidateEnvironmentAduana
 * @description Alias institucional de compatibilidad histórica para transiciones en el monorepo.
 * @deprecated Utilizar preferentemente 'ValidateEnvironmentContract' bajo norma ISO/IEC 11179.
 */
export const ValidateEnvironmentAduana = ValidateEnvironmentContract;
