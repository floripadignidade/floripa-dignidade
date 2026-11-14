/**
 * @section Resend Provider - Infrastructure Health Probe (Atom)
 * @description Evalúa la disponibilidad, autenticación y latencia física del servicio
 * transaccional Resend mediante una consulta a la API de dominios. Reconoce de forma
 * nominal las claves de alcance restringido (`restricted_api_key`) para evitar falsos
 * negativos y emite telemetría SRE estandarizada conforme a `TelemetrySignalSchema`.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Clean Paths).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa), ISO/IEC 25010 (Confiabilidad) e ISO/IEC 27001.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { Resend } from 'resend';

/* 1. Infraestructura Core de Telemetría */
import {
  type CorrelationIdentifier,
  EmitTelemetrySignal,
  GenerateCorrelationIdentifier,
  type ModuleIdentifier,
  ModuleIdentifierSchema,
  type OperationCode,
  TraceExecutionTime,
} from '@floripa-dignidade/telemetry';

/* 2. Contratos Centralizados de Resend */
import {
  type IResendConfiguration,
  ResendConfigurationSchema,
} from '../../schemas/ResendEmail.schema';

const RESEND_PROVIDER_MODULE_IDENTIFIER = ModuleIdentifierSchema.parse(
  'RESEND_COMMUNICATION_PROVIDER',
) as ModuleIdentifier;

const RESTRICTED_API_KEY_ERROR_NAME_LITERAL = 'restricted_api_key';

interface IResendProbeEvaluationVerdict {
  readonly isServiceHealthyBoolean: boolean;
  readonly isRestrictedSendingKeyBoolean: boolean;
  readonly statusDescriptionLiteral: string;
}

/**
 * Evalúa el resultado de la consulta SDK de Resend reconociendo claves con alcance exclusivo de envío.
 *
 * @param hasDomainDataBoolean - Indica si el endpoint devolvió la lista de dominios autorizados.
 * @param rawErrorSignalSnapshot - Objeto de error devuelto por el SDK de Resend si la llamada falló.
 * @returns {IResendProbeEvaluationVerdict} Veredicto técnico sellado e inmutable.
 */
const evaluateResendProbeOutcomeAction = (
  hasDomainDataBoolean: boolean,
  rawErrorSignalSnapshot: { readonly name?: string; readonly message?: string } | null,
): IResendProbeEvaluationVerdict => {
  if (hasDomainDataBoolean) {
    return Object.freeze({
      isServiceHealthyBoolean: true,
      isRestrictedSendingKeyBoolean: false,
      statusDescriptionLiteral:
        'Sonda de salud exitosa: Resend API responde correctamente con acceso pleno.',
    });
  }

  const isRestrictedKeyBoolean =
    rawErrorSignalSnapshot?.name === RESTRICTED_API_KEY_ERROR_NAME_LITERAL ||
    rawErrorSignalSnapshot?.message?.includes('restricted to only send emails') === true;

  if (isRestrictedKeyBoolean) {
    return Object.freeze({
      isServiceHealthyBoolean: true,
      isRestrictedSendingKeyBoolean: true,
      statusDescriptionLiteral:
        'Sonda de salud exitosa: Resend API autenticada y operativa con clave restringida de solo envío (restricted_api_key).',
    });
  }

  const errorDescriptionLiteral =
    rawErrorSignalSnapshot?.message ?? 'El proveedor Resend devolvió un estado no disponible.';

  return Object.freeze({
    isServiceHealthyBoolean: false,
    isRestrictedSendingKeyBoolean: false,
    statusDescriptionLiteral: `Sonda de salud fallida: ${errorDescriptionLiteral}`,
  });
};

/**
 * Audita activamente las credenciales y disponibilidad física del proveedor transaccional Resend.
 *
 * @param providerConfigurationSnapshot - Configuración técnica del proveedor con clave de API y remitente.
 * @param correlationIdentifierFallback - Identificador único de correlación opcional para trazabilidad forense.
 * @returns {Promise<boolean>} Promesa que resuelve en verdadero si el servicio está disponible para emitir correos.
 */
export const AuditResendHealthProbe = async (
  providerConfigurationSnapshot: IResendConfiguration,
  correlationIdentifierFallback: CorrelationIdentifier = GenerateCorrelationIdentifier(),
): Promise<boolean> => {
  const correlationIdentifier = correlationIdentifierFallback;
  const validatedConfiguration = ResendConfigurationSchema.parse(providerConfigurationSnapshot);

  return await TraceExecutionTime(
    RESEND_PROVIDER_MODULE_IDENTIFIER,
    'HEALTH_CHECK_PROBE_OPERATION' as OperationCode,
    correlationIdentifier,
    async (): Promise<boolean> => {
      const resendClientInstance = new Resend(validatedConfiguration.securityApiKeySecret);

      try {
        const { data: domainsDataSnapshot, error: probeErrorSignalSnapshot } =
          await resendClientInstance.domains.list();

        const evaluationVerdict = evaluateResendProbeOutcomeAction(
          domainsDataSnapshot !== null,
          probeErrorSignalSnapshot,
        );

        if (!evaluationVerdict.isServiceHealthyBoolean) {
          throw new Error(evaluationVerdict.statusDescriptionLiteral);
        }

        void EmitTelemetrySignal({
          occurrenceTimestampISO: new Date().toISOString(),
          severityLevelLiteral: 'INFO',
          moduleIdentifierLiteral: RESEND_PROVIDER_MODULE_IDENTIFIER,
          operationCodeLiteral: (evaluationVerdict.isRestrictedSendingKeyBoolean
            ? 'EXTERNAL_PROVIDER_RESTRICTED_KEY_NOMINAL'
            : 'EXTERNAL_PROVIDER_HEALTH_NOMINAL') as OperationCode,
          correlationIdentifier,
          messageContentLiteral: evaluationVerdict.statusDescriptionLiteral,
          semanticIntentTag: 'INFRASTRUCTURE_HEALTH_PROBE_SUCCESS',
          contextMetadataSnapshot: Object.freeze({
            isServiceAvailableBoolean: true,
            isRestrictedSendingKeyBoolean: evaluationVerdict.isRestrictedSendingKeyBoolean,
            defaultFromAddressLiteral: validatedConfiguration.defaultFromAddressLiteral,
          }),
        });

        return true;
      } catch (caughtExecutionError: unknown) {
        const errorDescriptionLiteral =
          caughtExecutionError instanceof Error
            ? caughtExecutionError.message
            : String(caughtExecutionError);

        void EmitTelemetrySignal({
          occurrenceTimestampISO: new Date().toISOString(),
          severityLevelLiteral: 'CRITICAL',
          moduleIdentifierLiteral: RESEND_PROVIDER_MODULE_IDENTIFIER,
          operationCodeLiteral: 'EXTERNAL_PROVIDER_HEALTH_DOWN' as OperationCode,
          correlationIdentifier,
          messageContentLiteral: `Sonda de salud fallida: El proveedor Resend no responde nominalmente (${errorDescriptionLiteral}).`,
          semanticIntentTag: 'INFRASTRUCTURE_HEALTH_PROBE_FAILURE',
          contextMetadataSnapshot: Object.freeze({
            errorTraceLiteral: errorDescriptionLiteral,
            defaultFromAddressLiteral: validatedConfiguration.defaultFromAddressLiteral,
          }),
        });

        return false;
      }
    },
  );
};
