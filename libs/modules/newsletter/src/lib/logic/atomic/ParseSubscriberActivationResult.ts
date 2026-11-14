/**
 * @section Newsletter Logic - Subscriber Activation Result Parser (Atom)
 * @description Átomo puro encargado de validar mediante Zod la fila devuelta por
 * Supabase PostgREST tras la activación Double Opt-In, normalizar el correo y
 * el código BCP 47 contra `@floripa-dignidade/contracts` (ADR 0030) y retornar
 * un contrato inmutable sellado.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Clean Paths).
 * Normas: BCP 47 (RFC 5646), ISO/IEC 11179 (Nomenclatura Prosa) e ISO/IEC 25010.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { DEFAULT_LOCALE_IDENTIFIER, SupportedLocaleSchema } from '@floripa-dignidade/contracts';
import { z } from 'zod';

import type { IActivationResult } from './ActivateCloudSubscription';

/**
 * @name SubscriberLedgerRowSchema
 * @description Contrato Zod para validar la fila afectada devuelta por PostgREST en `newsletter_subscribers`.
 */
const SubscriberLedgerRowSchema = z
  .object({
    id: z.string().trim().min(1).optional(),
    email_address: z
      .string()
      .trim()
      .email()
      .transform((emailInputLiteral: string) => emailInputLiteral.toLowerCase()),
    preferred_locale: z.string().trim().optional(),
    is_active_boolean: z.boolean().optional(),
  })
  .readonly();

/**
 * Analiza y valida estructuralmente el resultado devuelto por PostgREST tras activar un suscriptor.
 *
 * @param updatedDataCollection - Respuesta JSON cruda o colección de filas afectadas por el PATCH.
 * @returns {IActivationResult} Snapshot inmutable y sellado con el resultado de activación.
 */
export const ParseSubscriberActivationResult = (
  updatedDataCollection: unknown,
): IActivationResult => {
  const hasAffectedRowsBoolean =
    Array.isArray(updatedDataCollection) && updatedDataCollection.length > 0;

  if (!hasAffectedRowsBoolean) {
    return Object.freeze({ isActivationSuccessfulBoolean: false });
  }

  const rowValidationResult = SubscriberLedgerRowSchema.safeParse(updatedDataCollection[0]);

  if (!rowValidationResult.success) {
    return Object.freeze({ isActivationSuccessfulBoolean: false });
  }

  const validatedRowSnapshot = rowValidationResult.data;
  const localeValidationResult = SupportedLocaleSchema.safeParse(
    validatedRowSnapshot.preferred_locale,
  );
  const resolvedLocaleIdentifier = localeValidationResult.success
    ? localeValidationResult.data
    : DEFAULT_LOCALE_IDENTIFIER;

  return Object.freeze({
    isActivationSuccessfulBoolean: true,
    activatedCitizenEmailLiteral: validatedRowSnapshot.email_address,
    metadataSnapshot: Object.freeze({
      subscriberIdentifier: validatedRowSnapshot.id ?? 'UNKNOWN_ID',
      localeIdentifier: resolvedLocaleIdentifier,
    }),
  });
};
