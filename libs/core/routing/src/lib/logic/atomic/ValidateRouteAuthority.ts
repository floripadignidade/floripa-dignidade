/**
 * @section Routing Logic - Route Authority Validator (Atom)
 * @description Validador perimetral de control de acceso basado en roles (RBAC).
 * Evalúa si el rol institucional de la identidad posee autoridad suficiente para
 * transitar por la ruta solicitada, soportando rutas normalizadas y prefijadas por
 * código BCP 47 (ADR 0030), con trazabilidad SRE conforme a `TelemetrySignalSchema`.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Clean Paths).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa), ISO/IEC 25010 (Seguridad) y ADR 0030.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { ValidationException } from '@floripa-dignidade/exceptions';
import {
  type CorrelationIdentifier,
  EmitTelemetrySignal,
  GenerateCorrelationIdentifier,
  type ModuleIdentifier,
  ModuleIdentifierSchema,
  type OperationCode,
} from '@floripa-dignidade/telemetry';

import { ROUTE_PROTECTION_MANIFESTO } from '../../constants/RouteAuthorityManifesto';

const ROUTE_AUTHORITY_MODULE_IDENTIFIER = ModuleIdentifierSchema.parse(
  'ROUTE_AUTHORITY_SENTINEL',
) as ModuleIdentifier;

const BCP47_LOCALE_PREFIX_REGEX = /^\/[a-z]{2,3}(?:-[A-Za-z0-9]+)?(?=\/|$)/i;

/**
 * Normaliza la ruta solicitada eliminando el prefijo de idioma BCP 47 si está presente.
 *
 * @param rawPathnameLiteral - Ruta solicitada (ej: `/pt-BR/auditoria` o `/auditoria`).
 * @returns {string} Ruta base sin prefijo lingüístico (ej: `/auditoria`).
 */
const stripLocalePrefixAction = (rawPathnameLiteral: string): string => {
  const normalizedPathLiteral = rawPathnameLiteral.replace(BCP47_LOCALE_PREFIX_REGEX, '');
  return normalizedPathLiteral.startsWith('/')
    ? normalizedPathLiteral
    : `/${normalizedPathLiteral}`;
};

/**
 * Evalúa si el rol del usuario posee autoridad suficiente para acceder a la ruta solicitada.
 *
 * @param requestedPathnameLiteral - Ruta destino solicitada en la petición HTTP.
 * @param activeCitizenAuthorityRoleLiteral - Rol institucional asignado a la identidad (por defecto anónimo).
 * @returns {boolean} Verdadero si la ruta es pública o el rol satisface la política de acceso.
 * @throws {ValidationException} Si el rol institucional no cumple el requisito mínimo de la ruta.
 */
export const ValidateRouteAuthority = (
  requestedPathnameLiteral: string,
  activeCitizenAuthorityRoleLiteral = 'IDENTITY_ANONYMOUS',
): boolean => {
  const correlationIdentifier: CorrelationIdentifier = GenerateCorrelationIdentifier();
  const normalizedPathnameLiteral = stripLocalePrefixAction(requestedPathnameLiteral);

  // 1. IDENTIFICACIÓN DE REGLA APLICABLE (Evaluación dual: ruta cruda y normalizada)
  const matchingManifestoPathLiteral = Object.keys(ROUTE_PROTECTION_MANIFESTO).find(
    (pathPrefixLiteral) =>
      normalizedPathnameLiteral.startsWith(pathPrefixLiteral) ||
      requestedPathnameLiteral.startsWith(pathPrefixLiteral),
  );

  if (!matchingManifestoPathLiteral) {
    return true;
  }

  const minimumRequiredAuthorityRoleLiteral =
    ROUTE_PROTECTION_MANIFESTO[matchingManifestoPathLiteral];

  // 2. EVALUACIÓN DE JERARQUÍA INSTITUCIONAL Y BYPASS ADMINISTRATIVO
  const isAdministrativeBypassAuthorizedBoolean =
    activeCitizenAuthorityRoleLiteral === 'INFRASTRUCTURE_ADMINISTRATIVE_AUDITOR' ||
    activeCitizenAuthorityRoleLiteral === 'INFRASTRUCTURE_SOVEREIGN_AUDITOR' ||
    activeCitizenAuthorityRoleLiteral === 'PLATFORM_GLOBAL_MANAGER';

  const isAuthoritySufficientBoolean =
    isAdministrativeBypassAuthorizedBoolean ||
    activeCitizenAuthorityRoleLiteral === minimumRequiredAuthorityRoleLiteral;

  if (!isAuthoritySufficientBoolean) {
    const authorityViolationErrorCodeLiteral = 'AUTORIDAD_INSUFICIENTE_PARA_RUTA';
    const occurrenceTimestampISO = new Date().toISOString();

    void EmitTelemetrySignal({
      occurrenceTimestampISO,
      severityLevelLiteral: 'WARNING',
      moduleIdentifierLiteral: ROUTE_AUTHORITY_MODULE_IDENTIFIER,
      operationCodeLiteral: 'UNAUTHORIZED_ACCESS_ATTEMPT_DETECTED' as OperationCode,
      correlationIdentifier,
      messageContentLiteral: `Bloqueo de seguridad perimetral: La identidad [${activeCitizenAuthorityRoleLiteral}] intentó acceder a [${requestedPathnameLiteral}].`,
      semanticIntentTag: 'SECURITY_ROUTE_AUTHORITY_VIOLATION',
      contextMetadataSnapshot: Object.freeze({
        requestedPathLiteral: requestedPathnameLiteral,
        normalizedPathnameLiteral,
        requiredAuthorityRoleLiteral: minimumRequiredAuthorityRoleLiteral,
        activeAuthorityRoleLiteral: activeCitizenAuthorityRoleLiteral,
      }),
    });

    throw new ValidationException(authorityViolationErrorCodeLiteral, {
      requiredAuthorityRoleLiteral: minimumRequiredAuthorityRoleLiteral,
      activeCitizenAuthorityRoleLiteral: activeCitizenAuthorityRoleLiteral,
      correlationIdentifier,
    });
  }

  // 3. REPORTE TELEMÉTRICO DE ACCESO AUTORIZADO
  void EmitTelemetrySignal({
    occurrenceTimestampISO: new Date().toISOString(),
    severityLevelLiteral: 'INFO',
    moduleIdentifierLiteral: ROUTE_AUTHORITY_MODULE_IDENTIFIER,
    operationCodeLiteral: 'ROUTE_ACCESS_AUTHORIZED' as OperationCode,
    correlationIdentifier,
    messageContentLiteral: `Acceso autorizado para ruta protegida: [${requestedPathnameLiteral}].`,
    semanticIntentTag: 'SECURITY_ROUTE_AUTHORITY_CONFIRMED',
    contextMetadataSnapshot: Object.freeze({
      requestedPathLiteral: requestedPathnameLiteral,
      activeAuthorityRoleLiteral: activeCitizenAuthorityRoleLiteral,
    }),
  });

  return true;
};
