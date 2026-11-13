/**
 * @section Routing Logic - Route Authority Guardian Apparatus
 * @description Aparato de vigilancia que valida la simetría entre la ruta solicitada
 * y el rango de autoridad institucional de la identidad (RBAC).
 *
 * Protocolo OEDP-V13.0 - Atomic Architecture & Zero Abbreviations.
 * Saneamiento: Resolución de error '@typescript-eslint/no-inferrable-types'.
 *
 * @author Raz  Podestá - MetaShark Tech
 */

import { ValidationException } from '@floripa-dignidade/exceptions';
import { EmitTelemetrySignal, GenerateCorrelationIdentifier } from '@floripa-dignidade/telemetry';
import { ROUTE_PROTECTION_MANIFESTO } from '../../constants/RouteAuthorityManifesto';

/** Identificador técnico del guardián para trazabilidad forense. */
const ROUTE_AUTHORITY_SENTINEL_IDENTIFIER = 'ROUTE_AUTHORITY_SENTINEL';

/**
 * Evalúa si la identidad posee el rango de autoridad necesario para transitar
 * por la ruta solicitada basándose en el manifiesto soberano.
 *
 * @param requestedPathnameLiteral - Ruta de destino capturada en la intercepción de frontera.
 * @param activeCitizenAuthorityRoleLiteral - Rango de autoridad (Inferencia automática del valor por defecto).
 * @returns {boolean} Verdadero si la autoridad es suficiente para el acceso.
 * @throws {ValidationException} Si se detecta un intento de acceso no autorizado.
 */
export const ValidateRouteAuthority = (
  requestedPathnameLiteral: string,
  activeCitizenAuthorityRoleLiteral = 'CITIZEN_ANONYMOUS', // SANEADO: Eliminada anotación redundante ': string'
): boolean => {
  const correlationIdentifier = GenerateCorrelationIdentifier();

  /**
   * 1. IDENTIFICACIÓN DE REGLAS APLICABLES
   * Buscamos en el manifiesto externo si existe una restricción para el prefijo de la ruta.
   */
  const matchingManifestoPathLiteral = Object.keys(ROUTE_PROTECTION_MANIFESTO).find((pathPrefix) =>
    requestedPathnameLiteral.startsWith(pathPrefix),
  );

  // Si la ruta no está en el manifiesto, se clasifica como 'Acceso Público Nominal'.
  if (!matchingManifestoPathLiteral) {
    return true;
  }

  const minimumRequiredAuthorityRoleLiteral =
    ROUTE_PROTECTION_MANIFESTO[matchingManifestoPathLiteral];

  /**
   * 2. EVALUACIÓN DE JERARQUÍA TÉCNICA (Authority Enforcement)
   * Los roles de nivel 'Auditor' y 'Manager Global' poseen bypass automático sobre niveles inferiores.
   */
  const isAuthoritySufficientBoolean =
    activeCitizenAuthorityRoleLiteral === 'INFRASTRUCTURE_SOVEREIGN_AUDITOR' ||
    activeCitizenAuthorityRoleLiteral === 'PLATFORM_GLOBAL_MANAGER' ||
    activeCitizenAuthorityRoleLiteral === minimumRequiredAuthorityRoleLiteral;

  if (!isAuthoritySufficientBoolean) {
    const authorityViolationErrorCodeLiteral = 'AUTORIDAD_INSUFICIENTE_PARA_RUTA';

    EmitTelemetrySignal({
      severityLevel: 'WARNING',
      moduleIdentifier: ROUTE_AUTHORITY_SENTINEL_IDENTIFIER,
      operationCode: 'UNAUTHORIZED_ACCESS_ATTEMPT_DETECTED',
      correlationIdentifier,
      message: `Bloqueo de seguridad en ruteo: La identidad [${activeCitizenAuthorityRoleLiteral}] intentó acceder a [${requestedPathnameLiteral}].`,
      contextMetadata: {
        requestedPathLiteral: requestedPathnameLiteral,
        requiredAuthorityRoleLiteral: minimumRequiredAuthorityRoleLiteral,
        activeAuthorityRoleLiteral: activeCitizenAuthorityRoleLiteral,
      },
    });

    throw new ValidationException(authorityViolationErrorCodeLiteral, {
      requiredAuthorityRoleLiteral: minimumRequiredAuthorityRoleLiteral,
      activeCitizenAuthorityRoleLiteral: activeCitizenAuthorityRoleLiteral,
    });
  }

  // 3. REPORTE DE TRÁNSITO LEGÍTIMO (SRE Visibility)
  EmitTelemetrySignal({
    severityLevel: 'INFO',
    moduleIdentifier: ROUTE_AUTHORITY_SENTINEL_IDENTIFIER,
    operationCode: 'ROUTE_ACCESS_AUTHORIZED',
    correlationIdentifier,
    message: `Acceso autorizado para ruta protegida: [${requestedPathnameLiteral}]`,
  });

  return true;
};
