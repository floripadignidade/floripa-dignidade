/**
 * @section Newsletter Logic - Notification Dispatcher
 * @description Átomo encargado de la construcción física y despacho de la
 * notificación de verificación. Aísla los detalles de los proveedores externos.
 *
 * Protocolo OEDP-V16.0 - Functional Atomicity & Channel Abstraction.
 */

import { SendTransactionalEmail } from '@floripa-dignidade/resend-provider';
import { EmitTelemetrySignal } from '@floripa-dignidade/telemetry';
import type { INewsletterI18n } from '../../i18n/NewsletterI18n.schema';
import type { ISubscriptionVerificationChannel } from '../../schemas/NewsletterSubscriptionRequest.schema';
import { GenerateDoubleOptInEmailHtml } from './GenerateDoubleOptInEmailHtml';

/**
 * @interface IDispatchVerificationParameters
 * @description Contrato inmutable para el despacho de identidad.
 */
interface IDispatchVerificationParameters {
  readonly targetIdentifierLiteral: string;
  readonly targetChannelLiteral: ISubscriptionVerificationChannel;
  readonly securityTokenLiteral: string;
  readonly linguisticDictionary: INewsletterI18n;
  readonly correlationIdentifier: string;
  readonly infrastructureSecrets: {
    readonly resendApiKeySecret: string;
    readonly resendFromEmailLiteral: string;
  };
}

/**
 * Ejecuta el despacho físico de la verificación según el canal solicitado.
 */
export const DispatchNewsletterVerification = async (
  parameters: IDispatchVerificationParameters,
): Promise<void> => {
  const { targetChannelLiteral, linguisticDictionary, correlationIdentifier } = parameters;

  if (targetChannelLiteral === 'ELECTRONIC_MAIL') {
    const emailHtmlContentLiteral = GenerateDoubleOptInEmailHtml(
      linguisticDictionary,
      parameters.securityTokenLiteral,
      correlationIdentifier,
    );

    await SendTransactionalEmail(
      {
        securityApiKeySecret: parameters.infrastructureSecrets.resendApiKeySecret,
        defaultFromAddressLiteral: parameters.infrastructureSecrets.resendFromEmailLiteral,
      },
      {
        targetRecipientAddressLiteral: parameters.targetIdentifierLiteral,
        emailSubjectLiteral: linguisticDictionary.email.confirmationSubjectLiteral,
        emailHtmlContentLiteral: emailHtmlContentLiteral,
        trackingCategoryIdentifier: 'NEWSLETTER_VERIFICATION',
      },
    );

    EmitTelemetrySignal({
      severityLevel: 'INFO',
      moduleIdentifier: 'NEWSLETTER_DISPATCH_ATOM',
      operationCode: 'VERIFICATION_EMAIL_SENT',
      correlationIdentifier,
      message: 'Correo de verificación de soberanía despachado exitosamente.',
    });
  }

  // TODO: Implementar rama para 'WHATSAPP_MESSAGE' una vez nivelado el meta-provider.
};
