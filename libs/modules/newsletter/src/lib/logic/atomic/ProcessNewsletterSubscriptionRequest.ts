/**
 * @section Newsletter Logic - Subscription Request Orchestrator
 * @description Orquestador soberano de negocio. Coordina la secuencia de
 * validación, persistencia en nube y despacho de desafío de identidad.
 *
 * Protocolo OEDP-V17.0 - High Performance SRE & Swarm Intelligence.
 * SANEADO Zenith: Erradicación de entropía visual (Fix sort-imports), inyección
 * de PII Masking para cumplimiento LGPD y normalización de Prosa ISO.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { ValidateEnvironmentAduana } from '@floripa-dignidade/environment-validator';

/**
 * 🛡️ LEY ZENITH (Fix sort-imports):
 * Ordenamiento alfabético estricto de miembros (M < V).
 */
import { MapHttpErrorToException, ValidationException } from '@floripa-dignidade/exceptions';

import { MaskSovereignIdentity } from '@floripa-dignidade/shared-utility';

import {
  EmitTelemetrySignal,
  GenerateCorrelationIdentifier,
  ReportForensicException,
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
const ORCHESTRATOR_IDENTIFIER = 'NEWSLETTER_SUBSCRIPTION_ORCHESTRATOR';

/**
 * Procesa integralmente una solicitud de suscripción ciudadana.
 * Implementa el patrón "Sovereign Ingestion" garantizando la integridad de
 * cada fase de la transacción mediante telemetría forense.
 *
 * @param rawSubscriptionPayloadSnapshot - Datos crudos del formulario.
 * @returns {Promise<string>} Correlation ID de la transacción exitosa.
 * @throws {ValidationException} Si el contrato de datos es violado.
 * @throws {InternalSystemException} Si la infraestructura Cloud colapsa.
 */
export const ProcessNewsletterSubscriptionRequest = async (
  rawSubscriptionPayloadSnapshot: unknown,
): Promise<string> => {
  const correlationIdentifier = GenerateCorrelationIdentifier();

  return await TraceExecutionTime(
    ORCHESTRATOR_IDENTIFIER,
    'EXECUTE_SUBSCRIPTION_FLOW',
    correlationIdentifier,
    async () => {
      try {
        /**
         * 1. CAPTURA DE INFRAESTRUCTURA (Sovereign Secrets)
         * 🛡️ LEY ZENITH: La infraestructura debe estar plenamente resuelta
         * para acceder a los secretos (Resend/Supabase).
         */
        const infrastructureSnapshot = await ValidateEnvironmentAduana();

        // 2. ADUANA DE ADN: Validación de entrada (Safe Parsing)
        const validationResultSnapshot = NewsletterSubscriptionRequestSchema.safeParse(
          rawSubscriptionPayloadSnapshot,
        );

        if (!validationResultSnapshot.success) {
          throw new ValidationException('NEWSLETTER.ERRORS.ADN_CORRUPTED', {
            validationIssuesCollection: validationResultSnapshot.error.flatten(),
            correlationIdentifier,
          });
        }

        const validatedRequest: INewsletterSubscriptionRequest = validationResultSnapshot.data;
        const securityVerificationTokenLiteral = crypto.randomUUID();

        /**
         * 🛡️ PROTECCIÓN DE PRIVACIDAD (PII Masking - LGPD Compliance)
         * Enmascaramos el identificador para que el rastro de telemetría no exponga
         * el correo real del ciudadano en los logs institucionales.
         */
        const maskedCommunicationIdentifierLiteral = await MaskSovereignIdentity({
          rawIdentityLiteral: validatedRequest.communicationIdentifierLiteral,
          maskingStrategyLiteral: 'ELECTRONIC_MAIL',
        });

        // 3. PERSISTENCIA STATELESS (Supabase Cloud)
        await SavePendingSubscriptionToSupabase({
          emailAddressLiteral: validatedRequest.communicationIdentifierLiteral,
          verificationTokenLiteral: securityVerificationTokenLiteral,
          localeIdentifier: validatedRequest.preferredLinguisticLocaleIdentifier,
          correlationIdentifier,
        });

        // 4. CARGA DE ALMA LINGÜÍSTICA
        const linguisticDictionarySnapshot = await LoadNewsletterLinguisticDictionary(
          validatedRequest.preferredLinguisticLocaleIdentifier,
        );

        // 5. DESPACHO DE NOTIFICACIÓN (Delegación Atómica)
        await DispatchNewsletterVerification({
          targetIdentifierLiteral: validatedRequest.communicationIdentifierLiteral,
          targetChannelLiteral: validatedRequest.verificationChannelPreference,
          securityTokenLiteral: securityVerificationTokenLiteral,
          linguisticDictionary: linguisticDictionarySnapshot,
          correlationIdentifier,
          infrastructureSecrets: {
            resendApiKeySecret: infrastructureSnapshot.RESEND_API_KEY,
            resendFromEmailLiteral: infrastructureSnapshot.RESEND_FROM_EMAIL,
          },
        });

        // 6. CIERRE DE CICLO NOMINAL (SRE Visibility)
        void EmitTelemetrySignal({
          severityLevelLiteral: 'INFO',
          moduleIdentifierLiteral: ORCHESTRATOR_IDENTIFIER,
          operationCodeLiteral: 'CITIZEN_SUBSCRIPTION_REQUESTED',
          correlationIdentifier,
          /** 🛡️ SANEADO: Uso de clave semántica internacionalizada. */
          messageContentLiteral: 'NEWSLETTER.LOGS.SUBSCRIPTION_REQUESTED',
          semanticIntentTag: 'NEWSLETTER_CONVERSION_START',
          contextMetadataSnapshot: {
            preferredLocaleIdentifier: validatedRequest.preferredLinguisticLocaleIdentifier,
            citizenMaskLiteral: maskedCommunicationIdentifierLiteral,
          },
        });

        return correlationIdentifier;
      } catch (caughtError: unknown) {
        /**
         * 7. GESTIÓN FORENSE DE FALLO (Resilience Layer)
         */
        const normalizedException =
          caughtError instanceof ValidationException
            ? caughtError
            : MapHttpErrorToException(500, 'NEWSLETTER.ERRORS.ORCHESTRATION_FAULT', {
                originalErrorLiteral:
                  caughtError instanceof Error ? caughtError.message : String(caughtError),
                correlationIdentifier,
              });

        // Reporte forense detallado al Neural Sentinel
        ReportForensicException(normalizedException, correlationIdentifier);

        throw normalizedException;
      }
    },
  );
};
