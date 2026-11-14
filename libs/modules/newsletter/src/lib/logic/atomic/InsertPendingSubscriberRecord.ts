/**
 * @section Newsletter Persistence - PostgREST Subscriber Insert (Atom)
 * @description Átomo encargado exclusivamente de la operación física HTTP POST
 * hacia la tabla `newsletter_subscribers` en Supabase PostgREST, con normalización
 * de URL base, `keepalive: true`, timeout SRE de 8 segundos y mapeo de errores HTTP/504.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Clean Paths).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa) e ISO/IEC 25010 (Confiabilidad y Rendimiento).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { GlobalBaseException, MapHttpErrorToException } from '@floripa-dignidade/exceptions';
import type { CorrelationIdentifier } from '@floripa-dignidade/telemetry';

const PERSISTENCE_TIMEOUT_IN_MILLISECONDS_QUANTITY = 8000;
const SUBSCRIBERS_TABLE_NAME_LITERAL = 'newsletter_subscribers';

/**
 * @interface IInsertPendingSubscriberParameters
 * @description Parámetros validados e inmutables para ejecutar el alta pendiente en PostgREST.
 */
export interface IInsertPendingSubscriberParameters {
  readonly supabaseBaseUrlLiteral: string;
  readonly serviceRoleKeySecret: string;
  readonly emailAddressLiteral: string;
  readonly verificationTokenLiteral: string;
  readonly localeIdentifierLiteral: string;
  readonly correlationIdentifier: CorrelationIdentifier;
}

/**
 * Ejecuta la inserción física del registro de suscripción pendiente en Supabase.
 *
 * @param parametersSnapshot - Credenciales validadas y campos purificados del suscriptor.
 * @returns {Promise<void>} Resuelve cuando Supabase confirma la inserción (`201 Created`).
 * @throws {GlobalBaseException} Si el proveedor rechaza la petición, excede el timeout o falla la red.
 */
export const InsertPendingSubscriberRecord = async (
  parametersSnapshot: IInsertPendingSubscriberParameters,
): Promise<void> => {
  const {
    supabaseBaseUrlLiteral,
    serviceRoleKeySecret,
    emailAddressLiteral,
    verificationTokenLiteral,
    localeIdentifierLiteral,
    correlationIdentifier,
  } = parametersSnapshot;

  const normalizedBaseUrlLiteral = supabaseBaseUrlLiteral.trim().replace(/\/+$/, '');
  const targetEndpointLiteral = `${normalizedBaseUrlLiteral}/rest/v1/${SUBSCRIBERS_TABLE_NAME_LITERAL}`;

  try {
    const outgoingResponse = await fetch(targetEndpointLiteral, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: serviceRoleKeySecret,
        Authorization: `Bearer ${serviceRoleKeySecret}`,
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({
        email_address: emailAddressLiteral,
        verification_token: verificationTokenLiteral,
        preferred_locale: localeIdentifierLiteral,
        correlation_id: correlationIdentifier,
        status: 'PENDING_VERIFICATION',
        created_at: new Date().toISOString(),
      }),
      keepalive: true,
      signal: AbortSignal.timeout(PERSISTENCE_TIMEOUT_IN_MILLISECONDS_QUANTITY),
    });

    if (!outgoingResponse.ok) {
      throw MapHttpErrorToException(outgoingResponse.status, 'SUPABASE_PROVIDER_REJECTION', {
        httpStatusNumeric: outgoingResponse.status,
        targetTableLiteral: SUBSCRIBERS_TABLE_NAME_LITERAL,
        correlationIdentifier,
      });
    }
  } catch (caughtExecutionError: unknown) {
    if (caughtExecutionError instanceof GlobalBaseException) {
      throw caughtExecutionError;
    }

    const isTimeoutErrorBoolean =
      caughtExecutionError instanceof Error &&
      (caughtExecutionError.name === 'TimeoutError' || caughtExecutionError.name === 'AbortError');

    if (isTimeoutErrorBoolean) {
      throw MapHttpErrorToException(504, 'SUPABASE_PERSISTENCE_TIMEOUT', {
        targetTableLiteral: SUBSCRIBERS_TABLE_NAME_LITERAL,
        timeoutInMillisecondsQuantity: PERSISTENCE_TIMEOUT_IN_MILLISECONDS_QUANTITY,
        correlationIdentifier,
      });
    }

    const errorDescriptionLiteral =
      caughtExecutionError instanceof Error
        ? caughtExecutionError.message
        : String(caughtExecutionError);

    throw MapHttpErrorToException(500, 'FALLO_FISICO_PERSISTENCIA_NEWSLETTER', {
      originalErrorLiteral: errorDescriptionLiteral,
      targetTableLiteral: SUBSCRIBERS_TABLE_NAME_LITERAL,
      correlationIdentifier,
    });
  }
};
