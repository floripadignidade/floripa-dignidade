/**
 * @section Shared UI Foundry - Newsletter HTTP Transport Dispatcher (Atom)
 * @description Átomo encargado exclusivamente del envío HTTP hacia el gateway de
 * suscripción. Implementa timeout seguro con `AbortController` (compatible con WebViews
 * móviles legados), soporte de cabeceras personalizables multi-app y validación Zod de respuesta.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Clean Paths).
 * Normas: ISO/IEC 11179 e ISO/IEC 25010 (Confiabilidad y Portabilidad).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import type { TSupportedLocale } from '@floripa-dignidade/contracts';

import {
  type ISubscriptionGatewayResponse,
  SubscriptionGatewayResponseSchema,
  type TSubscriptionVerificationChannel,
} from '../../schemas/UseNewsletterSubscription.schema';

/**
 * @interface IDispatchNewsletterSubscriptionParameters
 * @description Contrato inmutable de parámetros para ejecutar la petición HTTP de alta.
 */
export interface IDispatchNewsletterSubscriptionParameters {
  readonly targetApiEndpointPathLiteral: string;
  readonly electronicMailAddressLiteral: string;
  readonly hasGivenPrivacyConsentBoolean: boolean;
  readonly preferredLinguisticLocaleIdentifier: TSupportedLocale;
  readonly verificationChannelPreference: TSubscriptionVerificationChannel;
  readonly acquisitionSourceIdentifier: string;
  readonly correlationIdentifier: string;
  readonly correlationHeaderNameLiteral: string;
  readonly requestTimeoutInMillisecondsQuantity: number;
  readonly customHeadersMapping: Readonly<Record<string, string>> | undefined;
}

/**
 * @interface IDispatchNewsletterSubscriptionResult
 * @description Resultado medido e inmutable retornado por la capa de transporte.
 */
export interface IDispatchNewsletterSubscriptionResult {
  readonly httpStatusCodeNumeric: number;
  readonly executionLatencyInMillisecondsQuantity: number;
  readonly gatewayPayloadSnapshot: ISubscriptionGatewayResponse | undefined;
}

/**
 * Despacha la solicitud de suscripción hacia el endpoint configurado con control de timeout.
 *
 * @param parametersSnapshot - Datos validados del formulario y configuración de red.
 * @returns {Promise<IDispatchNewsletterSubscriptionResult>} Respuesta validada y latencia medida.
 * @throws {Error} Si la red falla, vence el timeout o el gateway retorna código HTTP >= 400.
 */
export const DispatchNewsletterSubscriptionRequest = async (
  parametersSnapshot: IDispatchNewsletterSubscriptionParameters,
): Promise<IDispatchNewsletterSubscriptionResult> => {
  const executionStartTimestampNumeric = globalThis.performance.now();
  const abortControllerInstance = new AbortController();
  const timeoutHandleReference = setTimeout(
    () => abortControllerInstance.abort(),
    parametersSnapshot.requestTimeoutInMillisecondsQuantity,
  );

  try {
    const networkResponse = await fetch(parametersSnapshot.targetApiEndpointPathLiteral, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        [parametersSnapshot.correlationHeaderNameLiteral]: parametersSnapshot.correlationIdentifier,
        ...parametersSnapshot.customHeadersMapping,
      },
      body: JSON.stringify({
        communicationIdentifierLiteral: parametersSnapshot.electronicMailAddressLiteral,
        verificationChannelPreference: parametersSnapshot.verificationChannelPreference,
        preferredLinguisticLocaleIdentifier: parametersSnapshot.preferredLinguisticLocaleIdentifier,
        hasGivenPrivacyConsentBoolean: parametersSnapshot.hasGivenPrivacyConsentBoolean,
        acquisitionSourceIdentifier: parametersSnapshot.acquisitionSourceIdentifier,
      }),
      signal: abortControllerInstance.signal,
    });

    const executionLatencyInMillisecondsQuantity = Math.max(
      0,
      Math.round(globalThis.performance.now() - executionStartTimestampNumeric),
    );

    if (!networkResponse.ok) {
      throw new Error(`GATEWAY_FAULT_CODE_${networkResponse.status}`);
    }

    const rawResponsePayload: unknown = await networkResponse.json().catch(() => undefined);
    const parsedResponseResult = SubscriptionGatewayResponseSchema.safeParse(rawResponsePayload);

    return Object.freeze({
      httpStatusCodeNumeric: networkResponse.status,
      executionLatencyInMillisecondsQuantity,
      gatewayPayloadSnapshot: parsedResponseResult.success ? parsedResponseResult.data : undefined,
    });
  } finally {
    clearTimeout(timeoutHandleReference);
  }
};
