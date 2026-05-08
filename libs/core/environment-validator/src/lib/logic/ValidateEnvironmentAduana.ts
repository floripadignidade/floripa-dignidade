/**
 * @section Environment Logic - Infrastructure Integrity Guardian
 * @description Orquestador de validación proactiva (Fail-Fast). Garantiza que el
 * ADN de la infraestructura sea íntegro antes de permitir el arranque del sistema.
 * Implementa medición de latencia y telemetría forense para el Neural Sentinel.
 *
 * Protocolo OEDP-V17.0 - High Performance SRE & Async Contract Integrity.
 * SANEADO Zenith: Erradicación de cast inseguro y alineación asíncrona total.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import {
  EmitTelemetrySignal,
  GenerateCorrelationIdentifier,
  TraceExecutionTime,
} from '@floripa-dignidade/telemetry';

/* 1. ADN Estructural y Contratos (Verbatim Module Syntax) */
import { EnvironmentSchema } from '../schemas/Environment.schema';
import type { IEnvironmentVariables } from '../schemas/Environment.schema';

/* 2. Enjambre Atómico de Soporte (Internal Swarm) */
import { GatherEnvironmentMetadata } from './GatherEnvironmentMetadata';
import { ReportEnvironmentIntegrityViolation } from './atomic/ReportEnvironmentIntegrityViolation';

/** Identificador técnico del sensor de infraestructura para el Neural Sentinel. */
const ENVIRONMENT_ADUANA_IDENTIFIER = 'ENVIRONMENT_INFRASTRUCTURE_ADUANA';

/**
 * Realiza una auditoría profunda del contrato de secretos institucionales.
 * Implementa el patrón "Fail-Fast": si el entorno es impuro, el sistema colapsa
 * emitiendo una señal de prioridad CRITICAL.
 *
 * 🛡️ LEY ZENITH: Esta función debe ser invocada en el 'instrumentation.ts'
 * de las aplicaciones para asegurar el blindaje antes del primer ruteo.
 *
 * @returns {Promise<IEnvironmentVariables>} Contrato de entorno purificado y tipado.
 * @throws {InternalSystemException} Si se detecta corrupción en el contrato de secretos.
 */
export const ValidateEnvironmentAduana = async (): Promise<IEnvironmentVariables> => {
  const correlationIdentifier = GenerateCorrelationIdentifier();

  /**
   * @section Ejecución con Rastro de Rendimiento
   * Medimos físicamente el costo de la validación del hardware y el parseo de ADN.
   */
  return await TraceExecutionTime(
    ENVIRONMENT_ADUANA_IDENTIFIER,
    'EXECUTE_ENVIRONMENT_AUDIT_TRANSACTION',
    correlationIdentifier,
    async () => {
      // 1. RECOLECCIÓN DE METADATOS (Sensor de Hardware Isomórfico)
      const rawEnvironmentMetadataSnapshot = GatherEnvironmentMetadata();

      // 2. AUDITORÍA DE INTEGRIDAD (Aduana de ADN Zod)
      const environmentValidationResult = EnvironmentSchema.safeParse(rawEnvironmentMetadataSnapshot);

      if (!environmentValidationResult.success) {
        /**
         * 🛡️ ATOMIZACIÓN: Delegamos el reporte de violación y el bloqueo
         * de seguridad al átomo especializado para mantener el SRP.
         */
        return ReportEnvironmentIntegrityViolation(
          environmentValidationResult.error,
          correlationIdentifier
        );
      }

      // 3. CONFIRMACIÓN DE ESTADO NOMINAL (SRE Visibility)
      void EmitTelemetrySignal({
        severityLevelLiteral: 'INFO',
        moduleIdentifierLiteral: ENVIRONMENT_ADUANA_IDENTIFIER,
        operationCodeLiteral: 'ENVIRONMENT_VERIFIED_SUCCESSFULLY',
        correlationIdentifier,
        messageContentLiteral: 'ENVIRONMENT.LOGS.VERIFICATION_SUCCESS',
      });

      /**
       * Retorno de contrato purificado con Branded Types.
       * El resto del ecosistema ahora posee un mapa de infraestructura 100% seguro.
       */
      return environmentValidationResult.data;
    }
  );
};
