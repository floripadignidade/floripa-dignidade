/**
 * @section Newsletter Logic - Redirect Calculator Atom
 * @description Función pura encargada de determinar la ruta de destino final del
 * ciudadano basándose en el resultado de la activación técnica en la nube.
 *
 * Protocolo OEDP-V17.0 - Pure Logic & UX Navigation Integrity.
 * SANEADO Zenith: Sincronización de ADN con la librería de Newsletter (Fix TS2305).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import type { IActivationResult } from '@floripa-dignidade/newsletter';

/**
 * Calcula la instancia de URL absoluta para la redirección de Next.js.
 * Implementa una lógica de decisión binaria: Éxito (Bienvenida) vs Fallo (Token Inválido).
 *
 * @param activationResultSnapshot - Snapshot inmutable con el éxito o fallo de la operación.
 * @param targetLocaleIdentifier - Identificador lingüístico detectado para la localización de la ruta.
 * @param requestBaseUrlLiteral - URL base de la petición original para la construcción absoluta.
 * @returns {URL} Instancia de URL validada para el despacho del Middleware/Route Handler.
 */
export const CalculateConfirmationRedirect = (
  activationResultSnapshot: IActivationResult,
  targetLocaleIdentifier: string,
  requestBaseUrlLiteral: string,
): URL => {
  /**
   * @section Triaje de Navegación
   * Determinamos el segmento de ruta basándonos en la bandera de éxito del resultado.
   */
  const targetPathLiteral = activationResultSnapshot.isActivationSuccessfulBoolean
    ? `/${targetLocaleIdentifier}/newsletter/welcome?status=success`
    : `/${targetLocaleIdentifier}/newsletter/invalid-token`;

  /**
   * @section Construcción de Identidad de Red
   * Retornamos un objeto URL nativo para garantizar la compatibilidad con NextResponse.redirect.
   */
  return new URL(targetPathLiteral, requestBaseUrlLiteral);
};
