// libs/modules/newsletter/src/lib/logic/atomic/ActivateCloudSubscription.ts

/**
 * @section Newsletter Logic - Cloud Subscription Activation Orchestrator
 * @description Orquestador encargado de validar el token Double Opt-In, resolver
 * las credenciales de Supabase mediante `@floripa-dignidade/environment-validator`,
 * ejecutar la transición de estado (`PENDING_VERIFICATION` -> `ACTIVE`) en la nube
 * y delegar el parseo, la telemetría y la normalización de fallos en átomos puros.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Clean Paths).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa) e ISO/IEC 25010 (Confiabilidad y Seguridad).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { z } from 'zod';

import { ValidateEnvironmentContract } from '@floripa-dignidade/environment-validator';
import { MapHttpErrorToException, ValidationException } from '@floripa-dignidade/exceptions';
import {
  type CorrelationIdentifier,
  CorrelationIdentifierSchema,
  GenerateCorrelationIdentifier,
  type ModuleIdentifier,
  ModuleIdentifierSchema,
  type OperationCode,
  OperationCodeSchema,
  TraceExecutionTime,
} from '@floripa-dignidade/telemetry';

import { BuildCloudPatchHeaders } from './BuildCloudPatchHeaders';
import { EmitActivationOutcomeTelemetry } from './EmitActivationOutcomeTelemetry';
import { ExecuteCloudActivationRequest } from './ExecuteCloudActivationRequest';
import { NormalizeCloudActivationError } from './NormalizeCloudActivationError';
import { ParseSubscriberActivationResult } from './ParseSubscriberActivationResult';

/**
 * @interface IActivationResult
 * @description Contrato inmutable de salida para el resultado de activación de suscripción.
 */
export interface IActivationResult {
  readonly isActivationSuccessfulBoolean: boolean;
  readonly activatedCitizenEmailLiteral?: string;
  readonly metadataSnapshot?: Readonly<Record<string, unknown>>;
}

const ACTIVATION_MODULE_IDENTIFIER: ModuleIdentifier = ModuleIdentifierSchema.parse(
  'NEWSLETTER_ACTIVATION_ENGINE',
);

const ACTIVATION_TRACE_OPERATION_CODE: OperationCode = OperationCodeSchema.parse(
  'EXECUTE_CITIZEN_ACTIVATION_FLOW',
);

const VerificationTokenParameterSchema = z
  .string()
  .trim()
  .uuid({ message: 'INVALID_ACTIVATION_VERIFICATION_TOKEN_UUID' });

const resolveSafeCorrelationIdentifier = (
  correlationIdentifierFallback: string | undefined,
): CorrelationIdentifier => {
  const validationResult = CorrelationIdentifierSchema.safeParse(correlationIdentifierFallback);
  return validationResult.success ? validationResult.data : GenerateCorrelationIdentifier();
};

const validateVerificationTokenLiteral = (
  verificationTokenLiteral: string,
  correlationIdentifier: CorrelationIdentifier,
): string => {
  const tokenValidationResult =
    VerificationTokenParameterSchema.safeParse(verificationTokenLiteral);

  if (!tokenValidationResult.success) {
    throw new ValidationException('TOKEN_DE_ACTIVACION_INVALIDO', {
      validationIssuesCollection: tokenValidationResult.error.flatten(),
      correlationIdentifier,
    });
  }

  return tokenValidationResult.data;
};

const executeActivationPatchAction = async (
  sanitizedTokenLiteral: string,
  correlationIdentifier: CorrelationIdentifier,
): Promise<IActivationResult> => {
  const { SUPABASE_URL: rawSupabaseUrlLiteral, SUPABASE_SERVICE_ROLE_KEY: cloudSecurityKeySecret } =
    await ValidateEnvironmentContract();

  const normalizedSupabaseUrlLiteral = rawSupabaseUrlLiteral.trim().replace(/\/+$/, '');
  const securityHeadersSnapshot = BuildCloudPatchHeaders(cloudSecurityKeySecret);

  const networkResponse = await ExecuteCloudActivationRequest(
    normalizedSupabaseUrlLiteral,
    securityHeadersSnapshot,
    sanitizedTokenLiteral,
    correlationIdentifier,
  );

  if (!networkResponse.ok) {
    throw MapHttpErrorToException(networkResponse.status, 'ACTIVATION_CLOUD_IO_FAULT', {
      httpStatusNumeric: networkResponse.status,
      correlationIdentifier,
    });
  }

  const rawJsonPayloadSnapshot: unknown = await networkResponse.json();
  return ParseSubscriberActivationResult(rawJsonPayloadSnapshot);
};

/**
 * Valida el token de verificación y transiciona al suscriptor de pendiente a activo en Supabase.
 *
 * @param verificationTokenLiteral - Token UUID v4 capturado desde el enlace de confirmación.
 * @param correlationIdentifierFallback - Identificador UUID v4 opcional para propagar trazabilidad.
 * @returns {Promise<IActivationResult>} Resultado inmutable y validado de la activación.
 * @throws {ValidationException} Si el token proporcionado no es un UUID v4 válido.
 * @throws {GlobalBaseException} Si falla la comunicación o respuesta de Supabase PostgREST.
 */
export const ActivateCloudSubscription = async (
  verificationTokenLiteral: string,
  correlationIdentifierFallback?: string,
): Promise<IActivationResult> => {
  const correlationIdentifier = resolveSafeCorrelationIdentifier(correlationIdentifierFallback);

  return await TraceExecutionTime(
    ACTIVATION_MODULE_IDENTIFIER,
    ACTIVATION_TRACE_OPERATION_CODE,
    correlationIdentifier,
    async (): Promise<IActivationResult> => {
      try {
        const sanitizedTokenLiteral = validateVerificationTokenLiteral(
          verificationTokenLiteral,
          correlationIdentifier,
        );

        const activationResultSnapshot = await executeActivationPatchAction(
          sanitizedTokenLiteral,
          correlationIdentifier,
        );

        EmitActivationOutcomeTelemetry({
          moduleIdentifierLiteral: ACTIVATION_MODULE_IDENTIFIER,
          isActivationSuccessfulBoolean: activationResultSnapshot.isActivationSuccessfulBoolean,
          correlationIdentifier,
          metadataSnapshot: activationResultSnapshot.metadataSnapshot,
        });

        return activationResultSnapshot;
      } catch (caughtExecutionError: unknown) {
        throw NormalizeCloudActivationError({
          caughtExecutionError,
          moduleIdentifierLiteral: ACTIVATION_MODULE_IDENTIFIER,
          correlationIdentifier,
        });
      }
    },
  );
};
