/**
 * @file libs/tools/src/lib/infrastructure-auditor/probes/AuditHuggingFaceCognitiveProbe.ts
 * @section Tools & Infrastructure - Hugging Face Router Cognitive Probe (Orchestrator)
 * @description Sonda de conectividad y autenticación de red para el enrutador unificado
 * de Hugging Face (`https://router.huggingface.co/v1/chat/completions` multi-modelo o
 * Task API). Valida el formato del token `HUGGING_FACE_API_TOKEN` y el transporte HTTPS,
 * mide ejecución bajo `TraceExecutionTime`, aplica timeout SRE y delega el triaje en
 * `TriageHuggingFaceProbeResponse`.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Clean Paths).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa), ISO/IEC 25010 e ISO/IEC 27001.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { GatherEnvironmentMetadata } from '@floripa-dignidade/environment-validator';
import {
  type CorrelationIdentifier,
  CorrelationIdentifierSchema,
  EmitTelemetrySignal,
  GenerateCorrelationIdentifier,
  type ModuleIdentifier,
  ModuleIdentifierSchema,
  type OperationCode,
  OperationCodeSchema,
  TraceExecutionTime,
} from '@floripa-dignidade/telemetry';

import {
  type IIndividualProviderAuditSnapshot,
  IndividualProviderAuditSnapshotSchema,
} from '../schemas/CloudInfrastructureAuditReport.schema';
import { ResolveHuggingFaceProbeConfiguration } from './atoms/ResolveHuggingFaceProbeConfiguration';
import { TriageHuggingFaceProbeResponse } from './atoms/TriageHuggingFaceProbeResponse';

const PROBE_MODULE_IDENTIFIER: ModuleIdentifier =
  ModuleIdentifierSchema.parse('HUGGING_FACE_PROBE_ATOM');

const PROBE_EXECUTION_OPERATION_CODE: OperationCode = OperationCodeSchema.parse(
  'EXECUTE_HUGGING_FACE_INFRASTRUCTURE_PROBE',
);

const CREDENTIALS_SKIPPED_OPERATION_CODE: OperationCode = OperationCodeSchema.parse(
  'HF_PROBE_CREDENTIALS_INVALID_OR_MISSING',
);

const NETWORK_COLLAPSE_OPERATION_CODE: OperationCode = OperationCodeSchema.parse(
  'HF_PROBE_NETWORK_COLLAPSE',
);

const MAXIMUM_GATEWAY_TIMEOUT_IN_MILLISECONDS_QUANTITY = 8000;

const resolveSafeCorrelationIdentifier = (
  candidateIdentifier: string | undefined,
): CorrelationIdentifier => {
  const validationResult = CorrelationIdentifierSchema.safeParse(candidateIdentifier);
  return validationResult.success ? validationResult.data : GenerateCorrelationIdentifier();
};

const extractExecutionErrorMessageLiteral = (caughtExecutionError: unknown): string =>
  caughtExecutionError instanceof Error
    ? caughtExecutionError.message
    : String(caughtExecutionError);

/**
 * Audita activamente el token, endpoint y disponibilidad del enrutador de Hugging Face.
 *
 * @param correlationIdentifierFallback - Identificador de correlación opcional para traza forense.
 * @returns {Promise<IIndividualProviderAuditSnapshot>} Snapshot inmutable y validado por Zod.
 */
export const AuditHuggingFaceCognitiveProbe = async (
  correlationIdentifierFallback: string = GenerateCorrelationIdentifier(),
): Promise<IIndividualProviderAuditSnapshot> => {
  const correlationIdentifier = resolveSafeCorrelationIdentifier(correlationIdentifierFallback);
  const configurationSnapshot = ResolveHuggingFaceProbeConfiguration(GatherEnvironmentMetadata());

  if (!configurationSnapshot.isProbeReadyBoolean) {
    const failureCodeLiteral =
      configurationSnapshot.failureCodeLiteral ?? 'MISSING_HUGGING_FACE_API_TOKEN';
    const failureDescriptionLiteral =
      configurationSnapshot.failureDescriptionLiteral ??
      'Configuración inválida para la sonda de Hugging Face Router.';

    void EmitTelemetrySignal({
      occurrenceTimestampISO: new Date().toISOString(),
      severityLevelLiteral: 'WARNING',
      moduleIdentifierLiteral: PROBE_MODULE_IDENTIFIER,
      operationCodeLiteral: CREDENTIALS_SKIPPED_OPERATION_CODE,
      correlationIdentifier,
      messageContentLiteral: failureDescriptionLiteral,
      semanticIntentTag: 'INFRASTRUCTURE_PROBE_SKIPPED',
      contextMetadataSnapshot: Object.freeze({
        failureCodeLiteral,
        targetEndpointUrlLiteral: configurationSnapshot.targetEndpointUrlLiteral,
      }),
    });

    return Object.freeze(
      IndividualProviderAuditSnapshotSchema.parse({
        providerIdentifier: 'HUGGING_FACE_COGNITIVE_INFERENCE',
        probeStatusLiteral: 'UNCONFIGURED_CREDENTIALS',
        executionLatencyInMillisecondsQuantity: 0,
        statusDescriptionLiteral: failureDescriptionLiteral,
        endpointTargetLiteral: configurationSnapshot.targetEndpointUrlLiteral,
        hasValidSecretFormatBoolean: configurationSnapshot.hasValidSecretFormatBoolean,
        diagnosticErrorLiteral: failureCodeLiteral,
      }),
    );
  }

  return await TraceExecutionTime(
    PROBE_MODULE_IDENTIFIER,
    PROBE_EXECUTION_OPERATION_CODE,
    correlationIdentifier,
    async (): Promise<IIndividualProviderAuditSnapshot> => {
      const executionStartTimestampNumeric = globalThis.performance.now();

      try {
        const incomingNetworkResponse = await fetch(
          configurationSnapshot.targetEndpointUrlLiteral,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${configurationSnapshot.apiTokenSecret}`,
              'Content-Type': 'application/json',
              Accept: 'application/json',
              'X-Correlation-Identifier': correlationIdentifier,
            },
            body: configurationSnapshot.serializedProbeBodyLiteral,
            signal: AbortSignal.timeout(MAXIMUM_GATEWAY_TIMEOUT_IN_MILLISECONDS_QUANTITY),
          },
        );

        const executionLatencyInMillisecondsQuantity = Math.max(
          0,
          Math.round(globalThis.performance.now() - executionStartTimestampNumeric),
        );

        return await TriageHuggingFaceProbeResponse(
          incomingNetworkResponse,
          executionLatencyInMillisecondsQuantity,
          configurationSnapshot.targetEndpointUrlLiteral,
          configurationSnapshot.modelIdentifierLiteral,
          correlationIdentifier,
        );
      } catch (caughtExecutionError: unknown) {
        const executionLatencyInMillisecondsQuantity = Math.max(
          0,
          Math.round(globalThis.performance.now() - executionStartTimestampNumeric),
        );
        const errorDescriptionLiteral = extractExecutionErrorMessageLiteral(caughtExecutionError);

        void EmitTelemetrySignal({
          occurrenceTimestampISO: new Date().toISOString(),
          severityLevelLiteral: 'CRITICAL',
          moduleIdentifierLiteral: PROBE_MODULE_IDENTIFIER,
          operationCodeLiteral: NETWORK_COLLAPSE_OPERATION_CODE,
          correlationIdentifier,
          messageContentLiteral: `Fallo de red al conectar con Hugging Face Router: ${errorDescriptionLiteral}`,
          executionLatencyInMillisecondsQuantity,
          semanticIntentTag: 'INFRASTRUCTURE_NETWORK_COLLAPSE',
          contextMetadataSnapshot: Object.freeze({
            errorDescriptionLiteral,
            targetEndpointUrlLiteral: configurationSnapshot.targetEndpointUrlLiteral,
            modelIdentifierLiteral: configurationSnapshot.modelIdentifierLiteral,
          }),
        });

        return Object.freeze(
          IndividualProviderAuditSnapshotSchema.parse({
            providerIdentifier: 'HUGGING_FACE_COGNITIVE_INFERENCE',
            probeStatusLiteral: 'UNREACHABLE_FAILURE',
            executionLatencyInMillisecondsQuantity,
            statusDescriptionLiteral: `Incapaz de conectar con Hugging Face Router (${configurationSnapshot.modelIdentifierLiteral}): ${errorDescriptionLiteral}`,
            endpointTargetLiteral: configurationSnapshot.targetEndpointUrlLiteral,
            hasValidSecretFormatBoolean: true,
            diagnosticErrorLiteral: errorDescriptionLiteral,
          }),
        );
      }
    },
  );
};
