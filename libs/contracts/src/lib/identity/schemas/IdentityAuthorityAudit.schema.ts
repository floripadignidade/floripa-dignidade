/**
 * @section User Management & Identity - Authority Integrity Contracts
 * @description Define el contrato de integridad para el motor de credibilidad bayesiana.
 * Garantiza que los parámetros de entrada y los resultados de autoridad sigan
 * el estándar institucional de inmutabilidad.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First).
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { z } from 'zod';

/**
 * @name IdentityAuthorityAuditSchema
 * @description Validador de entrada para el cálculo de peso institucional.
 *
 * @prompt_ia: "Asegura que 'occurrenceTimestampISO' sea una fecha válida en el pasado
 * y que 'isIdentityLegallyVerifiedBoolean' influya positivamente en el coeficiente final."
 */
export const IdentityAuthorityAuditSchema = z
  .object({
    /** Identificador único del ciudadano con tipado nominal. */
    identityIdentifier: z.string().uuid().brand<'UserIdentifier'>(),

    /** Provedor de origen de la identidad (Federado o Interno). */
    socialProviderIdentifier: z.enum(['GOOGLE_IDENTITY', 'APPLE_ID', 'INTERNAL_INFRASTRUCTURE']),

    /** Estado de la auditoría documental humana. */
    isIdentityLegallyVerifiedBoolean: z
      .boolean()
      .describe('Indica si el ciudadano posee sello de verificación legal.'),

    /** Marca temporal ISO de creación de la cuenta para cálculo de antigüedad. */
    occurrenceTimestampISO: z
      .string()
      .datetime()
      .describe('Timestamp inalterable de activación de la identidad.'),
  })
  .readonly();

/**
 * @name IdentityAuthorityResultSchema
 * @description Contrato de salida para el coeficiente de autoridad generado.
 */
export const IdentityAuthorityResultSchema = z
  .object({
    /** Score final ponderado (0.1 para anónimos, hasta 1.0 para verificados antiguos). */
    authorityCoefficientNumeric: z
      .number()
      .min(0.1)
      .max(1.0)
      .describe('Coeficiente final de peso bayesiano.'),

    /** Delta temporal calculado por el motor. */
    daysSinceActivationQuantity: z
      .number()
      .int()
      .nonnegative()
      .describe('Cantidad total de días de existencia de la identidad en la red.'),

    /** Snapshot del estado de verificación en el momento del procesamiento. */
    isVerifiedHumanBoolean: z.boolean(),
  })
  .readonly();

export type IIdentityAuthorityAuditParameters = z.infer<typeof IdentityAuthorityAuditSchema>;
export type IIdentityAuthorityResult = z.infer<typeof IdentityAuthorityResultSchema>;
