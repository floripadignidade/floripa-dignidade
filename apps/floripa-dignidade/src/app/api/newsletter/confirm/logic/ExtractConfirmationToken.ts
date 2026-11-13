/**
 * @section Newsletter Logic - Token Extraction Atom
 * @description Átomo encargado de la extracción y validación técnica del token
 * de identidad desde la URL.
 *
 * Protocolo OEDP-V17.0 - Functional Atomicity & Zod Aduana.
 */

import { z } from 'zod';
import { ValidationException } from '@floripa-dignidade/exceptions';

/**
 * @name ConfirmationQuerySchema
 * @description Aduana de ADN para el rastro de la URL.
 */
const ConfirmationQuerySchema = z
  .object({
    token: z.string().uuid({ message: 'INVALID_TOKEN_FORMAT' }),
  })
  .readonly();

/**
 * Extrae el token de verificación de forma segura.
 *
 * @param searchParametersSnapshot - Objeto URLSearchParams de la petición.
 * @returns {string} Token validado (UUID v4).
 * @throws {ValidationException} Si el token es inexistente o malformado.
 */
export const ExtractConfirmationToken = (searchParametersSnapshot: URLSearchParams): string => {
  const rawTokenLiteral = searchParametersSnapshot.get('token');

  const validationResult = ConfirmationQuerySchema.safeParse({
    token: rawTokenLiteral,
  });

  if (!validationResult.success) {
    throw new ValidationException('TOKEN_DE_CONFIRMACION_INVALIDO', {
      validationIssuesCollection: validationResult.error.flatten(),
    });
  }

  return validationResult.data.token;
};
