/**
 * @section Resend Provider - Atomic Transmission
 * @description Ejecuta el despacho físico de correos utilizando el SDK oficial.
 *
 * Protocolo OEDP-V14.0 - Verbatim Module Syntax.
 * @author Dirección de Ingeniería - Floripa Dignidade
 */

import {
  EmitTelemetrySignal,
  GenerateCorrelationIdentifier,
  TraceExecutionTime,
} from '@floripa-dignidade/telemetry';
import { InternalSystemException } from '@floripa-dignidade/exceptions';
import { Resend } from 'resend';

/** 🛡️ SANEAMIENTO Zenith: Importación de ADN estructural como tipo */
import type { IResendConfiguration } from '../../schemas/ResendEmail.schema';
import { TransactionalEmailPayloadSchema } from '../../schemas/ResendEmail.schema';

const RESEND_PROVIDER_IDENTIFIER = 'RESEND_COMMUNICATION_PROVIDER';

export const SendTransactionalEmail = async (
  providerConfiguration: IResendConfiguration,
  unvalidatedEmailPayload: unknown,
): Promise<string> => {
  const correlationIdentifier = GenerateCorrelationIdentifier();

  return await TraceExecutionTime(
    RESEND_PROVIDER_IDENTIFIER,
    'EMAIL_TRANSMISSION_OPERATION',
    correlationIdentifier,
    async () => {
      const validationResult = TransactionalEmailPayloadSchema.safeParse(unvalidatedEmailPayload);

      if (!validationResult.success) {
        throw new InternalSystemException('ADN_CORREO_CORRUPTO', {
          validationIssues: validationResult.error.flatten(),
          receivedPayloadSnapshot: unvalidatedEmailPayload,
        });
      }

      const validatedPayload = validationResult.data;
      const resendClientInstance = new Resend(providerConfiguration.securityApiKeySecret);

      try {
        const { data: transmissionData, error: transmissionErrorSignal } =
          await resendClientInstance.emails.send({
            from: providerConfiguration.defaultFromAddressLiteral,
            to: validatedPayload.targetRecipientAddressLiteral,
            subject: validatedPayload.emailSubjectLiteral,
            html: validatedPayload.emailHtmlContentLiteral,
            tags: [
              { name: 'correlation_identifier', value: correlationIdentifier },
              { name: 'tracking_category', value: validatedPayload.trackingCategoryIdentifier },
            ],
          });

        if (transmissionErrorSignal) {
          throw new Error(transmissionErrorSignal.message);
        }

        EmitTelemetrySignal({
          severityLevel: 'INFO',
          moduleIdentifier: RESEND_PROVIDER_IDENTIFIER,
          operationCode: 'EMAIL_DISPATCH_SUCCESS',
          correlationIdentifier,
          message: `Correo despachado con éxito a: [${validatedPayload.targetRecipientAddressLiteral}]`,
          contextMetadata: {
            resendMessageIdentifier: transmissionData?.id,
          },
        });

        return transmissionData?.id || 'SUCCESS_SIGNAL';
      } catch (caughtError) {
        const errorMessageLiteral =
          caughtError instanceof Error ? caughtError.message : String(caughtError);

        EmitTelemetrySignal({
          severityLevel: 'CRITICAL',
          moduleIdentifier: RESEND_PROVIDER_IDENTIFIER,
          operationCode: 'RESEND_API_COMMUNICATION_FAILURE',
          correlationIdentifier,
          message: `Fallo crítico en el enlace con el proveedor: ${errorMessageLiteral}`,
          contextMetadata: {
            correlationIdentifier,
          },
        });

        throw new InternalSystemException('FALLO_DE_TRANSMISION_EXTERNA', {
          originalProviderErrorLiteral: errorMessageLiteral,
          correlationIdentifier,
        });
      }
    },
  );
};
