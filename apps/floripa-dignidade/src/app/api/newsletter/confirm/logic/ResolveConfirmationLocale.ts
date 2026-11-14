/**
 * @section Newsletter Confirm Logic - Locale Resolver (Atom)
 * @description Átomo encargado de determinar el código BCP 47 óptimo para la
 * redirección de confirmación Double Opt-In. Prioriza un parámetro explícito `locale`
 * validado contra el catálogo único SSOT (`SupportedLocaleSchema`) y conmuta a la
 * cabecera HTTP `Accept-Language` mediante `DetermineDeviceLocale`.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & ADR 0030).
 * Normas: BCP 47 (RFC 5646), ISO/IEC 11179 e ISO/IEC 25010 (Portabilidad y UX).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { SupportedLocaleSchema, type TSupportedLocale } from '@floripa-dignidade/contracts';
import { DetermineDeviceLocale } from '@floripa-dignidade/routing';

/**
 * Resuelve el código BCP 47 habilitado a partir de la URL y las cabeceras de la solicitud.
 *
 * @param searchParameters - Parámetros de consulta de la URL de confirmación.
 * @param incomingHeaders - Cabeceras HTTP de la petición entrante.
 * @returns {TSupportedLocale} Código BCP 47 activo validado contra el catálogo SSOT.
 */
export const ResolveConfirmationLocale = (
  searchParameters: URLSearchParams,
  incomingHeaders: Headers,
): TSupportedLocale => {
  const explicitLocaleCandidate = searchParameters.get('locale');

  if (explicitLocaleCandidate) {
    const explicitValidationResult = SupportedLocaleSchema.safeParse(
      explicitLocaleCandidate.trim(),
    );
    if (explicitValidationResult.success) {
      return explicitValidationResult.data;
    }
  }

  const acceptLanguageHeaderLiteral = incomingHeaders.get('accept-language');
  return DetermineDeviceLocale(acceptLanguageHeaderLiteral);
};
