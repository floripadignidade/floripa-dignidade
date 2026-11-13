/**
 * @section Resend Provider - Infrastructure Health Probe
 * @description Evalúa la disponibilidad y el rendimiento del servicio externo Resend.
 *
 * Protocolo OEDP-V14.0 - Verbatim Module Syntax.
 * @author Dirección de Ingeniería - Floripa Dignidade
 */

import {
  EmitTelemetrySignal,
  GenerateCorrelationIdentifier,
  TraceExecutionTime,
} from '@floripa-dignidade/telemetry';
import { Resend } from 'resend';

/** 🛡️ SANEAMIENTO Zenith: Importación de ADN como tipo puro */
import type { IResendConfiguration } from '../../schemas/ResendEmail.schema';

const RESEND_PROVIDER_IDENTIFIER = 'RESEND_COMMUNICATION_PROVIDER';

export const AuditResendHealthProbe = async (
  providerConfiguration: IResendConfiguration,
): Promise<boolean> => {
  const correlationIdentifier = GenerateCorrelationIdentifier();

  return await TraceExecutionTime(
    RESEND_PROVIDER_IDENTIFIER,
    'HEALTH_CHECK_PROBE_OPERATION',
    correlationIdentifier,
    async () => {
      const resendClientInstance = new Resend(providerConfiguration.securityApiKeySecret);

      try {
        const { data: domainsData, error: probeErrorSignal } =
          await resendClientInstance.domains.list();

        if (probeErrorSignal) {
          throw new Error(probeErrorSignal.message);
        }

        const isServiceAvailableBoolean = domainsData !== null;

        EmitTelemetrySignal({
          severityLevel: 'INFO',
          moduleIdentifier: RESEND_PROVIDER_IDENTIFIER,
          operationCode: 'EXTERNAL_PROVIDER_HEALTH_NOMINAL',
          correlationIdentifier,
          message: 'Sonda de salud exitosa: Resend API responde correctamente.',
          contextMetadata: {
            isAvailable: isServiceAvailableBoolean,
            timestamp: new Date().toISOString(),
          },
        });

        return isServiceAvailableBoolean;
      } catch (caughtError) {
        EmitTelemetrySignal({
          severityLevel: 'CRITICAL',
          moduleIdentifier: RESEND_PROVIDER_IDENTIFIER,
          operationCode: 'EXTERNAL_PROVIDER_HEALTH_DOWN',
          correlationIdentifier,
          message: 'Sonda de salud fallida: El proveedor Resend no responde.',
          contextMetadata: {
            errorTrace: caughtError instanceof Error ? caughtError.message : String(caughtError),
          },
        });

        return false;
      }
    },
  );
};
