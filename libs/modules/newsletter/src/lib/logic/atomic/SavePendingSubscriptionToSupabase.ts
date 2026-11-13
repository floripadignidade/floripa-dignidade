/**
 * @section Newsletter Logic - Cloud Persistence Atom
 * @description Ejecuta la inserción física de una suscripción pendiente en el
 * Ledger institucional de Supabase. Implementa un patrón de ejecución
 * stateless con blindaje de red y validación de ADN en frontera.
 *
 * Protocolo OEDP-V17.0 - High Performance SRE & Cloud Sovereign.
 * SANEADO Zenith: Inyección de Aduana Zod interna, protección de timeout
 * mediante AbortSignal y resiliencia 'keepalive' para el Edge Runtime.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { z } from 'zod';
import { ValidateEnvironmentAduana } from '@floripa-dignidade/environment-validator';
import { MapHttpErrorToException } from '@floripa-dignidade/exceptions';
import {
  EmitTelemetrySignal,
  // GenerateCorrelationIdentifier,
  TraceExecutionTime,
} from '@floripa-dignidade/telemetry';

/**
 * @section Aduana de ADN (Internal Schema)
 * Garantiza que el átomo no procese basura técnica.
 */
const SavePendingSubscriptionParametersSchema = z
  .object({
    emailAddressLiteral: z.string().email(),
    verificationTokenLiteral: z.string().uuid(),
    localeIdentifier: z.string().min(2),
    correlationIdentifier: z.string().uuid(),
  })
  .readonly();

export type ISavePendingSubscriptionParameters = z.infer<
  typeof SavePendingSubscriptionParametersSchema
>;

/** Identificador técnico del aparato para el Neural Sentinel. */
const PERSISTENCE_ATOM_IDENTIFIER = 'NEWSLETTER_CLOUD_PERSISTENCE_ATOM';

/**
 * Persiste un registro de ciudadano en estado 'PENDING_VERIFICATION' en la nube.
 * Realiza una auditoría de secretos previa para garantizar la integridad de la red.
 *
 * @param parameters - Objeto con los datos del ciudadano y metadatos de rastreo.
 * @throws {InternalSystemException} Si la conexión con el Tier de Datos colapsa.
 * @returns {Promise<void>} Promesa de finalización de la transacción cloud.
 */
export const SavePendingSubscriptionToSupabase = async (
  parameters: ISavePendingSubscriptionParameters,
): Promise<void> => {
  return await TraceExecutionTime(
    PERSISTENCE_ATOM_IDENTIFIER,
    'EXECUTE_CLOUD_LEDGER_INSERTION',
    parameters.correlationIdentifier,
    async () => {
      // 1. ADUANA DE ADN: Validación de frontera atómica
      const validationResultSnapshot =
        SavePendingSubscriptionParametersSchema.safeParse(parameters);

      if (!validationResultSnapshot.success) {
        throw MapHttpErrorToException(400, 'ADN_DE_PERSISTENCIA_CORRUPTO', {
          issuesCollection: validationResultSnapshot.error.flatten(),
        });
      }

      /**
       * 2. CAPTURA SEGURA DE INFRAESTRUCTURA (Aduana de Entorno)
       * 🛡️ SANEADO Zenith: El búnker environment-validator garantiza Branded Types.
       */
      const { SUPABASE_URL: cloudUrlLiteral, SUPABASE_SERVICE_ROLE_KEY: cloudSecurityKeySecret } =
        await ValidateEnvironmentAduana();

      try {
        /**
         * @section Comunicación Física (Cloud Native Layer)
         * Uso de fetch nativo con señal de tiempo de espera (SRE Compliance).
         */
        const targetEndpointLiteral = `${cloudUrlLiteral}/rest/v1/newsletter_subscribers`;

        const outgoingResponse = await fetch(targetEndpointLiteral, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            apikey: cloudSecurityKeySecret,
            Authorization: `Bearer ${cloudSecurityKeySecret}`,
            Prefer: 'return=minimal',
          },
          body: JSON.stringify({
            email_address: parameters.emailAddressLiteral,
            verification_token: parameters.verificationTokenLiteral,
            preferred_locale: parameters.localeIdentifier,
            correlation_id: parameters.correlationIdentifier,
            status: 'PENDING_VERIFICATION',
            created_at: new Date().toISOString(),
          }),
          /** 🛡️ SANEADO Zenith: Garantiza que la petición termine incluso si el contexto se cierra. */
          keepalive: true,
          /** 🛡️ SANEADO Zenith: Prevención de peticiones zombis (Timeout 8s). */
          signal: AbortSignal.timeout(8000),
        });

        if (!outgoingResponse.ok) {
          throw MapHttpErrorToException(outgoingResponse.status, 'SUPABASE_PROVIDER_REJECTION', {
            httpStatusNumeric: outgoingResponse.status,
            endpoint: targetEndpointLiteral,
          });
        }

        // 3. REPORTE DE ÉXITO (Audit Trail)
        void EmitTelemetrySignal({
          severityLevelLiteral: 'INFO',
          moduleIdentifierLiteral: PERSISTENCE_ATOM_IDENTIFIER,
          operationCodeLiteral: 'CLOUD_INSERTION_NOMINAL',
          correlationIdentifier: parameters.correlationIdentifier,
          messageContentLiteral: 'TELEMETRY.SIGNALS.END_PROCESS',
          contextMetadataSnapshot: {
            targetTableLiteral: 'newsletter_subscribers',
            recordIdentityLiteral: parameters.emailAddressLiteral,
          },
        });
      } catch (caughtError: unknown) {
        /**
         * @section Gestión Forense de Colapso
         * Si el fallo es de red o rechazo del proveedor, lo elevamos con rastro forense.
         */
        const errorDescriptionLiteral =
          caughtError instanceof Error ? caughtError.message : String(caughtError);

        void EmitTelemetrySignal({
          severityLevelLiteral: 'CRITICAL',
          moduleIdentifierLiteral: PERSISTENCE_ATOM_IDENTIFIER,
          operationCodeLiteral: 'CLOUD_PERSISTENCE_FAULT',
          correlationIdentifier: parameters.correlationIdentifier,
          messageContentLiteral: 'Fallo crítico al persistir suscripción en el Ledger Cloud.',
          contextMetadataSnapshot: { errorTraceLiteral: errorDescriptionLiteral },
        });

        if (errorDescriptionLiteral.includes('Exception')) {
          throw caughtError;
        }

        throw MapHttpErrorToException(500, 'FALLO_FISICO_PERSISTENCIA_NEWSLETTER', {
          originalErrorLiteral: errorDescriptionLiteral,
          correlationIdentifier: parameters.correlationIdentifier,
        });
      }
    },
  );
};
