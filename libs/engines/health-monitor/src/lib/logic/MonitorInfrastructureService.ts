/**
 * @section Health Monitoring - Infrastructure Probe Orchestrator
 * @description Orquestador superior encargado de la vigilancia logica de servicios
 * externos e internos. Ejecuta sondas de salud (Health Probes), mide la latencia
 * de respuesta y clasifica el estado ontologico del hardware bajo auditoria.
 *
 * Protocolo OEDP-V17.0 - Swarm Intelligence & High Performance SRE.
 * SANEADO Zenith: Sincronización PascalCase (Fix TS2724) e Integridad Forense.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { MapHttpErrorToException } from '@floripa-dignidade/exceptions';
import {
  EmitTelemetrySignal,
  GenerateCorrelationIdentifier,
  ReportForensicException,
  TraceExecutionTime,
} from '@floripa-dignidade/telemetry';

/* 1. ADN Estructural y Átomos de Especialidad (PascalCase) */
import type { HealthStatus, IInfrastructureCheck } from '../schemas/HealthStatus.schema';
import { ClassifyInfrastructureHealth } from './atomic/ClassifyInfrastructureHealth';

/** Identificador técnico del motor para el Neural Sentinel. */
const MONITOR_MODULE_IDENTIFIER = 'INFRASTRUCTURE_HEALTH_MONITOR';

/**
 * Ejecuta una sonda de salud integral sobre un servicio del ecosistema.
 * Implementa un patron de ejecucion blindado con triaje automatico de excepciones.
 *
 * @param targetServiceNameLiteral - Nombre tecnico del servicio (ej: SUPABASE_REST_API).
 * @param executeHealthCheckAction - Accion atomica que valida la conexion fisica.
 * @returns {Promise<IInfrastructureCheck>} Reporte de salud normalizado para el Ledger SRE.
 */
export const MonitorInfrastructureService = async (
  targetServiceNameLiteral: string,
  executeHealthCheckAction: () => Promise<void>,
): Promise<IInfrastructureCheck> => {
  /**
   * Generamos la "Traza de Sangre Digital" que vinculara la sonda con
   * cualquier anomalia detectada en el bus de datos.
   */
  const correlationIdentifier = GenerateCorrelationIdentifier();
  const startTimeNumeric = performance.now();

  let isServiceOperationallyFunctionalBoolean = true;

  try {
    /**
     * @section Ejecución de Sonda (Performance Wrapped)
     * Delegamos la ejecucion al wrapper de telemetria para asegurar que
     * la latencia del hardware sea auditada por el sistema nervioso central.
     */
    await TraceExecutionTime(
      MONITOR_MODULE_IDENTIFIER,
      `HEALTH_PROBE_${targetServiceNameLiteral.toUpperCase()}`,
      correlationIdentifier,
      executeHealthCheckAction,
    );
  } catch (caughtError: unknown) {
    /**
     * @section Gestion de Colapso de Sonda
     * Si la accion falla, marcamos el servicio como no funcional y
     * transformamos el error en una excepcion institucional.
     */
    isServiceOperationallyFunctionalBoolean = false;

    const infrastructureServiceException = MapHttpErrorToException(
      503,
      `INFRASTRUCTURE_SERVICE_FAULT: ${targetServiceNameLiteral}`,
      {
        targetServiceNameLiteral,
        originalErrorMessageLiteral:
          caughtError instanceof Error ? caughtError.message : String(caughtError),
        correlationIdentifier,
      },
    );

    // Reporte forense inmediato para intervencion de ingenieria.
    ReportForensicException(infrastructureServiceException, correlationIdentifier);
  }

  // 1. CAPTURA DE MÉTRICAS SRE
  const executionLatencyInMillisecondsQuantity = performance.now() - startTimeNumeric;

  /**
   * 2. CLASIFICACIÓN DE ESTADO (Delegación Atómica)
   * Resolvemos el estatus (UP | DEGRADED | DOWN) basado en la disponibilidad
   * y los umbrales de latencia definidos en la aduana de clasificacion.
   */
  const infrastructureHealthStatus: HealthStatus = ClassifyInfrastructureHealth(
    isServiceOperationallyFunctionalBoolean,
    executionLatencyInMillisecondsQuantity,
  );

  /**
   * 3. CONSTRUCCIÓN DE SNAPSHOT DE SALIDA
   * ADN inmutable del reporte para el consumidor superior.
   */
  const healthReportSnapshot: IInfrastructureCheck = {
    serviceName: targetServiceNameLiteral,
    status: infrastructureHealthStatus,
    latencyInMilliseconds: executionLatencyInMillisecondsQuantity,
    lastCheckTimestamp: new Date().toISOString(),
  };

  /**
   * 4. REPORTE DE CIERRE ZENITH (Final Audit Trail)
   * Notificamos al Neural Sentinel la finalizacion de la auditoria fisica.
   */
  void EmitTelemetrySignal({
    severityLevel:
      infrastructureHealthStatus === 'DOWN'
        ? 'CRITICAL'
        : infrastructureHealthStatus === 'DEGRADED'
          ? 'WARNING'
          : 'INFO',
    moduleIdentifier: MONITOR_MODULE_IDENTIFIER,
    operationCode: `HEALTH_PROBE_FINISHED_${targetServiceNameLiteral.toUpperCase()}`,
    correlationIdentifier,
    message: `Auditoria de infraestructura finalizada: [${targetServiceNameLiteral}] -> [${infrastructureHealthStatus}]`,
    executionLatencyInMillisecondsQuantity,
    contextMetadataSnapshot: {
      infrastructureStatusLiteral: infrastructureHealthStatus,
      isNominalBoolean: infrastructureHealthStatus === 'UP',
      targetServiceNameLiteral,
    },
  });

  return healthReportSnapshot;
};
