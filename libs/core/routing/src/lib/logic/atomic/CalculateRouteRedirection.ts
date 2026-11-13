/**
 * @section Routing Logic - Route Redirection Calculator Apparatus
 * @description Evalúa si la ruta actual requiere redirección hacia un prefijo
 * lingüístico localizado, manteniendo la pureza de la lógica de decisión
 * separada de los objetos de respuesta HTTP.
 *
 * Protocolo OEDP-V15.0 - Functional Atomicity & Zero Abbreviations.
 * @author Dirección de Ingeniería - Floripa Dignidade
 */

import { SUPPORTED_LOCALE_COLLECTION } from '../../constants/RoutingGlobalConfiguration';

/**
 * @interface IRouteCalculationResult
 * @description Contrato inmutable con el resultado de la evaluación de ruta.
 */
export interface IRouteCalculationResult {
  readonly isRedirectionRequiredBoolean: boolean;
  readonly localizedTargetUrl?: URL;
}

/**
 * Calcula de forma atómica si una ruta necesita ser interceptada y redirigida.
 *
 * @param currentPathnameLiteral - Ruta actual solicitada por el cliente.
 * @param detectedLocaleIdentifier - Idioma soberano inferido por el sistema.
 * @param baseRequestUrlLiteral - URL base original para construir la redirección absoluta.
 * @returns {IRouteCalculationResult} Objeto inmutable con la decisión calculada.
 */
export const CalculateRouteRedirection = (
  currentPathnameLiteral: string,
  detectedLocaleIdentifier: string,
  baseRequestUrlLiteral: string,
): IRouteCalculationResult => {
  const isPathAlreadyLocalizedBoolean = SUPPORTED_LOCALE_COLLECTION.some(
    (localeIdentifier) =>
      currentPathnameLiteral.startsWith(`/${localeIdentifier}`) ||
      currentPathnameLiteral === `/${localeIdentifier}`,
  );

  if (!isPathAlreadyLocalizedBoolean) {
    const localizedUrl = new URL(
      `/${detectedLocaleIdentifier}${currentPathnameLiteral}`,
      baseRequestUrlLiteral,
    );

    return {
      isRedirectionRequiredBoolean: true,
      localizedTargetUrl: localizedUrl,
    };
  }

  return {
    isRedirectionRequiredBoolean: false,
  };
};
