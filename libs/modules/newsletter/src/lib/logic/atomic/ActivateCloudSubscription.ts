/**
 * @section Newsletter Logic - Cloud Activation Orchestrator
 * @description Orquestador soberano encargado de la transición de estado
 * del ciudadano (PENDING -> ACTIVE). Implementa el patrón Swarm Orchestration
 * delegando en átomos especializados para seguridad, I/O y parseo.
 *
 * Protocolo OEDP-V17.0 - High Performance SRE & Swarm Intelligence.
 * SANEADO Zenith: Resolución de paradoja asíncrona (Fix TS2339) y Prosa ISO.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { ValidateEnvironmentAduana } from '@floripa-dignidade/environment-validator';
import { MapHttpErrorToException } from '@floripa-dignidade/exceptions';
import {
  EmitTelemetrySignal,
  GenerateCorrelationIdentifier,
  TraceExecutionTime,
} from '@floripa-dignidade/telemetry';

/* 1. ADN Estructural de Salida */
export interface IActivationResult {
  readonly isActivationSuccessfulBoolean: boolean;
  readonly activatedCitizenEmailLiteral?: string;
  readonly metadataSnapshot?: Record<string, unknown>;
}

/* 2. Enjambre Atómico Local (Internal Swarm) */
import { BuildCloudPatchHeaders } from './BuildCloudPatchHeaders';
import { ExecuteCloudActivationRequest } from './ExecuteCloudActivationRequest';
import { ParseSubscriberActivationResult } from './ParseSubscriberActivationResult';

/** Identificador técnico del aparato para el Neural Sentinel. */
const ACTIVATION_ORCHESTRATOR_IDENTIFIER = 'NEWSLETTER_ACTIVATION_ENGINE';

/**
 * Ejecuta el ciclo integral de activación de soberanía en la nube.
 *
 * @param verificationTokenLiteral - Token secreto capturado de la URL.
 * @returns {Promise<IActivationResult>} Resultado validado y auditado.
 */
export const ActivateCloudSubscription = async (
  verificationTokenLiteral: string,
): Promise<IActivationResult> => {
  const correlationIdentifier = GenerateCorrelationIdentifier();

  return await TraceExecutionTime(
    ACTIVATION_ORCHESTRATOR_IDENTIFIER,
    'EXECUTE_CITIZEN_ACTIVATION_FLOW',
    correlationIdentifier,
    async () => {
      try {
        /**
         * 1. CAPTURA DE SOBERANÍA DE HARDWARE (Aduana de Entorno)
         * 🛡️ SANEADO Zenith: Inyección de 'await' para resolver la promesa
         * de la aduana antes de intentar acceder a los secretos del hardware.
         */
        const { SUPABASE_URL: cloudUrlLiteral, SUPABASE_SERVICE_ROLE_KEY: cloudSecurityKeySecret } =
          await ValidateEnvironmentAduana();

        // 2. CONSTRUCCIÓN DE SEGURIDAD (Delegación Atómica)
        const securityHeaders = BuildCloudPatchHeaders(cloudSecurityKeySecret);

        // 3. DESPACHO FÍSICO A LA NUBE (Delegación Atómica)
        const networkResponse = await ExecuteCloudActivationRequest(
          cloudUrlLiteral,
          securityHeaders,
          verificationTokenLiteral,
          correlationIdentifier,
        );

        if (!networkResponse.ok) {
          throw MapHttpErrorToException(networkResponse.status, 'ACTIVATION_CLOUD_I/O_FAULT');
        }

        const rawJsonPayloadSnapshot = await networkResponse.json();

        // 4. ADUANA DE ADN Y VEREDICTO (Delegación Atómica)
        const activationResult = ParseSubscriberActivationResult(rawJsonPayloadSnapshot);

        // 5. REPORTE DE ESTADO (SRE Visibility)
        void EmitTelemetrySignal({
          severityLevelLiteral: activationResult.isActivationSuccessfulBoolean ? 'INFO' : 'WARNING',
          moduleIdentifierLiteral: ACTIVATION_ORCHESTRATOR_IDENTIFIER,
          operationCodeLiteral: activationResult.isActivationSuccessfulBoolean
            ? 'CONVERSION_SUCCESS'
            : 'INVALID_TOKEN',
          correlationIdentifier,
          messageContentLiteral: 'Proceso de activación de ciudadanía finalizado.',
          contextMetadataSnapshot: { ...activationResult.metadataSnapshot },
        });

        return activationResult;
      } catch (caughtError: unknown) {
        // 6. GESTIÓN FORENSE DE COLAPSO (Resilience Layer)
        const errorDescriptionLiteral =
          caughtError instanceof Error ? caughtError.message : String(caughtError);

        void EmitTelemetrySignal({
          severityLevelLiteral: 'CRITICAL',
          moduleIdentifierLiteral: ACTIVATION_ORCHESTRATOR_IDENTIFIER,
          operationCodeLiteral: 'ACTIVATION_PIPELINE_COLLAPSE',
          correlationIdentifier,
          messageContentLiteral: 'Error catastrófico en el orquestador de activación.',
          contextMetadataSnapshot: { errorTraceLiteral: errorDescriptionLiteral },
        });

        throw caughtError;
      }
    },
  );
};
