/**
 * @section Newsletter Logic - Subscription Request Orchestrator
 * @description Orquestador superior de negocio. Coordina la secuencia de
 * validación, persistencia en nube y despacho de desafío de identidad.
 *
 * Protocolo OEDP-V17.0 - High Performance SRE & Swarm Intelligence.
 * SANEADO Zenith: Resolución de paradoja asíncrona (Fix TS2339) y Prosa ISO.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { ValidateEnvironmentAduana } from '@floripa-dignidade/environment-validator';
import { ValidationException } from '@floripa-dignidade/exceptions';
import {
  EmitTelemetrySignal,
  GenerateCorrelationIdentifier,
  TraceExecutionTime,
} from '@floripa-dignidade/telemetry';

/* 1. ADN Estructural (Verbatim Module Syntax) */
import { NewsletterSubscriptionRequestSchema } from '../../schemas/NewsletterSubscriptionRequest.schema';
import type { INewsletterSubscriptionRequest } from '../../schemas/NewsletterSubscriptionRequest.schema';

/* 2. Enjambre Atómico de Soporte (Internal Swarm) */
import { DispatchNewsletterVerification } from './DispatchNewsletterVerification';
import { LoadNewsletterLinguisticDictionary } from './LoadNewsletterLinguisticDictionary';
import { SavePendingSubscriptionToSupabase } from './SavePendingSubscriptionToSupabase';

/** Identificador técnico del orquestador para el Neural Sentinel. */
const NEWSLETTER_ORCHESTRATOR_IDENTIFIER = 'NEWSLETTER_SUBSCRIPTION_ORCHESTRATOR';

/**
 * Procesa integralmente una solicitud de suscripción ciudadana.
 *
 * @param rawSubscriptionPayload - Datos crudos del formulario.
 * @returns {Promise<string>} Correlation ID de la transacción exitosa.
 * @throws {ValidationException} Si el contrato de datos es violado.
 */
export const ProcessNewsletterSubscriptionRequest = async (
  rawSubscriptionPayload: unknown
): Promise<string> => {
  const correlationIdentifier = GenerateCorrelationIdentifier();

  /**
   * 1. CAPTURA DE INFRAESTRUCTURA SOBERANA
   * 🛡️ SANEADO Zenith: Inyección de 'await' mandatorio. La infraestructura
   * debe estar plenamente resuelta para acceder a los secretos (Resend/Supabase).
   */
  const infrastructureSnapshot = await ValidateEnvironmentAduana();

  return await TraceExecutionTime(
    NEWSLETTER_ORCHESTRATOR_IDENTIFIER,
    'EXECUTE_SUBSCRIPTION_FLOW',
    correlationIdentifier,
    async () => {

      // 2. ADUANA DE ADN: Validación de entrada (Safe Parsing)
      const validationResult = NewsletterSubscriptionRequestSchema.safeParse(rawSubscriptionPayload);

      if (!validationResult.success) {
        throw new ValidationException('ADN_SUSCRIPCION_CORRUPTO', {
          validationIssuesCollection: validationResult.error.flatten(),
        });
      }

      const validatedRequest: INewsletterSubscriptionRequest = validationResult.data;
      const securityVerificationTokenLiteral = crypto.randomUUID();

      // 3. PERSISTENCIA STATELESS (Supabase Cloud)
      await SavePendingSubscriptionToSupabase({
        emailAddressLiteral: validatedRequest.communicationIdentifierLiteral,
        verificationTokenLiteral: securityVerificationTokenLiteral,
        localeIdentifier: validatedRequest.preferredLinguisticLocaleIdentifier,
        correlationIdentifier,
      });

      // 4. CARGA DE ALMA LINGÜÍSTICA
      const linguisticDictionary = await LoadNewsletterLinguisticDictionary(
        validatedRequest.preferredLinguisticLocaleIdentifier
      );

      // 5. DESPACHO DE NOTIFICACIÓN (Delegación Atómica)
      await DispatchNewsletterVerification({
        targetIdentifierLiteral: validatedRequest.communicationIdentifierLiteral,
        targetChannelLiteral: validatedRequest.verificationChannelPreference,
        securityTokenLiteral: securityVerificationTokenLiteral,
        linguisticDictionary,
        correlationIdentifier,
        infrastructureSecrets: {
          resendApiKeySecret: infrastructureSnapshot.RESEND_API_KEY,
          resendFromEmailLiteral: infrastructureSnapshot.RESEND_FROM_EMAIL
        }
      });

      // 6. CIERRE DE CICLO NOMINAL
      void EmitTelemetrySignal({
        severityLevelLiteral: 'INFO',
        moduleIdentifierLiteral: NEWSLETTER_ORCHESTRATOR_IDENTIFIER,
        operationCodeLiteral: 'CITIZEN_SUBSCRIPTION_REQUESTED',
        correlationIdentifier,
        messageContentLiteral: 'Ciclo de vida de suscripción iniciado y notificado.',
        contextMetadataSnapshot: {
          preferredLocale: validatedRequest.preferredLinguisticLocaleIdentifier
        }
      });

      return correlationIdentifier;
    }
  );
};
