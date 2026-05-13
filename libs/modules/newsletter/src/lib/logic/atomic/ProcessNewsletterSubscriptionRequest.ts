/**
 * @section Newsletter Logic - Subscription Request Orchestrator
 * @description Orquestador soberano de negocio. Coordina la secuencia de
 * validación, persistencia en nube y despacho de desafío de identidad.
 *
 * Protocolo OEDP-V17.0 - High Performance SRE & Swarm Intelligence.
 * SANEADO Zenith: Resolución de Paradoja de Identidad (Fix TS2304/TS6133),
 * inyección de auditoría forense y cumplimiento de Prosa ISO (Zero Abbreviations).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { ValidateEnvironmentAduana } from '@floripa-dignidade/environment-validator';
import {
  ValidationException,
  MapHttpErrorToException
} from '@floripa-dignidade/exceptions';
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
  rawSubscriptionPayloadSnapshot: unknown
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
         * 🛡️ SANEADO Zenith: Inyección de 'await' mandatorio. La infraestructura
         * debe estar plenamente resuelta para acceder a los secretos (Resend/Supabase).
         */
        const infrastructureSnapshot = await ValidateEnvironmentAduana();

        // 2. ADUANA DE ADN: Validación de entrada (Safe Parsing)
        /**
         * 🛡️ SANEADO Zenith (Fix TS2304/TS6133): Sincronización nominal de
         * la variable de validación para evitar colisiones en el grafo de tipos.
         */
        const validationResultSnapshot = NewsletterSubscriptionRequestSchema.safeParse(rawSubscriptionPayloadSnapshot);

        if (!validationResultSnapshot.success) {
          throw new ValidationException('ADN_SUSCRIPCION_CORRUPTO', {
            validationIssuesCollection: validationResultSnapshot.error.flatten(),
            correlationIdentifier
          });
        }

        const validatedRequest: INewsletterSubscriptionRequest = validationResultSnapshot.data;
        const securityVerificationTokenLiteral = crypto.randomUUID();

        // 3. PERSISTENCIA STATELESS (Supabase Cloud)
        await SavePendingSubscriptionToSupabase({
          emailAddressLiteral: validatedRequest.communicationIdentifierLiteral,
          verificationTokenLiteral: securityVerificationTokenLiteral,
          localeIdentifier: validatedRequest.preferredLinguisticLocaleIdentifier,
          correlationIdentifier,
        });

        // 4. CARGA DE ALMA LINGÜÍSTICA
        const linguisticDictionarySnapshot = await LoadNewsletterLinguisticDictionary(
          validatedRequest.preferredLinguisticLocaleIdentifier
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
            resendFromEmailLiteral: infrastructureSnapshot.RESEND_FROM_EMAIL
          }
        });

        // 6. CIERRE DE CICLO NOMINAL
        void EmitTelemetrySignal({
          severityLevelLiteral: 'INFO',
          moduleIdentifierLiteral: ORCHESTRATOR_IDENTIFIER,
          operationCodeLiteral: 'CITIZEN_SUBSCRIPTION_REQUESTED',
          correlationIdentifier,
          messageContentLiteral: 'Ciclo de vida de suscripción iniciado y notificado.',
          contextMetadataSnapshot: {
            preferredLocale: validatedRequest.preferredLinguisticLocaleIdentifier
          }
        });

        return correlationIdentifier;

      } catch (caughtError: unknown) {
        /**
         * 7. GESTIÓN FORENSE DE FALLO (Resilience Layer)
         */
        const normalizedException = caughtError instanceof ValidationException
          ? caughtError
          : MapHttpErrorToException(500, 'FALLO_EN_ORQUESTACION_DE_SUBSCRIPCION_SRE', {
              originalErrorLiteral: caughtError instanceof Error ? caughtError.message : String(caughtError),
              correlationIdentifier
            });

        // Reporte forense detallado al Neural Sentinel
        ReportForensicException(normalizedException, correlationIdentifier);

        throw normalizedException;
      }
    }
  );
};
