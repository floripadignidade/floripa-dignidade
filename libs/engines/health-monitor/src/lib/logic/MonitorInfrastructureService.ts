/**
 * @section Health Monitoring - Infrastructure Probe Orchestrator
 * @description Orquestador encargado de la vigilancia lógica de servicios externos e
 * internos. Valida entradas contra contratos Zod, ejecuta la sonda con protección de
 * timeout y medición `TraceExecutionTime`, clasifica el estado ontológico (`UP`,
 * `DEGRADED`, `DOWN`), sella el resultado contra `InfrastructureCheckSchema` y emite
 * telemetría SRE conforme a `TelemetrySignalSchema`.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Clean Paths).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa) e ISO/IEC 25010 (Confiabilidad y Mantenibilidad).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { ValidationException } from '@floripa-dignidade/exceptions';
import {
  type CorrelationIdentifier,
  CorrelationIdentifierSchema,
  GenerateCorrelationIdentifier,
  type ModuleIdentifier,
  ModuleIdentifierSchema,
  ReportForensicException,
} from '@floripa-dignidade/telemetry';

import {
  type HealthStatus,
  type IInfrastructureCheck,
  InfrastructureCheckSchema,
} from '../schemas/HealthStatus.schema';
import { ClassifyInfrastructureHealth } from './atomic/ClassifyInfrastructureHealth';
import { EmitHealthProbeOutcomeTelemetry } from './atomic/EmitHealthProbeOutcomeTelemetry';
import { ExecuteProbeWithTimeoutGuard } from './atomic/ExecuteProbeWithTimeoutGuard';
import { ResolveHealthMonitorDictionary } from './atomic/ResolveHealthMonitorDictionary';
import {
  DEFAULT_DEGRADED_LATENCY_THRESHOLD_IN_MILLISECONDS_QUANTITY,
  type IMonitorInfrastructureServiceOptionsInput,
  MonitorInfrastructureServiceOptionsSchema,
  ServiceNameIdentifierSchema,
} from './atomic/schemas/MonitorInfrastructureService.schema';

const MONITOR_MODULE_IDENTIFIER: ModuleIdentifier = ModuleIdentifierSchema.parse(
  'INFRASTRUCTURE_HEALTH_MONITOR',
);

const resolveSafeCorrelationIdentifier = (
  candidateIdentifier: string | undefined,
): CorrelationIdentifier => {
  const validationResult = CorrelationIdentifierSchema.safeParse(candidateIdentifier);
  return validationResult.success ? validationResult.data : GenerateCorrelationIdentifier();
};

const resolveProbeHealthStatus = (
  isServiceAvailableBoolean: boolean,
  executionLatencyInMillisecondsQuantity: number,
  degradedLatencyThresholdInMillisecondsQuantity: number,
): HealthStatus => {
  if (
    degradedLatencyThresholdInMillisecondsQuantity ===
    DEFAULT_DEGRADED_LATENCY_THRESHOLD_IN_MILLISECONDS_QUANTITY
  ) {
    return ClassifyInfrastructureHealth(
      isServiceAvailableBoolean,
      executionLatencyInMillisecondsQuantity,
    );
  }

  if (!isServiceAvailableBoolean) {
    return 'DOWN';
  }

  return executionLatencyInMillisecondsQuantity > degradedLatencyThresholdInMillisecondsQuantity
    ? 'DEGRADED'
    : 'UP';
};

/**
 * Ejecuta una sonda de salud integral sobre un servicio del ecosistema con timeout SRE y auditoría Zod.
 *
 * @param targetServiceNameLiteral - Nombre técnico del servicio (ejemplo: `SUPABASE_REST_API`).
 * @param executeHealthCheckAction - Acción asíncrona que valida la disponibilidad del servicio.
 * @param rawOptionsSnapshot - Opciones opcionales de timeout, umbral de latencia, idioma y correlación.
 * @returns {Promise<IInfrastructureCheck>} Reporte de salud inmutable y validado contra `InfrastructureCheckSchema`.
 * @throws {ValidationException} Si el nombre del servicio o el callback de sonda incumplen el contrato.
 */
export const MonitorInfrastructureService = async (
  targetServiceNameLiteral: string,
  executeHealthCheckAction: () => Promise<void>,
  rawOptionsSnapshot: IMonitorInfrastructureServiceOptionsInput = {},
): Promise<IInfrastructureCheck> => {
  const optionsValidationResult =
    MonitorInfrastructureServiceOptionsSchema.safeParse(rawOptionsSnapshot);
  const validatedOptions = optionsValidationResult.success
    ? optionsValidationResult.data
    : MonitorInfrastructureServiceOptionsSchema.parse({});

  const correlationIdentifier = resolveSafeCorrelationIdentifier(
    validatedOptions.correlationIdentifier,
  );

  const serviceNameValidationResult =
    ServiceNameIdentifierSchema.safeParse(targetServiceNameLiteral);
  const isProbeFunctionValidBoolean = typeof executeHealthCheckAction === 'function';

  if (!serviceNameValidationResult.success || !isProbeFunctionValidBoolean) {
    const validationException = new ValidationException(
      'INFRASTRUCTURE_HEALTH_PROBE_INPUT_INVALID',
      {
        hasValidServiceNameBoolean: serviceNameValidationResult.success,
        isProbeFunctionValidBoolean,
        correlationIdentifier,
      },
    );

    ReportForensicException(validationException, correlationIdentifier);
    throw validationException;
  }

  const validatedServiceNameLiteral = serviceNameValidationResult.data;
  const dictionarySnapshot = ResolveHealthMonitorDictionary(validatedOptions.localeIdentifier);

  const probeExecutionResult = await ExecuteProbeWithTimeoutGuard(
    validatedServiceNameLiteral,
    executeHealthCheckAction,
    validatedOptions.timeoutInMillisecondsQuantity,
    dictionarySnapshot.telemetry.probeTimeoutLiteral,
    MONITOR_MODULE_IDENTIFIER,
    correlationIdentifier,
  );

  const infrastructureHealthStatus = resolveProbeHealthStatus(
    probeExecutionResult.isServiceAvailableBoolean,
    probeExecutionResult.executionLatencyInMillisecondsQuantity,
    validatedOptions.degradedLatencyThresholdInMillisecondsQuantity,
  );

  const validatedHealthReportSnapshot = InfrastructureCheckSchema.parse({
    serviceName: validatedServiceNameLiteral,
    status: infrastructureHealthStatus,
    latencyInMilliseconds: probeExecutionResult.executionLatencyInMillisecondsQuantity,
    lastCheckTimestamp: new Date().toISOString(),
  });

  EmitHealthProbeOutcomeTelemetry({
    moduleIdentifierLiteral: MONITOR_MODULE_IDENTIFIER,
    targetServiceNameLiteral: validatedServiceNameLiteral,
    infrastructureHealthStatus,
    executionLatencyInMillisecondsQuantity:
      probeExecutionResult.executionLatencyInMillisecondsQuantity,
    correlationIdentifier,
    dictionarySnapshot,
    failureDiagnosticLiteral: probeExecutionResult.failureDiagnosticLiteral,
  });

  return Object.freeze(validatedHealthReportSnapshot);
};
